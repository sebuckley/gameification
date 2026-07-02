import { useEffect } from "react";
import StandardQuizQuestion from "./StandardQuestionQuiz";

export default function StandardQuizEngine({
  currentQuestion,
  index,
  questions,
  nextQuestion,
  cycle        // 1 = question cycle, 2 = reveal cycle
}) {

  const isRevealMode = cycle === 2;

  // ⭐ Reset any per-question UI state when question changes
  useEffect(() => {
    // Nothing needed now, but keep the hook for future expansion
  }, [index, cycle]);

  // ⭐ Cycle + finish logic only
  const advanceQuestion = () => {
    const isLast = index === questions.length - 1;

    // Last question → move from cycle 1 → cycle 2
    if (isLast && cycle === 1) {
      nextQuestion("cycle2");
      return;
    }

    // Last question → cycle 2 → finish
    if (isLast && cycle === 2) {
      nextQuestion("finish");
      return;
    }

    // Normal next question
    nextQuestion();
  };

  return (
    <StandardQuizQuestion
      index={index}
      currentQuestion={currentQuestion}
      isRevealMode={isRevealMode}
      nextQuestion={advanceQuestion}
    />
  );
}
