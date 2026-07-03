import { useState, useMemo } from "react";
import usePeople from "../store/usePeopleStore";

/* -------------------------------------------------------
   SMART COMBINATIONS (3+2, 4+3, 5+4+4, etc.)
------------------------------------------------------- */
const smartCombinations = (n) => {
  if (n <= 1) return [];

  const results = [];
  const sizes = [2, 3, 4, 5, 6];

  const dfs = (remaining, combo) => {
    if (remaining === 0) {
      results.push([...combo]);
      return;
    }
    for (const s of sizes) {
      if (s <= remaining) dfs(remaining - s, [...combo, s]);
    }
  };

  dfs(n, []);

  return results
    .filter((combo) => !combo.includes(1))
    .sort((a, b) => a.length - b.length)
    .slice(0, 6);
};

export default function GroupGenerator() {
  const people = usePeople((s) => s.people);
  const saveGroups = usePeople((s) => s.saveGroups);

  const [size, setSize] = useState(2);
  const [sessionName, setSessionName] = useState("");
  const [sessionNameError, setSessionNameError] = useState(false);
  const [mode, setMode] = useState("random");

  /* -------------------------------------------------------
     ELIGIBLE PEOPLE (same as original)
  ------------------------------------------------------- */
  const eligible = people.filter(
    (p) => p.inGroups === true && p.isPresenter === false
  );

  /* -------------------------------------------------------
     SMART SUGGESTIONS
  ------------------------------------------------------- */
  const smartSuggestions = useMemo(() => {
    const combos = smartCombinations(eligible.length);
    return combos.map((combo) => ({
      label: combo.join(" + "),
      sizes: combo,
    }));
  }, [eligible]);

  /* -------------------------------------------------------
     GENERATE GROUPS (same as original + sessionName validation)
  ------------------------------------------------------- */
  const generate = () => {
    if (!sessionName || sessionName.trim() === "") {
      setSessionNameError(true);
      return;
    }

    setSessionNameError(false);

    if (!eligible.length || size <= 0) return;

    let result = [];

    if (mode === "even") {
      const groupCount = Math.ceil(eligible.length / size);
      const baseSize = Math.floor(eligible.length / groupCount);
      const remainder = eligible.length % groupCount;

      let idx = 0;
      for (let g = 0; g < groupCount; g++) {
        const thisSize = baseSize + (g < remainder ? 1 : 0);
        result.push(eligible.slice(idx, idx + thisSize));
        idx += thisSize;
      }
    } else {
      const shuffled = [...eligible].sort(() => Math.random() - 0.5);
      for (let i = 0; i < shuffled.length; i += size) {
        result.push(shuffled.slice(i, i + size));
      }
    }

    saveGroups(result, sessionName);
  };

  return (
    <div className="space-y-6">

      {/* Session Name */}
      <div className="flex gap-2 items-center">
        <label className="text-sm font-medium">Session Name</label>
        <input
          type="text"
          className={`
            border p-2 rounded w-64
            ${sessionNameError ? "border-red-500 bg-red-50" : ""}
          `}
          value={sessionName}
          onChange={(e) => {
            setSessionName(e.target.value);
            setSessionNameError(false);
          }}
          placeholder="e.g. Morning Groups"
        />
      </div>

      {/* Group Size */}
      <div className="flex gap-2 items-center">
        <label className="text-sm font-medium">Group size</label>
        <input
          type="number"
          className="border p-2 rounded w-24"
          value={size}
          min={1}
          onChange={(e) => setSize(Number(e.target.value))}
        />

        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          onClick={generate}
        >
          Generate
        </button>
      </div>

      {/* Smart Suggestions */}
      {smartSuggestions.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {smartSuggestions.map((s) => (
            <button
              key={s.label}
              onClick={() => setSize(s.sizes[0])}
              className="
                px-3 py-2 rounded text-sm font-medium border
                bg-gray-100 text-gray-700 hover:bg-gray-200
              "
            >
              Suggested: {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Even vs Random */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("random")}
          className={`
            px-3 py-2 rounded text-sm font-medium border
            ${mode === "random"
              ? "bg-indigo-600 text-white border-indigo-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
          `}
        >
          Random Groups
        </button>

        <button
          onClick={() => setMode("even")}
          className={`
            px-3 py-2 rounded text-sm font-medium border
            ${mode === "even"
              ? "bg-indigo-600 text-white border-indigo-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
          `}
        >
          Even Groups
        </button>
      </div>
    </div>
  );
}
