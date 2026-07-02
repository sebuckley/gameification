import React, { useEffect, useState } from "react";

export default function StandardQuizQuestion({
  index,
  currentQuestion,
  isRevealMode,
  nextQuestion
}) {

  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    setShowAnswer(false);
  }, [currentQuestion]);

  if (!currentQuestion) return null;

  const questionText =
    currentQuestion.question ||
    currentQuestion.questionText ||
    currentQuestion.text;

  return (
    <div className="w-full h-full flex flex-col items-center justify-start gap-6">

      {/* ⭐ BUTTONS AT TOP — stable, no jumping */}
      <div className="flex gap-4">

        {/* Reveal Answer (only cycle 2) */}
        {isRevealMode && (
          <button
            onClick={() => setShowAnswer(true)}
            className="
              px-6 py-3 
              bg-indigo-700 
              text-white 
              rounded-lg 
              text-lg 
              font-semibold 
              hover:bg-indigo-800 
              transition 
              shadow
            "
          >
            Reveal Answer →
          </button>
        )}

        {/* Next Question — secondary */}
        <button
          onClick={nextQuestion}
          className={`
            px-6 py-3 
            rounded-lg 
            text-lg 
            font-medium 
            transition 
            shadow
            ${showAnswer 
              ? "bg-gray-700 text-white hover:bg-gray-800" 
              : "bg-gray-300 text-gray-800 hover:bg-gray-400"}
          `}
        >
          Next Question →
        </button>
      </div>

      {/* ⭐ FIXED HEIGHT QUESTION BOX — no movement */}
      <div
        className="
          w-full max-w-4xl mx-auto bg-indigo-600 text-white rounded-xl shadow-xl
          border border-indigo-700 p-8
          flex flex-col items-center justify-between
          h-56 md:h-64 lg:h-72
        "
      >
        {/* Q NUMBER — FIXED POSITION */}
        <div className="text-sm font-semibold opacity-80">
          Q{index + 1}
        </div>

        {/* Centered question text */}
        <p className="text-3xl font-extrabold leading-snug text-center drop-shadow px-4">
          {questionText}
        </p>

        {/* Spacer to keep layout stable */}
        <div className="h-6"></div>
      </div>

      {/* ⭐ Animated Answer Under Question */}
      {isRevealMode && showAnswer && (
        <div
          className="
            w-full max-w-4xl mx-auto text-center text-3xl font-bold text-indigo-700
            animate-[fadeIn_0.7s_ease-out,slideUp_0.7s_ease-out]
          "
        >
          {currentQuestion.answer}
        </div>
      )}
    </div>
  );
}
