import React from "react";
import MediaQuizQuestion from "./GameShowQuestion";
import usePeople from "../../store/usePeopleStore";


export default function GameShowEngine({
  currentQuestion,
  index,
  questions,
  nextQuestion,
  quizPeople,
  
}) {

  const { applyQuizResult } = usePeople();

  const handleAnswer = (option, personId, correct) => {
    applyQuizResult(personId, correct);
  };

  return (
    <MediaQuizQuestion
      index={index}
      total={questions.length}
      currentQuestion={currentQuestion}
      quizPeople={quizPeople}
      onAnswer={handleAnswer}
      onNext={nextQuestion}
    />
  );
}
