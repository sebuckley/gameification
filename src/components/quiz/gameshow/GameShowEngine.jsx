import React, { useState } from "react";
import GameShowQuestion from "./GameShowQuestion";
import usePeople from "../../store/usePeopleStore";


export default function GameShowEngine({
  currentQuestion,
  index,
  questions,
  nextQuestion,
  quizPeople,
  
}) {

  const [lastAnswer, setLastAnswer] = useState(null);
  const { applyQuizResult } = usePeople();

  const handleAnswer = (option, personId, correct) => {
    applyQuizResult(personId, correct);
  };

  return (
    <GameShowQuestion
      index={index}
      total={questions.length}
      currentQuestion={currentQuestion}
      quizPeople={quizPeople}
      onAnswer={handleAnswer}
      onNext={nextQuestion}
    />
  );
}
