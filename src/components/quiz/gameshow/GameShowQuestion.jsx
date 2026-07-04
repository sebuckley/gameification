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

  const handleSelectOption = (option) => {
    if (locked || !selectedPerson) return;

    setSelectedOption(option);
    setLocked(true);

    const correct = option === currentQuestion.answer;
    const personObj = quizPeople.find((p) => p.id === selectedPerson);

    onAnswer(option, selectedPerson, correct);

    if (correct) {
      setModalCorrectPerson(personObj);
      setShowCorrectModal(true);
    } else {
      setModalWrongPerson(personObj);
      setShowWrongModal(true);
    }
  };

  const getButtonStyle = (option) => {
    if (!locked) return "bg-indigo-600 hover:bg-indigo-700";

    if (option === currentQuestion.answer) return "bg-green-600 animate-pulse";
    if (option === selectedOption) return "bg-red-600";
    return "bg-gray-400 opacity-50";
  };

  return (
    <div className="w-full space-y-6 md:space-y-8 text-center">

      {/* Question Count */}
      <div className="text-sm font-medium text-gray-600">
        Question {index + 1} of {total}
      </div>

      {/* FIXED SIZE QUESTION BOX */}
      <div
        className="
          bg-indigo-600 
          text-white 
          rounded-xl 
          shadow-xl 
          p-6 
          overflow-y-auto
          flex
          items-center
          justify-center
          w-full
          h-24 sm:h-28 md:h-32 lg:h-36
        "
      >
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-snug text-center w-full">
          {currentQuestion.question}
        </h2>
      </div>

      {/* PLAYER SELECTOR */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
        {quizPeople.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPerson(p.id)}
            className={`
              p-3 rounded-lg shadow text-white font-semibold
              transition-all duration-300
              ${selectedPerson === p.id ? "bg-green-600" : "bg-gray-700 hover:bg-gray-800"}
            `}
          >
            {p.preferredName || p.fullName}
          </button>
        ))}
      </div>

      {/* OPTIONS */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
        {shuffledOptions.map((option, i) => (
          <button
            key={i}
            disabled={!selectedPerson}
            onClick={() => handleSelectOption(option)}
            className={`
              text-white text-xl font-semibold py-6 rounded-xl shadow-lg 
              transform transition-all duration-300 
              ${getButtonStyle(option)}
              ${!locked ? "hover:scale-105" : ""}
              ${!selectedPerson ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Manual Skip */}
      <button
        onClick={onNext}
        className="mt-6 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
      >
        Next Question Now
      </button>

      {/* CORRECT MODAL */}
      <CorrectAnswerModal
        show={showCorrectModal}
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
  );
}
