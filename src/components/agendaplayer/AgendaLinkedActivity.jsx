import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import usePeopleStore from "../store/usePeopleStore";
import { useIceBreakerEngine } from "../icebreaker/IceBreakerEngine";
import PersonBadge from "../shared/PersonBadge";
import PresenterController from "../quiz/shared/PresenterController";
import PresenterPortal from "../quiz/shared/PresenterPortal";

const normalizeAnswer = (value) => String(value ?? "").trim().toLowerCase();
const formatClock = (totalSeconds) =>
  `${String(Math.floor(totalSeconds / 60)).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}`;
const INITIAL_PLAY_STATE = { selectedPersonId: null, wrongPlayerIds: [], correctPlayerId: null };

// standard: self-monitored (no players). standard-points / gameshow: presenter-run with players.
// Legacy "media" sets are treated as standard because pictures are just question content.
// Gameshow without answer options has nothing to pick, so it runs as standard points.
function resolveAgendaQuizMode(questionSet) {
  const mode = questionSet?.quizMode || "standard";
  if (mode === "media") return "standard";
  if (mode === "gameshow") {
    const hasOptions = (questionSet?.questions || []).some((q) => Array.isArray(q.options) && q.options.filter(Boolean).length > 0);
    return hasOptions ? "gameshow" : "standard-points";
  }
  return mode === "standard-points" ? "standard-points" : "standard";
}
const DIFFICULTY_STYLES = {
  easy: "bg-emerald-100 text-emerald-800",
  medium: "bg-amber-100 text-amber-800",
  hard: "bg-red-100 text-red-800",
};

