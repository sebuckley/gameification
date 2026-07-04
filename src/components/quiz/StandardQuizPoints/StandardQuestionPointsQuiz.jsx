import React from "react";
import PersonBadge from "../shared/PersonBadge";
import CorrectAnswerModal from "../shared/CorrectAnswerModal";
import WrongAnswerModal from "../shared/WrongAnswerModal";

export default function StandardQuizPointsQuestion({
  timer,
  index,
  total,
  currentQuestion,
  quizPeople,
  attempted,
  showAnswerModal,
  showWrongModal,
  wrongTimer,
  wrongPerson,
  modalCorrectPerson,
  handleCorrect,
  handleWrong,
  handleNoOneAnswered,
  handleClearWrongModal,
  nextQuestion
}) {
  if (!currentQuestion) return null;

  return (
    <div className="w-full p-2 sm:p-3 md:p-4 space-y-4">

      {/* Timer + Question Count */}
      <div className="flex justify-between items-center text-sm font-medium text-gray-600">
        <span>Time: {timer}s</span>
        <span>Question {index + 1} of {total}</span>
      </div>

      {/* Question */}
      <div className="text-lg font-semibold">
        {currentQuestion.question}
      </div>

      {/* Player Buttons */}
      {!showAnswerModal && (
        <div className="space-y-2">
          {quizPeople.map((p) => {
            const disabled = attempted.includes(p.id);

            const initials = (p.fullName || p.preferredName)
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            return (
              <div
                key={p.id}
                className="flex items-center justify-between p-2 bg-white rounded border"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow"
                    style={{
                      backgroundColor: p.color,
                      border: `2px solid ${p.color}`
                    }}
                  >
                    {initials}
                  </div>

                  <span className="font-medium">
                    {p.preferredName || p.fullName}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    disabled={disabled}
                    onClick={() => handleCorrect(p.id)}
                    className={`px-3 py-1 rounded text-white ${
                      disabled
                        ? "bg-green-300 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    Correct
                  </button>

                  <button
                    disabled={disabled}
                    onClick={() => handleWrong(p.id)}
                    className={`px-3 py-1 rounded text-white ${
                      disabled
                        ? "bg-red-300 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    Buzz ❌
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No One Answered */}
      {!showAnswerModal && !showWrongModal && (
        <button
          onClick={handleNoOneAnswered}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 w-full"
        >
          No One Answered
        </button>
      )}

      {/* MODALS */}
      <CorrectAnswerModal
        show={showAnswerModal}
        answer={currentQuestion.answer}
        modalCorrectPerson={modalCorrectPerson}
        onNext={nextQuestion}
      />
      
      <WrongAnswerModal
        show={showWrongModal}
        wrongPerson={wrongPerson}
        wrongTimer={wrongTimer}
        onClear={handleClearWrongModal}
        onNoOneAnswered={handleNoOneAnswered}
      />
    </div>
  );
}
