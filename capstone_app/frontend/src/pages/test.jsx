import TypewriterEffect from "../components/TypewriterEffect";
import HyperspaceBackground from "../components/HyperspaceBackground";
import cockpitDashboard from "../assets/img/cockpit-dashboard.png";

export default function Test() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <HyperspaceBackground />
      <img
        src={cockpitDashboard}
        alt="Cockpit dashboard overlay"
        className="pointer-events-none fixed inset-0 z-10 h-full w-full object-fill opacity-100"
      />
      <div className="relative z-20 p-10">
        <TypewriterEffect
          text="test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test  test test test test test test test test test test test test test test test test test  test test test test test test test test test test test test test test test test test  test test test test test test test test test test test test test test test test test  "
          speed={100}
          className="font-ari text-green-200 text-xl font-normal block "
        />
      </div>
    </div>
  );
}