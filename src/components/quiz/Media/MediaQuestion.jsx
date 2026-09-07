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
  const [answerInput, setAnswerInput] = useState("");
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
    setAnswerInput("");
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

  const submitAnswer = (option) => {
    if (locked || !selectedPerson || wrongAnswersBy.includes(selectedPerson)) return;

    const correct = normalizeAnswer(option) === normalizedAnswer;
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

  const renderMedia = () => {
    if (!currentQuestion.mediaUrl) return null;

    if (currentQuestion.contentType === "image") {
      return (
        <img
          src={currentQuestion.mediaUrl}
          alt={currentQuestion.mediaAlt || currentQuestion.question || "Quiz media"}
          className="max-h-56 max-w-full rounded-2xl object-contain shadow-lg sm:max-h-72"
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
    <div className="flex min-h-[calc(100vh-160px)] w-full items-center justify-center px-4 py-6">
      <div className="flex w-full max-w-5xl flex-col items-center justify-center gap-6 text-center">
        <div className="flex min-h-[180px] w-full max-w-4xl flex-col items-center justify-center rounded-[28px] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-8 text-white shadow-[0_30px_70px_rgba(76,29,149,0.35)] ring-1 ring-white/20 sm:min-h-[210px] md:min-h-[240px]">
          <div className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-indigo-100">
            Q{index + 1} / {total}
          </div>
          {renderMedia()}
          <p className="mt-5 text-2xl font-black leading-tight sm:text-2xl md:text-4xl">
            {currentQuestion.question}
          </p>
        </div>

        <div className="flex w-full max-w-4xl flex-wrap items-center justify-center gap-3 md:gap-4">
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
                className={`flex items-center gap-3 rounded-full px-5 py-3 text-lg font-bold shadow-md transition hover:-translate-y-0.5 ${
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
          <div className="flex w-full max-w-4xl flex-wrap items-center justify-center gap-3 md:gap-4">
            {shuffledOptions.map((option, optionIndex) => {
              const isSelected = normalizeAnswer(option) === normalizeAnswer(selectedOption);
              const isCorrect = isSelected && normalizeAnswer(option) === normalizedAnswer;

              return (
                <button
                  key={`${option}-${optionIndex}`}
                  disabled={!selectedPerson || locked}
                  onClick={() => submitAnswer(option)}
                  className={`rounded-full px-6 py-3 text-lg font-bold shadow-md transition hover:-translate-y-0.5 ${
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
          <div className="flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
            <input
              value={answerInput}
              disabled={!selectedPerson || locked}
              onChange={(event) => setAnswerInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submitAnswer(answerInput);
              }}
              placeholder="Type the answer"
              className="min-w-0 flex-1 rounded-full border border-indigo-200 bg-white px-6 py-3 text-lg text-slate-800 shadow-md outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
            <button
              disabled={!selectedPerson || !answerInput.trim() || locked}
              onClick={() => submitAnswer(answerInput)}
              className="rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-600 px-6 py-3 text-lg font-bold text-white shadow-md disabled:cursor-not-allowed disabled:bg-slate-200 disabled:bg-none disabled:text-slate-400"
            >
              Submit Answer
            </button>
          </div>
        )}

        <button
          onClick={onNext}
          className={`rounded-full px-6 py-3 text-lg font-semibold shadow-md transition hover:-translate-y-0.5 ${
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
