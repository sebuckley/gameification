import React, { useState, useEffect } from "react";
import CorrectAnswerModal from "../shared/CorrectAnswerModal";
import WrongAnswerModal from "../shared/WrongAnswerModal";

export default function GameShowQuestion({
  index,
  total,
  currentQuestion,
  quizPeople,
  onAnswer,
  onNext
}) {
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [locked, setLocked] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [wrongAnswersBy, setWrongAnswersBy] = useState([]);

  // NEW — modal states
  const [showCorrectModal, setShowCorrectModal] = useState(false);
  const [showWrongModal, setShowWrongModal] = useState(false);
  const [modalCorrectPerson, setModalCorrectPerson] = useState(null);
  const [modalWrongPerson, setModalWrongPerson] = useState(null);

  // Reset state when question changes
  useEffect(() => {
    setSelectedPerson(null);
    setSelectedOption(null);
    setLocked(false);
    setWrongAnswersBy([]);
    setShowCorrectModal(false);
    setShowWrongModal(false);
  }, [index, currentQuestion]);

  // Shuffle options
  useEffect(() => {
    if (!currentQuestion) return;

    const shuffled = [...currentQuestion.options]
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

    setShuffledOptions(shuffled);
  }, [currentQuestion, index]);

  if (!currentQuestion) return null;

  const normalizeAnswer = (value) => String(value).trim().toLowerCase();
  const normalizedAnswer = normalizeAnswer(currentQuestion.answer);

  const handleSelectOption = (option) => {
    if (locked || !selectedPerson || wrongAnswersBy.includes(selectedPerson)) return;

    setSelectedOption(option);
    setLocked(true);

    const correct = normalizeAnswer(option) === normalizedAnswer;
    const personObj = quizPeople.find((p) => p.id === selectedPerson);

    onAnswer(option, selectedPerson, correct);

    if (correct) {
      setModalCorrectPerson(personObj);
      setShowCorrectModal(true);
    } else {
      setModalWrongPerson(personObj);
      setShowWrongModal(true);
      setWrongAnswersBy((previous) => [...previous, selectedPerson]);
      setSelectedPerson(null);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-160px)] w-full items-center justify-center px-4 py-6">
      <div className="flex w-full max-w-5xl flex-col items-center justify-center gap-6 text-center">

        {/* Question */}
        <div className="flex min-h-[180px] w-full max-w-4xl items-center justify-center rounded-[28px] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-8 text-white shadow-[0_30px_70px_rgba(76,29,149,0.35)] ring-1 ring-white/20 sm:min-h-[210px] md:min-h-[240px]">
          <div className="w-full">
            <div className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-indigo-100">
              Q{index + 1} / {total}
            </div>

            <p className="text-2xl font-black leading-tight sm:text-2xl md:text-4xl">
              {currentQuestion.question}
            </p>
          </div>
        </div>

      {/* PLAYER SELECTOR */}
      <div className="flex w-full max-w-4xl flex-wrap items-center justify-center gap-3 md:gap-4">
        {quizPeople.map((p) => {
          const disabled = wrongAnswersBy.includes(p.id);
          const initials = (p.fullName || p.preferredName)
            .split(" ")
            .map((name) => name[0])
            .join("")
            .toUpperCase();

          return (
            <button
              key={p.id}
              disabled={disabled}
              onClick={() => setSelectedPerson(p.id)}
              className={`flex items-center gap-3 rounded-full px-5 py-3 text-lg font-bold shadow-md transition hover:-translate-y-0.5 ${
                disabled
                  ? "bg-red-200 text-red-700 cursor-not-allowed"
                  : selectedPerson === p.id
                    ? "bg-emerald-500 text-white shadow-[0_12px_25px_rgba(16,185,129,0.3)]"
                    : "bg-white text-slate-800 hover:bg-slate-100"
              }`}
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shadow"
                style={{
                  backgroundColor: p.color,
                  border: `2px solid ${p.color}`
                }}
              >
                {initials}
              </div>

              <span className="font-medium">
                {p.preferredName || p.fullName}
              </span>
            </button>
          );
        })}
      </div>

      {/* OPTIONS */}
      <div className="flex w-full max-w-4xl flex-wrap items-center justify-center gap-3 md:gap-4">
        {shuffledOptions.map((option, i) => (
          <button
            key={i}
            disabled={!selectedPerson}
            onClick={() => handleSelectOption(option)}
            className={`rounded-full px-6 py-3 text-lg font-bold shadow-md transition hover:-translate-y-0.5 ${
              locked &&
              normalizeAnswer(option) === normalizeAnswer(selectedOption) &&
              normalizeAnswer(option) === normalizedAnswer
                ? "bg-green-600 text-white"
                : locked && normalizeAnswer(option) === normalizeAnswer(selectedOption)
                  ? "bg-red-600 text-white"
                : !selectedPerson
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : locked
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-600 text-white shadow-[0_12px_25px_rgba(109,40,217,0.35)]"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Manual Skip */}
      <button
        onClick={onNext}
        className={`rounded-full px-6 py-3 text-lg font-semibold shadow-md transition hover:-translate-y-0.5 ${
          locked
            ? "bg-slate-800 text-white hover:bg-slate-900"
            : "bg-slate-200 text-slate-800 hover:bg-slate-300"
        }`}
      >
        Next Question →
      </button>

      {/* CORRECT MODAL */}
      <CorrectAnswerModal
        show={showCorrectModal}
        setShowCorrectModal={setShowCorrectModal}
        answer={currentQuestion.answer}
        modalCorrectPerson={modalCorrectPerson}
        onNext={() => {
          setShowCorrectModal(false);
          onNext();
        }}
      />

      {/* WRONG MODAL */}
      <WrongAnswerModal
        show={showWrongModal}
        setLocked={setLocked}
        setShowWrongModal={setShowWrongModal}
        wrongPerson={modalWrongPerson}
        wrongTimer={3}
        onClear={() => {
          setShowWrongModal(false);
          onNext();
        }}
        onNoOneAnswered={() => {
          setShowWrongModal(false);
          onNext();
        }}
      />
      </div>
    </div>
  );
}
