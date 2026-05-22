import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HyperspaceBackground from "../components/HyperspaceBackground";
import LoadingScreen from "./LoadingScreen";
import cockpitDashboard from "../assets/img/cockpit-dashboard.png";
import btnAdventure from "../assets/img/btn_adventure-fullreso.png";
import { clearDemoAuthSession } from "../demoAuth";

const turbineFailurePage = new URL("../concept-main/assets/turbine/turbine_failure.html", import.meta.url).href;
const galaxyHopsPage = new URL("../concept-main/galaxy_hops.html", import.meta.url).href;
const overHeatPage = new URL("../concept-main/over_heat.html", import.meta.url).href;

const challengeHitboxes = [
  {
    id: "turbine-failure-hitbox",
    href: turbineFailurePage,
    title: "Turbine Failure Challenge",
    left: "20.47%",
    top: "53.8%",
  },
  {
    id: "galaxy-hops-hitbox",
    href: galaxyHopsPage,
    title: "Galaxy Hops Challenge",
    left: "31.82%",
    top: "53.8%",
  },
  {
    id: "over-heat-hitbox",
    href: overHeatPage,
    title: "Reactor Overheat Challenge",
    left: "43.75%",
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
      <HyperspaceBackground />

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
        {challengeHitboxes.map((hitbox) => (
          <a
            key={hitbox.id}
            href={hitbox.href}
            title={hitbox.title}
            className="absolute z-20 block h-[clamp(52px,5.4vw,88px)] w-[clamp(52px,5.4vw,88px)] -translate-x-1/2 -translate-y-1/2 rounded-full transition hover:bg-cyan-300/25"
            style={{ left: hitbox.left, top: hitbox.top }}
            aria-label={hitbox.title}
          />
        ))}

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
                <img src={btnAdventure} alt="Adventure" className="adventure-btn cursor-pointer" />
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
