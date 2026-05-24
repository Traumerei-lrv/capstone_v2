const BASE_MAZE = [
  ["S", ".", ".", "X", "D", "."],
  ["X", "X", ".", "X", ".", "."],
  [".", ".", ".", ".", ".", "X"],
  [".", "D", "X", "X", ".", "."],
  [".", ".", ".", "X", ".", "E"],
];

const tileSize = 88;
const gridPadding = 20;
const SHIP_SCALE = 0.1;
const ASTEROID_SCALE = 0.1;
const GAME_PROGRESS_KEY = "balangkas.ship.games_progress.v1";
const GAME_PROGRESS_EVENT = "balangkas:games-progress-updated";
const ASTEROID_GAME_ID = "rocketAvoidingPlan";

let maze = cloneMaze(BASE_MAZE);
let rows = 0;
let cols = 0;

const uiState = {
  isBusy: false,
  isGameOver: false,
  invalidAttempts: 0,
  invalidAttemptLimit: 3,
};

let shipPos = { row: 0, col: 0 };
let startPos = { row: 0, col: 0 };
let exitPos = { row: 0, col: 0 };
let routeHistory = [];
let revealedDanger = new Set();

let gameScene = null;
let bgRect = null;
let shipSprite = null;
let tileSprites = [];
let routeOverlays = [];
let hintOverlay = null;
let warningOverlay = null;
let winOverlay = null;

const dom = {
  input: document.getElementById("coordinate-input"),
  moveBtn: document.getElementById("move-btn"),
  resetBtn: document.getElementById("reset-btn"),
  hintBtn: document.getElementById("hint-btn"),
  randomizeBtn: document.getElementById("randomize-btn"),
  generateGridBtn: document.getElementById("generate-grid-btn"),
  gridSizeSelect: document.getElementById("grid-size-select"),
  status: document.getElementById("status-message"),
  route: document.getElementById("route-history"),
  currentCoordinate: document.getElementById("current-coordinate"),
  arrayValue: document.getElementById("array-value"),
  invalidAttempts: document.getElementById("invalid-attempts"),
};

function markAsteroidGameComplete() {
  try {
    const raw = window.localStorage.getItem(GAME_PROGRESS_KEY);
    const progress = raw ? JSON.parse(raw) : {};

    if (progress[ASTEROID_GAME_ID] === true) {
      return;
    }

    progress[ASTEROID_GAME_ID] = true;
    window.localStorage.setItem(GAME_PROGRESS_KEY, JSON.stringify(progress));
  } catch {}

  window.dispatchEvent(new Event(GAME_PROGRESS_EVENT));
}

function cloneMaze(source) {
  return source.map((row) => [...row]);
}

function syncGridDimensions() {
  rows = maze.length;
  cols = maze[0].length;
}

function coordKey(row, col) {
  return `${row},${col}`;
}

function setStatus(message) {
  dom.status.textContent = message;
}

function isInsideGrid(row, col) {
  return row >= 0 && row < rows && col >= 0 && col < cols;
}

function isAdjacent(row, col) {
  const distance = Math.abs(shipPos.row - row) + Math.abs(shipPos.col - col);
  return distance === 1;
}

function tileCenter(col, row) {
  return {
    x: gridPadding + col * tileSize + tileSize / 2,
    y: gridPadding + row * tileSize + tileSize / 2,
  };
}

function getCanvasWidth() {
  return cols * tileSize + gridPadding * 2;
}

function getCanvasHeight() {
  return rows * tileSize + gridPadding * 2;
}

function findSpecialCoordinates() {
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (maze[row][col] === "S") {
        startPos = { row, col };
      }
      if (maze[row][col] === "E") {
        exitPos = { row, col };
      }
    }
  }
}

function clearHint() {
  if (hintOverlay) {
    hintOverlay.destroy();
    hintOverlay = null;
  }
}

function clearRouteOverlay() {
  routeOverlays.forEach((overlay) => overlay.destroy());
  routeOverlays = [];
}

function clearGridSprites() {
  tileSprites.forEach((rowList) => {
    rowList.forEach((tileData) => {
      tileData.base.destroy();
      tileData.asteroid.destroy();
      tileData.exitGlow.destroy();
      tileData.dangerPulse.destroy();
      tileData.coordLabel.destroy();
      tileData.marker.destroy();
    });
  });
  tileSprites = [];
}

