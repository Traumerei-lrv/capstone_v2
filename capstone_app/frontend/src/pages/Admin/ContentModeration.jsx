import { useEffect, useMemo, useState } from "react";
import { fetchAdminMaterials, removeMaterial } from "../../api/adminDashboard";

const filters = ["All", "pdf", "video", "interactive", "article"];

export default function ContentModeration() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [materials, setMaterials] = useState([]);
  const [materialFilter, setMaterialFilter] = useState("All");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    let active = true;

    const loadMaterials = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const data = await fetchAdminMaterials();
        if (active) {
          setMaterials(data);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(error.message || "Failed to load materials.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadMaterials();

    return () => {
      active = false;
    };
  }, []);

  const filteredMaterials = useMemo(() => {
    if (materialFilter === "All") {
      return materials;
    }

    return materials.filter((item) => String(item.type || "").toLowerCase() === materialFilter.toLowerCase());
  }, [materials, materialFilter]);

  const handleRemove = async (materialId) => {
    const confirmed = window.confirm("Remove this material from the platform?");

    if (!confirmed) {
      return;
    }

    try {
      setBusyId(materialId);
      await removeMaterial(materialId);
      setMaterials((current) => current.filter((item) => item.id !== materialId));
    } catch (error) {
      setErrorMessage(error.message || "Failed to remove material.");
    } finally {
      setBusyId("");
    }
  };

  if (loading) {
    return <div className="p-5 text-sm text-slate-500">Loading materials...</div>;
  }

  return (
    <div className="space-y-5 p-4 sm:p-5">
      {errorMessage ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p> : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Content Moderation</h2>
            <p className="text-sm text-slate-500">Materials list with filters and remove actions.</p>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setMaterialFilter(filter)}
              className={`rounded-full px-3 py-1 text-xs ${
                materialFilter.toLowerCase() === filter.toLowerCase()
                  ? "border border-cyan-300/60 bg-cyan-500/20 text-cyan-900"
                  : "border border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              {filter.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.24em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredMaterials.map((material) => (
                <tr key={material.id}>
                  <td className="px-4 py-4">
                    <a href={material.url} target="_blank" rel="noreferrer" className="font-medium text-[#165A9E] hover:underline">
                      {material.title}
                    </a>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{material.type}</td>
                  <td className="px-4 py-4 text-slate-600">{new Date(material.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => handleRemove(material.id)}
                      disabled={busyId === material.id}
                      className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      {busyId === material.id ? "Removing..." : "Remove"}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredMaterials.length ? null : (
                <tr>
                  <td className="px-4 py-4 text-sm text-slate-500" colSpan={4}>
                    No materials found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
