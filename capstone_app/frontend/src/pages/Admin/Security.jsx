export default function Security() {
  return (
    <div className="space-y-5 p-4 sm:p-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Access Control & Security</h2>
        <p className="mt-1 text-sm text-slate-500">Role policies, MFA status, and security audit controls.</p>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">MFA coverage</p>
            <p className="mt-2 text-3xl font-black text-[#dc2626]">0%</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Admin role</p>
            <p className="mt-2 text-3xl font-black text-[#165A9E]">Enabled</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Audit policy</p>
            <p className="mt-2 text-3xl font-black text-[#0f766e]">Active</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className="rounded-lg bg-[#dc2626] px-4 py-2 text-sm font-semibold text-white">
            Enforce MFA
          </button>
          <button type="button" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
            Review Roles
          </button>
        </div>
      </section>
    </div>
  );
}
