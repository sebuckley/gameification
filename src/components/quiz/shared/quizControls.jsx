export default function QuizControls({
  index,
  total,
  showAnswer,
  revealAnswer,
  canProgress,
  progress,
  answer,
  isRevealMode,
  alwaysShowAnswer = false
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 text-white p-4 flex items-center justify-between shadow-lg">

      {/* Question Counter */}
      <div className="text-lg font-bold">
        Q{index + 1} / {total}
      </div>

      {/* Answer Display */}
      {(isRevealMode || alwaysShowAnswer) && (
        <div className="flex-1 text-center">
          {showAnswer || alwaysShowAnswer ? (
            <span className="text-2xl font-black">{answer}</span>
          ) : (
            <span className="text-slate-500">Press R to reveal</span>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        {isRevealMode && (
          <button
            onClick={revealAnswer}
            className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700"
          >
            Reveal
          </button>
        )}

        <button
          onClick={progress}
          disabled={!canProgress}
          className={`
            px-4 py-2 rounded
            ${canProgress ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-600 cursor-not-allowed"}
          `}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
