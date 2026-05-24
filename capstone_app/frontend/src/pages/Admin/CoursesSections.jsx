import { useEffect, useState } from "react";
import { fetchAdminOverview } from "../../api/adminDashboard";

export default function CoursesSections() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadOverview = async () => {
      try {
        const payload = await fetchAdminOverview();
        if (active) {
          setOverview(payload);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadOverview();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <div className="p-5 text-sm text-slate-500">Loading course data...</div>;
  }

  return (
    <div className="space-y-5 p-4 sm:p-5">
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Class Management</h2>
          <p className="mt-1 text-sm text-slate-500">Create, edit, and organize classes, then assign instructors or students.</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Courses</p>
              <p className="mt-2 text-2xl font-black text-[#165A9E]">{overview?.summary?.totalCourses || 0}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Sections</p>
              <p className="mt-2 text-2xl font-black text-[#0f766e]">{overview?.summary?.totalSections || 0}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Instructors</p>
              <p className="mt-2 text-2xl font-black text-[#ff9800]">{overview?.roleCounts?.instructor || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Editor</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Course form</p>
              <p className="mt-1 text-sm text-slate-500">Code, title, description, instructor.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Section form</p>
              <p className="mt-1 text-sm text-slate-500">Course linkage, name, instructor assignment.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Recent Courses</h3>
          <div className="mt-3 space-y-2">
            {(overview?.courses || []).slice(0, 5).map((course) => (
              <div key={course.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="font-semibold text-slate-900">{course.code}</p>
                <p className="text-sm text-slate-500">{course.title}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Recent Sections</h3>
          <div className="mt-3 space-y-2">
            {(overview?.sections || []).slice(0, 5).map((section) => (
              <div key={section.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="font-semibold text-slate-900">{section.name}</p>
                <p className="text-sm text-slate-500">Course: {section.course_id || "Unassigned"}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