function clearSceneArtifacts() {
  clearHint();
  clearRouteOverlay();

  if (warningOverlay) {
    warningOverlay.destroy();
    warningOverlay = null;
  }

  if (shipSprite) {
    shipSprite.destroy();
    shipSprite = null;
  }

  if (winOverlay) {
    winOverlay.destroy(true);
    winOverlay = null;
  }

  clearGridSprites();
}

function resizeSceneToGrid() {
  if (!gameScene) return;

  const width = getCanvasWidth();
  const height = getCanvasHeight();

  gameScene.scale.resize(width, height);
  gameScene.cameras.main.setSize(width, height);

  if (bgRect) {
    bgRect.setSize(width, height);
    bgRect.setPosition(width / 2, height / 2);
  }
}

function drawRouteOverlay() {
  if (!gameScene) return;

  clearRouteOverlay();

  routeHistory.forEach(({ row, col }, idx) => {
    if (idx === 0) return;
    const center = tileCenter(col, row);
    const glow = gameScene.add.rectangle(center.x, center.y, tileSize - 14, tileSize - 14, 0x2f93ff, 0.25);
    glow.setDepth(1);
    routeOverlays.push(glow);
  });
}

function updateDsaPanel() {
  const currentValue = maze[shipPos.row][shipPos.col];
  dom.currentCoordinate.textContent = `[${shipPos.row},${shipPos.col}]`;
  dom.arrayValue.textContent = currentValue;
  dom.invalidAttempts.textContent = String(uiState.invalidAttempts);
}

function updateRouteHistory() {
  dom.route.textContent = routeHistory.map((item) => `[${item.row},${item.col}]`).join(" -> ");
  drawRouteOverlay();
}

function refreshTileLook(row, col) {
  const tileData = tileSprites[row][col];
  const value = maze[row][col];
  const dangerIsRevealed = revealedDanger.has(coordKey(row, col));

  if (value === "X") {
    tileData.base.setFillStyle(0x101420, 1);
    tileData.asteroid.setVisible(true);
    tileData.exitGlow.setVisible(false);
    tileData.dangerPulse.setVisible(false);
  } else if (value === "E") {
    tileData.base.setFillStyle(0x13254b, 1);
    tileData.asteroid.setVisible(false);
    tileData.exitGlow.setVisible(true);
    tileData.dangerPulse.setVisible(false);
  } else if (value === "D" && dangerIsRevealed) {
    tileData.base.setFillStyle(0x4d0f18, 1);
    tileData.asteroid.setVisible(false);
    tileData.exitGlow.setVisible(false);
    tileData.dangerPulse.setVisible(true);
  } else {
    tileData.base.setFillStyle(0x1a2f57, 1);
    tileData.asteroid.setVisible(false);
    tileData.exitGlow.setVisible(false);
    tileData.dangerPulse.setVisible(false);
  }
}

function refreshGridVisuals() {
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      refreshTileLook(row, col);
    }
  }
}

function buildGrid(scene) {
  tileSprites = [];

  for (let row = 0; row < rows; row += 1) {
    const rowSprites = [];

    for (let col = 0; col < cols; col += 1) {
      const x = gridPadding + col * tileSize;
      const y = gridPadding + row * tileSize;
      const value = maze[row][col];

      const base = scene.add.rectangle(x + tileSize / 2, y + tileSize / 2, tileSize - 2, tileSize - 2, 0x1a2f57);
      base.setStrokeStyle(2, 0x3969a3);
      base.setDepth(0);

      const asteroidKey = `asteroid${(row * cols + col) % 6}`;
      const asteroid = scene.add.image(x + tileSize / 2, y + tileSize / 2, asteroidKey);
      asteroid.setScale(ASTEROID_SCALE);
      asteroid.setVisible(false);
      asteroid.setDepth(3);

      const exitGlow = scene.add.circle(x + tileSize / 2, y + tileSize / 2, tileSize * 0.28, 0x79ffd7, 0.38);
      exitGlow.setVisible(false);
      exitGlow.setDepth(1);
      scene.tweens.add({
        targets: exitGlow,
        alpha: { from: 0.28, to: 0.75 },
        yoyo: true,
        repeat: -1,
        duration: 850,
      });

      const dangerPulse = scene.add.circle(x + tileSize / 2, y + tileSize / 2, tileSize * 0.3, 0xff4e4e, 0.42);
      dangerPulse.setVisible(false);
      dangerPulse.setDepth(2);
      scene.tweens.add({
        targets: dangerPulse,
        alpha: { from: 0.2, to: 0.65 },
        scale: { from: 0.92, to: 1.08 },
        yoyo: true,
        repeat: -1,
        duration: 380,
      });

      const coordLabel = scene.add
        .text(x + tileSize / 2, y + 10, `[${row},${col}]`, {
          fontFamily: "Courier New",
          fontSize: "12px",
          color: "#bde1ff",
        })
        .setOrigin(0.5, 0);
      coordLabel.setDepth(4);

      const markerText = value === "S" ? "S" : value === "E" ? "E" : "";
      const marker = scene.add
        .text(x + tileSize / 2, y + tileSize - 12, markerText, {
          fontFamily: "Courier New",
          fontSize: "14px",
          color: value === "S" ? "#6ee7ff" : "#98ffc4",
          fontStyle: "bold",
        })
        .setOrigin(0.5, 1);
      marker.setDepth(4);

      rowSprites.push({
        base,
        asteroid,
        exitGlow,
        dangerPulse,
        coordLabel,
        marker,
      });
    }

    tileSprites.push(rowSprites);
  }

  refreshGridVisuals();
}

