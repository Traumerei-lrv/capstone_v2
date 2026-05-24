import { useEffect, useMemo, useRef, useState } from 'react';
import Phaser from 'phaser';

const DISK_COUNT = 3;
const PEG_KEYS = ['A', 'B', 'C'];
const HANOI_SCENE_KEY = 'RecursionHanoiScene';

// Recursive move generation:
// Base case: n === 1
// Recursive step: move n-1 -> move n -> move n-1
function generateHanoiMoves(n, source, auxiliary, target, moves = []) {
  if (n === 1) {
    moves.push({ from: source, to: target, disk: 1, stepType: 'Base Case' });
    return moves;
  }

  generateHanoiMoves(n - 1, source, target, auxiliary, moves);
  moves.push({ from: source, to: target, disk: n, stepType: 'Recursive Step' });
  generateHanoiMoves(n - 1, auxiliary, source, target, moves);
  return moves;
}

class RecursionHanoiScene extends Phaser.Scene {
  constructor() {
    super(HANOI_SCENE_KEY);
    this.pegX = { A: 130, B: 310, C: 490 };
    this.baseY = 320;
    this.diskGap = 24;
    this.diskSprites = {};
    this.pegs = { A: [], B: [], C: [] };
    this.activeTween = null;
    this.isAnimating = false;
  }

  create() {
    this.drawBackground();
    this.drawPegs();
    this.resetPuzzle();
  }

  drawBackground() {
    this.cameras.main.setBackgroundColor('#061324');

    const grid = this.add.graphics();
    grid.lineStyle(1, 0x1e3a8a, 0.22);
    for (let x = 20; x <= 600; x += 28) {
      grid.lineBetween(x, 20, x, 360);
    }
    for (let y = 20; y <= 360; y += 28) {
      grid.lineBetween(20, y, 600, y);
    }

    this.add.rectangle(310, 188, 590, 332, 0x0b1a31, 0.76).setStrokeStyle(2, 0x60a5fa, 0.38);

    for (let i = 0; i < 26; i += 1) {
      this.add.circle(Phaser.Math.Between(20, 600), Phaser.Math.Between(20, 360), Phaser.Math.Between(1, 2), 0xc7e5ff, Phaser.Math.FloatBetween(0.2, 0.7));
    }
  }

  drawPegs() {
    this.add.rectangle(310, this.baseY + 18, 520, 18, 0x203a65, 0.95).setStrokeStyle(2, 0x60a5fa, 0.45);

    PEG_KEYS.forEach((peg) => {
      const x = this.pegX[peg];
      this.add.rectangle(x, 228, 11, 170, 0x2d5ca1, 1).setStrokeStyle(2, 0x93c5fd, 0.5);
      this.add.text(x, 335, peg, {
        fontFamily: 'Pixellari, monospace',
        fontSize: '13px',
        color: '#bfdbfe',
      }).setOrigin(0.5);
    });
  }

  getDiskWidth(disk) {
    return 64 + disk * 36;
  }

  getDiskY(stackIndex) {
    return this.baseY - stackIndex * this.diskGap;
  }

  createDiskSprite(disk) {
    const width = this.getDiskWidth(disk);
    const colorByDisk = {
      1: 0x60a5fa,
      2: 0x38bdf8,
      3: 0x22d3ee,
      4: 0x14b8a6,
    };
    const diskColor = colorByDisk[disk] || 0x60a5fa;

    const container = this.add.container(0, 0);
    const body = this.add.rectangle(0, 0, width, 20, diskColor, 0.98).setStrokeStyle(2, 0xe0f2fe, 0.8);
    const shine = this.add.rectangle(0, -5, width - 12, 4, 0xffffff, 0.35);
    container.add([body, shine]);
    container.setDepth(20 + disk);
    return container;
  }

  resetPuzzle() {
    if (this.activeTween) {
      this.activeTween.stop();
      this.activeTween = null;
    }
    Object.values(this.diskSprites).forEach((sprite) => {
      this.tweens.killTweensOf(sprite);
    });
    this.isAnimating = false;

    this.pegs = { A: [], B: [], C: [] };
    for (let disk = DISK_COUNT; disk >= 1; disk -= 1) {
      this.pegs.A.push(disk);
    }

    for (let disk = 1; disk <= DISK_COUNT; disk += 1) {
      if (!this.diskSprites[disk]) {
        this.diskSprites[disk] = this.createDiskSprite(disk);
      }
    }

    this.positionAllDisks();
  }

  positionAllDisks() {
    PEG_KEYS.forEach((peg) => {
      this.pegs[peg].forEach((disk, stackIndex) => {
        const sprite = this.diskSprites[disk];
        sprite.x = this.pegX[peg];
        sprite.y = this.getDiskY(stackIndex);
      });
    });
  }

  setPauseState(paused) {
    if (!this.activeTween) {
      return;
    }
    if (paused) {
      this.activeTween.pause();
    } else {
      this.activeTween.resume();
    }
  }

