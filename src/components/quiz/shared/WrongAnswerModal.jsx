import React from "react";
import PersonBadge from "./PersonBadge";
import CountdownRing from "./CountdownRing";
import usePeople from "../../store/usePeopleStore";

export default function WrongAnswerModal({
  show,
  wrongPerson,
  wrongTimer,
  onClear,
  onNoOneAnswered
}) {

    // ⭐ Get quiz mode directly
  const { quizMode } = usePeople();
  if (!show) return null;



  const isGameShow = quizMode === "gameshow";
  const isStandardMode = !isGameShow;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-96 min-w-[500px] space-y-4 border">

        <h3 className="text-xl font-bold text-center">Wrong Answer</h3>

        {/* ⭐ GAMESHOW MODE */}
        {isGameShow && (
          <>
            {/* Big red X */}
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

            {/* Next Question */}
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
            {/* Person who answered incorrectly */}
            {wrongPerson && (
              <div className="space-y-3">
                <PersonBadge person={wrongPerson} />
                <div className="text-center text-red-700 font-medium">
                  Answered incorrectly
                </div>
              </div>
            )}

            {/* Countdown */}
            <div className="flex justify-center">
              <CountdownRing time={wrongTimer} total={60} />
            </div>

            {/* Penalty text */}
            <div className="text-center text-gray-600">
              If nobody answers correctly before the timer ends,<br />
              <strong>everyone who hasn&apos;t answered will lose 1 point.</strong>
            </div>

            {/* Buttons */}
            <button
              onClick={onClear}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Continue – Next Player
            </button>

            <button
              onClick={onNoOneAnswered}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 mt-2"
            >
              No One Answered
            </button>
          </>
        )}
      </div>
    </div>
  );
}
