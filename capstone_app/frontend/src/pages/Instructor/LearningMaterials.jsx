import { materialFilters, materials } from './instructorData';

function SectionCard({ title, children, className = '' }) {
  return (
    <section className={['rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-5', className].join(' ')}>
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function LearningMaterials() {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
      <SectionCard title="Learning Materials">
        <div className="flex flex-wrap gap-2">
          {materialFilters.map((filter, index) => (
            <button
              key={filter}
              className={[
                'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                index === 0 ? 'bg-[#165A9E] text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100',
              ].join(' ')}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Topic / Mission</th>
                <th className="px-4 py-3 font-semibold">Uploaded</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((material) => (
                <tr key={material.title} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-900">{material.title}</td>
                  <td className="px-4 py-3 text-slate-600">{material.type}</td>
                  <td className="px-4 py-3 text-slate-600">{material.target}</td>
                  <td className="px-4 py-3 text-slate-600">{material.uploadedAt}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <div className="flex gap-2 text-xs font-semibold">
                      <button className="rounded-full bg-slate-100 px-3 py-1.5 hover:bg-slate-200">View</button>
                      <button className="rounded-full bg-slate-100 px-3 py-1.5 hover:bg-slate-200">Edit</button>
                      <button className="rounded-full bg-rose-100 px-3 py-1.5 text-rose-700 hover:bg-rose-200">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Upload Panel" className="bg-white">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Title</span>
            <input className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none ring-0 focus:border-[#165A9E]" placeholder="Material title" />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Type</span>
            <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-[#165A9E]">
              <option>PDF</option>
              <option>Video</option>
              <option>Tutorial</option>
              <option>File upload</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">URL or File</span>
            <input className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-[#165A9E]" placeholder="https://..." />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">Topic</span>
              <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-[#165A9E]">
                <option>Arrays</option>
                <option>Linked Lists</option>
                <option>Stacks</option>
                <option>Queues</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">Mission</span>
              <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-[#165A9E]">
                <option>None</option>
                <option>Stacks</option>
                <option>Queues</option>
                <option>Trees</option>
              </select>
            </label>
          </div>

          <button className="w-full rounded-2xl bg-[#F39200] px-4 py-3 font-semibold text-white shadow-[0_12px_30px_rgba(243,146,0,0.28)] transition-transform hover:-translate-y-0.5">
            Upload Material
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