function createWarningOverlay(scene) {
  warningOverlay = scene.add.text(0, 0, "!", {
    fontFamily: "Courier New",
    fontSize: "48px",
    color: "#ffcc52",
    fontStyle: "bold",
  });
  warningOverlay.setOrigin(0.5);
  warningOverlay.setDepth(36);
  warningOverlay.setVisible(false);
}

function animateShipMove(row, col) {
  return new Promise((resolve) => {
    const center = tileCenter(col, row);
    gameScene.tweens.add({
      targets: shipSprite,
      x: center.x,
      y: center.y,
      duration: 360,
      ease: "Sine.InOut",
      onComplete: resolve,
    });
  });
}

function animateShipEntry() {
  return new Promise((resolve) => {
    const center = tileCenter(startPos.col, startPos.row);
    shipSprite.setPosition(center.x, gameScene.scale.height + tileSize);
    shipSprite.setAlpha(0);

    uiState.isBusy = true;
    setStatus("Launch sequence started...");

    gameScene.tweens.add({
      targets: shipSprite,
      y: center.y,
      alpha: 1,
      duration: 760,
      ease: "Cubic.Out",
      onComplete: () => {
        uiState.isBusy = false;
        setStatus("Enter an adjacent coordinate to navigate the ship.");
        resolve();
      },
    });
  });
}

function spawnShip(animateEntry = false) {
  const startCenter = tileCenter(startPos.col, startPos.row);
  shipSprite = gameScene.add.image(startCenter.x, startCenter.y, "ship").setScale(SHIP_SCALE);
  shipSprite.setDepth(20);

  if (animateEntry) {
    animateShipEntry();
  }
}

function showWinOverlay() {
  if (winOverlay) {
    winOverlay.destroy(true);
  }

  winOverlay = gameScene.add.container(0, 0);
  const w = gameScene.scale.width;
  const h = gameScene.scale.height;

  const shade = gameScene.add.rectangle(w / 2, h / 2, w, h, 0x061128, 0.72);
  const box = gameScene.add.rectangle(w / 2, h / 2, w * 0.7, 130, 0x0d2a4a, 0.92).setStrokeStyle(2, 0x66d3ff);
  const title = gameScene.add
    .text(w / 2, h / 2 - 18, "ESCAPE ROUTE FOUND!", {
      fontFamily: "Courier New",
      fontSize: "34px",
      color: "#ffe97a",
      fontStyle: "bold",
    })
    .setOrigin(0.5);
  const subtitle = gameScene.add
    .text(w / 2, h / 2 + 24, "Safe route found!", {
      fontFamily: "Courier New",
      fontSize: "20px",
      color: "#e2f3ff",
    })
    .setOrigin(0.5);

  winOverlay.add([shade, box, title, subtitle]);
  winOverlay.setDepth(50);
}

