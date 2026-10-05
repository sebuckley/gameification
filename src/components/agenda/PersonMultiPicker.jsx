import { useState } from "react";

const nameOf = (person) => person.preferredName || person.fullName || "Unnamed";

// Searchable checklist for choosing one or more people from the full list.
export default function PersonMultiPicker({ label, helper, people, selectedIds = [], disabledIds = [], invalid = false, onChange }) {
  const [search, setSearch] = useState("");
  const selected = new Set(selectedIds);
  const blocked = new Set(disabledIds);
  const term = search.trim().toLowerCase();
  const visible = people.filter((person) => {
    if (blocked.has(person.id)) return false;
    if (!term) return true;
    return [person.preferredName, person.fullName, person.email].filter(Boolean).join(" ").toLowerCase().includes(term);
  });

  const toggle = (personId) => {
    onChange(selected.has(personId) ? selectedIds.filter((id) => id !== personId) : [...selectedIds, personId]);
  };

  return (
    <div className={`space-y-2 rounded border p-3 ${invalid ? "border-red-500 bg-red-50" : "border-slate-200 bg-slate-50"}`}>
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-sm font-semibold text-gray-700">{label}</div>
        <div className={`text-xs ${invalid ? "font-semibold text-red-600" : "text-slate-500"}`}>
          {invalid ? "Select at least one" : `${selectedIds.length} selected`}
        </div>
      </div>
      {helper && <p className="text-xs text-slate-500">{helper}</p>}

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedIds.map((personId) => {
            const person = people.find((p) => p.id === personId);
            if (!person) return null;
            return (
              <span key={personId} className="flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3 py-1 text-sm">
                {nameOf(person)}
                <button
                  type="button"
                  aria-label={`Remove ${nameOf(person)}`}
                  onClick={() => toggle(personId)}
                  className="font-bold text-slate-500 hover:text-rose-700"
                >×</button>
              </span>
            );
          })}
        </div>
      )}

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search people"
        className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm"
      />
      <div className="max-h-40 divide-y divide-slate-100 overflow-y-auto rounded border border-slate-200 bg-white">
        {visible.map((person) => (
          <label key={person.id} className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-slate-50">
            <input type="checkbox" checked={selected.has(person.id)} onChange={() => toggle(person.id)} />
            <span>{nameOf(person)}</span>
          </label>
        ))}
        {visible.length === 0 && <p className="px-3 py-2 text-sm text-slate-500">No people found.</p>}
      </div>
    </div>
  );
}
