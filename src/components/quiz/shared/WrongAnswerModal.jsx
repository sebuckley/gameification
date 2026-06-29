import React from "react";
import PersonBadge from "./PersonBadge";
import CountdownRing from "./CountdownRing";

export default function WrongAnswerModal({
  show,
  wrongPerson,
  wrongTimer,
  onClear,
  onNoOneAnswered
}) {
  if (!show) return null;

  const isStandardMode = wrongPerson !== null || typeof wrongTimer === "number";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-96 min-w-[500px] space-y-4 border">

        <h3 className="text-xl font-bold text-center">Wrong Answer</h3>

        {/* STANDARD MODE: show person */}
        {isStandardMode && wrongPerson && (
          <div className="space-y-3">
            <PersonBadge person={wrongPerson} />
            <div className="text-center text-red-700 font-medium">
              Answered incorrectly
            </div>
          </div>
        )}

        {/* STANDARD MODE: countdown */}
        {isStandardMode && (
          <div className="flex justify-center">
            <CountdownRing time={wrongTimer} total={60} />
          </div>
        )}

        {/* STANDARD MODE: penalty text */}
        {isStandardMode && (
          <div className="text-center text-gray-600">
            If nobody answers correctly before the timer ends,<br />
            <strong>everyone who hasn&apos;t answered will lose 1 point.</strong>
          </div>
        )}

        {/* STANDARD MODE BUTTONS */}
        {isStandardMode && (
          <>
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

        {/* GAMESHOW MODE: simple wrong modal */}
        {!isStandardMode && (
          <>
            <div className="text-center text-red-700 font-medium">
              Wrong answer!
            </div>

            <button
              onClick={onClear}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Next Question
            </button>
          </>
        )}
      </div>
    </div>
  );
}
