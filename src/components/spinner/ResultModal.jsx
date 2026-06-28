import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function ResultModal({ winner, onClose }) {
  useEffect(() => {
    if (!winner) return;

    confetti({
      particleCount: 220,
      spread: 90,
      startVelocity: 45,
      origin: { y: 0.3 }
    });
  }, [winner]);

  if (!winner) return null;

  // Lighten winner colour for modal background
  const lighten = (hex, amount = 0.55) => {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);

    const lr = Math.min(255, r + (255 - r) * amount);
    const lg = Math.min(255, g + (255 - g) * amount);
    const lb = Math.min(255, b + (255 - b) * amount);

    return `#${Math.round(lr).toString(16).padStart(2, "0")}${Math.round(lg)
      .toString(16)
      .padStart(2, "0")}${Math.round(lb).toString(16).padStart(2, "0")}`;
  };

  // Darken winner colour for borders
  const darken = (hex, amount = 0.35) => {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);

    const dr = Math.max(0, r * (1 - amount));
    const dg = Math.max(0, g * (1 - amount));
    const db = Math.max(0, b * (1 - amount));

    return `#${Math.round(dr).toString(16).padStart(2, "0")}${Math.round(dg)
      .toString(16)
      .padStart(2, "0")}${Math.round(db).toString(16)
      .padStart(2, "0")}`;
  };

  const bgLight = lighten(winner.color, 0.65);   // ⭐ modal background tint
  const main = winner.color;                     // ⭐ main colour
  const dark = darken(winner.color, 0.35);       // ⭐ border + text

  const getInitials = (fullName) =>
    fullName
      .split(" ")
      .map((p) => p[0]?.toUpperCase())
      .join("")
      .slice(0, 3);

  const initials = getInitials(
    winner.fullName || winner.preferredName || winner.name
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        className="p-6 rounded shadow-lg text-center animate-fadeIn"
        style={{
          width: "420px",
          backgroundColor: "white",
          borderTop: `12px solid ${dark}`
        }}
      >
        <h2 className="text-xl font-bold mb-4" style={{ color: dark }}>
          Winner!
        </h2>

        <div className="text-2xl font-bold mb-4" style={{ color: dark }}>
          {winner.fullName || winner.preferredName || winner.name}
        </div>

        {/* ⭐ Circle = main colour, text = white, border = main colour */}
        <div
          className="mx-auto mb-6 w-24 h-24 rounded-full flex items-center justify-center font-extrabold text-4xl shadow-lg"
          style={{
            backgroundColor: main,
            color: "white",
            border: `4px solid ${main}`
          }}
        >
          {initials}
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 text-white rounded font-medium"
          style={{
            backgroundColor: dark,
            border: `2px solid ${dark}`
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
