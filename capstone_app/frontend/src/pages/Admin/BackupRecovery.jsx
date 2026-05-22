export default function BackupRecovery() {
  return (
    <div className="space-y-5 p-4 sm:p-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Backup & Recovery</h2>
        <p className="mt-1 text-sm text-slate-500">Backup job history, export controls, and restore actions.</p>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Latest backup</p>
            <p className="mt-2 text-xl font-black text-[#165A9E]">Manual snapshot</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Recovery point</p>
            <p className="mt-2 text-xl font-black text-[#0f766e]">24 hours</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Export</p>
            <p className="mt-2 text-xl font-black text-[#ff9800]">CSV / JSON</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className="rounded-lg bg-[#165A9E] px-4 py-2 text-sm font-semibold text-white">
            Create Backup
          </button>
          <button type="button" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
            Restore Snapshot
          </button>
        </div>
      </section>
    </div>
  );
}
