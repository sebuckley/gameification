import React, { useEffect, useState } from "react";
import CorrectAnswerModal from "../shared/CorrectAnswerModal";
import WrongAnswerModal from "../shared/WrongAnswerModal";

export default function MediaQuizQuestion({
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
  const [showCorrectModal, setShowCorrectModal] = useState(false);
  const [showWrongModal, setShowWrongModal] = useState(false);
  const [modalCorrectPerson, setModalCorrectPerson] = useState(null);
  const [modalWrongPerson, setModalWrongPerson] = useState(null);

  useEffect(() => {
    setSelectedPerson(null);
    setSelectedOption(null);
    setLocked(false);
    setWrongAnswersBy([]);
    setShowCorrectModal(false);
    setShowWrongModal(false);
  }, [index, currentQuestion]);

  useEffect(() => {
    const options = Array.isArray(currentQuestion?.options)
      ? currentQuestion.options.filter(Boolean)
      : [];

    setShuffledOptions(
      [...options]
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
    );
  }, [currentQuestion, index]);

  if (!currentQuestion) return null;

  const normalizeAnswer = (value) => String(value ?? "").trim().toLowerCase();
  const normalizedAnswer = normalizeAnswer(currentQuestion.answer);
  const hasOptions = shuffledOptions.length > 0;

  const recordAnswer = (correct, option = currentQuestion.answer) => {
    if (locked || !selectedPerson || wrongAnswersBy.includes(selectedPerson)) return;

    const personObj = quizPeople.find((person) => person.id === selectedPerson);

    setSelectedOption(option);
    setLocked(true);
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

  const submitAnswer = (option) => {
    recordAnswer(normalizeAnswer(option) === normalizedAnswer, option);
  };

  const renderMedia = () => {
    if (!currentQuestion.mediaUrl) return null;

    if (currentQuestion.contentType === "image") {
      return (
        <img
          src={currentQuestion.mediaUrl}
          alt={currentQuestion.mediaAlt || currentQuestion.question || "Quiz media"}
          className="h-full w-full rounded-2xl object-contain shadow-lg"
        />
      );
    }

    if (currentQuestion.contentType === "audio") {
      return <audio controls src={currentQuestion.mediaUrl} className="w-full max-w-xl" />;
    }

    if (currentQuestion.contentType === "video") {
      return (
        <video
          controls
          src={currentQuestion.mediaUrl}
          className="max-h-64 max-w-full rounded-2xl shadow-lg sm:max-h-80"
        />
      );
    }

    return null;
  };

  return (
    <div className="flex min-h-full w-full items-start justify-center overflow-y-auto px-2 py-3 sm:px-4 sm:py-4">
      <div className="flex w-full max-w-5xl flex-col items-center justify-start gap-3 text-center sm:gap-4">
        {currentQuestion.mediaUrl && currentQuestion.contentType !== "question" && (
          <div className="flex h-[clamp(120px,24vh,240px)] w-full max-w-4xl items-center justify-center rounded-[28px] bg-white p-3 shadow-[0_20px_45px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 sm:p-5">
            <div className="flex h-full w-full items-center justify-center">
              {renderMedia()}
            </div>
          </div>
        )}

        <div className="flex h-[clamp(110px,18vh,180px)] w-full max-w-4xl flex-col items-center justify-center rounded-[28px] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-4 text-white shadow-[0_20px_45px_rgba(76,29,149,0.25)] ring-1 ring-white/20 sm:p-6">
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-indigo-100">
            Q{index + 1} / {total}
          </div>
          <div>
            <p className="text-xl font-black leading-tight sm:text-2xl md:text-3xl">
              {currentQuestion.question}
            </p>
          </div>
        </div>

        <div className="flex w-full max-w-4xl flex-wrap items-center justify-center gap-2 md:gap-3">
          {quizPeople.map((person) => {
            const disabled = wrongAnswersBy.includes(person.id);
            const initials = (person.fullName || person.preferredName || "?")
              .split(" ")
              .map((name) => name[0])
              .join("")
              .toUpperCase();

            return (
              <button
                key={person.id}
                disabled={disabled}
                onClick={() => setSelectedPerson(person.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-base font-bold shadow-md transition hover:-translate-y-0.5 ${
                  disabled
                    ? "cursor-not-allowed bg-red-200 text-red-700"
                    : selectedPerson === person.id
                      ? "bg-emerald-500 text-white shadow-[0_12px_25px_rgba(16,185,129,0.3)]"
                      : "bg-white text-slate-800 hover:bg-slate-100"
                }`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shadow" style={{ backgroundColor: person.color }}>
                  {initials}
                </span>
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
                  onClick={() => submitAnswer(option)}
                  className={`rounded-full px-5 py-2 text-base font-bold shadow-md transition hover:-translate-y-0.5 ${
                    locked && isCorrect
                      ? "bg-green-600 text-white"
                      : locked && isSelected
                        ? "bg-red-600 text-white"
                        : !selectedPerson
                          ? "cursor-not-allowed bg-slate-200 text-slate-400"
                          : locked
                            ? "cursor-not-allowed bg-slate-300 text-slate-500"
                            : "bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-600 text-white shadow-[0_12px_25px_rgba(109,40,217,0.35)]"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex w-full max-w-2xl items-center justify-center gap-3">
            <button
              disabled={!selectedPerson || locked}
              onClick={() => recordAnswer(true)}
              className="rounded-full bg-emerald-600 px-5 py-2 text-base font-bold text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              Correct
            </button>
            <button
              disabled={!selectedPerson || locked}
              onClick={() => recordAnswer(false)}
              className="rounded-full bg-red-600 px-5 py-2 text-base font-bold text-white shadow-md transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              Wrong
            </button>
          </div>
        )}

        <button
          onClick={onNext}
          className={`rounded-full px-5 py-2 text-base font-semibold shadow-md transition hover:-translate-y-0.5 ${
            locked ? "bg-slate-800 text-white hover:bg-slate-900" : "bg-slate-200 text-slate-800 hover:bg-slate-300"
          }`}
        >
          Next Question →
        </button>

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
