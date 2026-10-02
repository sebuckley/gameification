import { useEffect } from "react";
import StandardQuizQuestion from "./StandardQuestionQuiz";

export default function StandardQuizEngine({
  currentQuestion,
  index,
  questions,
  nextQuestion,
  cycle,     // 1 = question cycle, 2 = reveal cycle
  showAnswer,
  revealAnswer,
  resetAnswer,
}) {

  console.log("Quiz engine", index, cycle);
  const isLastQuestion = index === questions.length - 1;

  const isRevealMode = cycle === 2;

  // ⭐ Reset any per-question UI state when question changes
  useEffect(() => {
    // Reset the answer visibility whenever the question or cycle changes

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
      cycle={cycle}
      nextQuestion={advanceQuestion}
      isLastQuestion={isLastQuestion}
      showAnswer={showAnswer}
      revealAnswer={revealAnswer}
      resetAnswer={resetAnswer}
    />
  );
}