  animateMove(move, onComplete) {
    if (this.isAnimating) {
      return false;
    }

    const sourceStack = this.pegs[move.from];
    const targetStack = this.pegs[move.to];
    if (!sourceStack || !targetStack || sourceStack.length === 0) {
      return false;
    }

    const disk = sourceStack[sourceStack.length - 1];
    if (disk !== move.disk) {
      return false;
    }

    const topTargetDisk = targetStack[targetStack.length - 1];
    if (topTargetDisk && topTargetDisk < disk) {
      return false;
    }

    sourceStack.pop();
    targetStack.push(disk);

    const sprite = this.diskSprites[disk];
    const targetX = this.pegX[move.to];
    const targetY = this.getDiskY(targetStack.length - 1);
    const liftY = 78;

    this.isAnimating = true;
    const startDropTween = () => {
      this.activeTween = this.tweens.add({
        targets: sprite,
        y: targetY,
        duration: 220,
        ease: 'Sine.easeIn',
        onComplete: () => {
          this.activeTween = null;
          this.isAnimating = false;
          if (typeof onComplete === 'function') {
            onComplete();
          }
        },
      });
    };

    const startHorizontalTween = () => {
      this.activeTween = this.tweens.add({
        targets: sprite,
        x: targetX,
        duration: 300,
        ease: 'Sine.easeInOut',
        onComplete: startDropTween,
      });
    };

    this.activeTween = this.tweens.add({
      targets: sprite,
      y: liftY,
      duration: 220,
      ease: 'Sine.easeOut',
      onComplete: startHorizontalTween,
    });

    return true;
  }
}

export default function RecursionHanoiVisualization() {
  // HTML structure state:
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const sceneRef = useRef(null);

  // Animation control state:
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [statusLabel, setStatusLabel] = useState('Recursive Step');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [movePathLabel, setMovePathLabel] = useState('A -> C');

  const isMountedRef = useRef(false);
  const isPlayingRef = useRef(false);
  const currentMoveRef = useRef(0);
  const playbackTimerRef = useRef(null);

  const moves = useMemo(() => generateHanoiMoves(DISK_COUNT, 'A', 'B', 'C', []), []);
  const totalMoves = moves.length;

  function clearPlaybackTimer() {
    if (playbackTimerRef.current) {
      window.clearTimeout(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
  }

  function executeStep() {
    const scene = sceneRef.current;
    if (!scene || scene.isAnimating || isAnimating) {
      return false;
    }

    const nextIndex = currentMoveRef.current;
    if (nextIndex >= totalMoves) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      return false;
    }

    const move = moves[nextIndex];
    setStatusLabel(move.stepType);
    setMovePathLabel(`${move.from} -> ${move.to}`);
    setIsAnimating(true);

    const started = scene.animateMove(move, () => {
      if (!isMountedRef.current) {
        return;
      }

      const completed = nextIndex + 1;
      currentMoveRef.current = completed;
      setCurrentMoveIndex(completed);
      setIsAnimating(false);

      if (isPlayingRef.current && completed < totalMoves) {
        clearPlaybackTimer();
        playbackTimerRef.current = window.setTimeout(() => {
          executeStep();
        }, 260);
      }
    });

    if (!started) {
      setIsAnimating(false);
      setIsPlaying(false);
      isPlayingRef.current = false;
      return false;
    }

    return true;
  }

  // Phaser scene setup:
  useEffect(() => {
    isMountedRef.current = true;

    if (!containerRef.current || gameRef.current) {
      return () => {
        isMountedRef.current = false;
      };
    }

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 620,
      height: 380,
      transparent: false,
      scene: RecursionHanoiScene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    });

    gameRef.current = game;

    const onReady = () => {
      const scene = game.scene.getScene(HANOI_SCENE_KEY);
      sceneRef.current = scene;
    };

    game.events.once('ready', onReady);

    return () => {
      isMountedRef.current = false;
      isPlayingRef.current = false;
      clearPlaybackTimer();
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    const scene = sceneRef.current;
    if (!scene) {
      return;
    }
    scene.setPauseState(!isPlaying);
    if (isPlaying && !scene.isAnimating && !isAnimating) {
      executeStep();
    }
  }, [isPlaying, isAnimating]);

  // UI button handlers:
  function handlePlay() {
    if (currentMoveRef.current >= totalMoves) {
      return;
    }
    setIsPlaying(true);
  }

  function handlePause() {
    setIsPlaying(false);
  }

  function handleNextStep() {
    setIsPlaying(false);
    executeStep();
  }

  function handleReset() {
    setIsPlaying(false);
    isPlayingRef.current = false;
    clearPlaybackTimer();

    const scene = sceneRef.current;
    if (scene) {
      scene.resetPuzzle();
    }

    currentMoveRef.current = 0;
    setCurrentMoveIndex(0);
    setIsAnimating(false);
    setStatusLabel('Recursive Step');
    setMovePathLabel('A -> C');
  }

  // CSS styling + HTML structure:
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-black text-blue-900">Tower of Hanoi</h3>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-700">
          Recursion
        </span>
      </div>

      <p className="text-xs text-slate-600">Watch how the problem is solved by repeating smaller steps.</p>

      <div
        ref={containerRef}
        className="min-h-[240px] w-full overflow-hidden rounded-2xl border border-blue-200 bg-slate-950 shadow-inner"
      />

      <div className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm sm:grid-cols-3">
        <p className="font-semibold text-slate-700">{statusLabel}</p>
        <p className="font-semibold text-slate-700">Move {Math.min(currentMoveIndex + (isAnimating ? 1 : 0), totalMoves)} of {totalMoves}</p>
        <p className="font-semibold text-slate-700">{movePathLabel}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button
          type="button"
          onClick={handlePlay}
          disabled={isPlaying || currentMoveRef.current >= totalMoves}
          className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Play
        </button>
        <button
          type="button"
          onClick={handlePause}
          disabled={!isPlaying}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Pause
        </button>
        <button
          type="button"
          onClick={handleNextStep}
          disabled={isAnimating || currentMoveRef.current >= totalMoves}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next Step
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
