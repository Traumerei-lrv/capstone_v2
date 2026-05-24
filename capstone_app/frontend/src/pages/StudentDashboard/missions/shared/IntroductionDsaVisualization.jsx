import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

const PACKETS = [
  { label: 'Fuel Cell', short: 'Fuel', color: 0xf97316 },
  { label: 'Oxygen Tank', short: 'Oxygen', color: 0x38bdf8 },
  { label: 'Repair Kit', short: 'Kit', color: 0x22c55e },
  { label: 'Data Core', short: 'Core', color: 0x8b5cf6 },
  { label: 'Shield Battery', short: 'Shield', color: 0xeab308 },
];

const ADTS = ['Linked List', 'Stack', 'Queue', 'Tree', 'Priority Queue', 'Heap', 'Set', 'Map', 'Graph'];
const OPERATIONS = ['Initialize', 'Add', 'Access', 'Remove'];
const ALGORITHM_STEPS = ['Receive mission data', 'Choose a structure', 'Store packets', 'Run operation', 'Return result'];

function addPanel(scene, x, y, width, height, label, fill = 0x0f172a) {
  scene.add.rectangle(x, y, width, height, fill, 0.9).setStrokeStyle(2, 0x60a5fa, 0.7);
  scene.add.text(x - width / 2 + 16, y - height / 2 + 12, label, {
    fontFamily: 'Pixellari, monospace',
    fontSize: '14px',
    color: '#bfdbfe',
  });
}

function addPacket(scene, x, y, packet, options = {}) {
  const container = scene.add.container(x, y);
  const body = scene.add.rectangle(0, 0, options.width || 120, 34, packet.color, 0.95).setStrokeStyle(2, 0xffffff, 0.55);
  const light = scene.add.circle(-(options.width || 120) / 2 + 14, 0, 5, 0xffffff, 0.85);
  const label = scene.add.text(-((options.width || 120) / 2) + 28, -8, packet.short || packet.label, {
    fontFamily: 'Pixellari, monospace',
    fontSize: options.fontSize || '13px',
    color: '#ffffff',
  });

  container.add([body, light, label]);

  return container;
}

function addArrow(scene, x1, y1, x2, y2, color = 0x93c5fd) {
  const graphics = scene.add.graphics();
  graphics.lineStyle(3, color, 0.85);
  graphics.beginPath();
  graphics.moveTo(x1, y1);
  graphics.lineTo(x2, y2);
  graphics.strokePath();

  const angle = Phaser.Math.Angle.Between(x1, y1, x2, y2);
  const head = scene.add.triangle(x2, y2, 0, 0, -10, -6, -10, 6, color, 0.9);
  head.setRotation(angle);
}

function addNode(scene, x, y, label, color = 0x2563eb) {
  scene.add.circle(x, y, 28, color, 0.95).setStrokeStyle(2, 0xffffff, 0.75);
  scene.add.text(x, y - 7, label, {
    fontFamily: 'Pixellari, monospace',
    fontSize: '11px',
    color: '#ffffff',
  }).setOrigin(0.5);
}

class IntroductionDsaScene extends Phaser.Scene {
  constructor() {
    super('IntroductionDsaScene');
  }

  create() {
    this.topicIndex = this.registry.get('topicIndex') || 0;
    this.drawScene(this.topicIndex);
  }

  setTopicIndex(topicIndex) {
    this.topicIndex = topicIndex;
    this.drawScene(topicIndex);
  }

  drawScene(topicIndex) {
    this.tweens.killAll();
    this.children.removeAll();
    this.cameras.main.setBackgroundColor('#07111f');

    this.drawBackdrop();
    this.drawHeader(topicIndex);

    if (topicIndex === 0) this.drawDataStructure();
    if (topicIndex === 1) this.drawTypes();
    if (topicIndex === 2) this.drawAdtMachine();
    if (topicIndex === 3) this.drawCommonAdts();
    if (topicIndex === 4) this.drawOperations();
    if (topicIndex === 5) this.drawAlgorithm();
  }

