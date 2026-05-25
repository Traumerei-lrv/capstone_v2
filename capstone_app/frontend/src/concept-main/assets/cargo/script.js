const cargoTypes = {
  cooling_valve: { color: 0x3ca3ff, label: "VALVE", texture: "cooling_valve" },
  fuel_injector: { color: 0xff9f43, label: "INJ", texture: "fuel_injector" },
  ignition_coil: { color: 0xf5dc53, label: "COIL", texture: "ignition_coil" },
  plasma_core: { color: 0xa06bff, label: "CORE", texture: "plasma_core" },
  stabilizer: { color: 0x46e2c3, label: "STAB", texture: "stabilizer" }
};

const cargoNames = Object.keys(cargoTypes);
const GAME_PROGRESS_KEY = "balangkas.ship.games_progress.v1";
const GAME_PROGRESS_EVENT = "balangkas:games-progress-updated";
const CARGO_GAME_ID = "cargoStackProtocol";

function markCargoGameComplete() {
  try {
    const raw = window.localStorage.getItem(GAME_PROGRESS_KEY);
    const progress = raw ? JSON.parse(raw) : {};

    if (progress[CARGO_GAME_ID] === true) {
      return;
    }

    progress[CARGO_GAME_ID] = true;
    window.localStorage.setItem(GAME_PROGRESS_KEY, JSON.stringify(progress));
  } catch {}

  window.dispatchEvent(new Event(GAME_PROGRESS_EVENT));
}

class CargoScene extends Phaser.Scene {
  constructor() {
    super("CargoScene");
    this.stack = [];
    this.maxSize = cargoNames.length;
    this.stackX = 336;
    this.slotBottomY = 700;
    this.slotStep = 115;
    this.busy = false;
    this.targetOrder = [];
    this.targetPreview = [];
    this.commandQueue = [];
    this.isRunningScript = false;
  }

  preload() {
    this.load.image("cooling_valve", "./cooling_valve.png");
    this.load.image("fuel_injector", "./fuel_injector.png");
    this.load.image("ignition_coil", "./ignition_coil.png");
    this.load.image("plasma_core", "./plasma_core.png");
    this.load.image("stabilizer", "./stabilizer.png");
  }

  create() {
    this.drawEnvironment();
    this.createEffects();
    this.resetStack(true);
  }

  drawEnvironment() {
    const w = this.scale.width;
    const h = this.scale.height;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x001640, 0x001640, 0x003f88, 0x003f88, 1);
    bg.fillRect(0, 0, w, h);

    for (let i = 0; i < 90; i += 1) {
      this.add.rectangle(
        Phaser.Math.Between(0, w),
        Phaser.Math.Between(0, h),
        2,
        2,
        0x9dc4ff,
        Phaser.Math.FloatBetween(0.2, 0.6)
      );
    }

    this.chamber = this.add.rectangle(this.stackX, 430, 300, 620, 0x001f52, 0.45)
      .setStrokeStyle(4, 0x89b2ff);
    this.targetChamber = this.add.rectangle(668, 430, 300, 620, 0x001f52, 0.45)
      .setStrokeStyle(4, 0x66d3ff, 0.8);
    this.add.text(594, 128, "TARGET STACK", {
      fontFamily: "Inter",
      fontSize: "13px",
      color: "#bce6ff"
    });

    this.tractorBeam = this.add.rectangle(0, 150, 78, 260, 0x7bdfff, 0)
      .setOrigin(0.5, 0)
      .setVisible(false);

    this.scannerBeam = this.add.rectangle(0, 0, 92, 64, 0x00ffaa, 0).setVisible(false);