export const QuizActivity = forwardRef(function QuizActivity({ questionSet, participants, onNavigationChange, speakerWindow, onSpeakerWindowClose, onLeave }, ref) {
  const applyQuizResult = usePeopleStore((state) => state.applyQuizResult);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [resolved, setResolved] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [finished, setFinished] = useState(false);
  const [standardRound, setStandardRound] = useState("questions");
  const [playState, setPlayState] = useState(INITIAL_PLAY_STATE);
  const [quizSeconds, setQuizSeconds] = useState(0);
  const [questionSeconds, setQuestionSeconds] = useState(0);
  const questions = questionSet?.questions || [];
  const mode = resolveAgendaQuizMode(questionSet);
  const isStandardMode = mode === "standard";
  const currentQuestion = questions[questionIndex];
  const options = Array.isArray(currentQuestion?.options) ? currentQuestion.options : [];
  const settings = questionSet?.settings || {};

  useEffect(() => {
    setResolved(false);
    setShowAnswer(false);
    setPlayState(INITIAL_PLAY_STATE);
    setQuestionSeconds(0);
  }, [questionIndex, standardRound]);

  useEffect(() => {
    if (finished) return undefined;
    const timer = window.setInterval(() => {
      setQuizSeconds((value) => value + 1);
      setQuestionSeconds((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [finished]);

  const advance = () => {
    if (!questionSet || !questions.length) return true;
    if (finished) return true;
    if (isStandardMode) {
      if (standardRound === "questions") {
        if (questionIndex + 1 < questions.length) {
          setQuestionIndex((index) => index + 1);
          return false;
        }
        setStandardRound("answers");
        setQuestionIndex(0);
        return false;
      }
      if (!showAnswer) {
        setShowAnswer(true);
        return false;
      }
      if (questionIndex + 1 < questions.length) {
        setQuestionIndex((index) => index + 1);
        return false;
      }
      setFinished(true);
      return false;
    }
    if (!resolved) return false;
    if (questionIndex + 1 < questions.length) {
      setQuestionIndex((index) => index + 1);
      return false;
    }
    setFinished(true);
    return false;
  };

  const previous = () => {
    if (finished) {
      setFinished(false);
      return false;
    }
    if (questionIndex > 0) {
      setQuestionIndex((index) => index - 1);
      return false;
    }
    if (isStandardMode && standardRound === "answers") {
      setStandardRound("questions");
      setQuestionIndex(questions.length - 1);
      setShowAnswer(false);
      return false;
    }
    return true;
  };

  useImperativeHandle(ref, () => ({ advance, previous }), [advance, previous]);

  const nextLabel = finished
    ? "Next agenda section"
    : isStandardMode && standardRound === "questions" && questionIndex === questions.length - 1
      ? "Reveal answers"
      : isStandardMode && standardRound === "answers" && !showAnswer
        ? "Reveal answer"
        : isStandardMode && standardRound === "answers" && questionIndex === questions.length - 1
          ? "Finish quiz"
          : isStandardMode
            ? standardRound === "answers" ? "Next answer" : "Next question"
            : resolved
              ? questionIndex + 1 < questions.length ? "Next question" : "Finish quiz"
              : "Answer or resolve question";

  useEffect(() => {
    onNavigationChange?.({ nextLabel, step: finished ? "finished" : "question" });
  }, [nextLabel, finished, onNavigationChange]);

  const handleControllerAction = (action) => {
    if (action.type === "select-player") return true;

    const isCorrect = action.type === "result"
      ? action.result === "correct"
      : action.type === "option"
        ? normalizeAnswer(action.option) === normalizeAnswer(currentQuestion.answer)
        : null;
    if (isCorrect === null || !action.playerId) return false;

    applyQuizResult(action.playerId, isCorrect, settings, currentQuestion);
    return true;
  };

  const handleNoOneAnswered = ({ wrongPlayerIds = [], correctPlayerId = null } = {}) => {
    if (isStandardMode || settings.allowNoOneAnswered === false || resolved) return false;
    if (settings.noOneAnsweredPenalty === "remove") {
      participants.forEach((person) => {
        if (!wrongPlayerIds.includes(person.id) && person.id !== correctPlayerId) {
          applyQuizResult(person.id, false, settings, currentQuestion, settings.noOneAnsweredPoints);
        }
      });
    }
    setResolved(true);
    return true;
  };

  const handleQuestionResolved = ({ resolved: isResolved }) => setResolved(Boolean(isResolved));

  if (!questionSet) return <ActivityMessage message="The linked quiz set could not be found." />;
  if (!questions.length) return <ActivityMessage message={`“${questionSet.name}” has no questions yet.`} />;

  const cycle = isStandardMode ? (standardRound === "questions" ? 1 : 2) : 1;
  const step = (direction) => {
    const leaveActivity = direction === "next" ? advance() : previous();
    if (leaveActivity) { if (onLeave) onLeave(direction); else window.postMessage({ action: direction === "next" ? "NEXT_SLIDE" : "PREV_SLIDE" }, "*"); }
  };
  const navButtons = (
    <div className="flex shrink-0 gap-2">
      <button type="button" onClick={() => step("prev")} className="rounded border border-slate-300 bg-white px-4 py-2 font-semibold hover:bg-slate-50">Previous</button>
      <button type="button" onClick={() => step("next")} className="rounded bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700">{nextLabel}</button>
    </div>
  );
  const controller = (
    <PresenterController
      embedded
      hideFooter
      alwaysShowAnswer
      index={questionIndex}
      total={questions.length}
      currentQuestion={currentQuestion}
      quizPeople={participants}
      mode={mode}
      activeQuizType={mode}
      cycle={cycle}
      quizElapsed={formatClock(quizSeconds)}
      questionElapsed={formatClock(questionSeconds)}
      nextQuestionPreview={questions[questionIndex + 1]?.question || ""}
      finished={finished}
      finalScores={[...participants].sort((a, b) => (b.quizScore || 0) - (a.quizScore || 0))}
      showAnswer={showAnswer}
      revealAnswer={() => setShowAnswer(true)}
      canProgress={!isStandardMode || cycle !== 2 || showAnswer}
      onNext={() => {}}
      onNoOneAnswered={handleNoOneAnswered}
      allowNoOneAnswered={settings.allowNoOneAnswered !== false}
      onAction={handleControllerAction}
      onQuestionResolved={handleQuestionResolved}
      onStateChange={setPlayState}
      onClose={() => {}}
    />
  );
  const speakerController = (
    <div className="flex h-dvh flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-300 bg-white p-2">
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-sm font-semibold text-slate-600">{finished ? "Quiz complete" : `${questionSet.name} · ${questionIndex + 1}/${questions.length}`}</span>
          {!finished && currentQuestion?.difficulty && (
            <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${DIFFICULTY_STYLES[currentQuestion.difficulty] || "bg-slate-100 text-slate-700"}`}>{currentQuestion.difficulty}</span>
          )}
        </div>
        {navButtons}
      </div>
      <div className="min-h-0 flex-1">{controller}</div>
    </div>
  );

  const hasPlayers = !isStandardMode && participants.length > 0;
  const sortedParticipants = [...participants].sort((a, b) => (b.quizScore || 0) - (a.quizScore || 0));

  return (
    <>
      <ActivityFrame
        title={finished ? `${questionSet.name} complete` : `${questionSet.name} · Question ${questionIndex + 1} of ${questions.length}`}
        theme={mode === "gameshow" ? "gameshow" : "quiz"}
      >
        {finished ? (
          <div className="flex w-full flex-col items-center gap-4">
            <p className="text-2xl font-bold text-slate-700">Quiz complete 🎉</p>
            {hasPlayers && <Scoreboard players={sortedParticipants} title="Final scores" />}
          </div>
        ) : (
          <div className="flex w-full flex-wrap items-start gap-4">
            <div className="min-w-[16rem] flex-[2_1_20rem]">
              <QuizQuestionDisplay
                question={currentQuestion}
                mode={mode}
                showAnswer={showAnswer}
                resolved={resolved}
                showChoices={mode !== "standard" || cycle === 1}
              />
            </div>
            {hasPlayers && (
              <div className="min-w-[11rem] flex-[1_1_11rem]">
                <Scoreboard players={participants} playState={playState} resolved={resolved} />
              </div>
            )}
          </div>
        )}
        {!isStandardMode && !speakerWindow && !finished && (
          <p className="text-sm text-slate-400">Open Speaker Mode to run the quiz controls.</p>
        )}
      </ActivityFrame>
      {speakerWindow && (
        <PresenterPortal
          presenterWindow={speakerWindow}
          running
          closeOnUnmount={false}
          onClose={onSpeakerWindowClose}
        >
          {speakerController}
        </PresenterPortal>
      )}
    </>
  );
});

const personName = (person) => person?.preferredName || person?.fullName || "Participant";

// Cycles through names, slowing down, then lands on the chosen participant.
function SelectionReel({ people, winner }) {
  const [shown, setShown] = useState(people[0] || winner);
  const [landed, setLanded] = useState(false);

  useEffect(() => {
    setLanded(false);
    const steps = 22;
    const timers = [];
    let elapsed = 0;
    for (let i = 0; i < steps; i += 1) {
      elapsed += 55 + Math.pow(i / steps, 3) * 420;
      timers.push(window.setTimeout(() => {
        setShown(people[(i + 1) % Math.max(people.length, 1)] || winner);
      }, elapsed));
    }
    timers.push(window.setTimeout(() => {
      setShown(winner);
      setLanded(true);
    }, elapsed + 450));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [winner?.id]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">{landed ? "Up next" : "Choosing…"}</div>
      <div className={`transition-transform duration-300 ${landed ? "scale-125" : "scale-100 opacity-80"}`}>
        <PersonBadge person={shown} size="xl" />
      </div>
    </div>
  );
}

export const IceBreakerActivity = forwardRef(function IceBreakerActivity({ iceBreakerSet, participants, onNavigationChange, speakerWindow, onSpeakerWindowClose, onLeave }, ref) {
  const iceBreaker = iceBreakerSet?.selectedIceBreaker;
  const collectFreeTextAnswers = usePeopleStore((state) => state.collectFreeTextAnswers);
  const stableParticipantsKey = participants.map((person) => person.id).join("|");
  const stableParticipants = useMemo(() => participants, [stableParticipantsKey]);
  const engine = useIceBreakerEngine(iceBreaker, stableParticipants);
  const [freeText, setFreeText] = useState("");
  const {
    phase, currentParticipant, currentIndex, totalParticipants, answer, randomPrompt, orderedParticipants,
    isSimple, isRandom, isChoice, isPerformance, isReveal,
    beginAnswer, submitAnswer, skipToNext, finishReveal, startSession,
  } = engine;

  useEffect(() => {
    if (iceBreaker && stableParticipants.length && phase === "idle") {
      startSession();
    }
  }, [iceBreaker, stableParticipants.length, phase]);

  const advance = () => {
    if (!iceBreaker || !stableParticipants.length) return true;
    if (phase === "complete") return true;
    if (phase === "selecting") {
      beginAnswer();
      return false;
    }
    if (phase === "reveal") {
      finishReveal();
      return false;
    }
    if (phase === "answering") {
      if (isChoice && !answer) return false;
      if (isReveal) finishReveal();
      else skipToNext();
    }
    return false;
  };

  const previous = () => true;
  useImperativeHandle(ref, () => ({ advance, previous }), [advance]);

  useEffect(() => {
    const nextLabel = phase === "complete"
      ? "Next agenda section"
      : phase === "idle" || phase === "selecting"
        ? "Start prompt"
        : phase === "reveal"
          ? "Next participant"
          : "Next participant";
    onNavigationChange?.({ nextLabel, step: phase });
  }, [phase, onNavigationChange]);

  if (!iceBreaker) return <ActivityMessage message="The linked icebreaker set has no selected prompt." />;
  if (!participants.length) return <ActivityMessage message="The linked people set has no eligible participants." />;

  const prompt = isRandom ? randomPrompt : iceBreaker.prompt;
  const step = (direction) => {
    const leaveActivity = direction === "next" ? advance() : previous();
    if (leaveActivity) { if (onLeave) onLeave(direction); else window.postMessage({ action: direction === "next" ? "NEXT_SLIDE" : "PREV_SLIDE" }, "*"); }
  };
  const nextLabel = phase === "complete" ? "Next agenda section" : phase === "selecting" || phase === "idle" ? "Start prompt" : "Next participant";
  const doneCount = phase === "complete" ? orderedParticipants.length : (currentIndex ?? 0);

  const speakerController = (
    <div className="flex h-dvh flex-col bg-slate-50 text-slate-900">
      <div className="shrink-0 space-y-2 border-b border-slate-300 bg-white p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-purple-700">{iceBreakerSet.name} · {doneCount} of {orderedParticipants.length} done</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => step("prev")} className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50">Previous section</button>
            <button type="button" onClick={() => step("next")} className="rounded bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700">{nextLabel}</button>
          </div>
        </div>
        {phase !== "complete" && (
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
            <div className="text-xs font-semibold uppercase text-purple-500">Speaker prompt{iceBreaker.label ? ` · ${iceBreaker.label}` : ""}</div>
            <p className="mt-1 text-lg font-bold">{prompt || iceBreaker.prompt}</p>
            {isReveal && (iceBreaker.answer) && <p className="mt-1 text-sm text-slate-600">Answer: {iceBreaker.answer}</p>}
            {isChoice && phase === "answering" && <p className="mt-1 text-sm text-slate-600">Choose a response on the player screen to continue.</p>}
          </div>
        )}
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
        {currentParticipant && (
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase text-slate-500">Current</h3>
            <div className="rounded-lg border-2 border-purple-500 bg-white p-3 text-xl font-bold">{personName(currentParticipant)}</div>
          </div>
        )}
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase text-slate-500">Still to go ({orderedParticipants.length - doneCount - (currentParticipant ? 1 : 0)})</h3>
          <ul className="space-y-1">
            {orderedParticipants.slice(doneCount + (currentParticipant ? 1 : 0)).map((person) => (
              <li key={person.id} className="rounded border border-slate-200 bg-white px-3 py-2">{personName(person)}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase text-slate-500">Done ({doneCount})</h3>
          <ul className="space-y-1">
            {orderedParticipants.slice(0, doneCount).map((person) => (
              <li key={person.id} className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">✓ {personName(person)}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <>
    <ActivityFrame theme="icebreaker" title={`${iceBreakerSet.name} · ${phase === "complete" ? "Complete" : `Person ${Math.min((currentIndex ?? 0) + 1, totalParticipants)} of ${totalParticipants}`}`}>
      {phase === "complete" ? (
        <p className="text-center text-2xl font-bold text-slate-700">Icebreaker complete 🎉</p>
      ) : (
        <>
          {phase === "selecting" && currentParticipant && (
            <SelectionReel people={orderedParticipants} winner={currentParticipant} />
          )}
          {phase !== "selecting" && currentParticipant && <PersonBadge person={currentParticipant} size="xl" />}
          {phase === "answering" && (
            <>
              <h2 className="text-center font-extrabold leading-tight text-slate-900" style={{ fontSize: "clamp(1.75rem, 8cqh, 4.5rem)" }}>{prompt}</h2>
              {isChoice && iceBreaker.options?.map((option) => (
                <button key={option} type="button" onClick={() => submitAnswer(option)} className="rounded border border-indigo-300 bg-white px-4 py-2 font-semibold hover:bg-indigo-50">{option}</button>
              ))}
              {(isSimple || isRandom) && collectFreeTextAnswers && (
                <form onSubmit={(event) => { event.preventDefault(); if (freeText.trim()) { submitAnswer(freeText.trim()); setFreeText(""); } }} className="flex w-full gap-2">
                  <input value={freeText} onChange={(event) => setFreeText(event.target.value)} className="min-w-0 flex-1 rounded border border-slate-300 px-3 py-2" placeholder="Record a response" />
                  <button type="submit" className="rounded bg-indigo-600 px-4 py-2 font-semibold text-white">Submit</button>
                </form>
              )}
              {isReveal && <div className="rounded bg-indigo-50 p-4 text-center font-semibold">{iceBreaker.answer || iceBreaker.prompt}</div>}
            </>
          )}
          {phase === "reveal" && <div className="rounded bg-indigo-50 p-4 text-center"><h2 className="text-lg font-semibold">Response</h2><p className="mt-2 text-2xl font-bold">{answer}</p></div>}
        </>
      )}
    </ActivityFrame>
    {speakerWindow && (
      <PresenterPortal presenterWindow={speakerWindow} running closeOnUnmount={false} onClose={onSpeakerWindowClose}>
        {speakerController}
      </PresenterPortal>
    )}
    </>
  );
});

export default forwardRef(function AgendaLinkedActivity(props, ref) {
  if (props.questionSet) return <QuizActivity {...props} ref={ref} />;
  if (props.iceBreakerSet) return <IceBreakerActivity {...props} ref={ref} />;
  return <ActivityMessage message="The linked activity set could not be found." />;
});

function QuizQuestionDisplay({ question, mode, showAnswer, resolved, showChoices }) {
  const questionText = question.question || question.questionText || question.text;
  const shouldShowAnswer = mode === "standard" ? showAnswer : resolved;
  const glam = mode === "gameshow";
  const hasVisibleOptions = showChoices && question.options?.filter(Boolean).length > 0;

  return (
    <div className="flex w-full min-h-0 flex-col gap-[2cqh]">
      {question.mediaUrl && question.contentType !== "question" && (
        <div className="flex items-center justify-center overflow-hidden rounded-lg bg-slate-100 p-1">
          {question.contentType === "image" && (
            <img
              src={question.mediaUrl}
              alt={question.mediaAlt || questionText || "Quiz media"}
              className="max-h-[45cqh] max-w-full rounded-lg object-contain"
            />
          )}
          {question.contentType === "audio" && <audio controls src={question.mediaUrl} className="w-full" />}
          {question.contentType === "video" && (
            <video controls src={question.mediaUrl} className="max-h-[45cqh] max-w-full rounded-lg" />
          )}
        </div>
      )}
      <section className={`w-full rounded-lg px-4 py-[1.5cqh] text-white shadow-sm ${glam ? "border-2 border-amber-300 bg-gradient-to-r from-indigo-700 via-blue-600 to-indigo-700 text-center shadow-lg shadow-indigo-900/40" : "bg-slate-900"}`}>
        <h1 className={`leading-tight text-[clamp(1.1rem,4cqh,2.75rem)] ${glam ? "font-black" : "font-bold"}`}>{questionText}</h1>
      </section>
      {showChoices && question.options?.length > 0 && (
        <section className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
          {question.options.filter(Boolean).map((option, index) => {
            const isCorrect = shouldShowAnswer && normalizeAnswer(option) === normalizeAnswer(question.answer);
            const isDimmed = shouldShowAnswer && !isCorrect;
            const base = glam
              ? "flex items-center gap-3 rounded-full border-2 px-5 py-[1.2cqh] font-bold text-white text-[clamp(0.9rem,2.8cqh,1.75rem)] "
              : "rounded-lg border px-4 py-[1.2cqh] font-semibold text-[clamp(0.9rem,2.8cqh,1.75rem)] ";
            const tone = isCorrect
              ? "border-emerald-500 bg-emerald-500 text-white ring-4 ring-emerald-300"
              : isDimmed
                ? glam ? "border-slate-500 bg-slate-700/60 opacity-50" : "border-slate-200 bg-slate-50 text-slate-400"
                : glam ? "border-amber-300 bg-indigo-800" : "border-slate-300 bg-white text-slate-700";
            return (
              <div key={`${option}-${index}`} className={base + tone}>
                {glam && <span className="flex h-[1.6em] w-[1.6em] shrink-0 items-center justify-center rounded-full bg-amber-300 text-sm font-black text-indigo-900">{String.fromCharCode(65 + index)}</span>}
                <span>{option}</span>
              </div>
            );
          })}
        </section>
      )}
      {shouldShowAnswer && !(mode !== "standard" && hasVisibleOptions) && (
        <section className="w-full rounded-lg border border-emerald-200 bg-white px-4 py-[1.2cqh] text-center shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">Answer</div>
          <div className="mt-1 font-black text-emerald-800 text-[clamp(1rem,3.4cqh,2.25rem)]">{question.answer}</div>
        </section>
      )}
    </div>
  );
}

function ActivityFrame({ title, children, footer, theme = "quiz" }) {
  const frameStyles = theme === "icebreaker"
    ? "border-purple-200 bg-white"
    : theme === "gameshow"
      ? "border-amber-300 bg-gradient-to-b from-indigo-950 via-indigo-900 to-blue-950"
      : "border-indigo-200 bg-white";
  const titleStyles = theme === "icebreaker" ? "text-purple-700" : theme === "gameshow" ? "text-amber-300" : "text-indigo-800";

  return (
    <section className={`flex h-full min-h-0 w-full min-w-0 flex-col items-center overflow-hidden rounded-lg border p-3 shadow-sm ${frameStyles}`}>
      <h2 className={`w-full shrink-0 border-b border-current/15 pb-2 text-lg font-bold ${titleStyles}`}>{title}</h2>
      {/* m-auto on the inner wrapper centres short content without clipping tall content */}
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto py-3">
        <div className="m-auto flex w-full flex-col items-center gap-4">
          {children}
        </div>
      </div>
      {footer && <div className="w-full shrink-0 border-t border-slate-200 pt-2">{footer}</div>}
    </section>
  );
}

function ActivityMessage({ message }) {
  return <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">{message}</div>;
}

function Scoreboard({ players, playState = INITIAL_PLAY_STATE, resolved = false, title = "Players" }) {
  const { selectedPersonId, wrongPlayerIds, correctPlayerId } = playState;
  const selected = players.find((person) => person.id === selectedPersonId);
  const personName = (person) => person.preferredName || person.fullName || "Player";

  return (
    <div className="flex w-full flex-col gap-2">
      <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">{title}</h3>
      {selected && !resolved && (
        <div className="rounded-lg bg-amber-100 px-3 py-2 text-center font-bold text-amber-900 ring-2 ring-amber-400">
          {personName(selected)} is answering…
        </div>
      )}
      <ul className="flex flex-col gap-2">
        {players.map((person) => {
          const isSelected = person.id === selectedPersonId && !resolved;
          const isWrong = wrongPlayerIds.includes(person.id);
          const isCorrect = person.id === correctPlayerId;
          const tone = isCorrect
            ? "border-emerald-600 bg-emerald-100 text-emerald-900"
            : isWrong
              ? "border-red-600 bg-red-100 text-red-900"
              : isSelected
                ? "border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-400"
                : "border-slate-200 bg-white text-slate-800";
          return (
            <li key={person.id} className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 font-semibold shadow-sm ${tone}`}>
              <span className="truncate">{isCorrect ? "✓ " : isWrong ? "✗ " : ""}{personName(person)}</span>
              <span className="tabular-nums">{person.quizScore ?? 0} pts</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}