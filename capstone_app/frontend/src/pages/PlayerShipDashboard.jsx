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
const TURBINE_ALL_RUNNING_KEY = "balangkas.turbines.all_running";
const TURBINE_STATE_STORAGE_KEY = "balangkas.turbine_failure.v2";

const challengeHitboxes = [
  {
    id: "turbine-failure-hitbox",
    href: turbineFailurePage,
    title: "Turbine Failure Challenge",
    left: "20.47%",
    top: "53.8%",
  },
  {
    id: "tree-delivery-drone-hitbox",
    route: "/tree-delivery-drone",
    title: "Tree Delivery Drone Challenge",
    left: "31.82%",
    top: "53.8%",
  },
  {
    id: "over-heat-hitbox",
    href: rocketAvoidingPlanPage,
    title: "Rocket Avoiding Plan",
    left: "43.75%",
    top: "53.15%",
  },
  {
    id: "cargo-stack-protocol-hitbox",
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
  const [allTurbinesRunning, setAllTurbinesRunning] = useState(false);

  useEffect(() => {
    const isAllSolvedFromState = () => {
      try {
        const raw = window.localStorage.getItem(TURBINE_STATE_STORAGE_KEY);
        if (!raw) return false;

        const parsed = JSON.parse(raw);
        const turbines = parsed?.turbines;

        if (!turbines) return false;

        const t1 = Boolean(turbines["turbine-1"]?.success);
        const t2 = Boolean(turbines["turbine-2"]?.success);
        const t3 = Boolean(turbines["turbine-3"]?.success);

        return t1 && t2 && t3;
      } catch {
        return false;
      }
    };

    const syncTurbineBoost = () => {
      try {
        const fromState = isAllSolvedFromState();
        const fromFlag = window.localStorage.getItem(TURBINE_ALL_RUNNING_KEY) === "true";
        setAllTurbinesRunning(fromState && fromFlag);
      } catch {
        setAllTurbinesRunning(false);
      }
    };

    syncTurbineBoost();
    window.addEventListener("storage", syncTurbineBoost);
    window.addEventListener("balangkas:turbines-updated", syncTurbineBoost);

    return () => {
      window.removeEventListener("storage", syncTurbineBoost);
      window.removeEventListener("balangkas:turbines-updated", syncTurbineBoost);
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <HyperspaceBackground boosted={allTurbinesRunning} />

      {allTurbinesRunning ? (
        <div className="absolute left-1/2 top-4 z-50 -translate-x-1/2 rounded-full border border-emerald-200/70 bg-emerald-900/45 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.26em] text-emerald-100">
          All Turbines Running
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleLogout}
        className="absolute right-4 top-4 z-50 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white backdrop-blur-sm transition hover:bg-black"
      >
        Log Out
      </button>

      <button
        type="button"
        onClick={() => navigate('/playershipdashboard')}
        className="absolute left-4 top-4 z-50 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white backdrop-blur-sm transition hover:bg-black"
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

        <div className="absolute left-1/2 top-[60%] z-20 flex w-[min(92vw,980px)] -translate-x-1/2 -translate-y-1/2 flex-wrap items-center justify-center gap-4">
          {challengeHitboxes.map((hitbox) => (
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
                className="min-h-[56px] min-w-[220px] rounded-md border border-cyan-200/70 bg-slate-900/25 px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-cyan-100 shadow-[0_0_0_rgba(34,211,238,0)] backdrop-blur-[1px] transition hover:bg-slate-900/45 hover:shadow-[0_0_18px_rgba(34,211,238,0.55)]"
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
                className="inline-flex min-h-[56px] min-w-[220px] items-center justify-center rounded-md border border-cyan-200/70 bg-slate-900/25 px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-cyan-100 shadow-[0_0_0_rgba(34,211,238,0)] backdrop-blur-[1px] transition hover:bg-slate-900/45 hover:shadow-[0_0_18px_rgba(34,211,238,0.55)]"
                aria-label={hitbox.title}
              >
                {hitbox.title}
              </a>
            )
          ))}
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