    this.topTag = this.add.text(0, 0, "TOP", {
      fontFamily: "Inter",
      fontSize: "12px",
      color: "#ffffff",
      backgroundColor: "#003f88",
      padding: { x: 4, y: 3 }
    }).setOrigin(0.5).setVisible(false);
  }

  createEffects() {
    const pixel = this.add.graphics();
    pixel.fillStyle(0xffffff, 1);
    pixel.fillRect(0, 0, 4, 4);
    pixel.generateTexture("sparkPixel", 4, 4);
    pixel.destroy();
  }

  createCrate(itemName, startX, startY) {
    const data = cargoTypes[itemName];
    const crate = this.add.image(startX, startY, data.texture).setDisplaySize(190, 44);
    this.physics.add.existing(crate);

    const label = this.add.text(startX, startY + 18, data.label, {
      fontFamily: "Inter",
      fontSize: "10px",
      color: "#091523",
      backgroundColor: "#c8d8f4"
    }).setOrigin(0.5);

    return { name: itemName, sprite: crate, text: label };
  }

  randomCargoName() {
    return Phaser.Utils.Array.GetRandom(cargoNames);
  }

  makeRandomOrder(length = 4) {
    const pool = Phaser.Utils.Array.Shuffle([...cargoNames]);
    return pool.slice(0, length);
  }

  setTargetOrder() {
    this.targetOrder = this.makeRandomOrder(4);
    document.getElementById("targetOrder").textContent = this.targetOrder.join(" -> ");
    this.renderTargetPreview();
  }

  updateCurrentOrderText() {
    const current = this.stack.map((item) => item.name);
    document.getElementById("currentOrder").textContent = current.length ? current.join(" -> ") : "(empty)";
  }

  pushCargo(itemName, fromScript = false) {
    if (this.busy) {
      this.updateStatus("Cargo arm busy. Wait for current operation.");
      return false;
    }

    if (this.stack.length >= this.maxSize) {
      this.showWarning("STACK OVERFLOW: Engine rack is full.");
      return false;
    }

    const slotIndex = this.stack.length;
    const targetX = this.stackX;
    const targetY = this.slotBottomY - slotIndex * this.slotStep;
    const crateObj = this.createCrate(itemName, 740, 130);
    this.busy = true;

    const body = crateObj.sprite.body;
    body.setAllowGravity(false);
    body.setVelocity(-700, 610);

    const syncEvent = this.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        crateObj.text.setPosition(crateObj.sprite.x, crateObj.sprite.y + 18);
      }
    });

    this.time.delayedCall(260, () => {
      syncEvent.remove(false);
      body.setVelocity(0, 0);
      crateObj.sprite.setPosition(targetX, targetY);
      crateObj.text.setPosition(targetX, targetY + 18);

      this.tweens.add({
        targets: [crateObj.sprite, crateObj.text],
        y: targetY + 4,
        duration: 70,
        yoyo: true,
        onComplete: () => {
          this.stack.push(crateObj);
          this.emitSparks(targetX, targetY + 24);
          this.busy = false;
          this.updateStatus(`Pushed ${itemName}`);
          this.updateCurrentOrderText();
          this.checkMission();
          if (fromScript) this.runNextCommand();
        }
      });
    });

    return true;
  }

  popCargo(fromScript = false) {
    if (this.busy) {
      this.updateStatus("Cargo arm busy. Wait for current operation.");
      return false;
    }

    if (this.stack.length === 0) {
      this.showWarning("STACK UNDERFLOW: No part to remove.");
      if (fromScript) this.runNextCommand();
      return false;
    }

    this.busy = true;

    const removedItem = this.stack.pop();

    this.tractorBeam.setPosition(removedItem.sprite.x, 150).setVisible(true).setAlpha(0.45);
    this.tweens.add({
      targets: this.tractorBeam,
      alpha: { from: 0.6, to: 0.2 },
      duration: 90,
      yoyo: true,
      repeat: 4
    });

    this.tweens.add({
      targets: [removedItem.sprite, removedItem.text],
      y: 110,
      alpha: 0,
      duration: 260,
      ease: "Sine.easeIn",
      onComplete: () => {
        removedItem.sprite.destroy();
        removedItem.text.destroy();
        this.tractorBeam.setVisible(false).setAlpha(0);
        this.busy = false;
        this.updateStatus(`Popped ${removedItem.name}`);
        this.updateCurrentOrderText();
        this.checkMission();
        if (fromScript) this.runNextCommand();
      }
    });

    return true;
  }

  peekCargo(fromScript = false) {
    if (this.busy) {
      this.updateStatus("Scanner waiting for current operation.");
      return false;
    }

    if (this.stack.length === 0) {
      this.showWarning("No part to scan.");
      if (fromScript) this.runNextCommand();
      return false;
    }

    const topItem = this.stack[this.stack.length - 1];
    const baseScaleX = topItem.sprite.scaleX;
    const baseScaleY = topItem.sprite.scaleY;

    this.scannerBeam.setVisible(true).setAlpha(0.45).setPosition(topItem.sprite.x, topItem.sprite.y);
    this.topTag.setVisible(true).setPosition(topItem.sprite.x, topItem.sprite.y - 48);

    this.tweens.add({
      targets: this.scannerBeam,
      x: { from: topItem.sprite.x - 10, to: topItem.sprite.x + 10 },
      alpha: { from: 0.15, to: 0.55 },
      duration: 110,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.scannerBeam.setVisible(false).setAlpha(0);
      }
    });

    this.tweens.add({
      targets: topItem.sprite,
      scaleX: baseScaleX * 1.05,
      scaleY: baseScaleY * 1.05,
      duration: 75,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        topItem.sprite.setScale(baseScaleX, baseScaleY);
        this.topTag.setVisible(false);
        if (fromScript) this.runNextCommand();
      }
    });

    this.updateStatus(`Scanner detects: ${topItem.name}`);
    this.checkMission();
    return true;
  }

  seedRandomStack() {
    const initialCount = Phaser.Math.Between(2, this.maxSize);
    for (let i = 0; i < initialCount; i += 1) {
      const name = this.randomCargoName();
      const y = this.slotBottomY - i * this.slotStep;
      const crateObj = this.createCrate(name, this.stackX, y);
      crateObj.text.setPosition(this.stackX, y + 18);
      this.stack.push(crateObj);
    }
  }

  resetStack(skipScriptCheck = false) {
    this.stack.forEach((item) => {
      item.sprite.destroy();
      item.text.destroy();
    });

    this.stack = [];
    this.busy = false;
    this.tractorBeam.setVisible(false).setAlpha(0);
    this.scannerBeam.setVisible(false).setAlpha(0);
    this.topTag.setVisible(false);

    this.setTargetOrder();
    this.seedRandomStack();

    this.updateStatus("Stack reset. New puzzle arrangement loaded.");
    this.updateCurrentOrderText();
    this.checkMission();

    if (!skipScriptCheck && this.isRunningScript) {
      this.runNextCommand();
    }
  }

  emitSparks(x, y) {
    const sparks = this.add.particles(x, y, "sparkPixel", {
      speed: { min: 20, max: 90 },
      angle: { min: 230, max: 310 },
      lifespan: 220,
      quantity: 8,
      tint: [0xfdc500, 0xfff7b3],
      scale: { start: 0.24, end: 0 },
      alpha: { start: 1, end: 0 },
      emitting: false
    });

    sparks.explode(10, x, y);
    this.time.delayedCall(240, () => sparks.destroy());
  }

  showWarning(message) {
    this.updateStatus(message);
    this.tweens.add({
      targets: this.chamber,
      alpha: { from: 0.42, to: 0.7 },
      duration: 90,
      yoyo: true,
      repeat: 4
    });

    this.cameras.main.shake(120, 0.0035);
  }

  clearTargetPreview() {
    this.targetPreview.forEach((item) => {
      item.sprite.destroy();
      item.text.destroy();
    });
    this.targetPreview = [];
  }

  renderTargetPreview() {
    this.clearTargetPreview();

    for (let i = 0; i < this.targetOrder.length; i += 1) {
      const itemName = this.targetOrder[i];
      const y = this.slotBottomY - i * this.slotStep;
      const crateObj = this.createCrate(itemName, 668, y);
      crateObj.sprite.setAlpha(0.8);
      crateObj.text.setAlpha(0.95);
      this.targetPreview.push(crateObj);
    }
  }

  updateStatus(lastActionText) {
    const top = this.stack.length > 0 ? this.stack[this.stack.length - 1].name : "None";

    document.getElementById("topCargo").textContent = top;
    document.getElementById("stackSize").textContent = String(this.stack.length);
    document.getElementById("lastAction").textContent = lastActionText;
  }

  checkMission() {
    const missionEl = document.getElementById("missionStatus");
    const current = this.stack.map((item) => item.name);
    const target = this.targetOrder;
    const sameLength = current.length === target.length;
    const matched = sameLength && current.every((name, idx) => name === target[idx]);

    if (matched) {
      missionEl.textContent = "Mission Complete: Engine stack calibrated.";
      missionEl.style.color = "#167b16";
      markCargoGameComplete();
    } else {
      missionEl.textContent = "Mission Incomplete: Match the target stack.";
      missionEl.style.color = "#b51616";
    }
  }

  normalizeCargoName(raw) {
    const cleaned = raw.trim().toLowerCase();
    const underscored = cleaned.replace(/\s+/g, "_");
    return (
      cargoNames.find((name) => {
        const id = name.toLowerCase();
        return cleaned === id || underscored === id;
      }) || null
    );
  }

  startScript(commands) {
    this.commandQueue = commands;
    this.isRunningScript = true;
    this.runNextCommand();
  }

  stopScript() {
    this.commandQueue = [];
    this.isRunningScript = false;
    this.updateStatus("Script stopped.");
  }

  runNextCommand() {
    if (!this.isRunningScript) return;
    if (this.busy) return;

    if (this.commandQueue.length === 0) {
      this.isRunningScript = false;
      this.updateStatus("Script complete.");
      return;
    }

    const cmd = this.commandQueue.shift();
    const op = cmd.op;

    if (op === "PUSH") {
      this.pushCargo(cmd.item, true);
      return;
    }

    if (op === "POP") {
      this.popCargo(true);
      return;
    }

    if (op === "PEEK") {
      this.peekCargo(true);
      return;
    }

    if (op === "RESET") {
      this.resetStack();
      return;
    }

    this.updateStatus(`Unknown command ignored: ${cmd.raw}`);
    this.time.delayedCall(80, () => this.runNextCommand());
  }
}

