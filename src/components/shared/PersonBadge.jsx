function PersonBadge({ person }) {
  if (!person) return null;

  const initials = person.preferredName
    ? person.preferredName.split(" ").map(n => n[0]).join("").toUpperCase()
    : person.fullName.split(" ").map(n => n[0]).join("").toUpperCase();

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg"
      style={{ backgroundColor: person.color + "22" }} // lighter tint
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow"
        style={{ backgroundColor: person.color }}
      >
        {initials}
      </div>

      <div className="font-semibold text-gray-800">
        {person.preferredName || person.fullName}
      </div>
    </div>
  );
}
