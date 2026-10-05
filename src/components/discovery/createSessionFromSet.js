import useDiscoveryStore from "../store/useDiscoveryStore";

// Each agenda item gets its own interview "response" object built from the set,
// so linking the same set to another item never copies or alters the set itself.
export function createSessionFromSet(setId, stakeholder, role) {
  const { discoveryQuestionSets, addInterview, addInterviewQuestion } = useDiscoveryStore.getState();
  const set = discoveryQuestionSets.find((s) => s.id === setId);
  if (!set) return null;
  const interviewId = addInterview({ stakeholder, role });
  for (const q of set.questions) {
    addInterviewQuestion(interviewId, { question: q.question, templateId: q.templateId });
  }
  return interviewId;
}
