import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HyperspaceBackground from "../components/HyperspaceBackground";
import LoadingScreen from "./LoadingScreen";
import cockpitDashboard from "../assets/img/cockpit-dashboard.png";
import btnAdventure from "../assets/img/btn_adventure-fullreso.png";
import { clearDemoAuthSession } from "../demoAuth";
 
const turbineFailurePage = new URL("../concept-main/assets/turbine/turbine_failure.html", import.meta.url).href;
const rocketAvoidingPlanPage = new URL("../concept-main/assets/asteroids/index.html", import.meta.url).href;
const cargoStackProtocolPage = new URL("../concept-main/assets/cargo/index.html", import.meta.url).href;
const GAME_PROGRESS_KEY = "balangkas.ship.games_progress.v1";
const GAME_PROGRESS_EVENT = "balangkas:games-progress-updated";
const REQUIRED_GAME_IDS = [
  "turbineFailure",
  "treeDeliveryDrone",
  "rocketAvoidingPlan",
  "cargoStackProtocol",
];

const challengeHitboxes = [
  {
    id: "turbine-failure-hitbox",
    progressId: "turbineFailure",
    href: turbineFailurePage,
    title: "Hyperspace Turbine",
    description: "Stabilize the failing hyperspace turbine before heat spikes trigger a full engine shutdown.",
    left: "20.47%",
    top: "53.8%",
  },
  {
    id: "tree-delivery-drone-hitbox",
    progressId: "treeDeliveryDrone",
    route: "/tree-delivery-drone",
    title: "Galaxy Hop Planner",
    description: "Plan the shortest delivery route across star systems and optimize each hop for fuel efficiency.",
    left: "31.82%",
    top: "53.8%",
  },
  {
    id: "over-heat-hitbox",
    progressId: "rocketAvoidingPlan",
    href: rocketAvoidingPlanPage,
    title: "Asteroid Avoiding Plan",
    description: "Navigate through an asteroid field and chart safe maneuvers to keep the ship hull intact.",
    left: "43.75%",
    top: "53.15%",
  },
  {
    id: "cargo-stack-protocol-hitbox",
    progressId: "cargoStackProtocol",
    href: cargoStackProtocolPage,
    title: "Cargo Stack Protocol",
    description: "Practice stack operations with a spaceship cargo bay simulation.",
    left: "55.68%",
    top: "53.15%",
  },
];

