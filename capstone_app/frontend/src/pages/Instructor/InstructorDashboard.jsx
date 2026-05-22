import {
  atRiskStudents,
  instructorStats,
  leaderboardRows,
  quickActions,
  recentActivities,
} from './instructorData';

function StatCard({ stat }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{stat.label}</p>
      <p className="mt-3 text-3xl font-black text-[#165A9E]">{stat.value}</p>
      <p className="mt-2 text-sm text-slate-500">{stat.note}</p>
    </article>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <section className="rounded-[1.4rem] border border-slate-200 bg-slate-50/90 p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function InstructorDashboard() {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {instructorStats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.3fr_0.9fr]">
        <Panel title="Performance Snapshot" subtitle="Leaderboard and students who need attention">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Top 5 Leaderboard</h3>
              <div className="space-y-3">
                {leaderboardRows.map((row) => (
                  <div key={row.rank} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3">
                    <div>
                      <p className="font-semibold text-slate-900">#{row.rank} {row.name}</p>
                      <p className="text-sm text-slate-500">{row.streak}</p>
                    </div>
                    <p className="text-lg font-black text-[#F39200]">{row.score}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">At-Risk Students</h3>
              <div className="space-y-3">
                {atRiskStudents.map((student) => (
                  <div key={student.name} className="rounded-xl border border-rose-100 bg-rose-50/70 px-3 py-3">
                    <p className="font-semibold text-rose-900">{student.name}</p>
                    <p className="text-sm text-rose-700">{student.concern}</p>
                    <p className="text-xs text-rose-600/80">{student.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel title="Quick Actions" subtitle="Common instructor tasks">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  className={[
                    'rounded-2xl px-4 py-4 text-left font-semibold transition-transform hover:-translate-y-0.5',
                    action.tone === 'blue' ? 'bg-[#165A9E] text-white' : '',
                    action.tone === 'amber' ? 'bg-[#F39200] text-white' : '',
                    action.tone === 'emerald' ? 'bg-emerald-600 text-white' : '',
                    action.tone === 'slate' ? 'bg-slate-700 text-white' : '',
                  ].join(' ')}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Recent Activity Feed" subtitle="Latest updates from activity_logs">
            <div className="space-y-3">
              {recentActivities.map((entry) => (
                <article key={entry.action} className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{entry.action}</p>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{entry.type}</p>
                    </div>
                    <p className="text-sm text-slate-500">{entry.time}</p>
                  </div>
                </article>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
