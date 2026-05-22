import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  User, 
  ChevronRight, 
  Trophy, 
  Coins, 
  Flame, 
  Award, 
  CheckCircle, 
  BookOpen, 
  Clock,
  History,
  Layout
} from 'lucide-react';

import MissionsTab from './components/MissionsTab';
import MaterialsTab from './components/MaterialsTab';
import AchievementsTab from './components/AchievementsTab';
import PerformanceTab from './components/PerformanceTab';
import ProfileTab from './components/ProfileTab';
import { clearDemoAuthSession } from '../../demoAuth';
import maskot from '../../assets/img/maskot.png';

/**
 * BALANGKAS STUDENT DASHBOARD - REACT COMPONENT
 * 
 * This component implements the "Balangkas" student dashboard with 
 * the high-fidelity aesthetic requested. It uses Tailwind CSS for 
 * utility-first styling and Lucide-React for iconography.
 */

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border-2 border-blue-100 p-6 ${className}`}>
    {children}
  </div>
);

const ProgressBar = ({ progress, total, label }) => {
  const percentage = (progress / total) * 100;
  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-2">
        <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">{label}</span>
        <span className="text-xs font-bold text-slate-500">{progress} / {total} XP</span>
      </div>
      <div className="h-4 bg-blue-50 rounded-full overflow-hidden border border-blue-100">
        <div 
          className="h-full bg-gradient-to-r from-blue-700 to-blue-500 transition-all duration-1000 ease-out" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const StatItem = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-3">
    <div className={`p-2 rounded-lg ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-lg font-black text-blue-900 leading-none">{value}</p>
    </div>
  </div>
);

const UserProfile = () => (
  <Card className="mb-6 flex flex-col md:flex-row items-center gap-8 shadow-sm">
    <div className="flex items-center gap-6 flex-1">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-200">
        <User className="w-10 h-10 text-blue-600" />
      </div>
      <div>
        <h1 className="text-3xl font-black text-blue-900 tracking-tight leading-tight">Recruit Alpha</h1>
        <p className="text-blue-500 font-bold text-xs uppercase tracking-widest">Algorithm Apprentice</p>
      </div>
    </div>
    
    <div className="flex flex-wrap gap-8 justify-center md:justify-end py-4 px-8 bg-blue-50/50 rounded-2xl border border-blue-100">
      <StatItem icon={Trophy} label="Level" value="5" color="text-blue-600 bg-blue-100" />
      <StatItem icon={Coins} label="Coins" value="4500" color="text-orange-600 bg-orange-100" />
      <StatItem icon={Flame} label="Streak" value="7" color="text-red-600 bg-red-100" />
      <StatItem icon={Award} label="Badges" value="12" color="text-emerald-600 bg-emerald-100" />
    </div>

    <div className="w-full md:w-auto md:min-w-[300px]">
      <ProgressBar progress={1250} total={3250} label="Level 5 Progress" />
    </div>
  </Card>
);

const MissionCard = () => (
  <Card className="mb-6 border-l-8 border-l-orange-500">
    <div className="flex items-center gap-2 mb-4">
      <Award className="w-5 h-5 text-blue-600" />
      <h2 className="text-lg font-black text-blue-900 uppercase tracking-tight">Recommended Next Mission</h2>
    </div>
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-4 bg-orange-50/30 rounded-xl border border-orange-100">
      <div>
        <span className="px-3 py-1 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-3 inline-block">QUEUES</span>
        <h3 className="text-2xl font-black text-blue-900 mb-2">Master Queue Operations</h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs">
            <Flame className="w-4 h-4 text-blue-500" /> Medium
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs">
            <Clock className="w-4 h-4 text-blue-500" /> 45 min
          </div>
        </div>
      </div>
      <button className="bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all text-white font-black px-8 py-4 rounded-xl flex items-center gap-3 uppercase tracking-wider shadow-lg shadow-orange-500/20">
        Start Mission <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  </Card>
);

const DailyMissionItem = ({ title, progress, total, xp }) => (
  <div className="py-4 first:pt-0 last:pb-0">
    <div className="flex justify-between items-center mb-3">
      <p className="font-bold text-blue-900">{title}</p>
      <span className="text-xs font-black text-blue-600">+{xp} XP</span>
    </div>
    <div className="flex items-center gap-4">
      <div className="flex-1 h-3 bg-blue-50 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-800 rounded-full" 
          style={{ width: `${(progress/total)*100}%` }}
        />
      </div>
      <span className="text-[10px] font-black text-slate-400 whitespace-nowrap">{progress} / {total}</span>
    </div>
  </div>
);

