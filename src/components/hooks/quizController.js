import { useEffect, useCallback, useState } from "react";

export default function useQuizController({
  quizMode,
  cycle,
  nextQuestion,
  index,
  questions,
  showAnswer,
  revealAnswer,
  resetAnswer
}) {
  const isRevealMode =
    (quizMode === "standard" || quizMode === "media") &&
    cycle === 2;

  const canProgress = isRevealMode ? showAnswer : true;

  const progress = useCallback(() => {
    if (!canProgress) return;

    resetAnswer();
    nextQuestion();   // StandardQuizEngine handles cycle logic
  }, [canProgress, nextQuestion, resetAnswer]);

const presenterProgress = useCallback(() => {
  resetAnswer();

  const isLast = index === questions.length - 1;

  if (isLast && cycle === 1) {
    nextQuestion("cycle2");
    return;
  }

  if (isLast && cycle === 2) {
    nextQuestion("finish");
    return;
  }

  nextQuestion();
}, [index, cycle, nextQuestion, resetAnswer, questions]);

  return {
    showAnswer,
    revealAnswer,
    canProgress,
    progress,
    presenterProgress,
    isRevealMode,
  };
}
