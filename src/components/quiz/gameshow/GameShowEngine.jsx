import React, { useState } from "react";
import GameShowQuestion from "./GameShowQuestion";

export default function GameShowEngine({
  currentQuestion,
  index,
  questions,
  nextQuestion
}) {
  const [lastAnswer, setLastAnswer] = useState(null);

  const handleAnswer = (option) => {
    setLastAnswer(option);
    // you can add scoring or logging here if you want
  };

  return (
    <GameShowQuestion
      index={index}
      total={questions.length}
      currentQuestion={currentQuestion}
      onAnswer={handleAnswer}
      onNext={nextQuestion}  
    />
  );
}
