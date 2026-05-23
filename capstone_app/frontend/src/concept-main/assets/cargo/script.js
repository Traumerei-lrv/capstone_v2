const cargoTypes = {
  "Fuel Cell": { color: 0xffd500, label: "FUEL", texture: "fuelcell" },
  "Oxygen Tank": { color: 0x389fe1, label: "O2", texture: "oxygen" },
  "Repair Kit": { color: 0xff5555, label: "FIX", texture: "repairkit" },
  "Data Core": { color: 0x8e5cff, label: "DATA", texture: "datacore" },
  "Shield Battery": { color: 0x00ffaa, label: "SHLD", texture: "shield" },
  "Food Capsule": { color: 0xffaa00, label: "FOOD", texture: "food" }
};

const cargoNames = Object.keys(cargoTypes);

class CargoScene extends Phaser.Scene {
  constructor() {
    super("CargoScene");
    this.stack = [];
    this.maxSize = 6;
    this.slotXs = [160, 250, 340, 430, 520, 610];
    this.slotY = 430;
    this.busy = false;
    this.targetOrder = [];
    this.commandQueue = [];
    this.isRunningScript = false;
  }

  preload() {
    this.load.image("fuelcell", "./fuelcell.png");
    this.load.image("oxygen", "./oxygen.png");
    this.load.image("repairkit", "./repairkit.png");
    this.load.image("datacore", "./datacore.png");
    this.load.image("shield", "./shield.png");
    this.load.image("food", "./food.png");
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

    this.add.rectangle(w / 2, h - 45, w, 90, 0x001f4f, 0.95).setStrokeStyle(2, 0x00509d);
    this.add.rectangle(120, 80, 210, 90, 0x012f73, 0.85).setStrokeStyle(2, 0xfdc500);
    this.add.rectangle(w - 120, 88, 220, 95, 0x012f73, 0.85).setStrokeStyle(2, 0xfdc500);

    this.add.text(36, 58, "HORIZONTAL CARGO BAY", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#ffd500"
    });

    this.warningLight = this.add.circle(w - 60, 52, 11, 0xff0000, 0.35).setStrokeStyle(2, 0xff7777);

    this.chamber = this.add.rectangle(w / 2, this.slotY + 18, 560, 120, 0x001f52, 0.45)
      .setStrokeStyle(4, 0x89b2ff);

    this.slotXs.forEach((x, idx) => {
      this.add.line(x, this.slotY, 0, -44, 0, 44, 0x2e72d6, 0.8).setLineWidth(2);
      this.add.text(x - 12, this.slotY + 56, `S${idx + 1}`, {
        fontFamily: "monospace",
        fontSize: "12px",
        color: "#9fc5ff"
      });
    });

    this.tractorBeam = this.add.rectangle(0, 150, 78, 260, 0x7bdfff, 0)
      .setOrigin(0.5, 0)
      .setVisible(false);

    this.scannerBeam = this.add.rectangle(0, 0, 86, 56, 0x00ffaa, 0).setVisible(false);

    this.topTag = this.add.text(0, 0, "TOP", {
      fontFamily: "monospace",
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
    const crate = this.add.image(startX, startY, data.texture).setDisplaySize(82, 56);
    this.physics.add.existing(crate);

    const label = this.add.text(startX, startY + 22, data.label, {
      fontFamily: "monospace",
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
      this.showWarning("STACK OVERFLOW: Cargo chamber full.");
      return false;
    }

    const slotIndex = this.stack.length;
    const targetX = this.slotXs[slotIndex];
    const targetY = this.slotY;
    const crateObj = this.createCrate(itemName, 760, 175);
    this.busy = true;

    const body = crateObj.sprite.body;
    body.setAllowGravity(false);
    body.setVelocity(-700, 520);

    const syncEvent = this.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        crateObj.text.setPosition(crateObj.sprite.x, crateObj.sprite.y + 22);
      }
    });

    this.time.delayedCall(260, () => {
      syncEvent.remove(false);
      body.setVelocity(0, 0);
      crateObj.sprite.setPosition(targetX, targetY);
      crateObj.text.setPosition(targetX, targetY + 22);

      this.tweens.add({
        targets: [crateObj.sprite, crateObj.text],
        y: targetY + 4,
        duration: 70,
        yoyo: true,
        onComplete: () => {
          // PUSH: add item to the top of the stack
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
      this.showWarning("STACK UNDERFLOW: No cargo to remove.");
      if (fromScript) this.runNextCommand();
      return false;
    }

    this.busy = true;

    // POP: remove the top item from the stack
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
      this.showWarning("No cargo to scan.");
      if (fromScript) this.runNextCommand();
      return false;
    }

    // PEEK: check top item without removing it
    const topItem = this.stack[this.stack.length - 1];

    this.scannerBeam.setVisible(true).setAlpha(0.45).setPosition(topItem.sprite.x, topItem.sprite.y);
    this.topTag.setVisible(true).setPosition(topItem.sprite.x, topItem.sprite.y - 42);

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
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 75,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        topItem.sprite.setScale(1, 1);
        this.topTag.setVisible(false);
        if (fromScript) this.runNextCommand();
      }
    });

    this.updateStatus(`Scanner detects: ${topItem.name}`);
    this.checkMission();
    return true;
  }

  seedRandomStack() {
    const initialCount = Phaser.Math.Between(3, 5);
    for (let i = 0; i < initialCount; i += 1) {
      const name = this.randomCargoName();
      const x = this.slotXs[i];
      const crateObj = this.createCrate(name, x, this.slotY);
      crateObj.text.setPosition(x, this.slotY + 22);
      // PUSH: add item to the top of the stack
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
    this.warningLight.setFillStyle(0xff0000, 0.35);

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
      targets: this.warningLight,
      alpha: { from: 0.25, to: 1 },
      duration: 90,
      yoyo: true,
      repeat: 4,
      onUpdate: () => this.warningLight.setFillStyle(0xff3030)
    });

    this.cameras.main.shake(120, 0.0035);
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
      missionEl.textContent = "Mission Complete: Target arrangement achieved.";
      missionEl.style.color = "#167b16";
    } else {
      missionEl.textContent = "Mission Incomplete: Match the target arrangement.";
      missionEl.style.color = "#b51616";
    }
  }

  normalizeCargoName(raw) {
    const cleaned = raw.trim().toLowerCase();
    return cargoNames.find((name) => name.toLowerCase() === cleaned) || null;
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
  width: 800,
  height: 600,
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
