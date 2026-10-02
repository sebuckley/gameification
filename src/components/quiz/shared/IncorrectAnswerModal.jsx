import React, { useEffect } from "react";
import confetti from "canvas-confetti";

export default function IncorrectAnswerModal({
  show,
  answer,
  onNext
}) {
  // 🔥 Fire a red "error burst" when modal becomes visible
  useEffect(() => {
    if (show) {
      confetti({
        particleCount: 80,
        spread: 70,
        startVelocity: 40,
        origin: { y: 0.6 },
        colors: ["#ff0000", "#b30000", "#ff4d4d"], // red tones
        scalar: 1.2
      });

      // 💥 Add a quick shake effect
      const modal = document.getElementById("incorrect-modal");
      if (modal) {
        modal.classList.add("animate-shake");
        setTimeout(() => modal.classList.remove("animate-shake"), 600);
      }
    }
  }, [show]);

  if (!show) return null;

  return (
    <div data-controller-modal="answer-reveal" className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div
        id="incorrect-modal"
        className="
          bg-white rounded-xl shadow-lg p-6 w-150 min-w-[500px] space-y-4 border
          border-red-600
        "
      >

        <h3 className="text-xl font-bold text-center text-red-700">
          Nobody got it right!
        </h3>

        <div className="text-center text-lg font-semibold text-gray-800">
          The correct answer was:
        </div>

        <div className="text-center text-2xl font-bold text-red-600">
          {answer}
        </div>

        <button
          data-controller-action="advance"
          onClick={onNext}
          className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Next Question
        </button>
      </div>

      {/* Shake animation */}
      <style>
        {`
          .animate-shake {
            animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
          }

          @keyframes shake {
            10%, 90% { transform: translateX(-1px); }
            20%, 80% { transform: translateX(2px); }
            30%, 50%, 70% { transform: translateX(-4px); }
            40%, 60% { transform: translateX(4px); }
          }
        `}
      </style>
    </div>
  );
}
