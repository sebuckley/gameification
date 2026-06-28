import { useState, useEffect } from "react";
import usePeople from "../store/usePeopleStore";

export default function AddPersonForm() {
  const people = usePeople((s) => s.people);
  const addPerson = usePeople((s) => s.addPerson);

  const chicColors = [
    "#D16C7A",
    "#6CA8D1",
    "#E3C26F",
    "#D18F6C",
    "#9B7ED1",
    "#6CD1A8",
    "#D16C6C",
    "#6CD1D1"
  ];

  const [color, setColor] = useState(() => {
    const used = usePeople.getState().people.map(p => p.color?.toLowerCase());
    const available = chicColors.filter(c => !used.includes(c.toLowerCase()));
    return available[0] || "#6CA8D1";
  });

  const [customColor, setCustomColor] = useState(null);

  const [fullName, setFullName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [message, setMessage] = useState("");

  const usedColors = people.map(p => p.color?.toLowerCase()).filter(Boolean);
  const availableColors = chicColors.filter(
    (c) => !usedColors.includes(c.toLowerCase())
  );

  const shiftHue = (hex) => {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (
      "#" +
      ((r + 25) % 255).toString(16).padStart(2, "0") +
      ((g + 25) % 255).toString(16).padStart(2, "0") +
      ((b + 25) % 255).toString(16).padStart(2, "0")
    );
  };

  const getDefaultColor = () => {
    if (availableColors.length > 0) return availableColors[0];
    return shiftHue("#6CA8D1");
  };

  const handleColorSelect = (newColor) => {
    setCustomColor(null);
    setColor(newColor);
    setMessage("");
  };

  const handleCustomColor = (newColor) => {
    setCustomColor(newColor);
    setMessage("Custom colour selected.");
  };

  const randomColor = () => {
    const randomPool = availableColors.filter((c) => {
      const lower = c.toLowerCase();
      return (
        lower !== color.toLowerCase() &&
        lower !== (customColor?.toLowerCase() ?? "")
      );
    });

    if (randomPool.length === 0) {
      const fallback = shiftHue("#6CA8D1");
      setCustomColor(fallback);
      setMessage("All preset colours are used — generated a unique chic colour.");
      return;
    }

    const random = randomPool[Math.floor(Math.random() * randomPool.length)];
    handleColorSelect(random);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!fullName.trim() || !preferredName.trim()) return;

    addPerson({
      fullName: fullName.trim(),
      preferredName: preferredName.trim(),
      color: customColor || color
    });

    setFullName("");
    setPreferredName("");
    setCustomColor(null);
    setMessage("");
  };

  // ⭐ FIX: do NOT override random or custom colours
  useEffect(() => {
    // If user picked custom → do not override
    if (customColor) return;

    // If user picked random → do not override
    if (color && !availableColors.includes(color)) return;

    // Otherwise auto-select next chic colour
    const used = people.map(p => p.color?.toLowerCase());
    const available = chicColors.filter(c => !used.includes(c.toLowerCase()));
    setColor(available[0] || shiftHue("#6CA8D1"));
  }, [people]);

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 p-4 bg-white rounded shadow"
    >
      {/* Full Name */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">Full Name</span>
        <input
          className="border p-2 rounded w-full"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. Stephen Johnson"
        />
      </label>

      {/* Preferred Name */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">Preferred Name</span>
        <input
          className="border p-2 rounded w-full"
          value={preferredName}
          onChange={(e) => setPreferredName(e.target.value)}
          placeholder="e.g. Steve"
        />
      </label>

      {/* Colour Picker */}
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-gray-700">Colour</span>

        <div className="flex flex-wrap gap-2">
          {availableColors.map((c) => {
            const isSelected = !customColor && color === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => handleColorSelect(c)}
                className={`
                  w-8 h-8 rounded-full border shadow transition-transform
                  ${isSelected ? "ring-2 ring-blue-600 scale-110" : ""}
                `}
                style={{ backgroundColor: c }}
              />
            );
          })}

          <button
            type="button"
            onClick={() => document.querySelector("#hiddenColorPicker").click()}
            className={`
              w-8 h-8 rounded-full border shadow transition-transform
              ${customColor ? "ring-2 ring-blue-600 scale-110" : ""}
            `}
            style={{ backgroundColor: customColor || color }}
          />
        </div>

        <input
          id="hiddenColorPicker"
          type="color"
          value={customColor || color}
          onChange={(e) => handleCustomColor(e.target.value)}
          className="hidden"
        />

        <button
          type="button"
          onClick={randomColor}
          className="text-sm text-blue-600 underline"
        >
          Random chic colour
        </button>

        {message && (
          <p className="text-xs text-orange-600">{message}</p>
        )}
      </label>

      {/* Preview */}
      <div
        className="p-3 rounded shadow border flex items-center gap-3"
        style={{ backgroundColor: customColor || color }}
      >
        <div className="w-10 h-10 rounded-full border bg-white/40"></div>
        <div className="text-white font-medium drop-shadow">
          {preferredName || "Preview Name"}
        </div>
      </div>

      <button className="bg-indigo-600 text-white px-4 py-2 rounded">
        Add Person
      </button>
    </form>
  );
}
