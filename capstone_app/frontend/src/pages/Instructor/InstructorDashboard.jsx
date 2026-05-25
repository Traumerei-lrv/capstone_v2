import { useMemo, useState } from 'react';
import { AlertTriangle, BookOpen, CheckCircle2, Users } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const stats = [
  { label: 'Active Classes', value: '6', note: 'Class groups currently handled', icon: BookOpen, tone: 'bg-blue-100 text-blue-600' },
  { label: 'Enrolled Students', value: '128', note: 'Across all managed classes', icon: Users, tone: 'bg-emerald-100 text-emerald-600' },
  { label: 'Avg Completion', value: '76%', note: 'Lessons and activities completion', icon: CheckCircle2, tone: 'bg-orange-100 text-orange-600' },
  { label: 'Needs Support', value: '14', note: 'Students flagged for intervention', icon: AlertTriangle, tone: 'bg-rose-100 text-rose-600' },
];

const classOptions = ['All Classes', 'Section A-12', 'Section B-09', 'Section C-03'];
const supportIssueOptions = ['All', 'Low Score', 'Failed Attempts', 'Incomplete', 'Inactive'];
const activityTypeOptions = ['All', 'Pre-Test', 'Post-Test', 'Quiz', 'Problem', 'Mini-Game'];

const studentsNeedingSupport = [
  {
    id: 1,
    studentName: 'Lee Valero',
    className: 'Section A-12',
    topic: 'Recursion',
    issue: 'Low post-test score',
    score: '4/10',
    status: 'Needs Support',
    issueType: 'Low Score',
  },
  {
    id: 2,
    studentName: 'Maria Santos',
    className: 'Section B-09',
    topic: 'Stack',
    issue: 'Failed mini-game twice',
    score: '520 pts',
    status: 'Failed Attempts',
    issueType: 'Failed Attempts',
  },
  {
    id: 3,
    studentName: 'John Cruz',
    className: 'Section A-12',
    topic: 'Linked List',
    issue: 'Incomplete activity',
    score: '45%',
    status: 'Incomplete',
    issueType: 'Incomplete',
  },
  {
    id: 4,
    studentName: 'Ana Reyes',
    className: 'Section C-03',
    topic: 'Introduction',
    issue: 'No recent activity',
    score: '20%',
    status: 'Inactive',
    issueType: 'Inactive',
  },
];

const recentClassActivity = [
  {
    id: 1,
    studentName: 'Lee Valero',
    className: 'Section A-12',
    activityType: 'Post-Test',
    activityLabel: 'Recursion Post-Test',
    topic: 'Recursion',
    result: '7/10',
    submittedAt: '10 minutes ago',
    status: 'Submitted',
  },
  {
    id: 2,
    studentName: 'Ana Reyes',
    className: 'Section C-03',
    activityType: 'Mini-Game',
    activityLabel: 'Stack Mini-Game',
    topic: 'Stack',
    result: '920 pts',
    submittedAt: '25 minutes ago',
    status: 'Completed',
  },
  {
    id: 3,
    studentName: 'Mark Cruz',
    className: 'Section B-09',
    activityType: 'Problem',
    activityLabel: 'Linked List Problem',
    topic: 'Linked List',
    result: '15/20',
    submittedAt: '1 hour ago',
    status: 'Submitted',
  },
  {
    id: 4,
    studentName: 'Nina Lopez',
    className: 'Section A-12',
    activityType: 'Quiz',
    activityLabel: 'Introduction Quiz',
    topic: 'Introduction',
    result: '9/10',
    submittedAt: '2 hours ago',
    status: 'Completed',
  },
];

function badgeClasses(status) {
  if (status === 'Needs Support' || status === 'Low Score') return 'border-rose-200 bg-rose-50 text-rose-700';
  if (status === 'Failed Attempts') return 'border-orange-200 bg-orange-50 text-orange-700';
  if (status === 'Incomplete') return 'border-amber-200 bg-amber-50 text-amber-700';
  if (status === 'Inactive') return 'border-slate-300 bg-slate-100 text-slate-700';
  if (status === 'Completed') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  return 'border-blue-200 bg-blue-50 text-blue-700';
}