const LeaderboardItem = ({ rank, name, xp, isUser }) => (
  <div className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${isUser ? 'bg-blue-50 border-2 border-blue-200 border-dashed' : 'hover:bg-slate-50'}`}>
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
      rank === 1 ? 'bg-blue-900 text-white' : 
      rank === 2 ? 'bg-blue-100 text-blue-600' : 
      rank === 3 ? 'bg-blue-50 text-blue-400' : 
      'text-slate-400'
    }`}>
      {rank}
    </div>
    <div className="flex-1">
      <p className={`font-bold text-sm ${isUser ? 'text-blue-900' : 'text-slate-700'}`}>{name}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Level {12 - rank}</p>
    </div>
    <div className="text-right">
      <p className="font-black text-blue-900 text-sm tracking-tight">{xp}</p>
    </div>
  </div>
);

const ActivityItem = ({ icon: Icon, title, time, color }) => (
  <div className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-bold text-blue-900 text-sm truncate">{title}</p>
      <p className="text-[10px] font-bold text-slate-400">{time}</p>
    </div>
  </div>
);

const missionCards = [
  {
    key: 'introduction',
    title: 'Introduction',
    description: 'Start here to learn the mission map, navigation rules, and basic controls.',
    status: 'Completed',
    path: null,
    progressPercent: 100,
    completedCount: 1,
    missionCount: 1,
  },
  {
    key: 'recursion',
    title: 'Recursion Relay',
    description: 'Traverse call stacks and recursive patterns with guided practice.',
    status: 'Active',
    path: '/playershipdashboard/recursion',
    progressPercent: 82,
    completedCount: 4,
    missionCount: 5,
  },
  {
    key: 'iteration',
    title: 'Iteration Forge',
    description: 'Reinforce loops, counters, and repetition-based problem solving.',
    status: 'Active',
    path: '/playershipdashboard/iteration',
    progressPercent: 64,
    completedCount: 3,
    missionCount: 5,
  },
  {
    key: 'linked-list',
    title: 'Linked List Link-up',
    description: 'Practice node traversal, insertion, deletion, and pointer logic.',
    status: 'Active',
    path: '/playershipdashboard/linked-list',
    progressPercent: 51,
    completedCount: 2,
    missionCount: 5,
  },
  {
    key: 'stack',
    title: 'Stack Tower',
    description: 'Locked stage for stack operations and last-in, first-out thinking.',
    status: 'Locked',
    path: null,
    progressPercent: 0,
    completedCount: 0,
    missionCount: 5,
  },
  {
    key: 'queue',
    title: 'Queue Station',
    description: 'Locked stage for first-in, first-out control and scheduling.',
    status: 'Locked',
    path: null,
    progressPercent: 0,
    completedCount: 0,
    missionCount: 5,
  },
  {
    key: 'tree',
    title: 'Tree Realm',
    description: 'Locked stage for hierarchical traversal and branching patterns.',
    status: 'Locked',
    path: null,
    progressPercent: 0,
    completedCount: 0,
    missionCount: 5,
  },
  {
    key: 'heap',
    title: 'Heap Mountain',
    description: 'Locked stage for priority-based structures and heap ordering.',
    status: 'Locked',
    path: null,
    progressPercent: 0,
    completedCount: 0,
    missionCount: 5,
  },
  {
    key: 'graph',
    title: 'Graph Universe',
    description: 'Locked stage for networks, paths, and graph traversal.',
    status: 'Locked',
    path: null,
    progressPercent: 0,
    completedCount: 0,
    missionCount: 5,
  },
  {
    key: 'dp',
    title: 'Dynamic Core',
    description: 'Locked stage for dynamic programming and optimization.',
    status: 'Locked',
    path: null,
    progressPercent: 0,
    completedCount: 0,
    missionCount: 5,
  },
];

const materialItems = [
  { id: 'mat-1', title: 'Arrays quick reference', type: 'pdf', url: '#' },
  { id: 'mat-2', title: 'Stack and queue walkthrough', type: 'video', url: '#' },
  { id: 'mat-3', title: 'Binary tree visual drill', type: 'interactive', url: '#' },
  { id: 'mat-4', title: 'Big O study guide', type: 'article', url: '#' },
];

const dashboardData = {
  topics: [
    { completedCount: 3, missionCount: 3 },
    { completedCount: 2, missionCount: 4 },
    { completedCount: 1, missionCount: 1 },
  ],
  gamification: {
    achievements: [
      {
        id: 'ach-1',
        title: 'First Login',
        description: 'Opened the student dashboard for the first time.',
        points: 50,
        created_at: '2026-05-20T12:00:00Z',
      },
      {
        id: 'ach-2',
        title: 'Mission Starter',
        description: 'Completed a learning mission.',
        points: 100,
        created_at: '2026-05-21T10:30:00Z',
      },
    ],
  },
  performance: {
    assessmentAverage: 87,
  },
  challenges: [
    { id: 'ch-1', completed: false },
    { id: 'ch-2', completed: true },
    { id: 'ch-3', completed: false },
  ],
};

