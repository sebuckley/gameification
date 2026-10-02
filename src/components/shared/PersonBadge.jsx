export default function PersonBadge({ person, size = "md" }) {
  if (!person) return null;
  const large = size === "xl";

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
      className={`flex items-center rounded-lg border ${large ? "gap-5 p-5" : "gap-3 p-3"}`}
      style={{
        width: large ? "min(100%, 480px)" : "240px", // ⭐ fixed width based on “Alexandra”
        backgroundColor: (person.color || "#888") + "22",
        borderColor: person.color || "#888"
      }}
    >
      <div
        className={`${large ? "h-24 w-24 text-4xl" : "h-12 w-12"} shrink-0 rounded-full flex items-center justify-center font-bold text-white shadow`}
        style={{
          backgroundColor: person.color || "#888",
          border: `3px solid ${person.color || "#888"}`
        }}
      >
        {initials}
      </div>

      <div className={`font-semibold text-gray-800 truncate ${large ? "text-4xl" : ""}`}>
        {displayName}
      </div>
    </div>
  );
}
