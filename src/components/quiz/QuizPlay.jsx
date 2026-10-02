import { useState, useEffect, useRef } from "react";
import usePeople from "../store/usePeopleStore";
import Leaderboard from "../shared/Leaderboard";
import StandaloneActivityRunner from "../shared/StandaloneActivityRunner";
import useQuizController from "../hooks/quizController";
import { formatTime } from "../../utils/formatUKTime";

import StandardQuizEngine from "./StandardQuiz/StandardQuizEngine";
import StandardQuizPointsEngine from "./StandardQuizPoints/StandardQuizPointsEngine";
import GameShowEngine from "./gameshow/GameShowEngine";
import MediaQuizEngine from "./media/MediaEngine";

import personBadge from "./shared/PersonBadge";

import PodiumModal from "./shared/PodiumModal";
import PersonBadge from "./shared/PersonBadge";

import { getQuizStats, generateQuizInstructions } from "../../utils/questions";
import { getPeopleSetRoster } from "../../utils/peopleSetMembers";

export default function QuizPlay({ running, setRunning }) {
  const {
    people,
    peopleSets = [],
    questions,
    questionSets,
    activeQuestionSetId,
    selectQuestionSet,
    resetQuizScores,
    quizMode,
    setQuizMode,
    quizSettings
  } = usePeople();




const presenterLaunchMap = usePeople(state => state.presenterLaunchMap);
const setPresenterLaunchMap = usePeople(state => state.setPresenterLaunchMap);

const [presenterWindow, setPresenterWindow] = useState(null);

const activeQuestionSet = (questionSets || []).find((setItem) => setItem.id === activeQuestionSetId);
const activePeopleSet = peopleSets.find((setItem) => setItem.id === activeQuestionSet?.peopleSetId);
const allQuizPeople = getPeopleSetRoster(people, activePeopleSet).filter(
    (p) => p?.inSpinner !== false && p?.isPresenter !== true
  );

  const [index, setIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const revealAnswer = () => setShowAnswer(true);
  const resetAnswer = () => setShowAnswer(false);

  const [showPodium, setShowPodium] = useState(false);
  const [podium, setPodium] = useState([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [players, setPlayers] = useState(allQuizPeople);

  const [timerDisplay, setTimerDisplay] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const timeoutHandledRef = useRef(false);

  useEffect(() => {
    setPlayers((previousPlayers) => {
      const selectedIds = new Set(previousPlayers.map((person) => person.id));
      return allQuizPeople.filter((person) => selectedIds.has(person.id));
    });
  }, [people, peopleSets, activePeopleSet?.id]);

  useEffect(() => {
  if (!running) return;

  const interval = setInterval(() => {
    setTimerDisplay(prev => prev + 1);
  }, 1000);

  return () => clearInterval(interval);
}, [running]);



  const currentQuestion = index !== null ? questions[index] : null;
  const quizSets = Array.isArray(questionSets) && questionSets.length > 0
    ? questionSets
    : [{ id: "default", name: "Question Set 1", questions: questions || [] }];
  const hasAnyQuestions = quizSets.some((setItem) => Array.isArray(setItem.questions) && setItem.questions.length > 0);
  const quizPeople = allQuizPeople;
  const hasPeople = quizPeople.length > 0;
  const quizPlayerIds = new Set(quizPeople.map((person) => person.id));
  const quizPlayers = players.filter((person) => quizPlayerIds.has(person.id));
  const activeSetSettings = { ...quizSettings, ...(activeQuestionSet?.settings || {}) };
  const activeSetName =
    activeQuestionSet?.name ||
    quizSets[0]?.name ||
    "Quiz";

  const questionTimeLimitSeconds = Math.max(
    0,
    Number(activeSetSettings.questionTimeLimitSeconds) || Number(activeQuestionSet?.timeLimit) || 0
  );

  const activeSetMode =
    quizSets.find((setItem) => setItem.id === activeQuestionSetId)?.quizMode ||
    quizMode ||
    "standard";

  useEffect(() => {
    setElapsed(0);
    timeoutHandledRef.current = false;
    if (!running || cycle === 0) return undefined;

    let interval = setInterval(() => {
      setElapsed((previousElapsed) => {
        const nextElapsed = previousElapsed + 1;
        if (questionTimeLimitSeconds > 0 && nextElapsed >= questionTimeLimitSeconds) {
          clearInterval(interval);
          if (!timeoutHandledRef.current && activeSetSettings.autoRevealOnTimeout && activeSetMode === "standard" && cycle === 2) {
            timeoutHandledRef.current = true;
            setShowAnswer(true);
          }
        }
        return nextElapsed;
      });

    }, 1000);

    return () => clearInterval(interval);
  }, [index, currentQuestion, running, questionTimeLimitSeconds, activeSetSettings.autoRevealOnTimeout, activeSetMode, cycle]);

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

  // Load set
  if (setItem.id && setItem.id !== activeQuestionSetId) {
    selectQuestionSet(setItem.id);
  }

  const hasMulti = setItem.questions.some((q) => q.type === "multi");
  const modeForSet = setItem.quizMode || "standard";
  const safeMode = modeForSet === "gameshow" && !hasMulti ? "standard" : modeForSet;
  setQuizMode(safeMode);

  setQuizFinished(false);
  setShowPodium(false);
  setIndex(0);

  // Running first
  setRunning(true);

  // Fullscreen must happen BEFORE opening presenter window
  enterFullscreen();

};





  const closeQuiz = () => {
    setRunning(false);
    setPresenterWindow(null);
    setIndex(0);
    setCycle(1);
    setQuizFinished(false);
    setShowPodium(false);
    exitFullscreen();
  };

  const finishQuiz = () => {

    const sorted = [...quizPlayers].sort((a, b) => b.quizScore - a.quizScore);
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

  const removePointsAll = activeSetSettings.noOneAnsweredPenalty === "remove";
  const points = activeSetMode !== "standard";
  const pointsMode = activeSetSettings.pointMode || "default";

  const stats = getQuizStats(questions);
  const instructions = generateQuizInstructions(stats, activeSetSettings.revealSeconds, points, activeSetSettings.samePoints ?? activeSetSettings.correctPoints, activeSetSettings.wrongPoints, removePointsAll, activeSetMode);

  const openPresenterWindow = () => {
    const win = window.open("", "QuizPresenter", "popup=yes,width=1200,height=900");
    if (!win) return;

    setPresenterWindow(win);

    if (typeof window.getScreenDetails === "function") {
      try {
        window.getScreenDetails().then(({ screens }) => {
          const secondaryScreen = screens.find((screen) => !screen.isPrimary);
          if (!secondaryScreen || win.closed) return;

          win.moveTo(secondaryScreen.availLeft + 16, secondaryScreen.availTop + 16);
          win.resizeTo(
            Math.max(640, secondaryScreen.availWidth - 32),
            Math.max(480, secondaryScreen.availHeight - 32)
          );
        }).catch(() => {});
      } catch {
      }
    }
  };

const {
  presenterProgress,
} = useQuizController({
  quizMode: activeSetMode,
  cycle,
  nextQuestion,
  index,
  questions,
  showAnswer,
  revealAnswer,
  resetAnswer
});


const dispatchControllerAction = (action) => {
  const mainDocument = presenterWindow?.opener?.document;
  if (!mainDocument) return;

  const buttons = Array.from(mainDocument.querySelectorAll("[data-controller-action]"));
  const target = buttons.find((button) => {
    if (action.type === "select-player") {
      return button.dataset.controllerPlayer === String(action.playerId);
    }
    if (action.type === "option") {
      return button.dataset.controllerOption === action.option;
    }
    if (action.type === "result") {
      return button.dataset.controllerPlayer === String(action.playerId) &&
        button.dataset.controllerResult === action.result;
    }
    if (action.type === "next") {
      return button.dataset.controllerAction === "advance" ||
        (activeSetMode === "gameshow" && button.dataset.controllerAction === "next");
    }
    return false;
  });

  if (action.type === "no-one-answered") {
    if (activeSetSettings.allowNoOneAnswered === false) return false;
    if (mainDocument.querySelector('[data-controller-modal="correct-answer"], [data-controller-modal="answer-reveal"]')) {
      return false;
    }

    const wrongModalOpen = mainDocument.querySelector('[data-controller-modal="wrong-answer"]');
    const noOneAnsweredTarget = buttons.find((button) => button.dataset.controllerAction === "modal-no-one-answered") ||
      (wrongModalOpen && activeSetMode === "gameshow"
        ? buttons.find((button) => button.dataset.controllerAction === "advance")
        : null) ||
      buttons.find((button) => button.dataset.controllerAction === "no-one-answered") ||
      (activeSetMode === "gameshow"
        ? buttons.find((button) => button.dataset.controllerAction === "next")
        : null);
    noOneAnsweredTarget?.click();
    return Boolean(noOneAnsweredTarget && !noOneAnsweredTarget.disabled);
  }

  if (!target || target.disabled) return false;
  target?.click();
  return true;
};

const handlePresenterNext = () => {
  if (activeSetMode === "standard") {
    presenterProgress();
    return;
  }

  dispatchControllerAction({ type: "next" });
};

const handlePresenterNoOneAnswered = () => {
  if (activeSetSettings.allowNoOneAnswered === false) return false;
  return dispatchControllerAction({ type: "no-one-answered" });
};





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

          const setAudience = setItem.peopleSetId
            ? allQuizPeople.filter((person) => peopleSets.find((peopleSet) => peopleSet.id === setItem.peopleSetId)?.personIds.includes(person.id))
            : allQuizPeople;
          const canStartSet = setAudience.length > 0 && setQuestionCount > 0;
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

  {/* ⭐ NEW: Presenter Window Checkbox */}
<label className="flex items-center gap-2 text-sm text-gray-700">
  <input
    type="checkbox"
    checked={presenterLaunchMap[setItem.id] || false}
    onChange={(e) => {
      setPresenterLaunchMap(prev => ({
        ...prev,
        [setItem.id]: e.target.checked
      }));
    }}
    className="h-4 w-4"
  />
  Launch Presenter Window
</label>


<button
  onClick={() => {
    startQuizForSet(setItem);
  }}
  disabled={!canStartSet}
  className="w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium shadow
    bg-indigo-600 text-white hover:bg-indigo-700"
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
        {formatTime(timerDisplay)}
      </div>
    </div>
  )}

</div>


      {!running && !hasAnyQuestions && (
        <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Please add questions before starting the quiz.
        </div>
      )}

      {running && cycle > 0 && (
  <StandaloneActivityRunner
    kind="quiz"
    questionSet={{ ...activeQuestionSet, quizMode: activeSetMode, questions, settings: activeSetSettings }}
    participants={quizPlayers}
    initialSpeakerWindow={presenterWindow}
    onClose={closeQuiz}
  />
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
  onClick={() => {
    setPlayers((previousPlayers) => quizPeople.filter((person) => previousPlayers.some((selected) => selected.id === person.id)));
    resetQuizScores();
    // 1️⃣ Start the quiz properly
    setCycle(1);
    // 3️⃣ After fullscreen completes, open presenter window
    if(presenterLaunchMap[activeQuestionSetId]){
        openPresenterWindow();
  
    }

    
  }}
  className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 text-lg font-semibold"
>
  Start Quiz
</button>

      </div>
    </div>

  </div>
)}


    </div>
    </>
  );
}
