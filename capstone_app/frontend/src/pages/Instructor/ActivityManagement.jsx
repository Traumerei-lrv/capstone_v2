import {
  announcements,
  assessments,
  challenges,
  missions,
  studentProgressRows,
} from './instructorData';

function ManagementCard({ title, subtitle, children }) {
  return (
    <section className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-5">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function SimpleList({ items, renderItem }) {
  return <div className="space-y-3">{items.map(renderItem)}</div>;
}

export default function ActivityManagement() {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-2">
        <ManagementCard title="Assessments" subtitle="List, create, edit, and inspect questions and choices">
          <SimpleList
            items={assessments}
            renderItem={(assessment) => (
              <article key={assessment.title} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{assessment.title}</p>
                    <p className="text-sm text-slate-500">{assessment.type} • {assessment.promptCount} questions • {assessment.points} pts</p>
                  </div>
                  <div className="flex gap-2 text-xs font-semibold">
                    <button className="rounded-full bg-slate-100 px-3 py-1.5 hover:bg-slate-200">Edit</button>
                    <button className="rounded-full bg-slate-100 px-3 py-1.5 hover:bg-slate-200">Delete</button>
                    <button className="rounded-full bg-[#165A9E] px-3 py-1.5 text-white hover:opacity-90">Questions</button>
                  </div>
                </div>
              </article>
            )}
          />
        </ManagementCard>

        <ManagementCard title="Student Progress" subtitle="Filter by student and review current progress signals">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Student</th>
                  <th className="px-4 py-3 font-semibold">Mission Progress</th>
                  <th className="px-4 py-3 font-semibold">Latest Assessment</th>
                  <th className="px-4 py-3 font-semibold">Challenge Performance</th>
                </tr>
              </thead>
              <tbody>
                {studentProgressRows.map((row) => (
                  <tr key={row.name} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-semibold text-slate-900">{row.name}</td>
                    <td className="px-4 py-3 text-slate-600">{row.mission} • {row.missionProgress}</td>
                    <td className="px-4 py-3 text-slate-600">{row.latestAssessment}</td>
                    <td className="px-4 py-3 text-slate-600">{row.challenge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ManagementCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <ManagementCard title="Missions" subtitle="Manage order and monitor completion %">
          <div className="space-y-3">
            {missions.map((mission) => (
              <article key={mission.title} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{mission.title}</p>
                    <p className="text-sm text-slate-500">Order {mission.order}</p>
                  </div>
                  <p className="text-lg font-black text-emerald-600">{mission.progress}%</p>
                </div>
              </article>
            ))}
          </div>
        </ManagementCard>

        <ManagementCard title="Challenges" subtitle="Track attempts and average score">
          <div className="space-y-3">
            {challenges.map((challenge) => (
              <article key={challenge.title} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <p className="font-semibold text-slate-900">{challenge.title}</p>
                <p className="text-sm text-slate-500">{challenge.attempts} attempts</p>
                <p className="mt-2 text-lg font-black text-[#F39200]">{challenge.avgScore}</p>
              </article>
            ))}
          </div>
        </ManagementCard>

        <ManagementCard title="Announcements" subtitle="Scope by course or section">
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <article key={announcement.title} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{announcement.title}</p>
                    <p className="text-sm text-slate-500">{announcement.scope}</p>
                  </div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{announcement.postedAt}</p>
                </div>
              </article>
            ))}
            <button className="w-full rounded-2xl bg-[#165A9E] px-4 py-3 font-semibold text-white hover:opacity-90">
              Create Announcement
            </button>
          </div>
        </ManagementCard>
      </div>
    </div>
  );
}
