import { useState } from "react";
import usePeople from "../store/usePeopleStore";

import StandardQuizEngine from "./StandardQuiz/StandardQuizEngine";
import GameShowEngine from "./gameshow/GameShowEngine";

import PodiumModal from "./shared/PodiumModal";

export default function QuizPlay() {
  const { people, questions, resetQuizScores } = usePeople();

  const quizPeople = people.filter((p) => p.inSpinner);

  const [index, setIndex] = useState(null);
  const [running, setRunning] = useState(false);
  const [quizMode, setQuizMode] = useState("standard");

  const [showPodium, setShowPodium] = useState(false);
  const [podium, setPodium] = useState([]);

  const currentQuestion = index !== null ? questions[index] : null;
  const hasMultiChoice = questions.some((q) => q.type === "multi");

  const startQuiz = () => {
    if (!questions.length) return;
    resetQuizScores();
    setRunning(true);
    setIndex(0);
  };

  const closeQuiz = () => {
    setRunning(false);
    setIndex(null);
  };

  const finishQuiz = () => {
    const sorted = [...quizPeople].sort((a, b) => b.quizScore - a.quizScore);
    setPodium(sorted.slice(0, 3));
    setShowPodium(true);
    closeQuiz();
  };

  const nextQuestion = () => {
    if (index + 1 >= questions.length) {
      finishQuiz();
    } else {
      setIndex(index + 1);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-5 border border-gray-300 space-y-4">

      <h2 className="text-xl font-bold">Quiz</h2>

      {/* MODE SWITCH */}
      <div className="flex gap-2 items-center">
        <span className="text-sm font-medium text-gray-700">Mode:</span>

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

      {/* START BUTTON */}
      {!running && questions.length > 0 && (
        <button
          onClick={startQuiz}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Start Quiz
        </button>
      )}

      {!questions.length && (
        <p className="text-gray-600 text-sm italic">
          Please set up the quiz. The start button will appear once questions are added.
        </p>
      )}

      {/* CLOSE BUTTON */}
      {running && (
        <button
          onClick={closeQuiz}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Close Quiz
        </button>
      )}

      {/* ENGINE RENDER */}
      {running && currentQuestion && (
        <>
          {quizMode === "standard" && (
            <StandardQuizEngine
              currentQuestion={currentQuestion}
              index={index}
              questions={questions}
              quizPeople={quizPeople}
              nextQuestion={nextQuestion}
            />
          )}

          {quizMode === "gameshow" && currentQuestion.type === "multi" && (
            <GameShowEngine
              currentQuestion={currentQuestion}
              index={index}
              questions={questions}
              nextQuestion={nextQuestion}
            />
          )}
        </>
      )}

      {/* PODIUM */}
      <PodiumModal
        show={showPodium}
        podium={podium}
        onClose={() => setShowPodium(false)}
      />
    </div>
  );
}
