export default function InputField({ label, value, onChange, textarea, icon, error }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
        {icon}
        {label}
      </span>

      {textarea ? (
        <textarea
          className={`border p-2 rounded w-full resize-none ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
        />
      ) : (
        <input
          className={`border p-2 rounded w-full ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {error && (
        <span className="text-xs text-red-600">Invalid format</span>
      )}
    </label>
  );
}