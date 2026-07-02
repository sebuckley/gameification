import { useState, useEffect } from "react";
import usePeople from "../../store/usePeopleStore";
import confetti from "canvas-confetti";

import StandardQuizPointsQuestion from "./StandardQuestionPointsQuiz";

export default function StandardQuizPointsEngine({
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
    setAttempted([]); // reset attempts for new question
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
          finishQuestion();
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

  const finishQuestion = () => {
    // close all modals
    setShowWrongModal(false);
    setWrongCountdownActive(false);
    setWrongPerson(null);

    setShowAnswerModal(false);
    setModalCorrectPerson(null);

    nextQuestion();
  };

  const handleCorrect = (personId) => {
    if (attempted.includes(personId)) return;

    const person = quizPeople.find((p) => p.id === personId);
    setModalCorrectPerson(person);

    applyQuizResult(personId, true);
    triggerConfetti();

    setAttempted((prev) => [...prev, personId]);

    // show correct modal
    setShowWrongModal(false);
    setWrongCountdownActive(false);
    setWrongPerson(null);
    setShowAnswerModal(true);

    // auto‑advance after modal closes
    setTimeout(() => {
      finishQuestion();
    }, 1500);
  };

  const handleWrong = (personId) => {
    if (attempted.includes(personId)) return;

    const person = quizPeople.find((p) => p.id === personId);
    setWrongPerson(person);

    applyQuizResult(personId, false);

    const newAttempted = [...attempted, personId];
    setAttempted(newAttempted);

    // everyone has attempted → finish question
    if (newAttempted.length === quizPeople.length) {
      penaliseRemaining();
      setModalCorrectPerson(null);
      setShowWrongModal(false);
      setWrongCountdownActive(false);
      setShowAnswerModal(true);

      setTimeout(() => {
        finishQuestion();
      }, 1500);
      return;
    }

    // otherwise show wrong modal + countdown
    setShowWrongModal(true);
    setWrongCountdownActive(true);
  };

  const handleNoOneAnswered = () => {
    penaliseRemaining();
    finishQuestion();
  };

  const handleClearWrongModal = () => {
    setShowWrongModal(false);
    setWrongCountdownActive(false);
    setWrongPerson(null);
  };

  return (
    <StandardQuizPointsQuestion
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
