import { Award, CheckCircle, Lock, Medal, ShieldCheck, Sparkles, Star, Trophy } from 'lucide-react';

const badgeCatalog = [
  { title: 'First Login', icon: CheckCircle, tone: 'bg-blue-100 text-blue-700', hint: 'Enter mission control.' },
  { title: 'Mission Starter', icon: Trophy, tone: 'bg-orange-100 text-orange-700', hint: 'Complete your first learning mission.' },
  { title: 'Hot Streak', icon: Sparkles, tone: 'bg-rose-100 text-rose-700', hint: 'Practice for 7 active days.' },
  { title: 'Queue Cadet', icon: ShieldCheck, tone: 'bg-emerald-100 text-emerald-700', hint: 'Finish the queue basics path.' },
  { title: 'Recursion Scout', icon: Medal, tone: 'bg-indigo-100 text-indigo-700', hint: 'Trace a recursive flow.' },
  { title: 'Quiz Climber', icon: Star, tone: 'bg-amber-100 text-amber-700', hint: 'Pass three knowledge checks.' },
];

function SummaryCard({ icon: Icon, label, value, helper, tone }) {
  return (
    <article className="overflow-hidden rounded-2xl border-2 border-blue-100 bg-white shadow-sm">
      <div className="flex items-center gap-4 p-5">
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${tone}`}>
          <Icon className="h-7 w-7" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
          <p className="mt-1 text-3xl font-black leading-none text-blue-900">{value}</p>
          <p className="mt-2 text-xs font-semibold text-slate-500">{helper}</p>
        </div>
      </div>
    </article>
  );
}

function AchievementCard({ achievement, toDateLabel, index }) {
  const catalogItem = badgeCatalog.find((item) => item.title === achievement.title) || badgeCatalog[index % badgeCatalog.length];
  const Icon = catalogItem.icon;

  return (
    <article className="group relative overflow-hidden rounded-2xl border-2 border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
      <div className="absolute right-4 top-4 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700">
        Unlocked
      </div>
      <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${catalogItem.tone} transition group-hover:scale-105`}>
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-black text-blue-900">{achievement.title}</h3>
      <p className="mt-2 min-h-[44px] text-sm font-medium leading-6 text-slate-600">{achievement.description || 'Achievement unlocked!'}</p>
      <div className="mt-5 flex items-center justify-between border-t border-blue-50 pt-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{toDateLabel(achievement.created_at)}</span>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">+{achievement.points || 0} XP</span>
      </div>
    </article>
  );
}

function LockedBadge({ badge }) {
  const Icon = badge.icon;

  return (
    <article className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 opacity-85">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-200 text-slate-500">
        <Icon className="h-7 w-7" />
      </div>
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-slate-400" />
        <h3 className="font-black text-slate-500">{badge.title}</h3>
      </div>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{badge.hint}</p>
    </article>
  );
}

export default function AchievementsTab({ dashboard, toDateLabel }) {
  const achievements = dashboard.gamification.achievements || [];
  const unlockedCount = achievements.length;
  const totalBadges = 9;
  const totalXp = achievements.reduce((sum, achievement) => sum + (achievement.points || 0), 0);
  const completedTopics = dashboard.topics?.filter((topic) => topic.completedCount === topic.missionCount).length || 0;
  const topicTotal = dashboard.topics?.length || 0;
  const unlockPercent = Math.round((unlockedCount / totalBadges) * 100);
  const lockedBadges = badgeCatalog.filter((badge) => !achievements.some((achievement) => achievement.title === badge.title)).slice(0, 4);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border-2 border-blue-100 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fdc500] text-blue-900">
                <Trophy className="h-7 w-7" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Badge Cabinet</p>
                <h1 className="text-3xl font-black text-blue-900">Your Achievements</h1>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-slate-600">
              Every badge marks a learning milestone. Keep completing lessons, quizzes, and missions to fill your cabinet.
            </p>
          </div>
          <div className="border-t border-blue-100 bg-blue-50/60 p-6 lg:border-l lg:border-t-0">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-blue-700">Collection Progress</span>
              <span className="text-sm font-black text-blue-900">{unlockPercent}%</span>
            </div>
            <div className="h-4 overflow-hidden rounded-full border border-blue-100 bg-white">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-800 via-blue-600 to-orange-400" style={{ width: `${unlockPercent}%` }} />
            </div>
            <p className="mt-3 text-xs font-semibold text-slate-500">{unlockedCount} of {totalBadges} achievements unlocked</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard icon={Trophy} label="Unlocked" value={`${unlockedCount}/${totalBadges}`} helper="Achievements collected" tone="bg-blue-100 text-blue-700" />
        <SummaryCard icon={Star} label="XP Earned" value={totalXp} helper="From achievements" tone="bg-amber-100 text-amber-700" />
        <SummaryCard icon={Award} label="Topic Badges" value={`${completedTopics}/${topicTotal}`} helper="Completed topic paths" tone="bg-emerald-100 text-emerald-700" />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-black text-blue-900">Unlocked Badges</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Badges you have already earned.</p>
        </div>

        {achievements.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {achievements.map((achievement, index) => (
              <AchievementCard key={achievement.id} achievement={achievement} toDateLabel={toDateLabel} index={index} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-blue-100 bg-white p-8 text-center">
            <p className="font-black text-blue-900">No achievements unlocked yet.</p>
            <p className="mt-2 text-sm font-medium text-slate-500">Complete your first mission to earn your first badge.</p>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-black text-blue-900">Next Badges</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">A preview of what you can unlock next.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {lockedBadges.map((badge) => (
            <LockedBadge key={badge.title} badge={badge} />
          ))}
        </div>
      </section>
    </div>
  );
}
