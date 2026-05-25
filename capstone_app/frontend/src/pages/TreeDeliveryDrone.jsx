import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Phaser from "phaser";
import "./TreeDeliveryDrone.css";
import galaxy1 from "../concept-main/assets/galaxies/galaxy_circles/galaxy1.png";
import galaxy2 from "../concept-main/assets/galaxies/galaxy_circles/galaxy2.png";
import galaxy3 from "../concept-main/assets/galaxies/galaxy_circles/galaxy3.png";
import galaxy4 from "../concept-main/assets/galaxies/galaxy_circles/galaxy4.png";
import galaxy5 from "../concept-main/assets/galaxies/galaxy_circles/galaxy5.png";

class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.x = 0;
    this.y = 0;
  }
}

function preorder(node, result) {
  if (!node) return;
  result.push(node);
  preorder(node.left, result);
  preorder(node.right, result);
}

function inorder(node, result) {
  if (!node) return;
  inorder(node.left, result);
  result.push(node);
  inorder(node.right, result);
}

function postorder(node, result) {
  if (!node) return;
  postorder(node.left, result);
  postorder(node.right, result);
  result.push(node);
}

function levelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];

  while (queue.length > 0) {
    const current = queue.shift();
    result.push(current);

    if (current.left) queue.push(current.left);
    if (current.right) queue.push(current.right);
  }

  return result;
}

function buildTreeFromLevelInsert(values) {
  if (!values.length) return null;
  const nodes = values.map((value) => new TreeNode(value));

  for (let i = 0; i < nodes.length; i += 1) {
    const leftIndex = (i * 2) + 1;
    const rightIndex = (i * 2) + 2;

    if (leftIndex < nodes.length) {
      nodes[i].left = nodes[leftIndex];
    }
    if (rightIndex < nodes.length) {
      nodes[i].right = nodes[rightIndex];
    }
  }

  return nodes[0];
}

const TRAVERSAL_RULES = {
  levelOrder: "Level Order (BFS): visit nodes level by level from left to right.",
  preorder: "Preorder: Root -> Left -> Right.",
  inorder: "Inorder: Left -> Root -> Right.",
  postorder: "Postorder: Left -> Right -> Root.",
};

const TRAVERSAL_LABELS = {
  levelOrder: "Level Order",
  preorder: "Preorder",
  inorder: "Inorder",
  postorder: "Postorder",
};

const DEFAULT_VALUES = ["1", "2", "3", "4", "5"];
const XP_STORAGE_KEY = "balangkas.student.bonus_xp";
const TREE_GAME_XP_REWARD = 120;
const GALAXY_TEXTURES = [galaxy1, galaxy2, galaxy3, galaxy4, galaxy5];
const GAME_PROGRESS_KEY = "balangkas.ship.games_progress.v1";
const GAME_PROGRESS_EVENT = "balangkas:games-progress-updated";
const TREE_GAME_ID = "treeDeliveryDrone";