export default function PlayerShipDashboard() {
  const navigate = useNavigate();
  const [showLoading, setShowLoading] = useState(true);
  const [dissolving, setDissolving] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);
  const [progressComplete, setProgressComplete] = useState(false);
  const [isNodeMapLoading, setIsNodeMapLoading] = useState(false);
  const [hoveredHitbox, setHoveredHitbox] = useState(null);
  const [allFixesComplete, setAllFixesComplete] = useState(false);
  const [gameProgress, setGameProgress] = useState({});

  useEffect(() => {
    const getProgressSnapshot = () => {
      try {
        const raw = window.localStorage.getItem(GAME_PROGRESS_KEY);
        if (!raw) return {};

        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : {};
      } catch {
        return {};
      }
    };

    const syncShipBoost = () => {
      const snapshot = getProgressSnapshot();
      const nextProgress = REQUIRED_GAME_IDS.reduce((acc, gameId) => {
        acc[gameId] = snapshot[gameId] === true;
        return acc;
      }, {});

      setGameProgress(nextProgress);
      setAllFixesComplete(REQUIRED_GAME_IDS.every((gameId) => nextProgress[gameId] === true));
    };

    syncShipBoost();
    window.addEventListener("storage", syncShipBoost);
    window.addEventListener(GAME_PROGRESS_EVENT, syncShipBoost);

    return () => {
      window.removeEventListener("storage", syncShipBoost);
      window.removeEventListener(GAME_PROGRESS_EVENT, syncShipBoost);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const prepare = async () => {
      const preloadImage = (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          if (img.complete) return resolve(true);
          img.onload = () => resolve(true);
          img.onerror = () => resolve(true);
        });

      try {
        await document.fonts?.ready;
      } catch {}

      try {
        await Promise.all([
          preloadImage(cockpitDashboard),
          preloadImage(btnAdventure),
        ]);
      } catch {}

      if (!cancelled) setAssetsReady(true);
    };

    prepare();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (progressComplete && assetsReady) {
      handleLoadingComplete();
    }
  }, [progressComplete, assetsReady]);

  const handleLoadingComplete = () => {
    // Trigger crossfade
    setDissolving(true);
    setTimeout(() => {
      setShowLoading(false);
      setDissolving(false);
    }, 700);
  };

  const handleNodeMapClick = () => {
    setIsNodeMapLoading(true);
  };

  const handleNodeMapLoadingComplete = () => {
    navigate('/nodemapoverlay');
  };

  const handleLogout = () => {
    clearDemoAuthSession();
    navigate('/', { replace: true });
  };

  const handleResetShipProgress = () => {
    try {
      const raw = window.localStorage.getItem(GAME_PROGRESS_KEY);
      const progress = raw ? JSON.parse(raw) : {};
      const safeProgress = progress && typeof progress === "object" ? progress : {};

      REQUIRED_GAME_IDS.forEach((gameId) => {
        safeProgress[gameId] = false;
      });

      window.localStorage.setItem(GAME_PROGRESS_KEY, JSON.stringify(safeProgress));
    } catch {
      const resetProgress = REQUIRED_GAME_IDS.reduce((acc, gameId) => {
        acc[gameId] = false;
        return acc;
      }, {});
      window.localStorage.setItem(GAME_PROGRESS_KEY, JSON.stringify(resetProgress));
    }

    window.dispatchEvent(new Event(GAME_PROGRESS_EVENT));
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <HyperspaceBackground boosted={allFixesComplete} />

      {allFixesComplete ? (
        <div className="absolute left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-900/45 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100">
          <span>fixes done, ship is now at 100% performance</span>
          <button
            type="button"
            onClick={handleResetShipProgress}
            className="rounded-full border border-emerald-100/70 bg-emerald-100/15 px-3 py-1 text-[9px] tracking-[0.16em] text-emerald-50 transition hover:bg-emerald-100/25"
          >
            Reset
          </button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleLogout}
        className="absolute right-4 top-4 z-50 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm transition hover:bg-black"
      >
        Log Out
      </button>

      <button
        type="button"
        onClick={() => navigate('/playershipdashboard')}
        className="absolute left-4 top-4 z-50 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm transition hover:bg-black"
        aria-label="Go back to home page"
      >
        Home
      </button>

      <img
        src={cockpitDashboard}
        alt="Cockpit dashboard overlay"
        className="pointer-events-none fixed inset-0 z-0 h-full w-full object-cover opacity-100"
      />

      <div className={`relative z-10 transition-opacity duration-700 ${showLoading || isNodeMapLoading ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        {hoveredHitbox ? (
          <aside className="pointer-events-none absolute left-1/2 top-[30%] z-30 w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-cyan-300/60 bg-slate-950/75 p-4 text-center shadow-[0_0_24px_rgba(34,211,238,0.3)] backdrop-blur-sm">
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-200">
              {hoveredHitbox.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-cyan-50/90">
              {hoveredHitbox.description}
            </p>
          </aside>
        ) : null}

        <div className="absolute left-1/2 top-[60%] z-20 flex w-[min(92vw,980px)] -translate-x-1/2 -translate-y-1/2 flex-nowrap items-center justify-center gap-3 overflow-x-auto px-2">
          {challengeHitboxes.map((hitbox) => {
            const isCompleted = gameProgress[hitbox.progressId] === true;
            const hitboxClass = `inline-flex h-[42px] min-w-[165px] items-center justify-center whitespace-nowrap rounded-md border px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.1em] backdrop-blur-[1px] transition ${
              isCompleted
                ? "border-emerald-200/80 bg-emerald-900/30 text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.8)]"
                : "border-cyan-200/70 bg-slate-900/25 text-cyan-100 shadow-[0_0_0_rgba(34,211,238,0)] hover:bg-slate-900/45 hover:shadow-[0_0_18px_rgba(34,211,238,0.55)]"
            }`;

            return (
            hitbox.route ? (
              <button
                key={hitbox.id}
                type="button"
                title={hitbox.title}
                onClick={() => navigate(hitbox.route)}
                onMouseEnter={() => setHoveredHitbox({
                  id: hitbox.id,
                  title: hitbox.title,
                  description: hitbox.description ?? "No description available.",
                })}
                onMouseLeave={() => setHoveredHitbox((current) => (current?.id === hitbox.id ? null : current))}
                className={hitboxClass}
                aria-label={hitbox.title}
              >
                {hitbox.title}
              </button>
            ) : (
              <a
                key={hitbox.id}
                href={hitbox.href}
                title={hitbox.title}
                onMouseEnter={() => setHoveredHitbox({
                  id: hitbox.id,
                  title: hitbox.title,
                  description: hitbox.description ?? "No description available.",
                })}
                onMouseLeave={() => setHoveredHitbox((current) => (current?.id === hitbox.id ? null : current))}
                className={hitboxClass}
                aria-label={hitbox.title}
              >
                {hitbox.title}
              </a>
            )
          );
          })}
        </div>

        <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col justify-between px-5 py-6 sm:px-8 lg:px-12">
          <main className="relative flex flex-1 items-center justify-center py-8">
            <div className="relative h-[520px] w-full max-w-[1200px]">
              <button
                type="button"
                onClick={handleNodeMapClick}
                className="adventure-btn-container !absolute !left-1/2 !top-auto !bottom-[5.9rem] !w-[195px]"
                style={{
                  ['--adventure-width']: '195px',
                  ['--adventure-bottom']: '5.9rem',
                  ['--adventure-left']: '50%',
                  ['--adventure-translateX']: '-50%',
                }}
                aria-label="Open lesson node map"
              >
                {/* <img src={btnAdventure} alt="Adventure" className="adventure-btn cursor-pointer" /> */}
              </button>
            </div>
          </main>
        </div>
      </div>
                
      {showLoading ? (
        <div className={`absolute inset-0 z-20 ${dissolving ? "opacity-0" : "opacity-100"}`}>
          <LoadingScreen
            visible={true}
            message={assetsReady ? "Preparing systems..." : "Loading assets..."}
            onComplete={() => setProgressComplete(true)}
          />
        </div>
      ) : null}

      {isNodeMapLoading ? (
        <div className="absolute inset-0 z-30">
          <LoadingScreen
            visible={true}
            message="Loading node map..."
            onComplete={handleNodeMapLoadingComplete}
          />
        </div>
      ) : null}
    </div>
  );
}