const toDateLabel = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const Header = ({ selectedTab, setSelectedTab }) => (
  <header className="bg-[#5089c6] border-b-2 border-blue-700 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <button type="button" onClick={() => setSelectedTab('home')} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <Layout className="text-[#5089c6] w-5 h-5" />
          </div>
          <span className="text-white font-black text-2xl tracking-tighter italic">BALANGKAS</span>
        </button>
        <nav className="hidden md:flex items-center gap-6">
          <button
            type="button"
            onClick={() => setSelectedTab('home')}
            className={`pb-1 text-sm uppercase tracking-wide transition-colors ${selectedTab === 'home' ? 'text-white font-bold border-b-2 border-white' : 'text-blue-100 font-medium hover:text-white'}`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('missions')}
            className={`pb-1 text-sm uppercase tracking-wide transition-colors ${selectedTab === 'missions' ? 'text-white font-bold border-b-2 border-white' : 'text-blue-100 font-medium hover:text-white'}`}
          >
            Learn
          </button>
          {/* Challenges moved to floating action button */}
          <button
            type="button"
            onClick={() => setSelectedTab('materials')}
            className={`pb-1 text-sm uppercase tracking-wide transition-colors ${selectedTab === 'materials' ? 'text-white font-bold border-b-2 border-white' : 'text-blue-100 font-medium hover:text-white'}`}
          >
            Class
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('achievements')}
            className={`pb-1 text-sm uppercase tracking-wide transition-colors ${selectedTab === 'achievements' ? 'text-white font-bold border-b-2 border-white' : 'text-blue-100 font-medium hover:text-white'}`}
          >
            Achievements
          </button>
        </nav>
      </div>
      <div className="flex items-center gap-4 text-white">
        <button className="p-2 hover:bg-blue-600 rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-orange-500 border-2 border-blue-700 rounded-full"></span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedTab('profile')}
          aria-label="Open profile"
          className={`p-1 rounded-full transition-colors ${selectedTab === 'profile' ? 'bg-blue-700 ring-2 ring-white/70' : 'hover:bg-blue-600'}`}
        >
          <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden flex items-center justify-center bg-blue-100">
            <User className="text-blue-600 w-5 h-5" />
          </div>
        </button>
      </div>
    </div>
  </header>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('home');
  const [materialFilter, setMaterialFilter] = useState('All');

  const handleLogout = async () => {
    clearDemoAuthSession();
    window.location.assign('/');
  };

  const filteredMaterials = useMemo(
    () => materialItems.filter((material) => materialFilter === 'All' || material.type.toLowerCase() === materialFilter.toLowerCase()),
    [materialFilter]
  );

  const performanceBars = [
    { label: 'Recursion', value: 92 },
    { label: 'Iteration', value: 78 },
    { label: 'Linked List', value: 64 },
    { label: 'Trees', value: 54 },
  ];

  const recentAttempts = [
    { id: 'att-1', title: 'Arrays Quiz', source: 'Missions', score: 95, when: '2026-05-21T08:15:00Z' },
    { id: 'att-2', title: 'Recursion Pre-test', source: 'Recursion', score: 88, when: '2026-05-20T14:40:00Z' },
    { id: 'att-3', title: 'Iteration Challenge', source: 'Iteration', score: 91, when: '2026-05-19T09:05:00Z' },
  ];

  const points = 1250;
  const xpProgress = 48;

  const loadDashboard = () => {
    setSelectedTab((currentTab) => currentTab);
  };

  const renderActiveTab = () => {
    if (selectedTab === 'missions') {
      return <MissionsTab missionCards={missionCards} navigate={navigate} />;
    }

    if (selectedTab === 'materials') {
      return <MaterialsTab materialFilter={materialFilter} setMaterialFilter={setMaterialFilter} filteredMaterials={filteredMaterials} />;
    }

    if (selectedTab === 'achievements') {
      return <AchievementsTab dashboard={dashboardData} toDateLabel={toDateLabel} />;
    }

    if (selectedTab === 'performance') {
      return (
        <PerformanceTab
          dashboard={dashboardData}
          points={points}
          xpProgress={xpProgress}
          performanceBars={performanceBars}
          recentAttempts={recentAttempts}
          toDateLabel={toDateLabel}
          navigate={navigate}
          setSelectedTab={setSelectedTab}
          loadDashboard={loadDashboard}
        />
      );
    }

    if (selectedTab === 'profile') {
      return <ProfileTab onLogout={handleLogout} />;
    }

    return (
      <>
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col items-start gap-2 md:flex-row md:items-center">
            <div className="relative h-20 w-20 shrink-0 md:h-24 md:w-24">
              <img
                src={maskot}
                alt="Balangkas mascot"
                className="h-full w-full object-contain drop-shadow-[0_8px_14px_rgba(17,76,147,0.35)] animate-[mascotFloat_2.6s_ease-in-out_infinite,mascotTalk_1.2s_ease-in-out_infinite]"
              />
            </div>

            <div className="relative w-full max-w-5xl">
              <div className="relative rounded-2xl border-2 border-blue-200 bg-white px-5 py-4 shadow-md">
                <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Mission Control</p>
                <p className="text-sm font-semibold leading-relaxed text-blue-950">
                  DSA mission update: you&apos;re doing great on arrays and recursion. Next target is stacks and queues to strengthen your problem-solving flow.
                  <span className="ml-1 inline-block h-3.5 w-1.5 bg-blue-700 align-[-1px] animate-[dialogCursor_0.95s_steps(1,end)_infinite]"></span>
                </p>
              </div>
              <div className="absolute -left-3 top-1/2 -translate-y-1/2">
                <div className="h-0 w-0 border-b-[12px] border-r-[14px] border-t-[12px] border-b-transparent border-r-blue-200 border-t-transparent"></div>
                <div className="absolute left-[3px] top-1/2 h-0 w-0 -translate-y-1/2 border-b-[9px] border-r-[11px] border-t-[9px] border-b-transparent border-r-white border-t-transparent"></div>
              </div>
            </div>
          </div>
        </div>

        <UserProfile />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            <MissionCard />

            <Card>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-black text-blue-900 uppercase tracking-tight">Daily Missions</h2>
                </div>
                <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 tracking-wider">
                  RESETS IN 8H 42M
                </div>
              </div>

              <div className="divide-y divide-blue-50">
                <DailyMissionItem title="Complete 3 lessons" progress={2} total={3} xp={150} />
                <DailyMissionItem title="Score 90% on a quiz" progress={0} total={1} xp={200} />
                <DailyMissionItem title="Practice for 30 minutes" progress={18} total={30} xp={100} />
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Card className="h-fit">
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-black text-blue-900 uppercase tracking-tight">Leaderboard</h2>
              </div>
              <div className="space-y-2 mb-6">
                <LeaderboardItem rank={1} name="AlgoMaster" xp="8500" />
                <LeaderboardItem rank={2} name="CodeNinja" xp="7200" />
                <LeaderboardItem rank={3} name="DataWizard" xp="6800" />
                <LeaderboardItem rank={4} name="You (Alpha)" xp="1250" isUser />
              </div>
              <button className="w-full py-3 text-sm font-black text-blue-600 uppercase tracking-widest border-t-2 border-blue-50 hover:bg-blue-50 transition-colors rounded-b-xl">
                View Full Rankings
              </button>
            </Card>

            <Card className="h-fit">
              <div className="flex items-center gap-2 mb-6">
                <History className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-black text-blue-900 uppercase tracking-tight">Recent Activity</h2>
              </div>
              <div className="space-y-4">
                <ActivityItem
                  icon={CheckCircle}
                  title="Completed Arrays"
                  time="2 hours ago"
                  color="bg-emerald-100 text-emerald-600"
                />
                <ActivityItem
                  icon={BookOpen}
                  title="Started Stacks"
                  time="Yesterday"
                  color="bg-blue-100 text-blue-600"
                />
                <ActivityItem
                  icon={Award}
                  title="Earned 'First Steps' Badge"
                  time="3 days ago"
                  color="bg-orange-100 text-orange-600"
                />
              </div>
            </Card>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Header selectedTab={selectedTab} setSelectedTab={setSelectedTab} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {renderActiveTab()}
      </main>

      {/* Floating Challenges Button (bottom-right) */}
      <button
        type="button"
        onClick={() => navigate('/playership')}
        title="Open Challenges"
        aria-label="Open Challenges in playership"
        className="fixed bottom-6 right-6 z-50 bg-orange-500 hover:bg-orange-600 text-white px-4 py-4 rounded-full shadow-xl flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
      >
        <Flame className="w-5 h-5" />
        <span className="hidden sm:inline-block text-xs font-black uppercase tracking-widest">Challenges</span>
      </button>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-blue-100 mt-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">© 2024 BALANGKAS MISSION CONTROL</p>
        <div className="flex gap-8">
          <a href="#" className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Privacy Directive</a>
          <a href="#" className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Tech Support</a>
          <a href="#" className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Code of Conduct</a>
        </div>
      </footer>

      <style>{`
        @keyframes mascotFloat {
          0%, 100% { transform: translateY(0px) rotate(-3deg); }
          50% { transform: translateY(-6px) rotate(2deg); }
        }

        @keyframes mascotTalk {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.07); }
        }

        @keyframes dialogCursor {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
