import usePeople from "../store/usePeopleStore";

export default function PersonCard({ person }) {
  const { updatePerson, people, removePerson } = usePeople();

  /* ---------------------------------------------------------
     UNIQUE COLOUR LOGIC
  --------------------------------------------------------- */
  const ensureUniqueColor = (hex) => {
    const lower = hex.toLowerCase();
    const used = people.map((p) => p.color?.toLowerCase()).filter(Boolean);

    if (!used.includes(lower)) return hex;

    let shifted = hex;
    let attempts = 0;

    while (used.includes(shifted.toLowerCase()) && attempts < 20) {
      shifted = shiftHue(shifted);
      attempts++;
    }

    return shifted;
  };

  const chicColors = [
    "#D16C7A", "#6CA8D1", "#E3C26F", "#D18F6C",
    "#9B7ED1", "#6CD1A8", "#D16C6C", "#6CD1D1"
  ];

  const lighten = (hex, amount = 0.55) => {
    if (!hex) return "#f3f4f6";
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);

    const lr = Math.min(255, Math.floor(r + (255 - r) * amount));
    const lg = Math.min(255, Math.floor(g + (255 - g) * amount));
    const lb = Math.min(255, Math.floor(b + (255 - b) * amount));

    return (
      "#" +
      lr.toString(16).padStart(2, "0") +
      lg.toString(16).padStart(2, "0") +
      lb.toString(16).padStart(2, "0")
    );
  };

  const shiftHue = (hex) => {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);

    const newR = (r + 140) % 255;
    const newG = (g + 140) % 255;
    const newB = (b + 140) % 255;

    return (
      "#" +
      newR.toString(16).padStart(2, "0") +
      newG.toString(16).padStart(2, "0") +
      newB.toString(16).padStart(2, "0")
    );
  };

  const usedColors = people
    .filter((p) => p.id !== person.id)
    .map((p) => p.color?.toLowerCase())
    .filter(Boolean);

  const availableColors = chicColors.filter((c) => {
    const lower = c.toLowerCase();
    const personColorLower = person.color?.toLowerCase();
    return !usedColors.includes(lower) && lower !== personColorLower;
  });

  const fallbackColor =
    availableColors.length > 0
      ? availableColors[0]
      : shiftHue(person.color || "#6CA8D1");

  const handleColorChange = (newColor) => {
    const unique = ensureUniqueColor(newColor);
    updatePerson(person.id, { color: unique });
  };

  const handlePresenterToggle = (v) => {
    updatePerson(person.id, {
      isPresenter: v,
      inSpinner: !v,
      inGroups: !v
    });
  };

  const initials = (name) =>
    name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0].toUpperCase())
      .join("");

  const headerBg = lighten(person.color, 0.55);

  /* ---------------------------------------------------------
     DELETE CONFIRMATION
  --------------------------------------------------------- */
  const confirmDelete = () => {
    const ok = window.confirm(
      `Are you sure you want to delete ${person.preferredName || person.fullName}?`
    );
    if (ok) removePerson(person.id);
  };

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-300 flex flex-col">

      {/* HEADER */}
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ backgroundColor: headerBg }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow"
          style={{
            backgroundColor: person.color,
            border: `2px solid ${person.color}`
          }}
        >
          {initials(person.fullName)}
        </div>

        <div className="text-lg font-semibold text-gray-900">
          {person.preferredName || person.fullName}
        </div>
      </div>

      {/* BODY */}
      <div className="p-5 space-y-4 flex-1">

        {/* Full Name */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Full Name</span>
          <input
            className="border p-2 rounded w-full"
            value={person.fullName}
            onChange={(e) =>
              updatePerson(person.id, { fullName: e.target.value })
            }
          />
        </label>

        {/* Preferred Name */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Preferred Name</span>
          <input
            className="border p-2 rounded w-full"
            value={person.preferredName}
            onChange={(e) =>
              updatePerson(person.id, { preferredName: e.target.value })
            }
          />
        </label>

        {/* Toggles */}
        <div className="space-y-2">
          <Toggle
            label="Presenter"
            value={person.isPresenter}
            onChange={handlePresenterToggle}
          />

          <Toggle
            label="Include in Spinner"
            value={person.inSpinner}
            onChange={(v) => updatePerson(person.id, { inSpinner: v })}
          />

          <Toggle
            label="Include in Groups"
            value={person.inGroups}
            onChange={(v) => updatePerson(person.id, { inGroups: v })}
          />
        </div>

        {/* COLOUR PICKER */}
        <div>
          <label className="text-sm font-medium text-gray-700">Colour</label>

          <div className="mt-3 space-y-4">

            {/* Current Colour */}
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">
                Current Colour
              </div>

              <button
                type="button"
                onClick={() =>
                  document.querySelector(`#picker-${person.id}`).click()
                }
                className={`
                  w-8 h-8 rounded-full border shadow transition-transform
                  ${
                    !availableColors.includes(person.color) &&
                    person.color !== fallbackColor
                      ? "ring-2 ring-blue-600 scale-110"
                      : ""
                  }
                `}
                style={{ backgroundColor: person.color }}
              />
            </div>

            {/* Available Colours */}
            {availableColors.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-600 mb-1">
                  Available Colours
                </div>

                <div className="flex gap-2 flex-wrap">
                  {availableColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleColorChange(c)}
                      className={`
                        w-8 h-8 rounded-full border shadow transition-transform
                        ${person.color === c ? "ring-2 ring-blue-600 scale-110" : ""}
                      `}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Custom Colour Button */}
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">
                Custom Colour
              </div>

              <button
                type="button"
                onClick={() => {
                  const unique = ensureUniqueColor(fallbackColor);
                  updatePerson(person.id, { color: unique });
                  document.querySelector(`#picker-${person.id}`).click();
                }}
                className="
                  px-3 py-2 rounded-md border shadow text-sm font-medium
                  bg-white hover:bg-gray-100 flex items-center gap-2
                "
              >
                <div
                  className="w-5 h-5 rounded-full border"
                  style={{ backgroundColor: fallbackColor }}
                />
                Choose Custom Colour
              </button>
            </div>

            {/* Hidden colour picker */}
            <input
              id={`picker-${person.id}`}
              type="color"
              value={person.color}
              onChange={(e) => handleColorChange(e.target.value)}
              className="hidden"
            />
          </div>
        </div>

        {/* History */}
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="font-medium text-gray-700 mb-1">History (last 3)</div>
          <ul className="list-disc ml-5 space-y-1">
            {person.history.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* ⭐ Unified Footer */}
      <div className="px-4 py-3 border-t bg-gray-50 flex justify-center">
        <button
          onClick={confirmDelete}
          className="
            px-4 py-2 rounded-md
            bg-red-600 text-white
            hover:bg-red-700
            text-sm font-medium
            shadow-sm
          "
        >
          Delete Person
        </button>
      </div>
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <label className="flex items-center gap-3 py-1">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
      />
      <span className="text-gray-700">{label}</span>
    </label>
  );
}
