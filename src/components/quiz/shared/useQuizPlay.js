import { useEffect, useState } from "react";

const normalizeAnswer = (value) => String(value ?? "").trim().toLowerCase();

// Per-question play state (who is answering, who got it wrong, who got it right) and the
// actions that change it. Shared by the player view and the speaker window controller.
export default function useQuizPlay({ question, resetKey, onAction, onNoOneAnswered }) {
  const [selectedPersonId, setSelectedPersonId] = useState(null);
  const [wrongPlayerIds, setWrongPlayerIds] = useState([]);
  const [correctPlayerId, setCorrectPlayerId] = useState(null);
  const [questionResolved, setQuestionResolved] = useState(false);

  useEffect(() => {
    setSelectedPersonId(null);
    setWrongPlayerIds([]);
    setCorrectPlayerId(null);
    setQuestionResolved(false);
  }, [resetKey, question]);

  const selectPlayer = (playerId) => {
    if (questionResolved || wrongPlayerIds.includes(playerId)) return;
    const selected = onAction({ type: "select-player", playerId });
    setSelectedPersonId(selected ? playerId : null);
  };

  const submitResult = (playerId, result) => {
    if (!playerId || questionResolved || wrongPlayerIds.includes(playerId)) return;
    if (!onAction({ type: "result", playerId, result })) return;
    setSelectedPersonId(null);
    if (result === "correct") {
      setCorrectPlayerId(playerId);
      setQuestionResolved(true);
    } else {
      setWrongPlayerIds((previous) => [...previous, playerId]);
    }
  };

  const submitOption = (option) => {
    if (!selectedPersonId || questionResolved) return;
    const playerId = selectedPersonId;
    if (!onAction({ type: "option", option: String(option), playerId })) return;
    setSelectedPersonId(null);
    if (normalizeAnswer(option) === normalizeAnswer(question?.answer)) {
      setCorrectPlayerId(playerId);
      setQuestionResolved(true);
    } else {
      setWrongPlayerIds((previous) => [...previous, playerId]);
    }
  };

  const handleNoOneAnswered = () => {
    if (questionResolved || onNoOneAnswered({ wrongPlayerIds, correctPlayerId }) === false) return;
    setSelectedPersonId(null);
    setQuestionResolved(true);
  };

  return {
    selectedPersonId,
    wrongPlayerIds,
    correctPlayerId,
    questionResolved,
    selectPlayer,
    submitResult,
    submitOption,
    handleNoOneAnswered,
  };
}
