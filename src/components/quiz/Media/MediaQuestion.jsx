import React, { useEffect, useRef, useState } from "react";
import CorrectAnswerModal from "../shared/CorrectAnswerModal";
import WrongAnswerModal from "../shared/WrongAnswerModal";
import usePeopleStore from "../../store/usePeopleStore";


export default function MediaQuizQuestion({ index, total, currentQuestion, quizPeople, onAnswer, onNext }) {
  
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [locked, setLocked] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [wrongAnswersBy, setWrongAnswersBy] = useState([]);
  const [showCorrectModal, setShowCorrectModal] = useState(false);
  const [showWrongModal, setShowWrongModal] = useState(false);
  const [modalCorrectPerson, setModalCorrectPerson] = useState(null);
  const [modalWrongPerson, setModalWrongPerson] = useState(null);
  const [revealProgress, setRevealProgress] = useState(0);
  const revealElapsedRef = useRef(0);
  const revealLastTickRef = useRef(null);
  const quizSettings = usePeopleStore((state) => state.quizSettings);

  const wantsReveal = Boolean(currentQuestion?.mediaReveal) && currentQuestion?.contentType === "image";
  const revealPaused = Boolean(selectedPerson) || locked;
  const revealTotalMs = Math.max(1, Number(quizSettings?.revealSeconds) || 20) * 1000;

  useEffect(() => {
    setSelectedPerson(null);
    setSelectedOption(null);
    setLocked(false);
    setWrongAnswersBy([]);
    setShowCorrectModal(false);
    setShowWrongModal(false);
    setRevealProgress(0);
    revealElapsedRef.current = 0;
    revealLastTickRef.current = null;
  }, [index, currentQuestion]);

  useEffect(() => {
    if (!wantsReveal || revealPaused) {
      revealLastTickRef.current = null;
      return;
    }

    const timer = setInterval(() => {
      const now = Date.now();
      if (revealLastTickRef.current === null) {
        revealLastTickRef.current = now;
        return;
      }
      revealElapsedRef.current += now - revealLastTickRef.current;
      revealLastTickRef.current = now;

      const progress = Math.min(1, revealElapsedRef.current / revealTotalMs);
      setRevealProgress(progress);

      if (progress >= 1) {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [wantsReveal, revealPaused, index, currentQuestion]);

  useEffect(() => {
    const options = Array.isArray(currentQuestion?.options) ? currentQuestion.options.filter(Boolean) : [];
    setShuffledOptions([...options].sort(() => Math.random() - 0.5));
  }, [currentQuestion, index]);

  if (!currentQuestion) return null;

  const normalizeAnswer = (value) => String(value ?? "").trim().toLowerCase();
  const normalizedAnswer = normalizeAnswer(currentQuestion.answer);
  const hasOptions = shuffledOptions.length > 0;

  const recordAnswer = (correct, option = currentQuestion.answer) => {
    if (locked || !selectedPerson || wrongAnswersBy.includes(selectedPerson)) return;

    const person = quizPeople.find((item) => item.id === selectedPerson);
    setSelectedOption(option);
    setLocked(true);
    onAnswer(option, selectedPerson, correct);

    if (correct) {
      setModalCorrectPerson(person);
      setShowCorrectModal(true);
    } else {
      setModalWrongPerson(person);
      setShowWrongModal(true);
      setWrongAnswersBy((previous) => [...previous, selectedPerson]);
      setSelectedPerson(null);
    }
  };

  const renderMedia = () => {
    if (!currentQuestion.mediaUrl) return null;
    if (currentQuestion.contentType === "image") {
      if (wantsReveal) {
        return (
          <div className="relative flex h-[32vh] w-full items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg sm:h-[36vh] lg:h-[40vh]">
<img
  src={currentQuestion.mediaUrl}
  alt={currentQuestion.mediaAlt || currentQuestion.question || "Quiz media"}
  className="h-full w-full object-contain opacity-0"
  onLoad={(e) => {
    e.currentTarget.style.opacity = 1;
  }}
  style={{
    filter: `blur(${Math.round((1 - revealProgress) * 20)}px)`,
    transform: `scale(${(1.35 - revealProgress * 0.35).toFixed(3)})`,
    transition: "filter 120ms linear, transform 120ms linear, opacity 0ms"
  }}
/>
          </div>
        );
      }

      return (
        <img
          src={currentQuestion.mediaUrl}
          alt={currentQuestion.mediaAlt || currentQuestion.question || "Quiz media"}
          className="max-h-[32vh] w-full max-w-full rounded-2xl object-contain shadow-lg sm:max-h-[36vh] lg:max-h-[40vh]"
        />
      );
    }
    if (currentQuestion.contentType === "audio") {
      return <audio controls src={currentQuestion.mediaUrl} className="w-full max-w-xl" />;
    }
    if (currentQuestion.contentType === "video") {
      return <video controls src={currentQuestion.mediaUrl} className="max-h-[32vh] max-w-full rounded-2xl shadow-lg sm:max-h-[36vh]" />;
    }
    return null;
  };

  return (
    <div className="flex min-h-full w-full items-start justify-center overflow-y-auto px-2 py-2 sm:px-4 sm:py-3">
      <div className="flex w-full max-w-5xl flex-col items-center justify-start gap-2 text-center sm:gap-3">
        {currentQuestion.mediaUrl && currentQuestion.contentType !== "question" && (
          <div className="flex min-h-[120px] w-full max-w-4xl flex-col items-center justify-center gap-2 rounded-[28px] bg-white p-3 shadow-[0_20px_45px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 sm:min-h-[160px] sm:p-4">
            {wantsReveal && revealProgress < 1 && (
              <div className="self-end rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white">
                Revealing… {Math.max(0, Math.ceil((1 - revealProgress) * (revealTotalMs / 1000)))}s
              </div>
            )}
            {renderMedia()}
          </div>
        )}

        <div className="flex h-[clamp(96px,14vh,150px)] w-full max-w-4xl flex-col items-center justify-center rounded-[28px] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-3 text-white shadow-[0_20px_45px_rgba(76,29,149,0.25)] ring-1 ring-white/20 sm:p-4">
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-indigo-100">Q{index + 1} / {total}</div>
          <p className="text-xl font-black leading-tight sm:text-2xl md:text-3xl">{currentQuestion.question}</p>
        </div>

        <div className="flex w-full max-w-4xl flex-wrap items-center justify-center gap-2 md:gap-3">
          {quizPeople.map((person) => {
            const disabled = wrongAnswersBy.includes(person.id);
            const initials = (person.fullName || person.preferredName || "?").split(" ").map((name) => name[0]).join("").toUpperCase();
            return (
              <button
                key={person.id}
                disabled={disabled}
                onClick={() => setSelectedPerson(person.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-base font-bold shadow-md transition hover:-translate-y-0.5 ${disabled ? "cursor-not-allowed bg-red-200 text-red-700" : selectedPerson === person.id ? "bg-emerald-500 text-white" : "bg-white text-slate-800 hover:bg-slate-100"}`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shadow" style={{ backgroundColor: person.color }}>{initials}</span>
                {person.preferredName || person.fullName}
              </button>
            );
          })}
        </div>

        {hasOptions ? (
          <div className="flex w-full max-w-4xl flex-wrap items-center justify-center gap-2 md:gap-3">
            {shuffledOptions.map((option, optionIndex) => {
              const isSelected = normalizeAnswer(option) === normalizeAnswer(selectedOption);
              const isCorrect = isSelected && normalizeAnswer(option) === normalizedAnswer;
              return (
                <button
                  key={`${option}-${optionIndex}`}
                  disabled={!selectedPerson || locked}
                  onClick={() => recordAnswer(normalizeAnswer(option) === normalizedAnswer, option)}
                  className={`rounded-full border-2 px-5 py-2 text-base font-bold shadow-md ${locked && isCorrect ? "border-green-600 bg-green-600 text-white" : locked && isSelected ? "border-red-600 bg-red-600 text-white" : !selectedPerson ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400" : locked ? "cursor-not-allowed border-slate-300 bg-slate-100 text-slate-500" : "border-violet-500 bg-white text-violet-700 hover:bg-violet-50"}`}
                >{option}</button>
              );
            })}
          </div>
        ) : (
          <div className="flex w-full items-center justify-center gap-3">
            <button disabled={!selectedPerson || locked} onClick={() => recordAnswer(true)} className="rounded-full bg-emerald-600 px-5 py-2 text-base font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">Correct</button>
            <button disabled={!selectedPerson || locked} onClick={() => recordAnswer(false)} className="rounded-full bg-red-600 px-5 py-2 text-base font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">Wrong</button>
          </div>
        )}

        <button onClick={onNext} className={`rounded-full px-5 py-2 text-base font-semibold shadow-md ${locked ? "bg-slate-800 text-white" : "bg-slate-200 text-slate-800"}`}>Next Question →</button>

        <CorrectAnswerModal show={showCorrectModal} setShowCorrectModal={setShowCorrectModal} answer={currentQuestion.answer} modalCorrectPerson={modalCorrectPerson} onNext={() => { setShowCorrectModal(false); onNext(); }} />
        <WrongAnswerModal show={showWrongModal} setLocked={setLocked} setShowWrongModal={setShowWrongModal} wrongPerson={modalWrongPerson} wrongTimer={3} onClear={() => { setLocked(false); setShowWrongModal(false); }} onNoOneAnswered={() => { setLocked(false); setShowWrongModal(false); }} />
      </div>
    </div>
  );
}
