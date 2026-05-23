const nodeBad = "./node_bad.png";
const nodeGood = "./node_good.png";
const XP_STORAGE_KEY = "balangkas.student.bonus_xp";
const TURBINE_XP_REWARD = 150;

const goodOrder = ["L1", "L2", "L3", "L4", "L5"];

const ring = document.getElementById("ring");
const queueEl = document.getElementById("queue");
const codeEl = document.getElementById("code");
const runBtn = document.getElementById("runBtn");
const resetBtn = document.getElementById("resetBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const statusLine = document.getElementById("statusLine");
const diagnosticLog = document.getElementById("diagnosticLog");
const tipText = document.getElementById("tipText");
const repairFill = document.getElementById("repairFill");
const turbineStatus = document.getElementById("turbineStatus");

const spinner = document.createElement("img");
spinner.id = "spinner";
spinner.src = "./turbinething.png";
spinner.alt = "Turbine spinner";

const state = {
  nodes: ["L3", "L1", "L5", "L2", "L4"],
  dragging: null,
  success: false,
  xpAwardedForCurrentRepair: false,
  activeIndex: -1,
  movingDot: null,
  readTimer: null,
  syncingFromDrag: false
};

let xpPopupTimer = null;

function awardXp(amount) {
  try {
    const raw = window.localStorage.getItem(XP_STORAGE_KEY);
    const current = Number.parseInt(raw || "0", 10);
    const next = (Number.isFinite(current) ? current : 0) + amount;
    window.localStorage.setItem(XP_STORAGE_KEY, String(next));
    window.dispatchEvent(new Event("balangkas:xp-updated"));
  } catch {}
}

function showXpPopup(message) {
  const existing = document.querySelector(".xp-popup");

  if (existing) {
    existing.remove();
  }

  const popup = document.createElement("div");
  popup.className = "xp-popup";
  popup.setAttribute("role", "status");
  popup.setAttribute("aria-live", "polite");
  popup.textContent = message;
  document.body.appendChild(popup);

  if (xpPopupTimer) {
    clearTimeout(xpPopupTimer);
  }

  xpPopupTimer = setTimeout(() => {
    popup.remove();
    xpPopupTimer = null;
  }, 2200);
}

const positions = [
  { x: 50, y: 10 },
  { x: 86, y: 35 },
  { x: 72, y: 78 },
  { x: 28, y: 78 },
  { x: 14, y: 35 }
];

function linkedListCodeFromNodes(nodes) {
  const nodeLines = nodes
    .map((node, index) => {
      const next = nodes[index + 1] ? `"${nodes[index + 1]}"` : "null";
      return `    ${node}: { value: "${node}", next: ${next} }`;
    })
    .join(",\n");

  return `const linkedList = {
  head: "${nodes[0]}",
  tail: "${nodes[nodes.length - 1]}",
  nodes: {
${nodeLines}
  }
};

traverse(linkedList);`;
}

function syncCodeFromArrangement() {
  state.syncingFromDrag = true;
  codeEl.value = linkedListCodeFromNodes(state.nodes);
  state.syncingFromDrag = false;
}

function parseLinkedListFromCode(text) {
  const headMatch = text.match(/head\s*:\s*["'](L\d+)["']/i);
  const tailMatch = text.match(/tail\s*:\s*["'](L\d+)["']/i);

  if (!headMatch || !tailMatch) {
    return null;
  }

  const head = headMatch[1].toUpperCase();
  const tail = tailMatch[1].toUpperCase();

  const nodeRegex =
    /(L\d+)\s*:\s*\{\s*value\s*:\s*["'](L\d+)["']\s*,\s*next\s*:\s*(?:"(L\d+)"|'(L\d+)'|null)\s*\}/gi;

  const map = {};
  let match;

  while ((match = nodeRegex.exec(text)) !== null) {
    const key = match[1].toUpperCase();
    const value = match[2].toUpperCase();
    const next = match[3] || match[4] || null;

    map[key] = {
      value,
      next: next ? next.toUpperCase() : null
    };
  }

  if (Object.keys(map).length === 0) {
    return null;
  }

  const order = [];
  const visited = new Set();
  let current = head;

  while (current !== null) {
    if (visited.has(current)) {
      return {
        head,
        tail,
        order,
        map,
        hasCycle: true,
        brokenAt: current
      };
    }

    const node = map[current];

    if (!node) {
      return {
        head,
        tail,
        order,
        map,
        missingNode: current
      };
    }

    if (node.value !== current) {
      return {
        head,
        tail,
        order,
        map,
        wrongValueAt: current
      };
    }

    visited.add(current);
    order.push(current);
    current = node.next;
  }

  return {
    head,
    tail,
    order,
    map,
    hasCycle: false
  };
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((item, i) => item === b[i]);
}

function isValidNodeSet(nodes) {
  return (
    nodes.length === goodOrder.length &&
    nodes.every((node) => goodOrder.includes(node)) &&
    new Set(nodes).size === goodOrder.length
  );
}

function renderQueue(mode = "neutral") {
  queueEl.innerHTML = "";

  state.nodes.forEach((id, index) => {
    const chip = document.createElement("div");
    chip.className = "chip";

    if (mode === "checked") {
      chip.classList.add(id === goodOrder[index] ? "good" : "bad");
    }

    chip.draggable = true;
    chip.dataset.index = String(index);
    chip.textContent = id;

    chip.addEventListener("dragstart", () => {
      state.dragging = index;
    });

    chip.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    chip.addEventListener("drop", () => {
      if (state.dragging === null || state.dragging === index) return;

      const updated = [...state.nodes];
      const [picked] = updated.splice(state.dragging, 1);
      updated.splice(index, 0, picked);

      state.nodes = updated;
      state.dragging = null;
      state.success = false;
      state.xpAwardedForCurrentRepair = false;
      state.activeIndex = -1;
      state.movingDot = null;

      clearReadTimer();
      renderQueue("neutral");
      renderLinkedList(false);
      syncCodeFromArrangement();

      statusLine.className = "status-line";
      statusLine.textContent =
        "Arrangement updated. Click Run Diagnostics to check linked list.";

      diagnosticLog.textContent =
        "Console ready. Linked list code synced from arrangement.";
    });

    queueEl.appendChild(chip);
  });
}

function renderConnections(color) {
  let svg = `
    <svg viewBox="0 0 300 300" width="100%" height="100%" aria-hidden="true" style="position:absolute;left:0;top:0;z-index:1;">
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="${color}"></path>
        </marker>
      </defs>
  `;

  for (let i = 0; i < state.nodes.length - 1; i++) {
    const start = positions[i];
    const end = positions[i + 1];

    const x1 = start.x * 3;
    const y1 = start.y * 3;
    const x2 = end.x * 3;
    const y2 = end.y * 3;

    const active = i === state.activeIndex;
    const strokeWidth = active ? 7 : 4;
    const strokeColor = active ? "#2e8bff" : color;

    svg += `
      <line
        x1="${x1}"
        y1="${y1}"
        x2="${x2}"
        y2="${y2}"
        stroke="${strokeColor}"
        stroke-width="${strokeWidth}"
        marker-end="url(#arrow)"
      />
    `;
  }

  if (state.movingDot) {
    svg += `
      <circle
        cx="${state.movingDot.x}"
        cy="${state.movingDot.y}"
        r="7"
        fill="#2e8bff"
      />
    `;
  }

  svg += `</svg>`;

  return svg;
}

function renderLinkedList(good) {
  const color = good ? "#43d443" : "#ff2a2a";
  const nodeImg = good ? nodeGood : nodeBad;

  const nodeHtml = state.nodes
    .map((node, index) => {
      const p = positions[index];
      const labelX = p.x + (p.x > 50 ? 5 : -8);
      const labelY = p.y + (p.y < 20 ? -4 : 10);

      const activeStyle =
        index === state.activeIndex
          ? "filter: drop-shadow(0 0 8px #2e8bff);"
          : "";

      return `
        <button class="node" style="left:${p.x}%; top:${p.y}%; ${activeStyle}" aria-label="${node}" type="button">
          <img src="${nodeImg}" alt="${node}">
        </button>
        <div class="node-label" style="left:${labelX}%; top:${labelY}%">${node}</div>
      `;
    })
    .join("");

  ring.innerHTML = `
    ${renderConnections(color)}
    <div class="head-label">HEAD: ${state.nodes[0] || "?"}</div>
    <div class="tail-label">TAIL: ${state.nodes[state.nodes.length - 1] || "?"}</div>
    <div class="hub"></div>
    ${nodeHtml}
  `;

  ring.querySelector(".hub").appendChild(spinner);
}

function setSpin(mode) {
  spinner.classList.remove("spin-fast", "spin-fade");

  if (mode === "good") {
    spinner.classList.add("spin-fast");
    return;
  }

  spinner.classList.add("spin-fade");

  setTimeout(() => {
    if (!state.success) {
      spinner.classList.remove("spin-fade");
    }
  }, 1600);
}

function clearReadTimer() {
  if (state.readTimer) {
    clearInterval(state.readTimer);
    state.readTimer = null;
  }
}

function logLine(text) {
  diagnosticLog.textContent += `\n${text}`;
  diagnosticLog.scrollTop = diagnosticLog.scrollHeight;
}

function getPositionByIndex(index) {
  return positions[index] || positions[0];
}

function moveDotBetweenNodes(fromIndex, toIndex, progress) {
  const from = getPositionByIndex(fromIndex);
  const to = getPositionByIndex(toIndex);

  return {
    x: (from.x + (to.x - from.x) * progress) * 3,
    y: (from.y + (to.y - from.y) * progress) * 3
  };
}

function animateTraversal(order, success) {
  clearReadTimer();

  let nodeIndex = 0;
  let progress = 0;

  state.activeIndex = -1;
  state.movingDot = null;

  diagnosticLog.textContent = "Starting linked list traversal...";

  function step() {
    if (nodeIndex >= order.length) {
      state.activeIndex = -1;
      state.movingDot = null;

      renderLinkedList(success);

      if (success) {
        logLine("TAIL reached. Linked list connection is stable.");
      } else {
        logLine("Traversal ended, but linked list is not correctly connected.");
      }

      clearReadTimer();
      return;
    }

    const currentNode = order[nodeIndex];
    const currentVisualIndex = state.nodes.indexOf(currentNode);

    state.activeIndex = currentVisualIndex;

    if (progress === 0) {
      logLine(`Reading node: ${currentNode}`);
    }

    if (nodeIndex < order.length - 1) {
      const nextNode = order[nodeIndex + 1];
      const nextVisualIndex = state.nodes.indexOf(nextNode);

      state.movingDot = moveDotBetweenNodes(
        currentVisualIndex,
        nextVisualIndex,
        progress
      );

      progress += 0.08;

      if (progress >= 1) {
        progress = 0;
        nodeIndex++;
      }
    } else {
      const p = getPositionByIndex(currentVisualIndex);

      state.movingDot = {
        x: p.x * 3,
        y: p.y * 3
      };

      nodeIndex++;
    }

    renderLinkedList(success);
  }

  step();
  state.readTimer = setInterval(step, 60);
}

function runDiagnostics() {
  clearReadTimer();

  const parsed = parseLinkedListFromCode(codeEl.value);

  let codeOrder = [];
  let codeHeadOk = false;
  let codeTailOk = false;
  let codeLinksOk = false;
  const arrangementOk = arraysEqual(state.nodes, goodOrder);

  const issues = [];

  if (!parsed) {
    issues.push("linked list code is missing head, tail, or node definitions");
  } else {
    codeOrder = parsed.order || [];

    codeHeadOk = parsed.head === "L1";
    codeTailOk = parsed.tail === "L5";
    codeLinksOk =
      arraysEqual(codeOrder, goodOrder) &&
      !parsed.hasCycle &&
      !parsed.missingNode &&
      !parsed.wrongValueAt;

    if (!codeHeadOk) {
      issues.push("head must point to L1");
    }

    if (!codeTailOk) {
      issues.push("tail must point to L5");
    }

    if (parsed.hasCycle) {
      issues.push(`cycle detected at ${parsed.brokenAt}`);
    }

    if (parsed.missingNode) {
      issues.push(`missing node definition for ${parsed.missingNode}`);
    }

    if (parsed.wrongValueAt) {
      issues.push(`node value mismatch at ${parsed.wrongValueAt}`);
    }

    if (!codeLinksOk) {
      issues.push("next pointers must connect L1 → L2 → L3 → L4 → L5 → null");
    }
  }

  if (!arrangementOk) {
    issues.push("drag arrangement must be L1 → L2 → L3 → L4 → L5");
  }

  let score = 0;

  if (arrangementOk) score += 35;
  if (codeHeadOk) score += 15;
  if (codeTailOk) score += 15;
  if (codeLinksOk) score += 35;

  repairFill.style.width = `${Math.max(10, score)}%`;

  if (arrangementOk && codeHeadOk && codeTailOk && codeLinksOk) {
    state.success = true;
    if (!state.xpAwardedForCurrentRepair) {
      state.xpAwardedForCurrentRepair = true;
      awardXp(TURBINE_XP_REWARD);
      showXpPopup(`Repair Complete! +${TURBINE_XP_REWARD} XP awarded.`);
    }

    statusLine.className = "status-line ok";
    statusLine.textContent =
      "PASS: HEAD, node links, and TAIL are connected correctly.";

    tipText.textContent =
      "Great job. The linked list starts at HEAD, reads every node in order, and ends at TAIL.";

    turbineStatus.src = "./turbine_ok.png";

    renderQueue("checked");
    setSpin("good");
    animateTraversal(goodOrder, true);

    return;
  }

  state.success = false;

  statusLine.className = "status-line err";
  statusLine.textContent = `FAIL: ${issues.join("; ")}.`;

  tipText.textContent =
    "Tip: Check both the dragged arrangement and the linked list next pointers.";

  turbineStatus.src = "./turbine_error.png";

  renderQueue("checked");
  setSpin("bad");

  const traversalOrder =
    parsed && parsed.order && parsed.order.length > 0
      ? parsed.order
      : state.nodes;

  animateTraversal(traversalOrder, false);
}

function updateArrangementFromCodeInput() {
  if (state.syncingFromDrag) return;

  const parsed = parseLinkedListFromCode(codeEl.value);

  if (!parsed || !isValidNodeSet(parsed.order)) {
    statusLine.className = "status-line";
    statusLine.textContent =
      "Code edited. Click Run Diagnostics after completing the linked list.";
    return;
  }

  clearReadTimer();

  state.nodes = parsed.order;
  state.success = false;
  state.activeIndex = -1;
  state.movingDot = null;

  renderQueue("neutral");
  renderLinkedList(false);

  statusLine.className = "status-line";
  statusLine.textContent =
    "Arrangement synced from code. Click Run Diagnostics to check it.";

  diagnosticLog.textContent =
    "Console ready. Arrangement synced from linked list code.";
}

function resetAll() {
  clearReadTimer();

  state.nodes = ["L3", "L1", "L5", "L2", "L4"];
  state.dragging = null;
  state.success = false;
  state.xpAwardedForCurrentRepair = false;
  state.activeIndex = -1;
  state.movingDot = null;

  repairFill.style.width = "15%";
  turbineStatus.src = "./turbine_error.png";

  statusLine.className = "status-line";
  statusLine.textContent = "System reset. Awaiting corrected linked list.";

  diagnosticLog.textContent = "Console ready.";

  tipText.textContent =
    "Tip: The list head must start at L1, every node must point to the next node, and the tail must end at L5.";

  renderQueue("neutral");
  renderLinkedList(false);
  syncCodeFromArrangement();
  setSpin("bad");
}

function shuffleNodes() {
  clearReadTimer();

  const arr = [...state.nodes];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  state.nodes = arr;
  state.success = false;
  state.xpAwardedForCurrentRepair = false;
  state.activeIndex = -1;
  state.movingDot = null;

  renderQueue("neutral");
  renderLinkedList(false);
  syncCodeFromArrangement();

  statusLine.className = "status-line";
  statusLine.textContent =
    "Nodes scrambled. Click Run Diagnostics to check linked list.";

  diagnosticLog.textContent =
    "Console ready. Linked list code synced from scrambled arrangement.";
}

runBtn.addEventListener("click", runDiagnostics);
resetBtn.addEventListener("click", resetAll);
shuffleBtn.addEventListener("click", shuffleNodes);
codeEl.addEventListener("input", updateArrangementFromCodeInput);

renderQueue("neutral");
renderLinkedList(false);
syncCodeFromArrangement();
setSpin("bad");
