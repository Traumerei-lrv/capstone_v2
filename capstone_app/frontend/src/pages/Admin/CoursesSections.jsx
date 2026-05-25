import { useEffect, useState } from "react";
import { fetchAdminOverview } from "../../api/adminDashboard";

const classSectionOverview = [
  {
    id: 1,
    classSection: "BSIT 2-A",
    instructor: "Mr. Dela Cruz",
    students: 42,
    status: "Active",
  },
  {
    id: 2,
    classSection: "BSIT 2-B",
    instructor: "Unassigned",
    students: 0,
    status: "Needs Setup",
  },
  {
    id: 3,
    classSection: "BSIT 3-A",
    instructor: "Ms. Reyes",
    students: 38,
    status: "Active",
  },
];

function statusBadgeClass(status) {
  if (status === "Needs Setup") {
    return "border-amber-300/50 bg-amber-500/10 text-amber-900";
  }
  return "border-emerald-300/50 bg-emerald-500/10 text-emerald-900";
}

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

  const handleRowAction = (row) => {
    const nextAction = row.status === "Needs Setup" ? "Assign" : "View";
    window.alert(`${nextAction} clicked for ${row.classSection}. Connect this to section editor/details next.`);
  };

  return (
    <div className="space-y-5 p-4 sm:p-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Class &amp; Section Overview</h3>
            <p className="text-sm text-slate-500">Section setup status, instructor assignment, and student counts.</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.24em] text-slate-500">
              <tr>
                <th className="px-4 py-3 font-black">Class/Section</th>
                <th className="px-4 py-3 font-black">Instructor</th>
                <th className="px-4 py-3 text-center font-black">Students</th>
                <th className="px-4 py-3 font-black">Status</th>
                <th className="px-4 py-3 font-black">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {classSectionOverview.map((row) => (
                <tr key={row.id} className="align-middle">
                  <td className="px-4 py-4 font-semibold text-slate-900">{row.classSection}</td>
                  <td className="px-4 py-4">
                    <span className={row.instructor === "Unassigned" ? "font-black text-rose-700" : "font-semibold text-slate-700"}>{row.instructor}</span>
                  </td>
                  <td className="px-4 py-4 text-center font-semibold text-slate-700">{row.students}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-black uppercase tracking-wide ${statusBadgeClass(row.status)}`}>{row.status}</span>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => handleRowAction(row)}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                        row.status === "Needs Setup" ? "border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100" : "border border-blue-300 bg-blue-50 text-[#165A9E] hover:bg-blue-100"
                      }`}
                    >
                      {row.status === "Needs Setup" ? "Assign" : "View"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
