import { useIceBreakerEngine } from "./useIceBreakerEngine";

export default function IceBreakerFullScreen({ iceBreaker, participants }) {
  const engine = useIceBreakerEngine(iceBreaker, participants);

  const {
    phase,
    currentParticipant,
    randomPrompt,
    isChoice,
    isRandom,
    isReveal,
    isPerformance,
    isSimple,
    beginAnswer,
    submitAnswer,
    finishReveal,
    startSession,
    endSession
  } = engine;

  if (phase === "idle") {
    return (
      <FullScreen>
        <button onClick={startSession}>Start Ice Breaker</button>
      </FullScreen>
    );
  }

  if (phase === "selecting") {
    return (
      <FullScreen>
        <ParticipantBubble participant={currentParticipant} />
        <Prompt text={isRandom ? randomPrompt : iceBreaker.prompt} />
        <button onClick={beginAnswer}>Begin</button>
      </FullScreen>
    );
  }

  if (phase === "answering") {
    return (
      <FullScreen>
        <ParticipantBubble participant={currentParticipant} />
        <Prompt text={isRandom ? randomPrompt : iceBreaker.prompt} />

        {isChoice && (
          <ChoiceList
            options={iceBreaker.options}
            onSelect={submitAnswer}
          />
        )}

        {isSimple && (
          <TextInput onSubmit={submitAnswer} />
        )}

        {isRandom && (
          <TextInput onSubmit={submitAnswer} />
        )}

        {isPerformance && (
          <button onClick={() => submitAnswer("done")}>
            Next Person
          </button>
        )}
      </FullScreen>
    );
  }

  if (phase === "reveal") {
    return (
      <FullScreen>
        <ParticipantBubble participant={currentParticipant} />
        <Prompt text="Reveal Time!" />
        <RevealPanel answer={engine.answer} />
        <button onClick={finishReveal}>Next</button>
      </FullScreen>
    );
  }

  if (phase === "complete") {
    return (
      <FullScreen>
        <h1>Session Complete</h1>
        <button onClick={endSession}>Close</button>
      </FullScreen>
    );
  }
}
