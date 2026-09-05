import { useState } from "react";
import usePeople from "../store/usePeopleStore";
import Leaderboard from "../shared/Leaderboard";

import StandardQuizEngine from "./StandardQuiz/StandardQuizEngine";
import StandardQuizPointsEngine from "./StandardQuizPoints/StandardQuizPointsEngine";
import GameShowEngine from "./gameshow/GameShowEngine";

import PodiumModal from "./shared/PodiumModal";

export default function QuizPlay({ running, setRunning }) {
  const {
    people,
    questions,
    questionSets,
    activeQuestionSetId,
    selectQuestionSet,
    resetQuizScores,
    quizMode,
    setQuizMode
  } = usePeople();

  const quizPeople = people.filter((p) => p?.inSpinner !== false);
  const hasPeople = quizPeople.length > 0;

  const [index, setIndex] = useState(0);
  const [cycle, setCycle] = useState(1);

  const [showPodium, setShowPodium] = useState(false);
  const [podium, setPodium] = useState([]);
  const [quizFinished, setQuizFinished] = useState(false);

  const [timerDisplay, setTimerDisplay] = useState([]);

  const currentQuestion = index !== null ? questions[index] : null;
  const quizSets = Array.isArray(questionSets) && questionSets.length > 0
    ? questionSets
    : [{ id: "default", name: "Question Set 1", questions: questions || [] }];
  const hasAnyQuestions = quizSets.some((setItem) => Array.isArray(setItem.questions) && setItem.questions.length > 0);
  const activeSetName =
    quizSets.find((setItem) => setItem.id === activeQuestionSetId)?.name ||
    quizSets[0]?.name ||
    "Quiz";

  const activeSetMode =
    quizSets.find((setItem) => setItem.id === activeQuestionSetId)?.quizMode ||
    quizMode ||
    "standard";

  const getQuizModeLabel = (mode) => {
    if (mode === "standard-points") return "Standard Points";
    if (mode === "gameshow") return "Game-Show";
    return "Standard";
  };

  const enterFullscreen = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const startQuizForSet = (setItem) => {
    if (!setItem || !Array.isArray(setItem.questions) || setItem.questions.length === 0) return;
    if (setItem.id && setItem.id !== activeQuestionSetId) {
      selectQuestionSet(setItem.id);
    }
    const hasMulti = setItem.questions.some((q) => q.type === "multi");
    const modeForSet = setItem.quizMode || "standard";
    const safeMode = modeForSet === "gameshow" && !hasMulti ? "standard" : modeForSet;
    setQuizMode(safeMode);
    resetQuizScores();
    setCycle(1);
    setQuizFinished(false);
    setShowPodium(false);
    setRunning(true);
    setIndex(0);
    enterFullscreen();
  };

  const closeQuiz = () => {
    setRunning(false);
    setIndex(0);
    setCycle(1);
    setQuizFinished(false);
    setShowPodium(false);
    exitFullscreen();
  };

  const finishQuiz = () => {
    if (quizMode === "standard") {
      setQuizFinished(true);
      setShowPodium(false);
      return;
    }

    const sorted = [...quizPeople].sort((a, b) => b.quizScore - a.quizScore);
    setPodium(sorted.slice(0, 3));
    setShowPodium(true);
  };

  const nextQuestion = (signal) => {
    if (signal === "cycle2") {
      setCycle(2);
      setIndex(0);
      return;
    }

    if (signal === "finish") {
      finishQuiz();
      return;
    }

    if (index + 1 >= questions.length) {
      finishQuiz();
    } else {
      setIndex(index + 1);
    }
  };

  return (
    <>
{/* FULL-WIDTH HEADER */}
<div className="w-full grid grid-cols-3 items-center gap-4 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">

  {/* LEFT COLUMN — Start / Close */}
  <div className="flex flex-col items-start gap-3">

    {!running ? (
      <>
        {hasAnyQuestions && quizSets.map((setItem, index) => {
          const setName = setItem.name || `Question Set ${index + 1}`;
          const setQuestionCount = Array.isArray(setItem.questions)
            ? setItem.questions.length
            : 0;

          const canStartSet = hasPeople && setQuestionCount > 0;
          const isActiveSet = setItem.id === activeQuestionSetId;
          const setHasMultiChoice = Array.isArray(setItem.questions)
            ? setItem.questions.some((q) => q.type === "multi")
            : false;

          const setMode = setItem.quizMode || "standard";
          const safeSetMode =
            setMode === "gameshow" && !setHasMultiChoice
              ? "standard"
              : setMode;

          return (
            <div
              key={setItem.id || `quiz-set-${index}`}
              className={`rounded-lg border p-3 flex flex-col gap-3 w-full
                ${isActiveSet ? "border-indigo-300 bg-indigo-50" : "border-gray-200 bg-white"}
              `}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold text-gray-800">{setName}</div>
                <div className="text-xs font-medium text-indigo-700 rounded-full bg-indigo-100 px-2 py-1 whitespace-nowrap">
                  {getQuizModeLabel(safeSetMode)}
                </div>
              </div>

              <div className="text-xs text-gray-600">
                {setQuestionCount} {setQuestionCount === 1 ? "question" : "questions"}
                {isActiveSet ? " • Active" : ""}
              </div>

              <button
                onClick={() => startQuizForSet(setItem)}
                disabled={!canStartSet}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium shadow
                  ${canStartSet
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-gray-400 text-white cursor-not-allowed"}
                `}
              >
                Start {setName}
              </button>
            </div>
          );
        })}

        {!hasPeople && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 w-full">
            Add people before starting a quiz.
          </div>
        )}
      </>
    ) : (
      <button
        onClick={closeQuiz}
        className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
      >
        Close Quiz
      </button>
    )}

  </div>

  {/* CENTER COLUMN — Question Counter */}
  {running && currentQuestion && (
    <div className="flex flex-col items-center justify-start text-center">

      <span className="text-lg font-semibold text-gray-700">
        Question {index + 1} / {questions.length}
      </span>

      <div className="text-xs text-gray-400 mt-1">
        {getQuizModeLabel(activeSetMode)}
      </div>

    </div>
  )}

  {/* RIGHT COLUMN — Quiz title + timer */}
  {running && (
    <div className="flex flex-col items-end justify-center gap-2">
      <div className="text-right">
        <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">Quiz</div>
        <div className="text-xl font-black text-indigo-700">{activeSetName}</div>
      </div>
      <div className="text-lg font-bold text-gray-700 bg-gray-100 px-4 py-2 rounded-lg shadow">
        {timerDisplay}
      </div>
    </div>
  )}

</div>


      {!running && !hasAnyQuestions && (
        <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Please add questions before starting the quiz.
        </div>
      )}

      {running && quizFinished && !showPodium && (
        <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center px-4 py-8">
          <div className="flex w-full max-w-xl flex-col items-center justify-center rounded-[32px] border border-indigo-200 bg-white p-10 text-center shadow-[0_30px_80px_rgba(79,70,229,0.12)]">
            <div className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-indigo-500">
              Complete
            </div>
            <h2 className="text-4xl font-black text-slate-900">Quiz ended</h2>
            <p className="mt-3 text-base text-slate-600">
              The quiz has finished. You can close this screen when you&apos;re ready.
            </p>
            <button
              onClick={closeQuiz}
              className="mt-8 rounded-full bg-red-600 px-8 py-3 text-lg font-semibold text-white shadow-md transition hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* TRUE FULLSCREEN QUIZ AREA */}
      {running && currentQuestion && !showPodium && !quizFinished && (
        <div
          className="
            flex 
            flex-col 
            lg:flex-row 
            w-full 
            h-[calc(100vh-80px)] 
            overflow-hidden
          "
        >

          {/* FULLSCREEN QUESTION ENGINE */}
          <div
            className="
              flex-1 
              h-full 
              overflow-auto 
              px-3 
              py-4 
              sm:px-4
              sm:py-6
              lg:px-8 
              lg:py-8
              w-full
            "
          >
            {quizMode === "standard" && (
              <StandardQuizEngine
                currentQuestion={currentQuestion}
                index={index}
                questions={questions}
                quizPeople={quizPeople}
                nextQuestion={nextQuestion}
                cycle={cycle}
              />
            )}

            {quizMode === "standard-points" && (
              <StandardQuizPointsEngine
                currentQuestion={currentQuestion}
                index={index}
                questions={questions}
                quizPeople={quizPeople}
                nextQuestion={nextQuestion}
                cycle={cycle}
              />
            )}

            {quizMode === "gameshow" && currentQuestion.type === "multi" && (
              <GameShowEngine
                currentQuestion={currentQuestion}
                index={index}
                questions={questions}
                quizPeople={quizPeople}
                nextQuestion={nextQuestion}
              />
            )}
          </div>

          {/* RIGHT-SIDE LEADERBOARD (desktop) */}
          {quizMode !== "standard" && (
            <div
              className="
                hidden 
                lg:flex 
                lg:flex-col
                lg:items-center
                lg:justify-center
                w-[24rem]          /* ⭐ wider leaderboard */
                h-[calc(100vh-80px)] /* ⭐ full height */
                mx-4        /* ⭐ small margin */
                overflow-none 
                bg-white 
              
              "
            >
              <Leaderboard people={quizPeople} data={"quiz"} running={running}/>
            </div>
          )}

          {/* MOBILE LEADERBOARD */}
          {quizMode !== "standard" && (
            <div className="lg:hidden w-full bg-white border-t border-gray-300 shadow p-4">
              <Leaderboard people={quizPeople} data={"quiz"} running={running} />
            </div>
          )}
        </div>
      )}

      {/* PODIUM */}
      {quizMode !== "standard" && (
          
        <PodiumModal
          show={showPodium}
          podium={podium}
          onClose={() => setShowPodium(false)}
        />

      )}
    
    </>
  );
}
