import React from "react";
import PersonBadge from "../shared/PersonBadge";

export default function CorrectAnswerModal({
  show,
  answer,
  modalCorrectPerson,
  onNext
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-150 min-w-[500px] space-y-4 border">

        <h3 className="text-xl font-bold text-center">Answer</h3>

        <div className="text-center text-lg font-semibold">
          {answer}
        </div>

        {modalCorrectPerson && (
          <div className="space-y-3">
            <PersonBadge person={modalCorrectPerson} />
            <div className="text-center text-green-700 font-medium">
              Got it right!
            </div>
          </div>
        )}

        {!modalCorrectPerson && (
          <div className="text-center text-red-700 font-medium">
            Everyone got it wrong — remaining players lost 1 point.
          </div>
        )}

        <button
          onClick={onNext}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Next Question
        </button>
      </div>
    </div>
  );
}
