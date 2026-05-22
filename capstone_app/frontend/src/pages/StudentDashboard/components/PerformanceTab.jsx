export default function PerformanceTab({
  dashboard,
  points,
  xpProgress,
  performanceBars,
  recentAttempts,
  toDateLabel,
  navigate,
  setSelectedTab,
  loadDashboard,
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Total Points</p>
          <p className="mt-2 text-3xl font-semibold text-[#2b67ad]">{points}</p>
          <p className="mt-1 text-xs text-slate-500">from user_points</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Missions Completed</p>
          <p className="mt-2 text-3xl font-semibold text-[#2b67ad]">{dashboard.topics.reduce((count, topic) => count + topic.completedCount, 0)}</p>
          <p className="mt-1 text-xs text-slate-500">from user_progress</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Avg Assessment</p>
          <p className="mt-2 text-3xl font-semibold text-[#2b67ad]">{Math.round(dashboard.performance.assessmentAverage || 0)}%</p>
          <p className="mt-1 text-xs text-slate-500">from assessment_attempts</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Active Challenges</p>
          <p className="mt-2 text-3xl font-semibold text-[#2b67ad]">{dashboard.challenges.filter((challenge) => !challenge.completed).length}</p>
          <p className="mt-1 text-xs text-slate-500">from challenges</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Performance Snapshot</h2>
            <p className="text-sm text-slate-500">Progress, achievements, and recent activity</p>
          </div>

          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">Gamification</h3>
              <span className="text-xs text-slate-400">user_points • achievements</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Total Points</p>
              <p className="mt-1 text-4xl font-semibold text-[#2b67ad]">{points}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.24em] text-slate-500">XP Progress</p>
              <div className="mt-2 h-3 rounded-full bg-slate-100">
                <div className="h-3 rounded-full bg-gradient-to-r from-[#4d8ecb] to-[#ff9800]" style={{ width: `${xpProgress}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-500">{xpProgress}% toward next tier</p>
            </div>

            <div className="mt-3 space-y-2">
              {(dashboard.gamification.achievements || []).slice(0, 5).map((achievement) => (
                <div key={achievement.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <p className="text-sm font-medium text-slate-900">{achievement.title}</p>
                  <p className="text-xs text-slate-500">+{achievement.points || 0} pts • {toDateLabel(achievement.created_at)}</p>
                </div>
              ))}
              {dashboard.gamification.achievements?.length ? null : <p className="text-xs text-slate-500">No achievements unlocked yet.</p>}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">Performance Overview</h3>
              <span className="text-xs uppercase tracking-[0.24em] text-slate-500">charts + recent attempts</span>
            </div>

            <div className="space-y-3">
              {performanceBars.map((bar) => (
                <div key={bar.label}>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                    <span>{bar.label}</span>
                    <span>{Math.round(bar.value || 0)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-gradient-to-r from-[#4d8ecb] to-[#6b8ef1]" style={{ width: `${bar.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
              <h4 className="text-sm font-semibold text-slate-900">Recent Attempts</h4>
              <ul className="mt-2 space-y-2 text-xs text-slate-600">
                {recentAttempts.map((attempt) => (
                  <li key={attempt.id} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2">
                    <p className="text-slate-900">{attempt.title}</p>
                    <p className="mt-1 text-slate-500">{attempt.source} • Score {attempt.score} • {toDateLabel(attempt.when)}</p>
                  </li>
                ))}
                {recentAttempts.length ? null : <li className="text-slate-500">No attempts yet.</li>}
              </ul>
            </div>
          </article>
        </section>

        <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
            <p className="text-sm text-slate-500">Common student tasks</p>
          </div>

          <button type="button" onClick={() => setSelectedTab('missions')} className="w-full rounded-xl bg-[#4d8ecb] px-4 py-3 text-left text-sm font-semibold text-white shadow-sm transition hover:brightness-105">
            View missions
          </button>
          <button type="button" onClick={() => setSelectedTab('materials')} className="w-full rounded-xl bg-[#ff9800] px-4 py-3 text-left text-sm font-semibold text-white shadow-sm transition hover:brightness-105">
            Open materials
          </button>
          <button type="button" onClick={() => navigate('/playership')} className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-left text-sm font-semibold text-white shadow-sm transition hover:brightness-105">
            Start challenge mode
          </button>
          <button type="button" onClick={loadDashboard} className="w-full rounded-xl bg-slate-700 px-4 py-3 text-left text-sm font-semibold text-white shadow-sm transition hover:bg-slate-600">
            Refresh dashboard
          </button>
        </aside>
      </div>
    </div>
  );
}