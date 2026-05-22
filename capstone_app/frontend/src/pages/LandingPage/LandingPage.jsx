import { Gamepad2, Rocket, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import HyperSpaceHorizontal from '../../components/HyperSpaceHorizontal';
import maskot from '../../assets/img/maskot.png';

const stats = [
  { label: 'DSA Topics', value: '12' },
  { label: 'Challenges', value: '50+' },
  { label: 'Rewards', value: '100+' },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-slate-900">
      <HyperSpaceHorizontal />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_30%),linear-gradient(180deg,rgba(11,24,47,0.48),rgba(11,24,47,0.34))]" />
      <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
        <div className="absolute top-[20%]" style={{ animation: 'mascotCruise 18s linear infinite' }}>
          <img
            src={maskot}
            alt="Floating mascot"
            className="h-20 w-20 object-contain opacity-85 drop-shadow-[0_10px_24px_rgba(0,0,0,0.45)] md:h-24 md:w-24"
            style={{ animation: 'mascotSpin 3.8s linear infinite' }}
          />
        </div>
      </div>

      <header className="sticky top-0 z-20 border-b border-blue-100/20 bg-white/82 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 text-blue-700">
            <Gamepad2 className="h-5 w-5" />
            <span className="text-2xl font-black tracking-tight">BALANGKAS</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
            >
              Login
            </Link>
            <Link
              to="/login?mode=signup"
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-800"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl px-6 py-16 md:py-20">
        <section className="max-w-5xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/94 px-3 py-1 text-xs font-black uppercase tracking-widest text-blue-700">
            <Rocket className="h-4 w-4" />
            Mission Control Academy
          </p>
          <h1 className="text-5xl font-black leading-tight text-white [text-shadow:0_6px_20px_rgba(5,13,29,0.85)] md:text-6xl lg:text-7xl">
            Master Data Structures And Algorithms Through Space Missions
          </h1>
          <p className="mt-6 max-w-4xl text-xl leading-relaxed text-blue-100 md:text-2xl">
            Train as a space crew coder, clear level-based operations, and build real DSA mastery through playful missions, quizzes, and rewards.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/login?mode=signup"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-black uppercase tracking-wider text-white transition hover:bg-blue-800"
            >
              <Rocket className="h-4 w-4" />
              Start Mission
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-6 py-3 text-sm font-black uppercase tracking-wider text-blue-700 transition hover:bg-blue-50"
            >
              <Shield className="h-4 w-4" />
              Login
            </Link>
          </div>

          <div className="mt-12 grid max-w-2xl grid-cols-3 gap-4 md:gap-6">
            {stats.map((item) => (
              <div key={item.label} className="rounded-xl border border-blue-100 bg-white/92 p-4 text-center shadow-sm md:p-5">
                <p className="text-3xl font-black text-blue-700 md:text-4xl">{item.value}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <style>{`
        @keyframes mascotCruise {
          0% { transform: translateX(-16vw) translateY(0px); }
          45% { transform: translateX(48vw) translateY(-16px); }
          100% { transform: translateX(116vw) translateY(0px); }
        }
        @keyframes mascotSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
