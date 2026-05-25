import {
  Award,
  CheckCircle,
  Coins,
  Edit3,
  Flame,
  LogOut,
  Mail,
  Shield,
  Trophy,
  User,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const Card = ({ children, className = '' }) => (
  <section className={`rounded-2xl border-2 border-blue-100 bg-white p-6 ${className}`}>
    {children}
  </section>
);

const ProfileMetric = ({ icon: Icon, label, value, tone }) => (
  <div className="rounded-2xl border-2 border-blue-100 bg-white p-5 shadow-sm">
    <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
      <Icon className="h-5 w-5" />
    </div>
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    <p className="mt-1 text-2xl font-black leading-none text-blue-900">{value}</p>
  </div>
);

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-xl bg-blue-50/60 px-4 py-3">
    <Icon className="h-4 w-4 shrink-0 text-blue-600" />
    <div className="min-w-0">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="truncate text-sm font-bold text-blue-900">{value}</p>
    </div>
  </div>
);

const STUDENT_SCOREBOARD_STORAGE_KEY = 'balangkas.student.scoreboard';

const SkillBar = ({ label, value }) => (
  <div>
    <div className="mb-2 flex items-end justify-between">
      <span className="text-[10px] font-black uppercase tracking-widest text-blue-900">{label}</span>
      <span className="text-[10px] font-black text-blue-500">{value}%</span>
    </div>
    <div className="h-3 overflow-hidden rounded-full bg-blue-50">
      <div className="h-full rounded-full bg-blue-700" style={{ width: `${value}%` }} />
    </div>
  </div>
);

