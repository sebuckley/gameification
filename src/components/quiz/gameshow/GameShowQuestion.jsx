import React, { useState, useEffect } from "react";

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

  console.log(quizPeople)
  // Reset state when question changes
  useEffect(() => {
    setSelectedPerson(null);
    setSelectedOption(null);
    setLocked(false);
  }, [index, currentQuestion]);

  if (!currentQuestion) return null;

  const handleSelectOption = (option) => {
    if (locked || !selectedPerson) return;

    setSelectedOption(option);
    setLocked(true);

    // Pass both the option and the person answering
    const correct = option === currentQuestion.answer;
    onAnswer(option, selectedPerson, correct);

    // Auto‑advance after reveal
    setTimeout(() => {
      onNext();
    }, 1200);
  };

  const getButtonStyle = (option) => {
    if (!locked) return "bg-indigo-600 hover:bg-indigo-700";

    if (option === currentQuestion.answer) return "bg-green-600 animate-pulse";
    if (option === selectedOption) return "bg-red-600";
    return "bg-gray-400 opacity-50";
  };

  return (
    <div className="space-y-6 text-center">

      {/* Question Count */}
      <div className="text-sm font-medium text-gray-600">
        Question {index + 1} of {total}
      </div>

      {/* Question */}
      <h2 className="text-3xl font-bold text-gray-800 animate-fade-in">
        {currentQuestion.question}
      </h2>

      {/* PLAYER SELECTOR */}
      <div className="max-w-xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
        {currentQuestion.options.map((option, i) => (
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

      {/* Reveal */}
      {locked && (
        <div className="text-2xl font-bold mt-4 animate-fade-in">
          {selectedOption === currentQuestion.answer ? (
            <span className="text-green-600">Correct!</span>
          ) : (
            <span className="text-red-600">Wrong!</span>
          )}
        </div>
      )}
    </div>
  );
}