const config = {
  type: Phaser.AUTO,
  width: 1100,
  height: 840,
  parent: "game-container",
  backgroundColor: "#00173e",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: CargoScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

const game = new Phaser.Game(config);

const getScene = () => game.scene.keys.CargoScene;

document.getElementById("pushBtn").addEventListener("click", () => {
  const selected = document.getElementById("cargoSelect").value;
  getScene().pushCargo(selected);
});

document.getElementById("popBtn").addEventListener("click", () => {
  getScene().popCargo();
});

document.getElementById("peekBtn").addEventListener("click", () => {
  getScene().peekCargo();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  getScene().resetStack();
});

function parseCommands(rawText) {
  const lines = rawText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const commands = [];

  for (const line of lines) {
    const upper = line.toUpperCase();

    if (upper === "POP" || upper === "PEEK" || upper === "RESET") {
      commands.push({ op: upper, raw: line });
      continue;
    }

    if (upper.startsWith("PUSH ")) {
      const itemRaw = line.slice(5).trim();
      const item = getScene().normalizeCargoName(itemRaw);
      if (item) {
        commands.push({ op: "PUSH", item, raw: line });
      } else {
        commands.push({ op: "UNKNOWN", raw: line });
      }
      continue;
    }

    commands.push({ op: "UNKNOWN", raw: line });
  }

  return commands;
}

document.getElementById("runCodeBtn").addEventListener("click", () => {
  const raw = document.getElementById("codeInput").value;
  const commands = parseCommands(raw);
  const scene = getScene();
  scene.startScript(commands);
});

document.getElementById("stopCodeBtn").addEventListener("click", () => {
  getScene().stopScript();
});
