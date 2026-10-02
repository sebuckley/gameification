import React from "react";
import MediaQuizQuestion from "./MediaQuestion";
import usePeople from "../../store/usePeopleStore";

export default function MediaEngine({
  currentQuestion,
  index,
  questions,
  nextQuestion,
  quizPeople,
  quizSettings
}) {
  const { applyQuizResult } = usePeople();

  const handleAnswer = (option, personId, correct) => {
    const noAnswerPenalty = option == null && !correct && quizSettings.noOneAnsweredPenalty === "remove"
      ? quizSettings.noOneAnsweredPoints
      : undefined;
    applyQuizResult(personId, correct, quizSettings, currentQuestion, noAnswerPenalty);
  };

  return (
    <MediaQuizQuestion
      index={index}
      total={questions.length}
      currentQuestion={currentQuestion}
      quizPeople={quizPeople}
      quizSettings={quizSettings}
      onAnswer={handleAnswer}
      onNext={nextQuestion}
    />
  );
}
