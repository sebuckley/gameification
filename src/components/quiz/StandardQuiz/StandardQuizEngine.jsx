import { useState, useEffect } from "react";
import usePeople from "../../store/usePeopleStore";
import confetti from "canvas-confetti";

import StandardQuizQuestion from "./StandardQuestionQuiz";

export default function StandardQuizEngine({
  currentQuestion,
  index,
  questions,
  quizPeople,
  nextQuestion
}) {
  const { applyQuizResult } = usePeople();

  const [timer, setTimer] = useState(0);
  const [attempted, setAttempted] = useState([]);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [modalCorrectPerson, setModalCorrectPerson] = useState(null);

  const [showWrongModal, setShowWrongModal] = useState(false);
  const [wrongTimer, setWrongTimer] = useState(60);
  const [wrongCountdownActive, setWrongCountdownActive] = useState(false);
  const [wrongPerson, setWrongPerson] = useState(null);

  /* TIMER */
  useEffect(() => {
    setTimer(0);
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [index]);

  /* WRONG COUNTDOWN */
  useEffect(() => {
    if (!wrongCountdownActive) return;
    setWrongTimer(60);

    const interval = setInterval(() => {
      setWrongTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          penaliseRemaining();
          setWrongCountdownActive(false);
          setShowWrongModal(false);
          nextQuestion();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [wrongCountdownActive]);

  const triggerConfetti = () => {
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
  };

  const penaliseRemaining = () => {
    quizPeople.forEach((p) => {
      if (!attempted.includes(p.id)) {
        applyQuizResult(p.id, false);
      }
    });
  };

  const handleCorrect = (personId) => {
    if (attempted.includes(personId)) return;

    const person = quizPeople.find((p) => p.id === personId);
    setModalCorrectPerson(person);

    applyQuizResult(personId, true);
    triggerConfetti();

    setAttempted((prev) => [...prev, personId]);
    setShowWrongModal(false);
    setWrongCountdownActive(false);
    setWrongPerson(null);
    setShowAnswerModal(true);
  };

  const handleWrong = (personId) => {
    if (attempted.includes(personId)) return;

    const person = quizPeople.find((p) => p.id === personId);
    setWrongPerson(person);

    applyQuizResult(personId, false);

    const newAttempted = [...attempted, personId];
    setAttempted(newAttempted);

    if (newAttempted.length === quizPeople.length) {
      setModalCorrectPerson(null);
      setShowWrongModal(false);
      setWrongCountdownActive(false);
      setShowAnswerModal(true);
      return;
    }

    setShowWrongModal(true);
    setWrongCountdownActive(true);
  };

  const handleNoOneAnswered = () => {
    penaliseRemaining();
    setShowWrongModal(false);
    setWrongCountdownActive(false);
    nextQuestion();
  };

  const handleClearWrongModal = () => {
    setShowWrongModal(false);
    setWrongCountdownActive(false);
    setWrongPerson(null);
  };

  return (
    <StandardQuizQuestion
      timer={timer}
      index={index}
      total={questions.length}
      currentQuestion={currentQuestion}
      quizPeople={quizPeople}
      attempted={attempted}
      showAnswerModal={showAnswerModal}
      showWrongModal={showWrongModal}
      wrongTimer={wrongTimer}
      wrongPerson={wrongPerson}
      modalCorrectPerson={modalCorrectPerson}
      handleCorrect={handleCorrect}
      handleWrong={handleWrong}
      handleNoOneAnswered={handleNoOneAnswered}
      handleClearWrongModal={handleClearWrongModal}
      nextQuestion={nextQuestion}
    />
  );
}