const Badge = ({ title, detail, icon: Icon, locked }) => (
  <div className={`rounded-2xl border-2 p-4 ${locked ? 'border-slate-200 bg-slate-50' : 'border-blue-100 bg-white'}`}>
    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${locked ? 'bg-slate-200 text-slate-400' : 'bg-[#fdc500] text-blue-900'}`}>
      <Icon className="h-6 w-6" />
    </div>
    <p className={`font-black ${locked ? 'text-slate-400' : 'text-blue-900'}`}>{title}</p>
    <p className="mt-1 text-xs font-medium text-slate-500">{detail}</p>
  </div>
);

function toTitleCase(value) {
  if (!value) return '';
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export default function ProfileTab({ onLogout, user }) {
  const role = user?.profile?.role || 'student';
  const [scoreboard, setScoreboard] = useState({});
  const [selectedTopicKey, setSelectedTopicKey] = useState('');
  const profile = {
    name: user?.profile?.full_name || 'Recruit',
    title: `${toTitleCase(role)} Account`,
    email: user?.email || 'No email',
  };

  useEffect(() => {
    const loadScoreboard = () => {
      try {
        const raw = window.localStorage.getItem(STUDENT_SCOREBOARD_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          setScoreboard({});
          return;
        }
        setScoreboard(parsed);
      } catch (error) {
        setScoreboard({});
      }
    };

    const handleScoreboardUpdated = (event) => {
      const detail = event?.detail;
      if (!detail || typeof detail !== 'object' || Array.isArray(detail)) {
        loadScoreboard();
        return;
      }
      setScoreboard(detail);
    };

    loadScoreboard();
    window.addEventListener('storage', loadScoreboard);
    window.addEventListener('focus', loadScoreboard);
    window.addEventListener('balangkas:scoreboard-updated', handleScoreboardUpdated);

    return () => {
      window.removeEventListener('storage', loadScoreboard);
      window.removeEventListener('focus', loadScoreboard);
      window.removeEventListener('balangkas:scoreboard-updated', handleScoreboardUpdated);
    };
  }, []);

  const topicScores = useMemo(() => {
    if (!scoreboard || typeof scoreboard !== 'object' || Array.isArray(scoreboard)) {
      return [];
    }

    return Object.entries(scoreboard)
      .filter(([, entry]) => entry && typeof entry === 'object')
      .map(([topicKey, entry]) => ({
        topicKey,
        topicLabel: toTitleCase(topicKey),
        pre: Number.isFinite(entry.preTestScore) ? entry.preTestScore : null,
        post: Number.isFinite(entry.postTestScore) ? entry.postTestScore : null,
        updatedAt: entry.updatedAt || null,
      }))
      .sort((a, b) => {
        const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return bTime - aTime;
      });
  }, [scoreboard]);

  useEffect(() => {
    if (!topicScores.length) {
      setSelectedTopicKey('');
      return;
    }

    if (!topicScores.some((topic) => topic.topicKey === selectedTopicKey)) {
      setSelectedTopicKey(topicScores[0].topicKey);
    }
  }, [topicScores, selectedTopicKey]);

  const selectedTopic = topicScores.find((topic) => topic.topicKey === selectedTopicKey) || topicScores[0] || null;

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-2xl border-2 border-blue-100 bg-white shadow-sm">
        <div className="relative bg-[#5089c6] px-6 py-8 text-white sm:px-8">
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-12 gap-4 p-4">
              {Array.from({ length: 72 }).map((_, index) => (
                <span key={index} className="h-1 w-1 rounded-full bg-white" />
              ))}
            </div>
          </div>
          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-blue-100 shadow-lg">
                <User className="h-12 w-12 text-blue-600" />
              </div>
              <div>
                <p className="mb-2 inline-flex rounded-md bg-[#fdc500] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-900">
                  {toTitleCase(role)} Profile
                </p>
                <h1 className="text-4xl font-black tracking-tight">{profile.name}</h1>
                <p className="mt-1 text-sm font-bold uppercase tracking-widest text-blue-100">{profile.title}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-blue-700 shadow-md transition hover:bg-blue-50">
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-md transition hover:bg-slate-700"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <InfoRow icon={Mail} label="Signal Mail" value={profile.email} />
          <InfoRow icon={User} label="Role" value={toTitleCase(role)} />
        </div>
      </div>

      {role === 'student' ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <ProfileMetric icon={Trophy} label="Level" value="5" tone="bg-blue-100 text-blue-600" />
          <ProfileMetric icon={Coins} label="Coins" value="4,500" tone="bg-orange-100 text-orange-600" />
          <ProfileMetric icon={Flame} label="Streak" value="7 days" tone="bg-red-100 text-red-600" />
          <ProfileMetric icon={Award} label="Badges" value="12" tone="bg-emerald-100 text-emerald-600" />
        </div>
      ) : null}

      {role === 'student' ? (
        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-blue-900">Mission Progress</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">Progress across your active learning paths.</p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600">
                1,250 / 3,250 XP
              </span>
            </div>
            <div className="space-y-5">
              <SkillBar label="Recursion Relay" value={82} />
              <SkillBar label="Iteration Forge" value={64} />
              <SkillBar label="Linked List Link-up" value={51} />
            </div>
          </Card>

          <Card>
            <div className="mb-6 flex items-center gap-3">
              <Trophy className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-black tracking-tight text-blue-900">Assessment Scores</h2>
            </div>
            {topicScores.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-600">No pre-test or post-test scores yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {topicScores.map((topic) => {
                    const active = topic.topicKey === selectedTopic?.topicKey;
                    return (
                      <button
                        key={topic.topicKey}
                        type="button"
                        onClick={() => setSelectedTopicKey(topic.topicKey)}
                        className={`rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-wider transition ${
                          active ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                      >
                        {topic.topicLabel}
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Selected topic</p>
                  <p className="mt-1 text-lg font-black text-blue-900">{selectedTopic?.topicLabel}</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-blue-100 bg-white p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Pre-test</p>
                      <p className="mt-1 text-2xl font-black text-blue-900">
                        {selectedTopic?.pre === null ? '--' : `${selectedTopic.pre}%`}
                      </p>
                    </div>
                    <div className="rounded-xl border border-emerald-100 bg-white p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Post-test</p>
                      <p className="mt-1 text-2xl font-black text-emerald-900">
                        {selectedTopic?.post === null ? '--' : `${selectedTopic.post}%`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      ) : null}

      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-black tracking-tight text-blue-900">Badge Cabinet</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Unlocked recognitions and next targets.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Badge icon={CheckCircle} title="First Login" detail="Entered mission control." />
          <Badge icon={Trophy} title="Mission Starter" detail="Completed a learning mission." />
          <Badge icon={Flame} title="Hot Streak" detail="Kept a 7-day activity streak." />
          <Badge icon={Shield} title="Queue Cadet" detail="Unlock by finishing queue drills." locked />
        </div>
      </Card>
    </div>
  );
}
