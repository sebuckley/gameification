import React, { useState, useEffect } from "react";

export default function GameShowQuestion({
  index,
  total,
  currentQuestion,
  onAnswer,
  onNext
}) {
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    setSelected(null);
    setLocked(false);
  }, [index, currentQuestion]);

  if (!currentQuestion) return null;

  const handleSelect = (option) => {
    if (locked) return;

    setSelected(option);
    setLocked(true);

    setTimeout(() => {
      onAnswer(option);
      onNext();          // ✅ now guaranteed to be a function
    }, 1200);
  };

  const getButtonStyle = (option) => {
    if (!locked) return "bg-indigo-600 hover:bg-indigo-700";

    if (option === currentQuestion.answer) return "bg-green-600 animate-pulse";
    if (option === selected) return "bg-red-600";
    return "bg-gray-400 opacity-50";
  };

  return (
    <div className="space-y-6 text-center">
      <div className="text-sm font-medium text-gray-600">
        Question {index + 1} of {total}
      </div>

      <h2 className="text-3xl font-bold text-gray-800 animate-fade-in">
        {currentQuestion.question}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
        {currentQuestion.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleSelect(option)}
            className={`
              text-white text-xl font-semibold py-6 rounded-xl shadow-lg 
              transform transition-all duration-300 
              ${getButtonStyle(option)}
              ${!locked ? "hover:scale-105" : ""}
            `}
          >
            {option}
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        className="mt-6 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
      >
        Next Question Now
      </button>

      {locked && (
        <div className="text-2xl font-bold mt-4 animate-fade-in">
          {selected === currentQuestion.answer ? (
            <span className="text-green-600">Correct!</span>
          ) : (
            <span className="text-red-600">Wrong!</span>
          )}
        </div>
      )}
    </div>
  );
}
