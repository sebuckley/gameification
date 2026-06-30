import {

  Plus,

} from "lucide-react";


export default function SelectField({ label, options, onSelect }) {
  return (
    <div className="flex flex-col gap-1 mb-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>

      <select
        className="border p-2 rounded w-full border-gray-300"
        onChange={(e) => {
          if (e.target.value) onSelect(e.target.value);
        }}
      >
        <option value="">Choose…</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      <button
        className="px-2 py-1 bg-gray-100 rounded border text-sm flex items-center gap-2 mt-1"
        onClick={() => {
          const item = prompt("Add custom item:");
          if (!item) return;
          onSelect(item);
        }}
      >
        <Plus size={14} /> Add Custom
      </button>
    </div>
  );
}