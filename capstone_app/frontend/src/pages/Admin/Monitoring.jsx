import { useEffect, useMemo, useState } from "react";
import { fetchAdminOverview } from "../../api/adminDashboard";

function MetricCard({ label, value, note, accent = "#165A9E" }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black" style={{ color: accent }}>
        {value}
      </p>
      <p className="mt-1 text-sm text-slate-500">{note}</p>
    </article>
  );
}

export default function Monitoring() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    let active = true;

    const loadOverview = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const payload = await fetchAdminOverview();
        if (active) {
          setOverview(payload);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(error.message || "Failed to load monitoring data.");
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

  const usageBars = useMemo(
    () => [
      { label: "Missions", value: overview?.usage?.missions || 0, color: "from-[#4d8ecb] to-[#6b8ef1]" },
      { label: "Challenges", value: overview?.usage?.challenges || 0, color: "from-[#ff9800] to-[#f59e0b]" },
      { label: "Assessments", value: overview?.usage?.assessments || 0, color: "from-[#0f766e] to-[#14b8a6]" },
    ],
    [overview],
  );

  if (loading) {
    return <div className="p-5 text-sm text-slate-500">Loading monitoring data...</div>;
  }

  return (
    <div className="space-y-5 p-4 sm:p-5">
      {errorMessage ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Users" value={overview?.summary?.totalUsers || 0} note="profiles" />
        <MetricCard label="Active Users" value={overview?.summary?.activeUsers || 0} note="recently seen" accent="#0f766e" />
        <MetricCard label="Courses" value={overview?.summary?.totalCourses || 0} note="courses table" accent="#ff9800" />
        <MetricCard label="Materials" value={overview?.summary?.totalMaterials || 0} note="materials table" accent="#dc2626" />
      </div>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Usage Charts</h2>
              <p className="text-sm text-slate-500">Average performance across attempts</p>
            </div>
          </div>

          <div className="space-y-4">
            {usageBars.map((bar) => (
              <div key={bar.label}>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                  <span>{bar.label}</span>
                  <span>{bar.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div className={`h-2 rounded-full bg-gradient-to-r ${bar.color}`} style={{ width: `${Math.min(bar.value, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Mission Attempts</p>
              <p className="mt-2 text-2xl font-black text-[#165A9E]">{overview?.attempts?.missionAttempts?.length || 0}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Challenge Attempts</p>
              <p className="mt-2 text-2xl font-black text-[#165A9E]">{overview?.attempts?.challengeAttempts?.length || 0}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Assessment Attempts</p>
              <p className="mt-2 text-2xl font-black text-[#165A9E]">{overview?.attempts?.assessmentAttempts?.length || 0}</p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Activity Feed</h2>
              <p className="text-sm text-slate-500">Latest records from activity_logs</p>
            </div>
          </div>

          <div className="space-y-3 max-h-[32rem] overflow-auto pr-1">
            {(overview?.recentActivity || []).map((entry) => (
              <article key={entry.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{entry.action}</p>
                    <p className="text-xs text-slate-500">{entry.user_id || "system"}</p>
                  </div>
                  <p className="text-xs text-slate-500">{new Date(entry.created_at).toLocaleString()}</p>
                </div>
              </article>
            ))}
            {overview?.recentActivity?.length ? null : <p className="text-sm text-slate-500">No activity logged yet.</p>}
          </div>
        </article>
      </section>
    </div>
  );
}
