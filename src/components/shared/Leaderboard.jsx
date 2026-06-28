import usePeople from "../store/usePeopleStore";

export default function Leaderboard({ people, data }) {
  const spinnerPeople = people.filter((p) => p.inSpinner === true);

  // ⭐ Choose correct score field
  const scoreField = data === "quiz" ? "quizScore" : "answers";

  // ⭐ Sort by correct score
  const sorted = [...spinnerPeople].sort((a, b) => b[scoreField] - a[scoreField]);

  const { resetAnswers, resetQuizScores } = usePeople();

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

  return (
    <div className="mt-6 bg-white rounded shadow overflow-hidden">

      <div className="bg-indigo-600 text-white px-4 py-2 font-semibold text-lg">
        Leaderboard
      </div>

      <div className="p-4 space-y-2">
        {sorted.map((p, index) => {
          const bg = lighten(p.color, 0.75);

          return (
            <div
              key={p.id}
              className="flex items-center justify-between px-3 py-2 rounded"
              style={{ backgroundColor: bg }}
            >
              <span className="font-bold text-gray-700 w-6">
                {index + 1}.
              </span>

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

                <span className="font-medium text-gray-900">
                  {p.preferredName || p.fullName || p.name}
                </span>
              </div>

              <span className="font-bold text-gray-900">
                {p[scoreField]}
              </span>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-3 border-t flex justify-center">
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
    </div>
  );
}
