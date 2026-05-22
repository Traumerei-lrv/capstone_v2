const missionStyleMap = {
  introduction: {
    icon: '01',
    ring: 'border-sky-300',
    card: 'from-sky-500 via-cyan-500 to-blue-500',
    chip: 'bg-sky-100 text-sky-700',
    label: 'Start here',
  },
  recursion: {
    icon: '↺',
    ring: 'border-blue-300',
    card: 'from-blue-500 via-indigo-500 to-violet-500',
    chip: 'bg-blue-100 text-blue-700',
    label: 'Core path',
  },
  iteration: {
    icon: '∞',
    ring: 'border-emerald-300',
    card: 'from-emerald-500 via-teal-500 to-cyan-500',
    chip: 'bg-emerald-100 text-emerald-700',
    label: 'Core path',
  },
  'linked-list': {
    icon: '⛓',
    ring: 'border-fuchsia-300',
    card: 'from-fuchsia-500 via-pink-500 to-rose-500',
    chip: 'bg-fuchsia-100 text-fuchsia-700',
    label: 'Core path',
  },
  stack: {
    icon: '▤',
    ring: 'border-orange-300',
    card: 'from-orange-500 via-amber-500 to-yellow-500',
    chip: 'bg-orange-100 text-orange-700',
    label: 'Locked',
  },
  queue: {
    icon: '≡',
    ring: 'border-purple-300',
    card: 'from-purple-500 via-violet-500 to-pink-500',
    chip: 'bg-purple-100 text-purple-700',
    label: 'Locked',
  },
  tree: {
    icon: '🌳',
    ring: 'border-emerald-300',
    card: 'from-emerald-600 via-lime-500 to-emerald-400',
    chip: 'bg-emerald-100 text-emerald-700',
    label: 'Locked',
  },
  heap: {
    icon: '⛰',
    ring: 'border-slate-300',
    card: 'from-slate-500 via-slate-600 to-slate-700',
    chip: 'bg-slate-100 text-slate-700',
    label: 'Locked',
  },
  graph: {
    icon: '◌',
    ring: 'border-cyan-300',
    card: 'from-cyan-500 via-sky-500 to-blue-600',
    chip: 'bg-cyan-100 text-cyan-700',
    label: 'Locked',
  },
  dp: {
    icon: '⊕',
    ring: 'border-rose-300',
    card: 'from-rose-500 via-red-500 to-orange-500',
    chip: 'bg-rose-100 text-rose-700',
    label: 'Locked',
  },
};

const defaultStyle = {
  icon: '★',
  ring: 'border-slate-300',
  card: 'from-slate-500 via-slate-600 to-slate-700',
  chip: 'bg-slate-100 text-slate-700',
  label: 'Locked',
};

const starsForMission = (mission) => {
  if (mission.status === 'Locked') {
    return 0;
  }

  if (mission.progressPercent >= 100) {
    return 3;
  }

  if (mission.progressPercent >= 70) {
    return 2;
  }

  return 1;
};

export default function MissionsTab({ missionCards, navigate }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] overflow-hidden">
      <div className="border-b border-slate-100 bg-gradient-to-r from-sky-50 via-white to-indigo-50 px-6 py-6 sm:px-8">
        <p className="text-[11px] font-black uppercase tracking-[0.34em] text-sky-500">Learning map</p>
        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Mission Path</h2>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
              Follow the route from Introduction through recursion, iteration, linked lists, and the advanced locked stages.
            </p>
          </div>
          <div className="rounded-full border border-sky-100 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-slate-500 shadow-sm">
            Scroll to explore levels
          </div>
        </div>
      </div>

      <div className="max-h-[78vh] overflow-y-auto px-4 py-6 sm:px-6">
        <div className="relative mx-auto max-w-5xl">
          <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-sky-200 via-slate-200 to-slate-300 md:block" />

          <div className="space-y-8">
            {missionCards.map((mission, index) => {
              const style = missionStyleMap[mission.key] || defaultStyle;
              const isLeft = index % 2 === 0;
              const stars = starsForMission(mission);
              const isLocked = mission.status === 'Locked';
              const canOpen = Boolean(mission.path) && !isLocked;

              const card = (
                <button
                  key={mission.key}
                  type="button"
                  disabled={!canOpen}
                  onClick={() => canOpen && navigate(mission.path)}
                  className={`group w-full rounded-[1.75rem] border bg-white p-4 text-left shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition duration-200 sm:p-5 ${canOpen ? 'hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)]' : 'cursor-default'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.4rem] border-2 ${style.ring} bg-gradient-to-br ${style.card} text-2xl font-black text-white shadow-lg`}>{style.icon}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.32em] text-slate-400">{style.label}</p>
                          <h3 className="mt-1 text-xl font-black tracking-tight text-slate-900">{mission.title}</h3>
                        </div>
                        <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] ${style.chip}`}>
                          {mission.status}
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-slate-600">{mission.description}</p>

                      <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
                        <span>{mission.completedCount || 0}/{mission.missionCount || 0} complete</span>
                        <span className="text-slate-300">•</span>
                        <span>{mission.progressPercent || 0}% cleared</span>
                      </div>

                      <div className="mt-4 flex items-center gap-1 text-amber-400">
                        {Array.from({ length: 3 }).map((_, starIndex) => (
                          <span key={starIndex} className={starIndex < stars ? 'text-amber-400' : 'text-slate-200'}>★</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${style.card}`}
                      style={{ width: `${mission.progressPercent || 0}%` }}
                    />
                  </div>
                </button>
              );

              return (
                <div key={mission.key} className="grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_auto_1fr] md:gap-0">
                  <div className={`${isLeft ? 'md:pr-10' : 'hidden md:block'}`}>
                    {isLeft ? card : null}
                  </div>

                  <div className="flex flex-col items-center justify-center py-2 md:py-0">
                    <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 bg-white shadow-lg ${isLocked ? 'border-slate-300 text-slate-400' : `${style.ring} text-slate-900`}`}>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                    {index < missionCards.length - 1 ? (
                      <div className="mt-1 h-20 w-1 rounded-full bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200 md:h-24" />
                    ) : null}
                  </div>

                  <div className={`${isLeft ? 'hidden md:block' : 'md:pl-10'}`}>
                    {!isLeft ? card : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/80 px-6 py-4 sm:px-8">
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-500" /> Completed</span>
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-blue-500" /> Active</span>
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-slate-300" /> Locked</span>
          <span className="flex items-center gap-2"><span className="text-amber-500">★</span> Stars earned</span>
        </div>
      </div>
    </section>
  );
}
