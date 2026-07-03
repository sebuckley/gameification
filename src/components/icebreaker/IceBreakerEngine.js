import { useState, useMemo } from "react";

export function useIceBreakerEngine(iceBreaker, participants) {
  const [currentIndex, setCurrentIndex] = useState(null); // index of participant
  const [phase, setPhase] = useState("idle"); 
  // idle → selecting → answering → reveal → complete

  const [answer, setAnswer] = useState(null); // choice, text, etc.
  const [randomPrompt, setRandomPrompt] = useState(null);

  // Guard against a null/undefined iceBreaker
  const isRandom = !!iceBreaker && iceBreaker.type === "random";
  const isChoice = !!iceBreaker && iceBreaker.type === "choice";
  const isReveal = !!iceBreaker && iceBreaker.type === "reveal";
  const isPerformance = !!iceBreaker && iceBreaker.type === "performance";
  const isSimple = !!iceBreaker && iceBreaker.type === "simple";

  const orderedParticipants = useMemo(() => {
    // randomize once at start
    return [...participants].sort(() => Math.random() - 0.5);
  }, [participants]);

  const currentParticipant = 
    currentIndex !== null ? orderedParticipants[currentIndex] : null;

  // -----------------------------
  // STATE MACHINE TRANSITIONS
  // -----------------------------

  function startSession() {
    setPhase("selecting");
    setCurrentIndex(0);
    if (isRandom) {
      setRandomPrompt(getRandomPrompt());
    }
  }

  function getRandomPrompt() {
    const list = (iceBreaker && iceBreaker.options) || [];
    if (!list.length) return null;
    return list[Math.floor(Math.random() * list.length)];
  }

  function beginAnswer() {
    setPhase("answering");
    if (isRandom) {
      setRandomPrompt(getRandomPrompt());
    }
  }

  function submitAnswer(value) {
    setAnswer(value);

    if (isChoice || isReveal) {
      setPhase("reveal");
    } else {
      nextParticipant();
    }
  }

  function skipToNext() {
    setAnswer(null);
    nextParticipant();
  }

  function nextParticipant() {
    const next = (currentIndex || 0) + 1;

    if (next >= orderedParticipants.length) {
      // mark complete and clear current index so UI stops showing a participant
      setPhase("complete");
      setCurrentIndex(null);
      return;
    }

    setCurrentIndex(next);
    setAnswer(null);

    if (isRandom) {
      setRandomPrompt(getRandomPrompt());
    }

    setPhase("selecting");
  }

  function finishReveal() {
    nextParticipant();
  }

  function endSession() {
    setPhase("complete");
  }

  return {
    phase,
    currentParticipant,
    currentIndex,
    totalParticipants: orderedParticipants.length,
    answer,
    randomPrompt,

    isRandom,
    isChoice,
    isReveal,
    isPerformance,
    isSimple,

    startSession,
    beginAnswer,
    submitAnswer,
    skipToNext,
    finishReveal,
    endSession
  };
}