  drawBackdrop() {
    const g = this.add.graphics();
    g.lineStyle(1, 0x1e3a8a, 0.35);
    for (let x = 40; x < 860; x += 40) {
      g.lineBetween(x, 72, x, 520);
    }
    for (let y = 88; y < 520; y += 40) {
      g.lineBetween(28, y, 872, y);
    }

    for (let i = 0; i < 42; i += 1) {
      this.add.circle(Phaser.Math.Between(20, 880), Phaser.Math.Between(20, 530), Phaser.Math.Between(1, 2), 0xdbeafe, Phaser.Math.FloatBetween(0.25, 0.75));
    }

    this.add.rectangle(450, 298, 860, 450, 0x0b1b33, 0.68).setStrokeStyle(2, 0x2563eb, 0.5);
  }

  drawHeader(topicIndex) {
    const titles = [
      'Data Structure Storage',
      'Linear vs Non-Linear',
      'Abstract Data Type',
      'Common ADTs',
      'Main ADT Operations',
      'Algorithm Execution',
    ];

    this.add.text(30, 24, 'MISSION CONTROL DATA ORGANIZER', {
      fontFamily: 'Pixellari, monospace',
      fontSize: '18px',
      color: '#e0f2fe',
    });
    this.add.text(30, 49, titles[topicIndex] || titles[0], {
      fontFamily: 'Pixellari, monospace',
      fontSize: '13px',
      color: '#facc15',
    });
    this.add.text(812, 30, `0${topicIndex + 1}/06`, {
      fontFamily: 'Pixellari, monospace',
      fontSize: '18px',
      color: '#93c5fd',
    }).setOrigin(0.5);
  }

  drawIncomingPackets() {
    addPanel(this, 140, 298, 210, 376, 'Incoming Data Packets');
    PACKETS.forEach((packet, index) => {
      addPacket(this, 140, 154 + index * 52, packet, { width: 150, float: 5 });
    });
  }

  drawDataStructure() {
    this.drawIncomingPackets();
    addPanel(this, 565, 298, 510, 376, 'Storage System');
    addArrow(this, 255, 298, 345, 298);

    const slots = [
      { x: 440, y: 190 },
      { x: 565, y: 190 },
      { x: 690, y: 190 },
      { x: 500, y: 300 },
      { x: 630, y: 300 },
    ];

    PACKETS.forEach((packet, index) => {
      addPacket(this, slots[index].x, slots[index].y, packet, { width: 108, fontSize: '11px', float: 4 });
    });

    this.add.text(382, 402, 'A data structure stores and organizes data so the system can add, access, update, or remove it.', {
      fontFamily: 'Pixellari, monospace',
      fontSize: '15px',
      color: '#e0f2fe',
      wordWrap: { width: 360 },
      lineSpacing: 8,
    });
  }

  drawTypes() {
    this.drawIncomingPackets();
    addPanel(this, 425, 298, 250, 376, 'Linear Path');
    addPanel(this, 690, 298, 250, 376, 'Non-Linear Map');

    const linearPackets = PACKETS.slice(0, 3);
    linearPackets.forEach((packet, index) => {
      addPacket(this, 350 + index * 75, 295, packet, { width: 66, fontSize: '10px', float: 3 });
      if (index < linearPackets.length - 1) {
        addArrow(this, 385 + index * 75, 295, 410 + index * 75, 295, 0xfacc15);
      }
    });

    addNode(this, 690, 205, 'Fuel', 0xf97316);
    addNode(this, 635, 320, 'O2', 0x38bdf8);
    addNode(this, 745, 320, 'Kit', 0x22c55e);
    addArrow(this, 678, 231, 648, 294, 0x93c5fd);
    addArrow(this, 702, 231, 732, 294, 0x93c5fd);

    this.add.text(310, 396, 'Linear keeps data in sequence.', {
      fontFamily: 'Pixellari, monospace',
      fontSize: '13px',
      color: '#dbeafe',
    });
    this.add.text(598, 396, 'Non-linear creates branches or links.', {
      fontFamily: 'Pixellari, monospace',
      fontSize: '13px',
      color: '#dbeafe',
    });
  }

