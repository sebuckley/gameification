import { useState, useMemo } from "react";
import usePeople from "../store/usePeopleStore";
import { Settings } from "lucide-react";

/* -------------------------------------------------------
   SMART COMBINATIONS
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

/* -------------------------------------------------------
   GROUP GENERATOR (dropdown version)
------------------------------------------------------- */
export default function GroupGenerator() {
  const people = usePeople((s) => s.people);
  const saveGroups = usePeople((s) => s.saveGroups);

  const [size, setSize] = useState(2);
  const [sessionName, setSessionName] = useState("");
  const [sessionNameError, setSessionNameError] = useState(false);
  const [mode, setMode] = useState("random");
  const [open, setOpen] = useState(false);

  const eligible = people.filter(
    (p) => p?.inGroups !== false && p?.isPresenter !== true
  );

  const smartSuggestions = useMemo(() => {
    const combos = smartCombinations(eligible.length);
    return combos.map((combo) => ({
      label: combo.join(" + "),
      sizes: combo,
    }));
  }, [eligible]);

  const generate = () => {
    if (!sessionName.trim()) {
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
    <div className="border rounded shadow bg-white">
      {/* HEADER — EXACT MATCH */}
      <div
        className="
          flex items-center justify-between 
          px-4 py-3 border-b cursor-pointer select-none 
          bg-white rounded-t
        "
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center text-gray-500 mr-2 gap-2">
          <Settings size={16} />
          <span className="text-sm font-semibold text-gray-700">
            Group Setup
          </span>
        </div>

        <span className="text-gray-700 text-xl">
          {open ? "▼" : "◀"}
        </span>
      </div>

      {/* BODY */}
      <div
        className={`
          overflow-hidden transition-all duration-300
          ${open ? "max-h-[2000px]" : "max-h-0"}
        `}
      >
        <div className="p-4 space-y-6">

          {/* HEADER */}
          <h3 className="text-lg font-bold text-gray-800">Group Setup</h3>
          <p className="text-sm text-gray-600">
            Create a session name, choose group size, and generate groups.
          </p>

          {/* SESSION NAME */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Session Name</label>
            <input
              type="text"
              className={`
                border border-gray-300 p-2 rounded-md w-full
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

          {/* GROUP SIZE */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Group Size</label>
            <input
              type="number"
              className="border border-gray-300 p-2 rounded-md w-32"
              value={size}
              min={1}
              onChange={(e) => setSize(Number(e.target.value))}
            />
          </div>

          {/* SMART SUGGESTIONS */}
          {smartSuggestions.length > 0 && (
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <h4 className="text-sm font-semibold text-gray-700">Smart Suggestions</h4>

              <div className="flex gap-2 flex-wrap">
                {smartSuggestions.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setSize(s.sizes[0])}
                    className="
                      px-3 py-2 rounded-md text-sm font-medium border border-gray-300
                      bg-gray-100 text-gray-700 hover:bg-gray-200
                    "
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MODE SELECT */}
          <div className="pt-4 border-t border-gray-200 space-y-2">
            <h4 className="text-sm font-semibold text-gray-700">Group Mode</h4>

            <div className="flex gap-2">
              <button
                onClick={() => setMode("random")}
                className={`
                  px-3 py-2 rounded-md text-sm font-medium border
                  ${mode === "random"
                    ? "bg-indigo-600 text-white border-indigo-700"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"}
                `}
              >
                Random Groups
              </button>

              <button
                onClick={() => setMode("even")}
                className={`
                  px-3 py-2 rounded-md text-sm font-medium border
                  ${mode === "even"
                    ? "bg-indigo-600 text-white border-indigo-700"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"}
                `}
              >
                Even Groups
              </button>
            </div>
          </div>

          {/* GENERATE BUTTON */}
          <div className="pt-4 border-t border-gray-200">
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              onClick={generate}
            >
              Generate Groups
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