export default function TreeDeliveryDrone({ onBack }) {
  const navigate = useNavigate();
  const gameRef = useRef(null);
  const gameContainerRef = useRef(null);
  const sceneBridgeRef = useRef(null);
  const latestRootRef = useRef(null);
  const uiCallbackRef = useRef(null);
  const rewardIssuedRef = useRef(false);
  const popupTimerRef = useRef(null);

  const [nodeInput, setNodeInput] = useState("");
  const [xpPopup, setXpPopup] = useState(null);
  const [nodeValues, setNodeValues] = useState(DEFAULT_VALUES);
  const [gameInfo, setGameInfo] = useState({
    traversalType: "None",
    traversalRule: "Choose a traversal mode to begin.",
    targetOrder: [],
    currentExpected: "-",
    score: 0,
    mistakes: 0,
    message: "Tree initialized. Start a traversal mission.",
    complete: false,
  });

  const root = useMemo(() => buildTreeFromLevelInsert(nodeValues), [nodeValues]);
  latestRootRef.current = root;

  uiCallbackRef.current = (nextState) => {
    setGameInfo((previous) => ({ ...previous, ...nextState }));
  };

  const awardXp = (amount) => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(XP_STORAGE_KEY);
    const current = Number.parseInt(raw || "0", 10);
    const next = (Number.isFinite(current) ? current : 0) + amount;
    window.localStorage.setItem(XP_STORAGE_KEY, String(next));
    window.dispatchEvent(new Event("balangkas:xp-updated"));
  };

  const showXpPopup = (amount) => {
    setXpPopup(`Traversal Complete! +${amount} XP awarded.`);
    if (popupTimerRef.current) {
      clearTimeout(popupTimerRef.current);
    }
    popupTimerRef.current = setTimeout(() => {
      setXpPopup(null);
    }, 2200);
  };

  const markTreeGameComplete = () => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(GAME_PROGRESS_KEY);
      const progress = raw ? JSON.parse(raw) : {};

      if (progress[TREE_GAME_ID] === true) {
        return;
      }

      progress[TREE_GAME_ID] = true;
      window.localStorage.setItem(GAME_PROGRESS_KEY, JSON.stringify(progress));
    } catch {}

    window.dispatchEvent(new Event(GAME_PROGRESS_EVENT));
  };

  useEffect(() => {
    if (!gameContainerRef.current || gameRef.current) return undefined;

    class TreeDeliveryScene extends Phaser.Scene {
      constructor() {
        super("TreeDeliveryScene");
        this.root = null;
        this.traversalNodes = [];
        this.currentTraversal = null;
        this.currentIndex = 0;
        this.score = 0;
        this.mistakes = 0;
        this.nodeObjects = new Map();
      }

      preload() {
        GALAXY_TEXTURES.forEach((texturePath, index) => {
          this.load.image(`galaxy-${index + 1}`, texturePath);
        });
      }

      create() {
        this.cameras.main.setBackgroundColor("#060912");
        this.edgeGraphics = this.add.graphics();
        this.nodeGraphics = this.add.graphics();
        this.glowGraphics = this.add.graphics();
        this.drone = this.add.triangle(450, 88, 0, 20, 28, 10, 0, 0, 0xffdb7a)
          .setStrokeStyle(2, 0xc5fbff, 1);
        this.drone.setDepth(4);

        sceneBridgeRef.current = {
          setTree: (nextRoot) => this.setTree(nextRoot),
          startTraversal: (traversalType) => this.startTraversal(traversalType),
        };

        this.setTree(latestRootRef.current);
      }

      assignPositions(node, x, y, spread) {
        if (!node) return;
        node.x = x;
        node.y = y;

        const nextSpread = Math.max(64, spread * 0.55);
        if (node.left) this.assignPositions(node.left, x - spread, y + 124, nextSpread);
        if (node.right) this.assignPositions(node.right, x + spread, y + 124, nextSpread);
      }

      clearNodeObjects() {
        this.nodeObjects.forEach((entry) => {
          entry.circle.destroy();
          entry.label.destroy();
          if (entry.leafGlow) entry.leafGlow.destroy();
        });
        this.nodeObjects.clear();
      }

      setTree(nextRoot) {
        this.root = nextRoot;
        this.traversalNodes = [];
        this.currentTraversal = null;
        this.currentIndex = 0;
        this.score = 0;
        this.mistakes = 0;

        this.clearNodeObjects();
        this.edgeGraphics.clear();

        if (!this.root) {
          this.emitUiState("None", "Choose a traversal mode to begin.", [], "-", "Tree is empty.", false);
          return;
        }

        this.assignPositions(this.root, 450, 118, 190);
        this.drawEdges(this.root);
        this.drawNodes(this.root);
        this.moveDroneTo(this.root, 0);

        this.emitUiState("None", "Choose a traversal mode to begin.", [], "-", "Tree updated. Start traversal.", false);
      }

      drawEdges(node) {
        if (!node) return;

        if (node.left) {
          this.edgeGraphics.lineStyle(3, 0x2b4e86, 0.9);
          this.edgeGraphics.beginPath();
          this.edgeGraphics.moveTo(node.x, node.y);
          this.edgeGraphics.lineTo(node.left.x, node.left.y);
          this.edgeGraphics.strokePath();
          this.drawEdges(node.left);
        }

        if (node.right) {
          this.edgeGraphics.lineStyle(3, 0x2b4e86, 0.9);
          this.edgeGraphics.beginPath();
          this.edgeGraphics.moveTo(node.x, node.y);
          this.edgeGraphics.lineTo(node.right.x, node.right.y);
          this.edgeGraphics.strokePath();
          this.drawEdges(node.right);
        }
      }

      drawNodes(node) {
        if (!node) return;

        const isRoot = node === this.root;
        const isLeaf = !node.left && !node.right;
        const radius = isRoot ? 34 : 30;
        const textureIndex = (Number.parseInt(String(node.value), 10) || 0) % GALAXY_TEXTURES.length;

        const circle = this.add.image(node.x, node.y, `galaxy-${textureIndex + 1}`);
        circle.setDisplaySize(radius * 2, radius * 2);
        const baseScaleX = circle.scaleX;
        const baseScaleY = circle.scaleY;
        circle.setDepth(2);
        circle.setInteractive({ useHandCursor: true });
        circle.on("pointerover", () => {
          circle.setScale(baseScaleX * 1.02, baseScaleY * 1.02);
        });
        circle.on("pointerout", () => {
          circle.setScale(baseScaleX, baseScaleY);
        });
        circle.on("pointerdown", () => {
          this.handleNodeClick(node);
        });

        const label = this.add.text(node.x, node.y, String(node.value), {
          fontFamily: "Pixellari, monospace",
          fontSize: isRoot ? "22px" : "20px",
          color: "#f9f4dd",
          stroke: "#161833",
          strokeThickness: 4,
        }).setOrigin(0.5);
        label.setDepth(3);
        label.setInteractive({ useHandCursor: true });
        label.on("pointerdown", () => {
          this.handleNodeClick(node);
        });

        let leafGlow = null;
        if (isLeaf) {
          leafGlow = this.add.circle(node.x, node.y, radius + 8, 0xb091ff, 0.1);
          leafGlow.setStrokeStyle(2, 0xb091ff, 0.5);
          leafGlow.setDepth(1);
        }

        this.nodeObjects.set(node, { circle, label, leafGlow, isRoot, isLeaf });
        this.drawNodes(node.left);
        this.drawNodes(node.right);
      }

      traversalFor(type) {
        const result = [];
        if (!this.root) return result;

        if (type === "levelOrder") return levelOrder(this.root);
        if (type === "preorder") {
          preorder(this.root, result);
          return result;
        }
        if (type === "inorder") {
          inorder(this.root, result);
          return result;
        }
        if (type === "postorder") {
          postorder(this.root, result);
          return result;
        }

        return result;
      }

      startTraversal(type) {
        if (!this.root) return;
        rewardIssuedRef.current = false;
        this.traversalNodes = this.traversalFor(type);
        this.currentTraversal = type;
        this.currentIndex = 0;
        this.score = 0;
        this.mistakes = 0;
        this.resetNodeColors();
        this.moveDroneTo(this.root, 0);

        this.emitUiState(
          TRAVERSAL_LABELS[type],
          TRAVERSAL_RULES[type],
          this.traversalNodes.map((node) => String(node.value)),
          this.traversalNodes[0] ? String(this.traversalNodes[0].value) : "-",
          "Traversal started. Select the first node.",
          false,
        );
      }

      resetNodeColors() {
        this.nodeObjects.forEach((entry) => {
          entry.circle.setTint(0xffffff);
          entry.circle.setAlpha(1);
        });
      }

      handleNodeClick(node) {
        if (!this.traversalNodes.length || this.currentTraversal === null) {
          this.emitUiState("None", "Choose a traversal mode to begin.", [], "-", "Pick a traversal mode first.", false);
          return;
        }

        const expected = this.traversalNodes[this.currentIndex];
        if (node === expected) {
          this.handleCorrectNode(node);
          return;
        }

        this.handleWrongNode(node);
      }

      handleCorrectNode(node) {
        const visuals = this.nodeObjects.get(node);
        if (visuals) {
          visuals.circle.setTint(0xa2ffd2);
        }

        this.moveDroneTo(node, 350);
        this.score += 1;
        this.currentIndex += 1;

        const complete = this.currentIndex >= this.traversalNodes.length;
        const nextExpected = complete ? "-" : String(this.traversalNodes[this.currentIndex].value);
        const message = complete ? "Traversal Complete!" : "Correct node!";
        if (complete && !rewardIssuedRef.current) {
          rewardIssuedRef.current = true;
          awardXp(TREE_GAME_XP_REWARD);
          showXpPopup(TREE_GAME_XP_REWARD);
        }

        if (complete) {
          markTreeGameComplete();
        }

        this.emitUiState(
          TRAVERSAL_LABELS[this.currentTraversal],
          TRAVERSAL_RULES[this.currentTraversal],
          this.traversalNodes.map((item) => String(item.value)),
          nextExpected,
          message,
          complete,
        );
      }

      handleWrongNode(node) {
        const visuals = this.nodeObjects.get(node);
        if (visuals) {
          visuals.circle.setTint(0xff8ca0);
          this.time.delayedCall(180, () => {
            visuals.circle.setTint(0xffffff);
          });
        }

        this.mistakes += 1;
        this.emitUiState(
          TRAVERSAL_LABELS[this.currentTraversal],
          TRAVERSAL_RULES[this.currentTraversal],
          this.traversalNodes.map((item) => String(item.value)),
          String(this.traversalNodes[this.currentIndex].value),
          "Wrong node!",
          false,
        );
      }

      moveDroneTo(node, duration) {
        const targetY = node.y - 48;
        if (!duration) {
          this.drone.setPosition(node.x, targetY);
          return;
        }

        this.tweens.add({
          targets: this.drone,
          x: node.x,
          y: targetY,
          duration,
          ease: "Sine.Out",
        });
      }

      emitUiState(traversalType, traversalRule, targetOrder, currentExpected, message, complete) {
        const callback = uiCallbackRef.current;
        if (!callback) return;

        callback({
          traversalType,
          traversalRule,
          targetOrder,
          currentExpected,
          score: this.score,
          mistakes: this.mistakes,
          message,
          complete,
        });
      }
    }

    const config = {
      type: Phaser.AUTO,
      width: 900,
      height: 600,
      parent: gameContainerRef.current,
      backgroundColor: "#050711",
      scene: TreeDeliveryScene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current);
      }
      sceneBridgeRef.current = null;
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      if (gameContainerRef.current) {
        gameContainerRef.current.innerHTML = "";
      }
    };
  }, []);

  useEffect(() => {
    if (sceneBridgeRef.current) {
      sceneBridgeRef.current.setTree(root);
    }
  }, [root]);

  const handleInsert = () => {
    const trimmed = nodeInput.trim();
    if (!trimmed) return;
    if (nodeValues.length >= 15) return;
    setNodeValues((previous) => [...previous, trimmed]);
    setNodeInput("");
  };

  const startTraversal = (type) => {
    if (!sceneBridgeRef.current) return;
    sceneBridgeRef.current.startTraversal(type);
  };

  const handleResetTree = () => {
    setNodeValues(DEFAULT_VALUES);
    setNodeInput("");
    rewardIssuedRef.current = false;
  };

  const handleBack = () => {
    if (onBack) onBack();
    else navigate("/playership");
  };

  return (
    <section className="tree-delivery-page">
      <div className="tree-delivery-frame">
        {xpPopup ? (
          <div className="tree-xp-popup" role="status" aria-live="polite">
            {xpPopup}
          </div>
        ) : null}
        <main className="tree-delivery-screen">
          <section className="tree-delivery-panel tree-delivery-panel-left">
            <div className="tree-delivery-alert">
              ALERT! Ship traversal route mismatch.
              <br />
              Plot and verify galaxy hop order.
            </div>

            <div className="tree-delivery-controls">
              <label htmlFor="tree-node-input">Node Value</label>
              <input
                id="tree-node-input"
                type="text"
                value={nodeInput}
                maxLength={8}
                onChange={(event) => setNodeInput(event.target.value)}
                placeholder="Type node value"
              />
              <div className="tree-delivery-btn-row">
                <button type="button" className="tree-ctrl" onClick={handleInsert}>Insert Node</button>
                <button type="button" className="tree-ctrl" onClick={() => startTraversal("levelOrder")}>Start Level Order</button>
                <button type="button" className="tree-ctrl" onClick={() => startTraversal("preorder")}>Start Preorder</button>
                <button type="button" className="tree-ctrl" onClick={() => startTraversal("inorder")}>Start Inorder</button>
                <button type="button" className="tree-ctrl" onClick={() => startTraversal("postorder")}>Start Postorder</button>
              </div>
              <div className="tree-delivery-btn-row">
                <button type="button" className="tree-ctrl tree-ctrl-alt" onClick={handleResetTree}>Reset Tree</button>
                <button type="button" className="tree-ctrl tree-ctrl-alt" onClick={handleBack}>Back</button>
              </div>
            </div>

            <div className="tree-delivery-brief">
              <h2>Galaxy Travel Briefing</h2>
              <p><strong>Traversal Type:</strong> {gameInfo.traversalType}</p>
              <p><strong>Rule:</strong> {gameInfo.traversalRule}</p>
              <p><strong>Galaxy Hop Plan:</strong> {gameInfo.targetOrder.length ? gameInfo.targetOrder.join(" -> ") : "-"}</p>
              <p><strong>Current Target Galaxy:</strong> {gameInfo.currentExpected}</p>
              <p><strong>Score:</strong> {gameInfo.score}</p>
              <p><strong>Mistakes:</strong> {gameInfo.mistakes}</p>
              <p className={gameInfo.complete ? "status-complete" : "status-message"}>{gameInfo.message}</p>
              <p><strong>Current Tree Input:</strong> {nodeValues.join(", ")}</p>
            </div>
          </section>

          <section className="tree-delivery-panel tree-delivery-panel-right">
            <div className="tree-game-frame">
              <div ref={gameContainerRef} className="tree-game-canvas" />
            </div>
          </section>
        </main>
      </div>
    </section>
  );
}