  drawAdtMachine() {
    this.drawIncomingPackets();
    addPanel(this, 560, 298, 520, 376, 'ADT Control Machine');
    addArrow(this, 255, 298, 335, 298);

    this.add.rectangle(570, 292, 230, 190, 0x111827, 1).setStrokeStyle(3, 0xfacc15, 0.9);
    this.add.text(570, 216, 'HIDDEN IMPLEMENTATION', {
      fontFamily: 'Pixellari, monospace',
      fontSize: '13px',
      color: '#fde68a',
    }).setOrigin(0.5);
    this.add.text(570, 292, 'Inside details are hidden', {
      fontFamily: 'Pixellari, monospace',
      fontSize: '14px',
      color: '#e5e7eb',
    }).setOrigin(0.5);

    ['Add', 'Access', 'Remove'].forEach((label, index) => {
      this.add.rectangle(390 + index * 180, 420, 132, 44, 0x2563eb, 1).setStrokeStyle(2, 0xffffff, 0.65);
      this.add.text(390 + index * 180, 407, label, {
        fontFamily: 'Pixellari, monospace',
        fontSize: '14px',
        color: '#ffffff',
      }).setOrigin(0.5, 0);
    });
  }

  drawCommonAdts() {
    addPanel(this, 450, 298, 760, 376, 'Common Abstract Data Types');
    ADTS.forEach((label, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = 260 + col * 190;
      const y = 170 + row * 95;
      const card = this.add.rectangle(x, y, 150, 58, 0x172554, 0.95).setStrokeStyle(2, 0x60a5fa, 0.75);
      this.add.text(x, y - 9, label, {
        fontFamily: 'Pixellari, monospace',
        fontSize: label.length > 12 ? '11px' : '13px',
        color: '#e0f2fe',
      }).setOrigin(0.5);
    });
  }

  drawOperations() {
    this.drawIncomingPackets();
    addPanel(this, 575, 298, 500, 376, 'Operation Console');
    OPERATIONS.forEach((label, index) => {
      const y = 175 + index * 72;
      this.add.rectangle(525, y, 210, 48, 0x0ea5e9, 0.95).setStrokeStyle(2, 0xffffff, 0.65);
      this.add.text(525, y - 9, label, {
        fontFamily: 'Pixellari, monospace',
        fontSize: '15px',
        color: '#ffffff',
      }).setOrigin(0.5);
      addArrow(this, 330, y, 410, y, 0xfacc15);
    });
  }

  drawAlgorithm() {
    addPanel(this, 450, 298, 760, 376, 'Mission Instruction List');
    ALGORITHM_STEPS.forEach((step, index) => {
      const y = 150 + index * 62;
      this.add.circle(210, y, 16, 0x2563eb, 0.95).setStrokeStyle(2, 0xffffff, 0.6);
      this.add.text(210, y - 7, String(index + 1), {
        fontFamily: 'Pixellari, monospace',
        fontSize: '13px',
        color: '#ffffff',
      }).setOrigin(0.5, 0);
      this.add.text(250, y - 10, step, {
        fontFamily: 'Pixellari, monospace',
        fontSize: '15px',
        color: '#dbeafe',
      });
      if (index < ALGORITHM_STEPS.length - 1) {
        addArrow(this, 210, y + 20, 210, y + 43, 0x93c5fd);
      }
    });

    this.add.text(570, 430, 'An algorithm executes clear steps to solve a problem.', {
      fontFamily: 'Pixellari, monospace',
      fontSize: '15px',
      color: '#fef3c7',
    }).setOrigin(0.5);
  }
}

export default function IntroductionDsaVisualization({ subtopicIndex }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) {
      return undefined;
    }

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 900,
      height: 560,
      backgroundColor: '#07111f',
      scene: IntroductionDsaScene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    });

    game.registry.set('topicIndex', subtopicIndex);
    gameRef.current = game;

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    const game = gameRef.current;
    if (!game) {
      return;
    }

    game.registry.set('topicIndex', subtopicIndex);
    const scene = game.scene.getScene('IntroductionDsaScene');
    if (scene?.scene?.isActive()) {
      scene.setTopicIndex(subtopicIndex);
    }
  }, [subtopicIndex]);

  return (
    <div
      ref={containerRef}
      className="min-h-[280px] w-full overflow-hidden rounded-2xl border border-blue-200 bg-slate-950 shadow-inner"
    />
  );
}
