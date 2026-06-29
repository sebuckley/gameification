import React from "react";

export default function PersonBadge({ person }) {
  if (!person) return null;

  const useName = person.fullName || person.preferredName || "";

  const initials = useName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

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
