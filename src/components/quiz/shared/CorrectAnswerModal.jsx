import React, { useEffect } from "react";
import PersonBadge from "./PersonBadge";
import confetti from "canvas-confetti";

export default function CorrectAnswerModal({
  show,
  answer,
  modalCorrectPerson,
  onNext
}) {
  // ⭐ Fire confetti when modal becomes visible
  useEffect(() => {
    if (show) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [show]);

  if (!show) return null;

  const isStandardMode = modalCorrectPerson !== null;

  return (
    <div data-controller-modal="correct-answer" className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-150 min-w-[500px] space-y-6 border animate-pop">

        <h3 className="text-xl font-bold text-center">Correct Answer</h3>

        {/* ⭐ SUPER PROMINENT ANSWER */}
        <div className="
          text-center 
          text-4xl 
          font-extrabold 
          text-green-600 
          drop-shadow-lg 
          py-4
          px-2
          rounded-lg
          bg-green-50
          border border-green-300
        ">
          {answer}
        </div>

        {/* STANDARD MODE: show who got it right */}
        {isStandardMode && (
          <div className="space-y-3">
            <PersonBadge person={modalCorrectPerson} />
            <div className="text-center text-green-700 font-medium">
              Got it right!
            </div>
          </div>
        )}

        {/* GAMESHOW MODE */}
        {!isStandardMode && (
          <div className="text-center text-green-700 font-medium">
            Correct!
          </div>
        )}

        <button
          data-controller-action="advance"
          onClick={onNext}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Next Question
        </button>
      </div>

      {/* ⭐ Pop animation */}
      <style>
        {`
          .animate-pop {
            animation: popIn 0.35s ease-out;
          }

          @keyframes popIn {
            0% { transform: scale(0.85); opacity: 0; }
            60% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
}
