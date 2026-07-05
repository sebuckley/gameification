import { Plus } from "lucide-react";

export default function SelectField({ label, options, value, onSelect }) {
  return (
    <div className="flex flex-col gap-1 mb-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>

      <select
        className="border p-2 rounded w-full border-gray-300 text-sm"
        value={value || ""}
        onChange={(e) => {
          const selected = e.target.value;
          if (!selected) return;

          // If the option is an object, return the whole object
          const found =
            options.find(
              (opt) =>
                (typeof opt === "string" && opt === selected) ||
                (typeof opt === "object" && opt.value === selected)
            ) || selected;

          onSelect(found);
        }}
      >
        <option value="">Choose…</option>

        {options.map((opt) => {
          const isObject = typeof opt === "object";
          const optionValue = isObject ? opt.value : opt;
          const optionLabel = isObject ? opt.label : opt;

          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
    </div>
  );
}