function playExplosionAt(x, y) {
  const flare = gameScene.add.circle(x, y, 12, 0xff4f2d, 0.96).setDepth(35);
  const ring = gameScene.add.circle(x, y, 16, 0xffd37d, 0.5).setStrokeStyle(3, 0xff6347).setDepth(34);
  gameScene.tweens.add({
    targets: [flare, ring],
    scale: 3.2,
    alpha: 0,
    duration: 450,
    ease: "Quad.Out",
    onComplete: () => {
      flare.destroy();
      ring.destroy();
    },
  });

  const particles = gameScene.add.particles(0, 0, "spark", {
    x,
    y,
    speed: { min: 45, max: 180 },
    lifespan: 430,
    quantity: 22,
    scale: { start: 1.4, end: 0.15 },
    blendMode: "ADD",
    tint: [0xff6846, 0xffcf6f, 0xff2b2b],
  });
  gameScene.time.delayedCall(420, () => particles.destroy());
}

function revealDanger(row, col) {
  revealedDanger.add(coordKey(row, col));
  refreshTileLook(row, col);
}

function updateShipState(row, col) {
  shipPos = { row, col };
  routeHistory.push({ row, col });
  updateRouteHistory();
  updateDsaPanel();
}

function validateMove(row, col) {
  if (uiState.isBusy || uiState.isGameOver) {
    return { ok: false, reason: "Systems busy. Wait for the current action." };
  }

  if (!isInsideGrid(row, col)) {
    return { ok: false, reason: "Coordinate outside the grid." };
  }

  if (!isAdjacent(row, col)) {
    return {
      ok: false,
      reason: "Coordinate is not adjacent. Move only up, down, left, or right.",
    };
  }

  if (maze[row][col] === "X") {
    return { ok: false, reason: "Blocked path. Asteroid cluster ahead." };
  }

  return { ok: true, cellType: maze[row][col] };
}

function incrementInvalidAttempt() {
  uiState.invalidAttempts += 1;
  dom.invalidAttempts.textContent = String(uiState.invalidAttempts);

  if (uiState.invalidAttemptLimit > 0 && uiState.invalidAttempts >= uiState.invalidAttemptLimit) {
    setStatus("Too many invalid coordinates. Navigation reset.");
    resetGame();
  }
}

function parseCoordinateSequence(rawInput) {
  const matches = rawInput.matchAll(/(-?\d+)\s*,\s*(-?\d+)/g);
  const path = [];

  for (const match of matches) {
    path.push({
      row: Number.parseInt(match[1], 10),
      col: Number.parseInt(match[2], 10),
    });
  }

  return path;
}

async function handleDangerTile(row, col) {
  uiState.isBusy = true;
  await animateShipMove(row, col);
  updateShipState(row, col);
  setStatus("Danger route detected too late!");

  revealDanger(row, col);

  warningOverlay.setPosition(shipSprite.x, shipSprite.y);
  warningOverlay.setVisible(true);
  gameScene.tweens.add({
    targets: warningOverlay,
    alpha: { from: 1, to: 0.2 },
    yoyo: true,
    repeat: 1,
    duration: 120,
  });

  await new Promise((resolve) => gameScene.time.delayedCall(330, resolve));

  playExplosionAt(shipSprite.x, shipSprite.y);
  gameScene.cameras.main.shake(320, 0.01);
  setStatus("This route looked safe, but it led to doom. The ship was destroyed. Resetting...");

  await new Promise((resolve) => gameScene.time.delayedCall(1150, resolve));
  warningOverlay.setVisible(false);
  resetGame();
}

function handleExitTile() {
  setStatus("Safe route found!");
  uiState.isGameOver = true;
  showWinOverlay();
  markAsteroidGameComplete();
  uiState.isBusy = false;
}

async function moveShipTo(row, col) {
  clearHint();
  const cellType = maze[row][col];

  if (cellType === "D") {
    await handleDangerTile(row, col);
    return;
  }

  uiState.isBusy = true;
  await animateShipMove(row, col);
  updateShipState(row, col);

  if (cellType === "E") {
    handleExitTile();
    return;
  }

  setStatus("Coordinate accepted.");
  uiState.isBusy = false;
}

function resetShipVisual() {
  const center = tileCenter(startPos.col, startPos.row);
  shipSprite.setPosition(center.x, center.y);
  shipSprite.setAlpha(1);
  warningOverlay.setVisible(false);
  warningOverlay.setAlpha(1);
}

