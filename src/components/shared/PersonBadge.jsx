export default function PersonBadge({ person }) {
  if (!person) return null;

  // Prefer initials from fullName; fallback to preferredName
  const nameForInitials = (person.fullName && person.fullName.trim()) ? person.fullName : (person.preferredName || "");
  const initials = nameForInitials
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const displayName = person.preferredName || person.fullName || "Participant";

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg border"
      style={{ backgroundColor: (person.color || "#888") + "22", borderColor: person.color || "#888" }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow"
        style={{ backgroundColor: person.color || "#888", border: `3px solid ${person.color || "#888"}` }}
      >
        {initials}
      </div>

      <div className="font-semibold text-gray-800">{displayName}</div>
    </div>
  );
}
