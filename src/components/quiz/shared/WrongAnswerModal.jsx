import React, { useEffect } from "react";
import PersonBadge from "./PersonBadge";
import CountdownRing from "./CountdownRing";
import usePeople from "../../store/usePeopleStore";
import { useState } from "react";
import confetti from "canvas-confetti";

export default function WrongAnswerModal({
  show,
  setShowWrongModal,
  setLocked,
  wrongPerson,
  wrongTimer,
  setWrongTimer,
  onClear,
  onNoOneAnswered
}) {

  const { quizMode } = usePeople();
  const isGameShow = quizMode === "gameshow";
  const isStandardMode = !isGameShow;



  // 🎯 Trigger a red “incorrect burst” when modal opens
  useEffect(() => {
    if (show) {
      confetti({
        particleCount: 80,
        spread: 70,
        startVelocity: 40,
        origin: { y: 0.6 },
        colors: ["#ff0000", "#b30000", "#ff4d4d"],
        scalar: 1.2
      });

      const modal = document.getElementById("wrong-modal");
      if (modal) {
        modal.classList.add("animate-shake");
        setTimeout(() => modal.classList.remove("animate-shake"), 600);
      }
    }
  }, [show]);

  const answerAgain = () => {
    setShowWrongModal(false);
    setLocked(false);
  };

  useEffect(() => {


  setWrongTimer(60); // reset timer

  const interval = setInterval(() => {
    setWrongTimer((t) => {
      if (t <= 1) {
        clearInterval(interval);
        onNoOneAnswered(); // auto-trigger if timer hits zero
        return 0;
      }
      return t - 1;
    });
  }, 1000);

  return () => clearInterval(interval);
}, []);


  const handleNoOneAnswered = () => {
    setShowWrongModal(false);
    onNoOneAnswered();   // ⭐ This will open your IncorrectAnswerModal
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div
        id="wrong-modal"
        className="
          bg-white rounded-xl shadow-lg p-6 w-96 min-w-[500px] space-y-4 border border-red-600
        "
      >

        <h3 className="text-xl font-bold text-center text-red-700">
          Wrong Answer
        </h3>

        {/* ❌ Big red X for both modes */}
        <div className="text-center text-red-600 text-6xl font-bold">
          ✖
        </div>

        {/* Person who answered incorrectly */}
        {wrongPerson && (
          <div className="space-y-3">
            <PersonBadge person={wrongPerson} />
            <div className="text-center text-red-700 font-medium">
              Answered incorrectly
            </div>
          </div>
        )}

        {/* ⭐ GAMESHOW MODE */}
        {isGameShow && (
          <>
            <button
              onClick={answerAgain}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Answer again
            </button>

            <button
              onClick={onClear}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Next Question
            </button>
          </>
        )}

        {/* ⭐ STANDARD MODE */}
        {isStandardMode && (
          <>
            <div className="flex justify-center">
              <CountdownRing time={wrongTimer} total={60} />
            </div>

            <div className="text-center text-gray-600">
              If nobody answers correctly before the timer ends,<br />
              <strong>everyone who hasn&apos;t answered will lose 1 point.</strong>
            </div>

            <button
              onClick={onClear}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Continue – Next Player
            </button>

            <button
              onClick={handleNoOneAnswered}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 mt-2"
            >
              No One Answered
            </button>
          </>
        )}
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
