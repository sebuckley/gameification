export default function PersonBadge({ person }) {
  if (!person) return null;

  const nameForInitials =
    person.fullName?.trim() || person.preferredName || "";
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
      style={{
        width: "240px", // ⭐ fixed width based on “Alexandra”
        backgroundColor: (person.color || "#888") + "22",
        borderColor: person.color || "#888"
      }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow"
        style={{
          backgroundColor: person.color || "#888",
          border: `3px solid ${person.color || "#888"}`
        }}
      >
        {initials}
      </div>

      <div className="font-semibold text-gray-800 truncate">
        {displayName}
      </div>
    </div>
  );
}