function resetGame() {
  uiState.isBusy = false;
  uiState.isGameOver = false;
  uiState.invalidAttempts = 0;
  revealedDanger.clear();
  shipPos = { ...startPos };
  routeHistory = [{ ...startPos }];

  if (winOverlay) {
    winOverlay.destroy(true);
    winOverlay = null;
  }

  clearHint();
  refreshGridVisuals();
  resetShipVisual();
  updateRouteHistory();
  updateDsaPanel();
  dom.input.value = "";
  setStatus("Navigation reset. Plot a new route from the start coordinate.");
}

function renderHint(row, col) {
  clearHint();
  const center = tileCenter(col, row);
  hintOverlay = gameScene.add.rectangle(center.x, center.y, tileSize - 20, tileSize - 20, 0xffdd55, 0.28);
  hintOverlay.setStrokeStyle(2, 0xfff4a1);
  hintOverlay.setDepth(2);
}

function findNextBfsStep() {
  const queue = [{ row: shipPos.row, col: shipPos.col }];
  const visited = new Set([coordKey(shipPos.row, shipPos.col)]);
  const parent = new Map();
  const directions = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current.row === exitPos.row && current.col === exitPos.col) {
      break;
    }

    directions.forEach(({ dr, dc }) => {
      const nextRow = current.row + dr;
      const nextCol = current.col + dc;
      const key = coordKey(nextRow, nextCol);
      if (!isInsideGrid(nextRow, nextCol)) return;
      if (visited.has(key)) return;

      const value = maze[nextRow][nextCol];
      if (value === "X" || value === "D") return;

      visited.add(key);
      parent.set(key, coordKey(current.row, current.col));
      queue.push({ row: nextRow, col: nextCol });
    });
  }

  const exitKey = coordKey(exitPos.row, exitPos.col);
  if (!visited.has(exitKey)) return null;

  let cursor = exitKey;
  let previous = parent.get(cursor);
  while (previous && previous !== coordKey(shipPos.row, shipPos.col)) {
    cursor = previous;
    previous = parent.get(cursor);
  }

  if (!previous) return null;
  const [row, col] = cursor.split(",").map((num) => Number.parseInt(num, 10));
  return { row, col };
}

function showBfsHint() {
  if (uiState.isBusy || uiState.isGameOver) return;
  const hint = findNextBfsStep();

  if (!hint) {
    setStatus("No safe BFS hint from this position (danger and asteroids are avoided).");
    clearHint();
    return;
  }

  renderHint(hint.row, hint.col);
  setStatus(`BFS hint: next safe coordinate is [${hint.row},${hint.col}].`);
}

function parseAndValidateInput() {
  const path = parseCoordinateSequence(dom.input.value);
  if (path.length === 0) {
    setStatus("Invalid input format. Use coordinates like 2,3 or 2,3;2,4;3,4.");
    incrementInvalidAttempt();
    return null;
  }

  return path;
}

async function handleCoordinateInput() {
  if (uiState.isBusy || uiState.isGameOver) {
    setStatus("Systems busy. Wait for the current action.");
    return;
  }

  const path = parseAndValidateInput();
  if (!path) return;

  for (let stepIndex = 0; stepIndex < path.length; stepIndex += 1) {
    const step = path[stepIndex];
    const check = validateMove(step.row, step.col);

    if (!check.ok) {
      setStatus(`Path stopped at step ${stepIndex + 1}: ${check.reason}`);
      incrementInvalidAttempt();
      return;
    }

    await moveShipTo(step.row, step.col);

    if (check.cellType === "D" || uiState.isGameOver) {
      return;
    }
  }

  setStatus("Path sequence complete.");
}

function generateRandomMaze(rowCount, colCount) {
  const generated = Array.from({ length: rowCount }, () => Array.from({ length: colCount }, () => "X"));

  const path = [];
  let row = 0;
  let col = 0;
  path.push({ row, col });

  while (row !== rowCount - 1 || col !== colCount - 1) {
    const options = [];
    if (row < rowCount - 1) options.push({ row: row + 1, col });
    if (col < colCount - 1) options.push({ row, col: col + 1 });

    const next = options[Math.floor(Math.random() * options.length)];
    row = next.row;
    col = next.col;
    path.push({ row, col });
  }

  const safePathKeys = new Set(path.map((cell) => coordKey(cell.row, cell.col)));

  for (let r = 0; r < rowCount; r += 1) {
    for (let c = 0; c < colCount; c += 1) {
      const key = coordKey(r, c);

      if (r === 0 && c === 0) {
        generated[r][c] = "S";
        continue;
      }

      if (r === rowCount - 1 && c === colCount - 1) {
        generated[r][c] = "E";
        continue;
      }

      if (safePathKeys.has(key)) {
        generated[r][c] = ".";
        continue;
      }

      const roll = Math.random();
      if (roll < 0.34) {
        generated[r][c] = "X";
      } else if (roll < 0.5) {
        generated[r][c] = "D";
      } else {
        generated[r][c] = ".";
      }
    }
  }

  return generated;
}

