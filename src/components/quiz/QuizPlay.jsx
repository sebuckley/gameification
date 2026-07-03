import { useState } from "react";
import usePeople from "../store/usePeopleStore";
import Leaderboard from "../shared/Leaderboard";

import StandardQuizEngine from "./StandardQuiz/StandardQuizEngine";
import StandardQuizPointsEngine from "./StandardQuizPoints/StandardQuizPointsEngine";
import GameShowEngine from "./gameshow/GameShowEngine";

import PodiumModal from "./shared/PodiumModal";

export default function QuizPlay({ running, setRunning }) {
  const { people, questions, resetQuizScores, quizMode, setQuizMode } = usePeople();

  const quizPeople = people.filter((p) => p.inSpinner);
  const hasPeople = quizPeople.length > 0;

  const [index, setIndex] = useState(0);
  const [cycle, setCycle] = useState(1);

  const [showPodium, setShowPodium] = useState(false);
  const [podium, setPodium] = useState([]);

  const currentQuestion = index !== null ? questions[index] : null;
  const hasMultiChoice = questions.some((q) => q.type === "multi");

  const enterFullscreen = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const startQuiz = () => {
    if (!questions.length) return;
    resetQuizScores();
    setCycle(1);
    setRunning(true);
    setIndex(0);
    enterFullscreen();
  };

  const closeQuiz = () => {
    setRunning(false);
    setIndex(0);
    setCycle(1);
    exitFullscreen();
  };

const finishQuiz = () => {
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
      <div className="w-full bg-white shadow-md border-b border-gray-300 p-4 flex flex-wrap items-center justify-between gap-4">

        {/* LEFT: Close / Start */}
        {!running ? (
          <div className="flex flex-col gap-3">
            {questions.length > 0 && (
              <button
                onClick={startQuiz}
                disabled={!hasPeople}
                className={`px-4 py-2 rounded text-white ${hasPeople ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-400 cursor-not-allowed"}`}
              >
                Start Quiz
              </button>
            )}
            {!hasPeople && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                No people loaded. Add participants in the People Manager before starting the quiz.
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={closeQuiz}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Close Quiz
          </button>
        )}

        {/* MIDDLE: Question Count */}
        {running && currentQuestion && (
          <div className="flex-1 text-center">
            <span className="text-lg font-semibold text-gray-700">
              Question {index + 1} / {questions.length}
            </span>
          </div>
        )}

        {/* RIGHT: Mode Switch */}
        {!running && (
          <div className="flex gap-2">
            <button
              onClick={() => setQuizMode("standard")}
              className={`px-3 py-1 rounded text-sm ${
                quizMode === "standard"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Standard
            </button>

            <button
              onClick={() => setQuizMode("standard-points")}
              className={`px-3 py-1 rounded text-sm ${
                quizMode === "standard-points"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Standard Points
            </button>

            {hasMultiChoice && (
              <button
                onClick={() => setQuizMode("gameshow")}
                className={`px-3 py-1 rounded text-sm ${
                  quizMode === "gameshow"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Game‑Show
              </button>
            )}
          </div>
        )}
      </div>

      {/* TRUE FULLSCREEN QUIZ AREA */}
      {running && currentQuestion && !showPodium && (
        <div
          className="
            flex 
            flex-col 
            lg:flex-row 
            w-full 
            h-[calc(100vh-80px)] 
            overflow-hidden
            lg:items-center
            lg:justify-center
          "
        >

          {/* FULLSCREEN QUESTION ENGINE */}
          <div
            className="
              flex-1 
              h-full 
              overflow-auto 
              px-8 
              py-10 
              lg:px-16 
              lg:py-20
              flex
              lg:items-center
              lg:justify-center
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
