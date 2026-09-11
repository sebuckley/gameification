import { useEffect, useMemo, useRef, useState } from "react";
import { useIceBreakerEngine } from "./IceBreakerEngine";
import usePeopleStore from "../store/usePeopleStore";
import PersonBadge from "../shared/PersonBadge";

export default function IceBreakerPlay({ running, setRunning }) {
  const {
    selectedIceBreaker,
    participants,
    collectFreeTextAnswers,
    iceBreakerSets,
    activeIceBreakerSetId,
    selectIceBreakerSet,
  } = usePeopleStore();
  const engine = useIceBreakerEngine(selectedIceBreaker, participants);
  const hasStartedRef = useRef(false);
  const [sessionResponses, setSessionResponses] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  const {
    phase,
    currentParticipant,
    currentIndex,
    totalParticipants,
    randomPrompt,
    answer,
    isSimple,
    isRandom,
    isChoice,
    isPerformance,
    isReveal,
    beginAnswer,
    submitAnswer,
    skipToNext,
    finishReveal,
    startSession
  } = engine;

  const hasParticipants = participants && participants.length > 0;
  const availableSetPrompts = useMemo(
    () =>
      (iceBreakerSets || []).filter(
        (setItem) => setItem?.selectedIceBreaker && setItem?.selectedIceBreaker?.label
      ),
    [iceBreakerSets]
  );

  const promptText = useMemo(() => {
    if (isRandom) return randomPrompt;
    return selectedIceBreaker?.prompt ?? "Choose a prompt to begin";
  }, [isRandom, randomPrompt, selectedIceBreaker]);

  useEffect(() => {
    if (!running || !selectedIceBreaker || !hasParticipants || hasStartedRef.current) return;
    hasStartedRef.current = true;
    startSession();
    setStartTime(Date.now());
  }, [running, selectedIceBreaker, hasParticipants, startSession]);

  useEffect(() => {
    if (!running) {
      setStartTime(null);
      setElapsed(0);
      return;
    }

    const tick = () => {
      setElapsed(Math.floor((Date.now() - (startTime || Date.now())) / 1));
    };

    const id = setInterval(tick, 2);
    tick();
    return () => clearInterval(id);
  }, [running, startTime]);

  useEffect(() => {
    if (phase !== "selecting" || !selectedIceBreaker || !currentParticipant) return;

    const timer = window.setTimeout(() => {
      beginAnswer();
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [phase, selectedIceBreaker, currentParticipant, beginAnswer]);

  useEffect(() => {
    if (!running) {
      hasStartedRef.current = false;
      return;
    }

    const enterFullscreen = () => {
      const target = document.documentElement;
      if (!target || typeof target.requestFullscreen !== "function") return;

      try {
        if (!document.fullscreenElement) {
          target.requestFullscreen();
        }
      } catch {
        // Ignore browser fullscreen permission issues and continue with the session.
      }
    };

    enterFullscreen();

    // Lock background scroll while running
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      // restore body overflow
      document.body.style.overflow = prevOverflow || "";
      if (document.fullscreenElement) {
        try {
          document.exitFullscreen();
        } catch {
          // Ignore teardown errors.
        }
      }
    };
  }, [running]);

  const handleStart = (setId = null) => {
    if (setId) {
      selectIceBreakerSet(setId);
    }

    if (!selectedIceBreaker && !setId) return;
    setRunning(true);
    setSessionResponses([]);
  };

  const recordResponse = (value) => {
    const participantName = currentParticipant?.preferredName || currentParticipant?.fullName || "Participant";
    setSessionResponses((prev) => [...prev, { participant: participantName, answer: value }]);
  };

  const handleTextSubmit = (value) => {
    recordResponse(value);
    submitAnswer(value);
  };

  const handleSkip = () => {
    if (isReveal) {
      finishReveal();
      return;
    }

    if (isSimple || isRandom) {
      if (collectFreeTextAnswers) recordResponse("Skipped");
      skipToNext();
      return;
    }

    submitAnswer("done");
  };

  const handleChoiceSelect = (value) => {
    recordResponse(value);
    submitAnswer(value);
  };

  const closeSession = () => {
    engine.endSession();
    hasStartedRef.current = false;
    setSessionResponses([]);
    setRunning(false);
  };

  const choiceSummary = useMemo(() => {
    if (!isChoice || !selectedIceBreaker?.options?.length) return [];

    return selectedIceBreaker.options.map((option) => {
      const matching = sessionResponses.filter((entry) => entry.answer === option);
      return {
        option,
        count: matching.length,
        people: matching.map((entry) => entry.participant)
      };
    });
  }, [sessionResponses, isChoice, selectedIceBreaker]);

  const formattedElapsed = useMemo(() => {
    const totalSeconds = Math.floor(elapsed / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [elapsed]);

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

return (
  <div className="fixed inset-0 z-50 h-screen w-screen bg-white text-slate-900 overflow-hidden flex flex-col">

    {/* HEADER */}
    <div className="w-full bg-white border-b border-purple-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
      <button
        onClick={closeSession}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-sm font-semibold text-white"
      >
        Close Ice Breaker
      </button>

      <div className="flex-1 text-center">
        <div className="text-sm font-medium text-purple-400">
          {phase === "complete"
            ? "Session complete"
            : `Person ${Math.max((currentIndex ?? 0) + 1, 1)} / ${totalParticipants || 0}`}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-purple-400">Time elapsed</div>
        <div className="text-sm font-medium text-purple-600">{formattedElapsed}</div>
      </div>
    </div>

    {/* MAIN CONTENT AREA */}
    <div className="flex-1 flex items-center justify-center px-6 py-10 overflow-hidden">

      {/* SELECTING PHASE */}
      {phase === "selecting" && currentParticipant && (
        <div className="w-full max-w-xl rounded-3xl bg-white border border-purple-200 shadow-lg p-10 text-center">

          {(isRandom || isPerformance) && (
            <div className="text-sm text-purple-500 mb-4">
              <strong>{selectedIceBreaker?.label}</strong>
              {isRandom ? " — Random Prompts" : isPerformance ? " — Performance" : ""}
            </div>
          )}

          <div className="text-sm font-semibold uppercase tracking-wide text-purple-600 mb-4">
            You’ve Been Selected
          </div>

          <div className="flex flex-col items-center space-y-4">
            <PersonBadge person={currentParticipant} size="xl" />

            <h2 className="text-3xl font-bold text-slate-900">
              {currentParticipant?.preferredName || currentParticipant?.fullName}
            </h2>

            <p className="text-slate-600 text-base max-w-sm">
              It’s your turn to answer the next question.
              Take a moment, then press the button below.
            </p>

            <button
              onClick={beginAnswer}
              className="mt-6 rounded-full bg-purple-600 hover:bg-purple-700 px-10 py-4 text-lg font-semibold text-white shadow-md transition"
            >
              Time to Answer →
            </button>
          </div>
        </div>
      )}

      {/* ANSWERING PHASE */}
      {phase === "answering" && (
        <div className="flex flex-col items-center justify-center text-center space-y-8 max-w-3xl w-full">

          <h1 className="text-3xl md:text-4xl font-bold text-purple-700">
            {promptText}
          </h1>

          {(isSimple || isRandom) && collectFreeTextAnswers && (
            <div className="w-full flex justify-center">
              <TextAnswerInput onSubmit={handleTextSubmit} />
            </div>
          )}

          {isChoice && (
            <div className="w-full flex justify-center">
              <ChoiceList
                options={selectedIceBreaker?.options ?? []}
                onSelect={handleChoiceSelect}
              />
            </div>
          )}

          {(isPerformance || isSimple || isRandom || isReveal) && (
            <button
              onClick={handleSkip}
              className="px-10 py-4 bg-purple-600 hover:bg-purple-700 rounded-full text-lg font-semibold text-white shadow-md transition"
            >
              Next Person →
            </button>
          )}
        </div>
      )}

      {/* REVEAL PHASE — FUNKY CARD STAYS FUNKY */}
      {phase === "reveal" && (
        <div className="flex flex-col items-center justify-center space-y-8 w-full max-w-2xl">

          <div className="
            w-full 
            rounded-3xl 
            bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500
            text-white 
            p-8 
            shadow-xl 
            text-center 
          ">
            <div className="text-lg font-semibold tracking-wide opacity-90">
              ✨ Reveal Time ✨
            </div>

            <div className="mt-4 text-4xl font-extrabold drop-shadow-md">
              {answer}
            </div>

            <div className="mt-2 text-sm opacity-80">
              Nice one!
            </div>
          </div>

          <button
            onClick={finishReveal}
            className="px-10 py-4 bg-purple-600 hover:bg-purple-700 rounded-full text-lg font-semibold text-white shadow-md transition transform hover:scale-105"
          >
            Next Person →
          </button>
        </div>
      )}

      {/* COMPLETE PHASE */}
      {phase === "complete" && (
        <div className="flex flex-col items-center space-y-6 w-full max-w-2xl">

          <h2 className="text-3xl font-bold text-purple-700">Icebreaker Complete 🎉</h2>

          {/* SIMPLE ANSWERS */}
          {!isChoice && sessionResponses.length > 0 && (
            <div className="w-full rounded-xl border border-purple-200 bg-white p-4 shadow-md">
              <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-purple-600">
                Everyone’s Answers
              </div>

              <div className="space-y-3">
                {sessionResponses.map((entry, index) => (
                  <div key={`${entry.participant}-${index}`} className="rounded-lg border border-purple-100 bg-purple-50 p-3">
                    <div className="font-semibold text-purple-800">{entry.participant}</div>
                    <div className="mt-1 text-sm text-purple-700">{entry.answer}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHOICE SUMMARY */}
          {isChoice && choiceSummary.length > 0 && (
            <div className="w-full rounded-xl border border-purple-200 bg-white p-4 shadow-md">

              <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-purple-600">
                Choice Summary
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {choiceSummary
                  .filter(item => item.count > 0)
                  .map(({ option, count, people }) => (
                    <div key={option} className="rounded-lg border border-purple-100 bg-purple-50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-purple-800">{option}</div>
                        <span className="rounded-full bg-purple-200 px-2.5 py-1 text-xs font-semibold text-purple-900">
                          {count}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {people.map((person) => (
                          <span
                            key={`${option}-${person}`}
                            className="rounded-full bg-purple-300 px-2 py-1 text-xs text-purple-900"
                          >
                            {person}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>

              {choiceSummary.some(item => item.count === 0) && (
                <div className="mt-6">
                  <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-purple-600">
                    Superpowers Not Chosen
                  </div>

                  <ul className="list-disc list-inside text-sm text-purple-700">
                    {choiceSummary
                      .filter(item => item.count === 0)
                      .map(item => (
                        <li key={item.option}>{item.option}</li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <button
            onClick={closeSession}
            className="px-10 py-4 bg-red-600 hover:bg-red-700 rounded-full text-lg font-semibold text-white shadow-md transition"
          >
            Close
          </button>
        </div>
      )}

    </div>
  </div>
);



}

function TextAnswerInput({ onSubmit }) {
  const [value, setValue] = useState("");

  return (
    <div className="flex flex-col items-center space-y-4">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="px-4 py-2 rounded-md text-gray-900 w-72 max-w-full"
        placeholder="Type your answer..."
      />
      <button
        onClick={() => value && onSubmit(value)}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-md text-lg font-semibold text-white"
      >
        Submit
      </button>
    </div>
  );
}

function ChoiceList({ options, onSelect }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl w-full">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className="px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-lg font-semibold shadow-sm"
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
