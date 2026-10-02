import { useMemo } from "react";
import usePeopleStore from "../store/usePeopleStore";
import StandaloneActivityRunner from "../shared/StandaloneActivityRunner";

export default function IceBreakerPlay({ running, setRunning }) {
  const {
    selectedIceBreaker,
    participants,
    iceBreakerSets,
    activeIceBreakerSetId,
    selectIceBreakerSet,
  } = usePeopleStore();

  const hasParticipants = participants && participants.length > 0;
  const availableSetPrompts = useMemo(
    () =>
      (iceBreakerSets || []).filter(
        (setItem) => setItem?.selectedIceBreaker && setItem?.selectedIceBreaker?.label
      ),
    [iceBreakerSets]
  );

  const handleStart = (setId = null) => {
    if (setId && setId !== activeIceBreakerSetId) selectIceBreakerSet(setId);
    if (!selectedIceBreaker && !setId) return;
    setRunning(true);
  };

  if (!running) {
    return (
      <div className="border rounded shadow bg-white p-6 space-y-4">
        <div className="text-gray-800 font-semibold">Ice Breaker Player</div>
        <p className="text-sm text-gray-600">
          Start the session to enter fullscreen and guide one person at a time through the chosen prompt.
        </p>
        {availableSetPrompts.length > 0 ? (
          <div className="space-y-3">
            <div className="text-sm font-semibold text-slate-700">Available Icebreaker Sets</div>
            <div className="space-y-3">
              {availableSetPrompts.map((setItem) => {
                const prompt = setItem.selectedIceBreaker;
                const isActive = setItem.id === activeIceBreakerSetId;
                const promptTypeLabel =
                  prompt.type === "random"
                    ? "Random"
                    : prompt.type === "performance"
                    ? "Performance"
                    : prompt.type === "choice"
                    ? "Choice"
                    : prompt.type === "reveal"
                    ? "Reveal"
                    : "Simple";

                return (
                  <div
                    key={setItem.id}
                    className={`rounded-lg border p-4 ${
                      isActive ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-slate-600">{setItem.name}</div>
                        <div className="mt-1 text-lg font-semibold text-slate-900">{prompt.label}</div>
                        <div className="mt-1 text-sm text-slate-600">{prompt.prompt}</div>
                        <div className="mt-3 inline-flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                            {promptTypeLabel}
                          </span>
                          {isActive && <span className="text-xs text-indigo-700">Current active set</span>}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStart(setItem.id)}
                        disabled={!hasParticipants}
                        className={`px-4 py-2 rounded-md text-white text-sm font-semibold whitespace-nowrap ${
                          hasParticipants ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Start This Icebreaker
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            No icebreaker set has a selected prompt yet.
          </div>
        )}
        {!hasParticipants && (
          <div className="text-xs text-slate-500">Add participants before starting an icebreaker session.</div>
        )}
      </div>
    );
  }

  const activeSet = (iceBreakerSets || []).find((setItem) => setItem.id === activeIceBreakerSetId && setItem.selectedIceBreaker)
    || (iceBreakerSets || []).find((setItem) => setItem.selectedIceBreaker);
  return (
    <StandaloneActivityRunner
      kind="icebreaker"
      iceBreakerSet={{ ...activeSet, name: activeSet?.name || "Ice Breaker", selectedIceBreaker: selectedIceBreaker || activeSet?.selectedIceBreaker }}
      participants={participants}
      onClose={() => setRunning(false)}
    />
  );
}
