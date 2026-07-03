import { useEffect, useMemo, useRef, useState } from "react";
import { useIceBreakerEngine } from "./IceBreakerEngine";
import usePeopleStore from "../store/usePeopleStore";
import PersonBadge from "../shared/PersonBadge";

export default function IceBreakerPlay({ running, setRunning }) {
  const { selectedIceBreaker, participants, collectFreeTextAnswers } = usePeopleStore();
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

  const promptText = useMemo(() => {
    if (isRandom) return randomPrompt;
    return selectedIceBreaker?.prompt ?? "Choose a prompt to begin";
  }, [isRandom, randomPrompt, selectedIceBreaker]);

  useEffect(() => {
    if (!running || !selectedIceBreaker || hasStartedRef.current) return;
    hasStartedRef.current = true;
    startSession();
    setStartTime(Date.now());
  }, [running, selectedIceBreaker, startSession]);

  useEffect(() => {
    if (!running) {
      setStartTime(null);
      setElapsed(0);
      return;
    }

    const tick = () => {
      setElapsed(Math.floor((Date.now() - (startTime || Date.now())) / 1000));
    };

    const id = setInterval(tick, 1000);
    tick();
    return () => clearInterval(id);
  }, [running, startTime]);

  useEffect(() => {
    if (phase !== "selecting" || !selectedIceBreaker || !currentParticipant) return;

    const timer = window.setTimeout(() => {
      beginAnswer();
    }, 250);

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

  const handleStart = () => {
    if (!selectedIceBreaker) return;
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

  if (!running) {
    return (
      <div className="border rounded shadow bg-white p-6 space-y-4">
        <div className="text-gray-800 font-semibold">Ice Breaker Player</div>
        <p className="text-sm text-gray-600">
          Start the session to enter fullscreen and guide one person at a time through the chosen prompt.
        </p>
        <button
          onClick={handleStart}
          disabled={!selectedIceBreaker}
          className={`px-4 py-2 rounded-md text-white text-sm font-semibold ${selectedIceBreaker ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-400 cursor-not-allowed"}`}
        >
          Start Ice Breaker
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 h-screen w-screen bg-white text-slate-900 overflow-hidden flex flex-col">
      <div className="w-full bg-white border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <button
          onClick={closeSession}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-semibold text-white"
        >
          Close Ice Breaker
        </button>

        <div className="flex-1 text-center">
          <div className="text-sm font-medium text-slate-300">
            {phase === "complete"
              ? "Session complete"
              : `Person ${Math.max((currentIndex ?? 0) + 1, 1)} / ${totalParticipants || 0}`}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-300">{selectedIceBreaker?.label ?? "Ice Breaker"}</div>
          <div className="text-sm font-medium text-slate-500">{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 grid place-items-center">
        <div className="w-full max-w-4xl mx-auto max-h-[calc(100vh-73px)] flex flex-col justify-center rounded-2xl border border-slate-200 bg-slate-50 shadow-2xl p-6 md:p-10">
          {currentParticipant && (
            <div className="flex justify-center mb-8">
              <div className="w-full max-w-md">
                <PersonBadge person={currentParticipant} />
              </div>
            </div>
          )}

          <div className="text-center max-w-2xl mx-auto mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{promptText}</h1>
            {(isRandom || isPerformance) && (
              <div className="text-sm text-slate-500 mt-2">
                <strong>{selectedIceBreaker?.label}</strong>
                {isRandom ? " — Random Prompts" : isPerformance ? " — Performance" : ""}
              </div>
            )}
          </div>

          {phase === "answering" && (
            <div className="flex flex-col items-center space-y-6">
              {(isSimple || isRandom) && collectFreeTextAnswers && <TextAnswerInput onSubmit={handleTextSubmit} />}
              {isChoice && <ChoiceList options={selectedIceBreaker?.options ?? []} onSelect={handleChoiceSelect} />}
              {(isPerformance || isSimple || isRandom || isReveal) && (
                <button
                  onClick={handleSkip}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-md text-lg font-semibold text-white"
                >
                  Next Person
                </button>
              )}
            </div>
          )}

          {phase === "reveal" && (
            <div className="flex flex-col items-center justify-center space-y-6 w-full min-h-[50vh]">
              <div className="text-xl bg-white text-gray-900 px-5 py-4 rounded-lg shadow w-full max-w-2xl text-center">
                <strong>Answer:</strong>
                <div className="mt-3 text-2xl font-semibold text-slate-900">{answer}</div>
              </div>

              <button
                onClick={finishReveal}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-md text-lg font-semibold text-white"
              >
                Next Person
              </button>
            </div>
          )}

          {phase === "complete" && (
            <div className="flex flex-col items-center space-y-6 w-full">
              <h2 className="text-3xl font-bold">Session Complete</h2>

              {!isChoice && sessionResponses.length > 0 && (
                <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Everyone&apos;s Answers
                  </div>
                  <div className="space-y-3">
                    {sessionResponses.map((entry, index) => (
                      <div key={`${entry.participant}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <div className="font-semibold text-gray-800">{entry.participant}</div>
                        <div className="mt-1 text-sm text-slate-700">{entry.answer}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isChoice && choiceSummary.length > 0 && (
                <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Choice Summary
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {choiceSummary.map(({ option, count, people }) => (
                      <div key={option} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold text-gray-800">{option}</div>
                          <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                            {count}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {people.length > 0 ? (
                            people.map((person) => (
                              <span key={`${option}-${person}`} className="rounded-full bg-slate-200 px-2 py-1 text-xs text-slate-700">
                                {person}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500">No selections yet</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={closeSession}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-md text-lg font-semibold text-white"
              >
                Close
              </button>
            </div>
          )}
        </div>
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
