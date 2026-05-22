export default function AchievementsTab({ dashboard, toDateLabel }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <div className="mb-2 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
              <span className="text-3xl">🏆</span>
            </div>
          </div>
          <p className="text-2xl font-semibold text-slate-900">{dashboard.gamification.achievements?.length || 0}/9</p>
          <p className="mt-2 text-xs text-slate-500">Achievements Unlocked</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <div className="mb-2 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <span className="text-3xl">⭐</span>
            </div>
          </div>
          <p className="text-2xl font-semibold text-slate-900">{dashboard.gamification.achievements?.reduce((sum, ach) => sum + (ach.points || 0), 0) || 0}</p>
          <p className="mt-2 text-xs text-slate-500">XP from Achievements</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <div className="mb-2 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <span className="text-3xl">📌</span>
            </div>
          </div>
          <p className="text-2xl font-semibold text-slate-900">{dashboard.topics?.filter((topic) => topic.completedCount === topic.missionCount).length || 0}/{dashboard.topics?.length || 0}</p>
          <p className="mt-2 text-xs text-slate-500">Topic Badges Earned</p>
        </div>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-slate-900">Your Achievements</h2>
          <p className="mt-1 text-sm text-slate-500">Keep grinding to unlock more!</p>
        </div>

        {dashboard.gamification.achievements?.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dashboard.gamification.achievements.map((achievement) => (
              <div key={achievement.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                    <span className="text-2xl">✓</span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">
                    ✓ Unlocked
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-900">{achievement.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{achievement.description || 'Achievement unlocked!'}</p>
                <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                  <span className="text-xs text-slate-500">{toDateLabel(achievement.created_at)}</span>
                  <span className="text-sm font-semibold text-purple-600">+{achievement.points || 0} XP</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-slate-600">No achievements unlocked yet.</p>
            <p className="mt-2 text-sm text-slate-500">Complete missions and challenges to earn achievements!</p>
          </div>
        )}
      </article>
    </div>
  );
}