function StatCard({ stat }) {
  const Icon = stat.icon;

  return (
    <article className="rounded-2xl border-2 border-blue-100 bg-white p-5 shadow-sm">
      <div className={`mb-3 inline-flex rounded-xl p-2 ${stat.tone}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-xs uppercase tracking-widest font-black text-slate-500">{stat.label}</p>
      <p className="mt-2 text-3xl font-black text-blue-900">{stat.value}</p>
      <p className="mt-2 text-sm text-slate-500">{stat.note}</p>
    </article>
  );
}

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [supportClassFilter, setSupportClassFilter] = useState('All Classes');
  const [supportIssueFilter, setSupportIssueFilter] = useState('All');
  const [activityClassFilter, setActivityClassFilter] = useState('All Classes');
  const [activityTypeFilter, setActivityTypeFilter] = useState('All');

  const filteredSupportStudents = useMemo(() => {
    return studentsNeedingSupport.filter((item) => {
      const classMatch = supportClassFilter === 'All Classes' || item.className === supportClassFilter;
      const issueMatch = supportIssueFilter === 'All' || item.issueType === supportIssueFilter;
      return classMatch && issueMatch;
    });
  }, [supportClassFilter, supportIssueFilter]);

  const filteredRecentActivity = useMemo(() => {
    return recentClassActivity.filter((item) => {
      const classMatch = activityClassFilter === 'All Classes' || item.className === activityClassFilter;
      const typeMatch = activityTypeFilter === 'All' || item.activityType === activityTypeFilter;
      return classMatch && typeMatch;
    });
  }, [activityClassFilter, activityTypeFilter]);

  const handleViewProgress = (student) => {
    window.alert(`View Progress: ${student.studentName} (${student.className})`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-blue-900 tracking-tight">Instructor Home</h1>
        <p className="mt-2 text-slate-500 font-medium">
          {`Welcome, ${user?.profile?.full_name || 'Instructor'}. `}
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border-2 border-blue-100 bg-white p-6">
          <h2 className="text-xl font-black text-blue-900">Students Needing Support</h2>
          <p className="mt-1 text-sm text-slate-500">Students flagged based on low scores, failed attempts, or incomplete activities.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <select
              value={supportClassFilter}
              onChange={(event) => setSupportClassFilter(event.target.value)}
              className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300"
            >
              {classOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              value={supportIssueFilter}
              onChange={(event) => setSupportIssueFilter(event.target.value)}
              className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300"
            >
              {supportIssueOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-5 space-y-3">
            {filteredSupportStudents.map((item) => (
              <article key={item.id} className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-black text-blue-900">{item.studentName}</p>
                  <span className="rounded-full border border-blue-200 bg-blue-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-blue-700">
                    {item.className}
                  </span>
                </div>
                <p className="mt-2 text-xs font-black uppercase tracking-widest text-slate-500">Topic: {item.topic}</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">Issue: {item.issue}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-black text-blue-700">{item.score}</p>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${badgeClasses(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleViewProgress(item)}
                  className="mt-3 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-widest text-blue-700 hover:bg-blue-50"
                >
                  View Progress
                </button>
              </article>
            ))}
            {filteredSupportStudents.length === 0 ? (
              <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-500">No students match the current filters.</p>
            ) : null}
          </div>
          <button type="button" className="mt-5 w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-blue-700 hover:bg-blue-100">
            View All
          </button>
        </section>

        <section className="rounded-2xl border-2 border-blue-100 bg-white p-6">
          <h2 className="text-xl font-black text-blue-900">Recent Class Activity</h2>
          <p className="mt-1 text-sm text-slate-500">Latest submissions and progress updates from handled classes.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <select
              value={activityClassFilter}
              onChange={(event) => setActivityClassFilter(event.target.value)}
              className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300"
            >
              {classOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              value={activityTypeFilter}
              onChange={(event) => setActivityTypeFilter(event.target.value)}
              className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300"
            >
              {activityTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-5 space-y-3">
            {filteredRecentActivity.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-black text-blue-900">{item.studentName}</p>
                  <span className="rounded-full border border-blue-200 bg-blue-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-blue-700">
                    {item.className}
                  </span>
                </div>
                <p className="mt-2 text-xs font-black uppercase tracking-widest text-slate-500">
                  {item.activityLabel} • {item.topic}
                </p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-slate-700">Result: {item.result}</p>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${badgeClasses(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-500">Submitted: {item.submittedAt}</p>
              </article>
            ))}
            {filteredRecentActivity.length === 0 ? (
              <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-500">No recent activity matches the current filters.</p>
            ) : null}
          </div>
          <button type="button" className="mt-5 w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-blue-700 hover:bg-blue-100">
            View All
          </button>
        </section>

        {/* Removed: static teaching focus and reminders cards */}
        {/* Replaced with progress-based support and activity insight cards */}
      </div>
    </div>
  );
}
