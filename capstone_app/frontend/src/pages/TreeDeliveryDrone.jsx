import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Phaser from "phaser";
import "./TreeDeliveryDrone.css";

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

export default function TreeDeliveryDrone({ onBack }) {
  const navigate = useNavigate();
  const gameRef = useRef(null);
  const gameContainerRef = useRef(null);
  const sceneBridgeRef = useRef(null);
  const latestRootRef = useRef(null);
  const uiCallbackRef = useRef(null);

  const [nodeInput, setNodeInput] = useState("");
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

      create() {
        this.cameras.main.setBackgroundColor("#060912");
        this.edgeGraphics = this.add.graphics();
        this.nodeGraphics = this.add.graphics();
        this.glowGraphics = this.add.graphics();
        this.drone = this.add.triangle(450, 88, 0, 20, 28, 10, 0, 0, 0x49e3ff)
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
        const fillColor = isRoot ? 0x29b3ff : 0x12325f;
        const strokeColor = isRoot ? 0xd5f2ff : 0x73b5ff;
        const radius = isRoot ? 30 : 27;

        const circle = this.add.circle(node.x, node.y, radius, fillColor, 1);
        circle.setStrokeStyle(3, strokeColor, 1);
        circle.setDepth(2);
        circle.setInteractive({ useHandCursor: true });
        circle.on("pointerover", () => {
          circle.setScale(1.07);
        });
        circle.on("pointerout", () => {
          circle.setScale(1);
        });
        circle.on("pointerdown", () => {
          this.handleNodeClick(node);
        });

        const label = this.add.text(node.x, node.y, String(node.value), {
          fontFamily: "monospace",
          fontSize: isRoot ? "22px" : "20px",
          color: "#f0fbff",
        }).setOrigin(0.5);
        label.setDepth(3);
        label.setInteractive({ useHandCursor: true });
        label.on("pointerdown", () => {
          this.handleNodeClick(node);
        });

        let leafGlow = null;
        if (isLeaf) {
          leafGlow = this.add.circle(node.x, node.y, radius + 8, 0x85d9ff, 0.12);
          leafGlow.setStrokeStyle(2, 0x85d9ff, 0.6);
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
          const fillColor = entry.isRoot ? 0x29b3ff : 0x12325f;
          const strokeColor = entry.isRoot ? 0xd5f2ff : 0x73b5ff;
          entry.circle.setFillStyle(fillColor, 1);
          entry.circle.setStrokeStyle(3, strokeColor, 1);
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
          visuals.circle.setFillStyle(0x24c978, 1);
          visuals.circle.setStrokeStyle(3, 0xbfffe4, 1);
        }

        this.moveDroneTo(node, 350);
        this.score += 1;
        this.currentIndex += 1;

        const complete = this.currentIndex >= this.traversalNodes.length;
        const nextExpected = complete ? "-" : String(this.traversalNodes[this.currentIndex].value);
        const message = complete ? "Traversal Complete!" : "Correct node!";

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
          visuals.circle.setFillStyle(0xd93b4f, 1);
          this.time.delayedCall(180, () => {
            const fillColor = visuals.isRoot ? 0x29b3ff : 0x12325f;
            const strokeColor = visuals.isRoot ? 0xd5f2ff : 0x73b5ff;
            visuals.circle.setFillStyle(fillColor, 1);
            visuals.circle.setStrokeStyle(3, strokeColor, 1);
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
  };

  const handleBack = () => {
    if (onBack) onBack();
    else navigate("/playershipdashboard");
  };

  return (
    <section className="tree-delivery-page">
      <div className="tree-delivery-shell">
        <header className="tree-delivery-header">
          <h1>Tree Delivery Drone</h1>
          <p>Build a binary tree by level-order insert, then click nodes in the correct traversal path.</p>
        </header>

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
          <button type="button" onClick={handleInsert}>Insert Node</button>
          <button type="button" onClick={() => startTraversal("levelOrder")}>Start Level Order</button>
          <button type="button" onClick={() => startTraversal("preorder")}>Start Preorder</button>
          <button type="button" onClick={() => startTraversal("inorder")}>Start Inorder</button>
          <button type="button" onClick={() => startTraversal("postorder")}>Start Postorder</button>
          <button type="button" onClick={handleResetTree}>Reset Tree</button>
          <button type="button" className="tree-delivery-back-btn" onClick={handleBack}>Back</button>
        </div>

        <div className="tree-delivery-layout">
          <div className="tree-delivery-panel">
            <h2>Traversal Briefing</h2>
            <p><strong>Traversal Type:</strong> {gameInfo.traversalType}</p>
            <p><strong>Rule:</strong> {gameInfo.traversalRule}</p>
            <p><strong>Target Order:</strong> {gameInfo.targetOrder.length ? gameInfo.targetOrder.join(" -> ") : "-"}</p>
            <p><strong>Current Expected Node:</strong> {gameInfo.currentExpected}</p>
            <p><strong>Score:</strong> {gameInfo.score}</p>
            <p><strong>Mistakes:</strong> {gameInfo.mistakes}</p>
            <p className={gameInfo.complete ? "status-complete" : "status-message"}>{gameInfo.message}</p>
            <p><strong>Current Tree Input:</strong> {nodeValues.join(", ")}</p>
          </div>

          <div className="tree-game-frame">
            <div ref={gameContainerRef} className="tree-game-canvas" />
          </div>
        </div>
      </div>
    </section>
  );
}
