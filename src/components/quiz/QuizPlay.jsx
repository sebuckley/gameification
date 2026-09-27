import { useState, useEffect } from "react";
import usePeople from "../store/usePeopleStore";
import Leaderboard from "../shared/Leaderboard";

import StandardQuizEngine from "./StandardQuiz/StandardQuizEngine";
import StandardQuizPointsEngine from "./StandardQuizPoints/StandardQuizPointsEngine";
import GameShowEngine from "./gameshow/GameShowEngine";
import MediaQuizEngine from "./media/MediaEngine";

import personBadge from "./shared/PersonBadge";

import PodiumModal from "./shared/PodiumModal";
import PersonBadge from "./shared/PersonBadge";

import { getQuizStats, generateQuizInstructions } from "../../utils/questions";

export default function QuizPlay({ running, setRunning }) {
  const {
    people,
    questions,
    questionSets,
    activeQuestionSetId,
    selectQuestionSet,
    resetQuizScores,
    quizMode,
    setQuizMode,
    quizSettings
  } = usePeople();



 const quizPeople = people.filter(
    (p) => p?.inSpinner !== false && p?.isPresenter !== true
  );
  const hasPeople = quizPeople.length > 0;

  const [index, setIndex] = useState(0);
  const [cycle, setCycle] = useState(0);

  const [showPodium, setShowPodium] = useState(false);
  const [podium, setPodium] = useState([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [players, setPlayers] = useState([]);

  const [timerDisplay, setTimerDisplay] = useState([]);

  // Keep players in sync with quizPeople
  useEffect(() => {
    setPlayers(quizPeople);
  }, []);

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
    if (mode === "media") return "Media Quiz";
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

    const sorted = [...players].sort((a, b) => b.quizScore - a.quizScore);
    setPodium(sorted.slice(0, 3));

    if (quizMode === "standard" || quizMode === "media") {
      setQuizFinished(true);
      setShowPodium(false);
      return;
    }

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

  const removePointsAll = quizSettings.noOneAnsweredPenalty === "remove";
  const points = activeSetMode !== "standard";
  const pointsMode = quizSettings.pointMode || "default";

  const stats = getQuizStats(questions);
  const instructions = generateQuizInstructions(stats, quizSettings.revealSeconds , points, quizSettings.correctAnswerPoints, quizSettings.incorrectAnswerPoints, removePointsAll, activeSetMode);

  return (
    <>

<div className="h-full flex flex-col">
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
    ): (
      <button
        onClick={closeQuiz}
        className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
      >
        Close Quiz
      </button>
    )}

  </div>

  {/* CENTER COLUMN — Question Counter */}
  {running && currentQuestion && cycle > 0 ? (
    <div className="flex flex-col items-center justify-start text-center">

      <span className="text-lg font-semibold text-gray-700">
        Question {index + 1} / {questions.length}
      </span>

      <div className="text-xs text-gray-400 mt-1">
        {getQuizModeLabel(activeSetMode)}
      </div>

    </div>
  ):( <div className="flex flex-col items-center justify-start text-center">

      <span className="text-lg font-semibold text-gray-700">
     
      </span>

      <div className="text-xs text-gray-400 mt-1">
        
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

          <div className="flex w-full max-w-3xl flex-col items-center justify-center rounded-[32px] border border-indigo-200 bg-white p-10 text-center shadow-[0_30px_80px_rgba(79,70,229,0.12)] space-y-10">

            {/* Podium Section (only for non-standard mode) */}
            {quizMode !== "standard" && (
              <>
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold">Final Scores</h3>

                  <div className="flex justify-center gap-6 items-end">

                    {/* 2nd Place */}
                    {podium[1] && (
                      <div className="flex flex-col items-center space-y-2">
                        <PersonBadge person={podium[1]} />
                        <div className="font-semibold text-gray-700">2nd Place</div>
                        <div className="text-sm text-gray-600">{podium[1].quizScore} pts</div>
                      </div>
                    )}

                    {/* 1st Place */}
                    {podium[0] && (
                      <div className="flex flex-col items-center space-y-2 border-4 border-yellow-400 rounded-xl p-2">
                        <PersonBadge person={podium[0]} />
                        <div className="font-bold text-yellow-600 text-xl">1st Place</div>
                        <div className="text-sm text-gray-600">{podium[0].quizScore} pts</div>
                      </div>
                    )}

                    {/* 3rd Place */}
                    {podium[2] && (
                      <div className="flex flex-col items-center space-y-2">
                        <PersonBadge person={podium[2]} />
                        <div className="font-semibold text-gray-700">3rd Place</div>
                        <div className="text-sm text-gray-600">{podium[2].quizScore} pts</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px w-full bg-slate-200"></div>
              </>
            )}

            {/* Quiz Ended Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="text-xs font-bold uppercase tracking-[0.35em] text-indigo-500">
                Complete
              </div>

              <h2 className="text-4xl font-black text-slate-900">Quiz ended</h2>

              <p className="text-base text-slate-600">
                The quiz has finished. You can close this screen when you’re ready.
              </p>

              <button
                onClick={closeQuiz}
                className="mt-4 rounded-full bg-red-600 px-8 py-3 text-lg font-semibold text-white shadow-md transition hover:bg-red-700"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

{running && currentQuestion && !showPodium && !quizFinished && cycle > 0 && (
  <div className="w-full h-[calc(100vh-80px)] flex flex-row overflow-hidden">

    {/* LEFT: QUESTION AREA */}
    <div className="flex-1 h-full flex items-center justify-center overflow-hidden">

      {/* Centered content that can scroll */}
      <div className="
        w-full
        max-w-5xl
        max-h-full
        overflow-auto
        flex
        flex-col
        items-center
        justify-center
        px-6
        py-6
      ">

        {/* QUIZ ENGINES */}
        {quizMode === "standard" && (
          <StandardQuizEngine
            currentQuestion={currentQuestion}
            index={index}
            questions={questions}
            quizPeople={players}
            nextQuestion={nextQuestion}
            cycle={cycle}
          />
        )}

        {quizMode === "standard-points" && (
          <StandardQuizPointsEngine
            currentQuestion={currentQuestion}
            index={index}
            questions={questions}
            quizPeople={players}
            nextQuestion={nextQuestion}
            cycle={cycle}
          />
        )}

        {quizMode === "gameshow" && currentQuestion.type === "multi" && (
          <GameShowEngine
            currentQuestion={currentQuestion}
            index={index}
            questions={questions}
            quizPeople={players}
            nextQuestion={nextQuestion}
          />
        )}

        {quizMode === "media" && (
          <MediaQuizEngine
            currentQuestion={currentQuestion}
            index={index}
            questions={questions}
            quizPeople={players}
            nextQuestion={nextQuestion}
          />
        )}

      </div>
    </div>

    {/* RIGHT: LEADERBOARD (DESKTOP) */}
    {quizMode !== "standard" && (
      <div
        className="
          hidden
          lg:flex
          flex-col
          items-center
          justify-center
          w-[24rem]
          h-full
          mx-4
          bg-white
          overflow-hidden
        "
      >
        <Leaderboard people={players} data="quiz" running={running} />
      </div>
    )}

    {/* MOBILE LEADERBOARD */}
    {quizMode !== "standard" && (
      <div className="lg:hidden w-full bg-white border-t border-gray-300 shadow p-4">
        <Leaderboard people={players} data="quiz" running={running} />
      </div>
    )}

  </div>
)}





{running && cycle === 0 && (
  <div className="w-full flex-1 flex flex-row bg-white p-10 gap-10">



      { activeSetMode !== "standard" ? (
   
        <>

            {/* LEFT SIDE — PLAYERS (centered vertically, rows wrap) */}
    <div className="w-1/2 flex items-center justify-center">
      <div className="flex flex-col items-center">

        <h1 className="text-4xl font-bold mb-6">Players</h1>

        {/* Players wrap into rows */}
        <div className="flex flex-wrap gap-4 justify-center">
          {quizPeople.map((person) => {


            return (
              <div
                key={person.id}
                className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50"
              >
<input
  type="checkbox"
  checked={players.some(p => p.id === person.id)}
  onChange={(e) => {
    setPlayers(prev => {
      if (e.target.checked) {
        if (!prev.some(p => p.id === person.id)) {
          return [...prev, person];
        }
        return prev;
      } else {
        return prev.filter(p => p.id !== person.id);
      }
    });
  }}
  className="
    w-5 h-5 
    rounded 
    border-2 
    border-slate-400 
    text-blue-600 
    focus:ring-blue-500 
    focus:ring-offset-0 
    cursor-pointer
  "
/>



                <PersonBadge person={person} />
              </div>
            );
          })}
        </div>

      </div>
    </div>

    </>

        ): null }


    {/* RIGHT SIDE — RULES (centered vertically) */}
    <div className={`${activeSetMode === "standard" ? "w-full" : "w-1/2"} flex items-center justify-center`}>

      <div className="flex flex-col max-w-xl">

        <h1 className="text-4xl font-bold mb-6">Quiz Rules</h1>

        <p className="text-lg text-gray-700 mb-4">
          Todays quiz will be a {getQuizModeLabel(quizMode)}
        </p>

        <p className="text-lg text-gray-700 mb-6">
          Welcome to the quiz! Make sure to read the rules carefully before starting.
        </p>

        <ul className="text-lg text-gray-700 space-y-3 mb-10">
          {instructions.map((line, i) => (
            <li key={i}>• {line}</li>
          ))}
          <li>• The quiz will begin immediately after you press Start.</li>
        </ul>

        <button
          onClick={() => setCycle(1)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 text-lg font-semibold"
        >
          Start Quiz
        </button>

      </div>
    </div>

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
    
    </div>
    </>
  );
}
