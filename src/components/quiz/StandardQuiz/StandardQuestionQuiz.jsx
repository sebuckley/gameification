import React, { useEffect, useState } from "react";

export default function StandardQuizQuestion({
  index,
  currentQuestion,
  isRevealMode,
  nextQuestion,
  isLastQuestion = false
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

  const actionLabel = isLastQuestion ? "Finish Quiz" : "Next Question";

  return (
    <div className="flex min-h-[calc(100vh-160px)] w-full items-center justify-center px-4 py-6">
      <div className="flex w-full max-w-5xl flex-col items-center justify-center gap-6 text-center">
        <div className="flex min-h-[180px] w-full max-w-4xl items-center justify-center rounded-[28px] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-8 text-white shadow-[0_30px_70px_rgba(76,29,149,0.35)] ring-1 ring-white/20 sm:min-h-[210px] md:min-h-[240px]">
          <div className="w-full">
            <div className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-indigo-100">
              Q{index + 1}
            </div>

            <p className="text-2xl font-black leading-tight sm:text-2xl md:text-4xl">
              {questionText}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
          {isRevealMode && (
            <button
              onClick={() => setShowAnswer(true)}
              className="rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-600 px-6 py-3 text-lg font-bold text-white shadow-[0_12px_25px_rgba(109,40,217,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_35px_rgba(109,40,217,0.45)]"
            >
              Reveal Answer ✨
            </button>
          )}

          <button
            onClick={nextQuestion}
            className={`rounded-full px-6 py-3 text-lg font-semibold shadow-md transition hover:-translate-y-0.5 ${
              showAnswer
                ? "bg-slate-800 text-white hover:bg-slate-900"
                : "bg-slate-200 text-slate-800 hover:bg-slate-300"
            }`}
          >
            {actionLabel} →
          </button>
        </div>

        {isLastQuestion && isRevealMode && showAnswer && (
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2 text-sm font-bold uppercase tracking-[0.22em] text-emerald-700">
            Quiz ended
          </div>
        )}

        <div
          className={`relative w-full max-w-4xl overflow-hidden rounded-[28px] border border-indigo-200 bg-white p-8 text-indigo-700 shadow-[0_30px_80px_rgba(79,70,229,0.18)] ring-1 ring-indigo-100 transition-all duration-200 ${
            isRevealMode && showAnswer ? "opacity-100 visible min-h-[180px] sm:min-h-[210px] md:min-h-[240px] flex items-center justify-center flex-col  gap-5" : "invisible min-h-[180px] opacity-0 sm:min-h-[210px] md:min-h-[240px]"
          }`}
        >
        

          <div>
   
            <div className="text-xs font-bold uppercase tracking-[0.4em] text-indigo-500">
              {isRevealMode && showAnswer ? "Answer" : ""}
            </div>
            <div className={`text-2xl font-black leading-snug sm:text-3xl md:text-5xl ${isRevealMode && showAnswer ? "animate-[pulse_1.5s_ease-in-out_infinite] text-slate-900" : "text-transparent"}`}>
              {currentQuestion.answer}
            </div>
     
          </div>
        </div>
      </div>
    </div>
  );
}
