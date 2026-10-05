import useDiscoveryStore from "../store/useDiscoveryStore";

const primary =
  "px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 text-sm w-full";
const secondary =
  "px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700";

export default function DiscoverySetList({ onCreate, onEdit }) {
  const sets = useDiscoveryStore((s) => s.discoveryQuestionSets);
  const deleteSet = useDiscoveryStore((s) => s.deleteDiscoveryQuestionSet);

  return (
   <div className="w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Current question sets</h2>
        <button
        type="button"
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 text-sm max-w-[150px]"
        onClick={onCreate}
      >
        Create New Set
      </button>

      </div>

      {/* Cards */}
      <div className="space-y-6">
        {sets.map((s) => (
          <div
            key={s.id}
            className="w-[350px] rounded-xl border border-slate-200 bg-white shadow-sm p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-800">{s.name}</h3>
              <span className="rounded-full bg-indigo-100 text-indigo-700 px-3 py-1 text-xs font-medium">
                Discovery
              </span>
            </div>

            <p className="text-sm text-slate-600">
              {s.questions.length} questions • Active
            </p>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" className="accent-indigo-600" />
              Open in editor
            </label>

            <button
              type="button"
              className={primary}
              onClick={() => onEdit(s.id)}
            >
              Edit set
            </button>

            <button
              type="button"
              className={`${secondary} text-red-600 w-full`}
              onClick={() =>
                window.confirm(`Delete "${s.name}"?`) && deleteSet(s.id)
              }
            >
              Delete
            </button>
          </div>

        ))}

        {sets.length === 0 && (
          <p className="text-sm text-slate-500">No discovery sets yet.</p>
        )}
      </div>
    </div>
  );
}
