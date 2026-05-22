import { AlertTriangle, BookOpen, CheckCircle2, Users } from 'lucide-react';

const stats = [
  { label: 'Active Classes', value: '6', note: 'Class groups currently handled', icon: BookOpen, tone: 'bg-blue-100 text-blue-600' },
  { label: 'Enrolled Students', value: '128', note: 'Across all managed classes', icon: Users, tone: 'bg-emerald-100 text-emerald-600' },
  { label: 'Avg Completion', value: '76%', note: 'Lessons and activities completion', icon: CheckCircle2, tone: 'bg-orange-100 text-orange-600' },
  { label: 'Needs Support', value: '14', note: 'Students flagged for intervention', icon: AlertTriangle, tone: 'bg-rose-100 text-rose-600' },
];

const reminders = [
  'Publish Week 4 recursion activity for Section A-12.',
  'Review low scores in linked list assessment.',
  'Post announcement about Friday challenge window.',
];

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
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-blue-900 tracking-tight">Instructor Home</h1>
        <p className="mt-2 text-slate-500 font-medium">Monitor your current teaching status and jump into class operations quickly.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border-2 border-blue-100 bg-white p-6">
          <h2 className="text-xl font-black text-blue-900">Today&apos;s Teaching Focus</h2>
          <p className="mt-1 text-sm text-slate-500">Suggested priorities based on class activity signals.</p>
          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <p className="text-xs uppercase tracking-widest font-black text-blue-600">Priority 1</p>
              <p className="mt-1 font-bold text-blue-900">Linked List remediation session</p>
              <p className="text-sm text-slate-600">Students in Section B-09 are dropping points on pointer updates.</p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <p className="text-xs uppercase tracking-widest font-black text-blue-600">Priority 2</p>
              <p className="mt-1 font-bold text-blue-900">Publish recursion activity</p>
              <p className="text-sm text-slate-600">Launch the weekly quiz and coding challenge before 5:00 PM.</p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <p className="text-xs uppercase tracking-widest font-black text-blue-600">Priority 3</p>
              <p className="mt-1 font-bold text-blue-900">Check completion gaps</p>
              <p className="text-sm text-slate-600">14 students have incomplete tasks from last week.</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border-2 border-blue-100 bg-white p-6">
          <h2 className="text-xl font-black text-blue-900">Reminders</h2>
          <p className="mt-1 text-sm text-slate-500">Current operational reminders.</p>
          <div className="mt-5 space-y-3">
            {reminders.map((item, index) => (
              <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Task {index + 1}</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{item}</p>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="w-full mt-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-widest px-4 py-3"
          >
            Open Class Management
          </button>
        </section>
      </div>
    </div>
  );
}