function applyMaze(nextMaze, launchEntry = true) {
  maze = cloneMaze(nextMaze);
  syncGridDimensions();
  findSpecialCoordinates();

  revealedDanger.clear();
  shipPos = { ...startPos };
  routeHistory = [{ ...startPos }];
  uiState.invalidAttempts = 0;
  uiState.isBusy = false;
  uiState.isGameOver = false;

  if (!gameScene) return;

  clearSceneArtifacts();
  resizeSceneToGrid();
  buildGrid(gameScene);
  createWarningOverlay(gameScene);
  spawnShip(launchEntry);
  updateRouteHistory();
  updateDsaPanel();

  if (!launchEntry) {
    setStatus("Grid updated. Enter an adjacent coordinate to navigate the ship.");
  }
}

function handleRandomizeRoute() {
  if (uiState.isBusy) return;

  const generated = generateRandomMaze(rows, cols);
  applyMaze(generated, true);
}

function handleGenerateGrid() {
  if (uiState.isBusy) return;

  const sizeText = dom.gridSizeSelect?.value || "5x6";
  const match = sizeText.match(/^(\d+)x(\d+)$/i);

  if (!match) {
    setStatus("Invalid grid size format.");
    return;
  }

  const rowCount = Number.parseInt(match[1], 10);
  const colCount = Number.parseInt(match[2], 10);

  if (!Number.isFinite(rowCount) || !Number.isFinite(colCount) || rowCount < 3 || colCount < 3) {
    setStatus("Grid size is out of range.");
    return;
  }

  const generated = generateRandomMaze(rowCount, colCount);
  applyMaze(generated, true);
}

function bindUiHandlers() {
  dom.moveBtn.addEventListener("click", () => {
    handleCoordinateInput();
  });

  dom.resetBtn.addEventListener("click", () => {
    resetGame();
  });

  dom.hintBtn.addEventListener("click", () => {
    showBfsHint();
  });

  dom.randomizeBtn?.addEventListener("click", () => {
    handleRandomizeRoute();
  });

  dom.generateGridBtn?.addEventListener("click", () => {
    handleGenerateGrid();
  });

  dom.input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleCoordinateInput();
    }
  });
}

const mainScene = {
  preload() {
    this.load.image("ship", "./ship.png");
    this.load.image("asteroid0", "./asteroid1.png");
    this.load.image("asteroid1", "./asteroid2.png");
    this.load.image("asteroid2", "./asteroid3.png");
    this.load.image("asteroid3", "./asteroid4.png");
    this.load.image("asteroid4", "./asteroid5.png");
    this.load.image("asteroid5", "./asteroid6.png");
  },

  create() {
    gameScene = this;

    const spark = this.make.graphics({ x: 0, y: 0, add: false });
    spark.fillStyle(0xffffff, 1);
    spark.fillCircle(2, 2, 2);
    spark.generateTexture("spark", 4, 4);

    bgRect = this.add.rectangle(getCanvasWidth() / 2, getCanvasHeight() / 2, getCanvasWidth(), getCanvasHeight(), 0x071326);
    bgRect.setDepth(-1);

    buildGrid(this);
    createWarningOverlay(this);
    spawnShip(true);

    routeHistory = [{ ...startPos }];
    updateRouteHistory();
    updateDsaPanel();
  },

  update() {},
};

function initGame() {
  syncGridDimensions();
  findSpecialCoordinates();
  shipPos = { ...startPos };
  routeHistory = [{ ...startPos }];
  bindUiHandlers();

  const config = {
    type: Phaser.AUTO,
    width: getCanvasWidth(),
    height: getCanvasHeight(),
    parent: "game-container",
    transparent: true,
    scene: mainScene,
  };

  new Phaser.Game(config);
  setStatus("Preparing launch...");
}

initGame();
