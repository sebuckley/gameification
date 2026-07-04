import { useEffect, useState, useMemo } from "react";
import usePeople from "../store/usePeopleStore";

export default function Leaderboard({ people, data, running }) {
  const scoreField = data === "quiz" ? "quizScore" : "answers";

  // ⭐ Animated score state
  const [animatedScores, setAnimatedScores] = useState({});

const sorted = useMemo(() => {
  return [...people].sort((a, b) => b[scoreField] - a[scoreField]);
}, [people, scoreField]);

  const { resetAnswers, resetQuizScores } = usePeople();

  // ⭐ Lighten background color
  const lighten = (hex, amount = 0.75) => {
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

  const initials = (name) =>
    name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0].toUpperCase())
      .join("");

  // ⭐ Live score pulse animation
  useEffect(() => {
    const newScores = {};
    sorted.forEach((p) => {
      newScores[p.id] = p[scoreField];
    });

    setAnimatedScores((prev) => {
      const updated = { ...prev };
      sorted.forEach((p) => {
        if (prev[p.id] !== undefined && prev[p.id] !== p[scoreField]) {
          updated[p.id] = p[scoreField];
        }
      });
      return updated;
    });
  }, [sorted]);

  return (
    <div className="bg-white rounded shadow overflow-hidden w-full mx-2 my-4">

      {/* Header */}
      <div className="bg-indigo-600 text-white px-4 py-2 font-semibold text-lg w-full">
        Leaderboard
      </div>

      {/* List */}
      <div className="p-4 space-y-3 w-full">
        {sorted.map((p, index) => {
          const bg = lighten(p.color, 0.75);

          // ⭐ Gold / Silver / Bronze highlights
          const medalStyles = [
            "border-yellow-500 bg-yellow-100",
            "border-gray-400 bg-gray-100",
            "border-amber-600 bg-amber-100"
          ];

          const medalClass = index < 3 ? medalStyles[index] : "";

          return (
            <div
  key={p.id}
  className={`
    flex items-center justify-between 
    px-4 py-3 
    rounded 
    w-[95%] mx-auto
    mb-2
    transition-all duration-300
    ${medalClass}
  `}
  style={{ backgroundColor: bg }}
>

              {/* Rank */}
              <span className="font-bold text-gray-700 w-6">
                {index + 1}.
              </span>

              {/* Circle + Preferred Name */}
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow"
                  style={{
                    backgroundColor: p.color,
                    border: `2px solid ${p.color}`
                  }}
                >
                  {initials(p.fullName || p.preferredName || p.name)}
                </div>

                {/* ⭐ Preferred Name displayed */}
                <span className="font-medium text-gray-900 truncate">
                  {p.preferredName || p.fullName || p.name}
                </span>
              </div>

              {/* Score with pulse animation */}
              <span
                className={`
                  font-bold text-gray-900
                  ${animatedScores[p.id] !== p[scoreField] ? "animate-pulse text-black" : ""}
                `}
              >
                {p[scoreField]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Reset — hidden while running */}
      {!running && (
        <div className="px-4 py-3 border-t flex justify-center w-full">
          <button
            onClick={() => {
              if (data === "quiz") resetQuizScores();
              else resetAnswers();
            }}
            className="
              px-3 py-1 rounded 
              bg-red-600 text-white 
              hover:bg-red-700 
              text-sm font-medium
            "
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
