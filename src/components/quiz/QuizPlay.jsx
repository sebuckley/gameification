import { useState, useEffect } from "react";
import usePeople from "../store/usePeopleStore";
import confetti from "canvas-confetti";

/* ---------------------------------------------------------
   PERSON BADGE — used in correct modal, wrong modal, podium
--------------------------------------------------------- */
function PersonBadge({ person }) {
  if (!person) return null;

 const useName = person?.fullName || person?.preferredName || "";

  const initials = (useName)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg"
      style={{ backgroundColor: person.color + "22" }} // lighter tint
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow"
        style={{ backgroundColor: person.color }}
      >
        {initials}
      </div>

      <div className="font-semibold text-gray-800">
        {person.preferredName || person.fullName}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   COUNTDOWN RING
--------------------------------------------------------- */
function CountdownRing({ time, total = 60 }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (time / total) * circumference;

  return (
    <svg width="100" height="100">
      <circle
        cx="50"
        cy="50"
        r={radius}
        stroke="#e5e7eb"
        strokeWidth="8"
        fill="none"
      />
      <circle
        cx="50"
        cy="50"
        r={radius}
        stroke="#6366f1"
        strokeWidth="8"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={progress}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s linear" }}
      />
      <text
        x="50"
        y="55"
        textAnchor="middle"
        fontSize="20"
        className="font-bold fill-gray-700"
      >
        {time}s
      </text>
    </svg>
  );
}

/* ---------------------------------------------------------
   MAIN COMPONENT
--------------------------------------------------------- */
export default function QuizPlay() {
  const {
    people,
    questions,
    applyQuizResult,
    resetQuizScores,
    importQuestions
  } = usePeople();

  const quizPeople = people.filter((p) => p.inSpinner);

  const [index, setIndex] = useState(null);
  const [attempted, setAttempted] = useState([]);
  const [running, setRunning] = useState(false);
  const [timer, setTimer] = useState(0);

  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [modalCorrectPerson, setModalCorrectPerson] = useState(null);

  const [showWrongModal, setShowWrongModal] = useState(false);
  const [wrongTimer, setWrongTimer] = useState(60);
  const [wrongCountdownActive, setWrongCountdownActive] = useState(false);
  const [wrongPerson, setWrongPerson] = useState(null);

  const [showPodium, setShowPodium] = useState(false);
  const [podium, setPodium] = useState([]);

  const currentQuestion = index !== null ? questions[index] : null;

  /* ---------------------------------------------------------
     TIMER
  --------------------------------------------------------- */
  useEffect(() => {
    if (!running || currentQuestion === null) return;

    setTimer(0);
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t === 10) {
          const audio = new Audio("/timer-warning.mp3");
          audio.play().catch(() => {});
        }
        return t + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [index, running, currentQuestion]);

  /* ---------------------------------------------------------
     WRONG COUNTDOWN
  --------------------------------------------------------- */
  useEffect(() => {
    if (!wrongCountdownActive) return;

    setWrongTimer(60);
    const interval = setInterval(() => {
      setWrongTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          penaliseRemaining();
          setWrongCountdownActive(false);
          setShowWrongModal(false);
          nextQuestion();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [wrongCountdownActive]);

  /* ---------------------------------------------------------
     START QUIZ
  --------------------------------------------------------- */
  const startQuiz = () => {
    if (!questions || questions.length === 0) return;

    resetQuizScores();

    setRunning(true);
    setIndex(0);
    setAttempted([]);
    setShowAnswerModal(false);
    setShowWrongModal(false);
    setWrongCountdownActive(false);
    setWrongPerson(null);
    setShowPodium(false);
  };

  const closeQuiz = () => {
    setRunning(false);
    setIndex(null);
    setAttempted([]);
    setShowAnswerModal(false);
    setShowWrongModal(false);
    setWrongCountdownActive(false);
    setWrongPerson(null);
  };

  /* ---------------------------------------------------------
     FINISH QUIZ → PODIUM
  --------------------------------------------------------- */
  const finishQuiz = () => {
    const sorted = [...quizPeople].sort((a, b) => b.quizScore - a.quizScore);
    setPodium(sorted.slice(0, 3));
    setShowPodium(true);

    closeQuiz();
  };

  /* ---------------------------------------------------------
     NEXT QUESTION
  --------------------------------------------------------- */
  const nextQuestion = () => {
    setShowAnswerModal(false);
    setModalCorrectPerson(null);
    setShowWrongModal(false);
    setWrongCountdownActive(false);
    setWrongTimer(60);
    setWrongPerson(null);

    if (index + 1 >= questions.length) {
      finishQuiz();
    } else {
      setIndex(index + 1);
      setAttempted([]);
    }
  };

  /* ---------------------------------------------------------
     CONFETTI
  --------------------------------------------------------- */
  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  /* ---------------------------------------------------------
     PENALISE REMAINING
  --------------------------------------------------------- */
  const penaliseRemaining = () => {
    quizPeople.forEach((p) => {
      if (!attempted.includes(p.id)) {
        applyQuizResult(p.id, false);
      }
    });
  };

  /* ---------------------------------------------------------
     CORRECT ANSWER
  --------------------------------------------------------- */
  const handleCorrect = (personId) => {
    if (attempted.includes(personId)) return;

    const person = quizPeople.find((p) => p.id === personId);
    setModalCorrectPerson(person);

    applyQuizResult(personId, true);
    triggerConfetti();

    setAttempted((prev) => [...prev, personId]);
    setShowWrongModal(false);
    setWrongCountdownActive(false);
    setWrongPerson(null);
    setShowAnswerModal(true);
  };

  /* ---------------------------------------------------------
     WRONG ANSWER
  --------------------------------------------------------- */
  const handleWrong = (personId) => {
    if (attempted.includes(personId)) return;

    const person = quizPeople.find((p) => p.id === personId);
    setWrongPerson(person);

    applyQuizResult(personId, false);

    const newAttempted = [...attempted, personId];
    setAttempted(newAttempted);

    if (newAttempted.length === quizPeople.length) {
      setModalCorrectPerson(null);
      setShowWrongModal(false);
      setWrongCountdownActive(false);
      setShowAnswerModal(true);
      return;
    }

    setShowWrongModal(true);
    setWrongCountdownActive(true);
  };

  const handleNoOneAnswered = () => {
    penaliseRemaining();
    setShowWrongModal(false);
    setWrongCountdownActive(false);
    nextQuestion();
  };

  const handleClearWrongModal = () => {
    setShowWrongModal(false);
    setWrongCountdownActive(false);
    setWrongPerson(null);
  };

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */
  return (
    <div className="bg-white rounded-xl shadow p-5 border border-gray-300 space-y-4">

      <h2 className="text-xl font-bold">Quiz</h2>

      {!running && questions.length > 0 && (
        <button
          onClick={startQuiz}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Start Quiz
        </button>
      )}

      {running && (
        <button
          onClick={closeQuiz}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Close Quiz
        </button>
      )}

      {running && currentQuestion && (
        <div className="p-4 bg-gray-50 rounded border border-gray-200 space-y-4">

          <div className="flex justify-between items-center text-sm font-medium text-gray-600">
            <span>Time: {timer}s</span>
            <span>
              Question {index + 1} of {questions.length}
            </span>
          </div>

          <div className="text-lg font-semibold">
            {currentQuestion.question}
          </div>

          {!showAnswerModal && (
            <div className="space-y-2">
              {quizPeople.map((p) => {
                const disabled = attempted.includes(p.id);

                const initials = (p.fullName || p.preferredName)
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase();

                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 bg-white rounded border"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow"
                        style={{
                          backgroundColor: p.color,
                          border: `2px solid ${p.color}`
                        }}
                      >
                        {initials}
                      </div>

                      <span className="font-medium">
                        {p.preferredName || p.fullName}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        disabled={disabled}
                        onClick={() => handleCorrect(p.id)}
                        className={`px-3 py-1 rounded text-white ${
                          disabled
                            ? "bg-green-300 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        Correct
                      </button>

                      <button
                        disabled={disabled}
                        onClick={() => handleWrong(p.id)}
                        className={`px-3 py-1 rounded text-white ${
                          disabled
                            ? "bg-red-300 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                      >
                        Buzz ❌
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!showAnswerModal && !showWrongModal && (
            <button
              onClick={handleNoOneAnswered}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 w-full"
            >
              No One Answered
            </button>
          )}
        </div>
      )}

      {/* ---------------------------------------------------------
         CORRECT ANSWER MODAL
      --------------------------------------------------------- */}
      {showAnswerModal && currentQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-150 space-y-4 border">

            <h3 className="text-xl font-bold text-center">Answer</h3>

            <div className="text-center text-lg font-semibold">
              {currentQuestion.answer}
            </div>

            {modalCorrectPerson && (
              <div className="space-y-3">
                <PersonBadge person={modalCorrectPerson} />
                <div className="text-center text-green-700 font-medium">
                  Got it right!
                </div>
              </div>
            )}

            {!modalCorrectPerson && (
              <div className="text-center text-red-700 font-medium">
                Everyone got it wrong — remaining players lost 1 point.
              </div>
            )}

            <button
              onClick={nextQuestion}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Next Question
            </button>
          </div>
        </div>
      )}
{showAnswerModal && currentQuestion && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-lg p-6 w-150 min-w-[500px] space-y-4 border">

      <h3 className="text-xl font-bold text-center">Answer</h3>

      <div className="text-center text-lg font-semibold">
        {currentQuestion.answer}
      </div>

      {modalCorrectPerson && (
        <div className="space-y-3">
          <PersonBadge person={modalCorrectPerson} />
          <div className="text-center text-green-700 font-medium">
            Got it right!
          </div>
        </div>
      )}

      {!modalCorrectPerson && (
        <div className="text-center text-red-700 font-medium">
          Everyone got it wrong — remaining players lost 1 point.
        </div>
      )}

      <button
        onClick={nextQuestion}
        className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Next Question
      </button>
    </div>
  </div>
)}

      {/* ---------------------------------------------------------
         WRONG ANSWER MODAL
      --------------------------------------------------------- */}
{showWrongModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-lg p-6 w-96 min-w-[500px] space-y-4 border">

      <h3 className="text-xl font-bold text-center">Wrong Answer</h3>

      {wrongPerson && (
        <div className="space-y-3">
          <PersonBadge person={wrongPerson} />
          <div className="text-center text-red-700 font-medium">
            Answered incorrectly
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <CountdownRing time={wrongTimer} total={60} />
      </div>

      <div className="text-center text-gray-600">
        If nobody answers correctly before the timer ends,<br />
        <strong>everyone who hasn&apos;t answered will lose 1 point.</strong>
      </div>

      <button
        onClick={handleClearWrongModal}
        className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Continue – Next Player
      </button>

      <button
        onClick={handleNoOneAnswered}
        className="w-full px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 mt-2"
      >
        No One Answered
      </button>
    </div>
  </div>
)}

      {/* ---------------------------------------------------------
         PODIUM MODAL
      --------------------------------------------------------- */}
{showPodium && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-lg p-6 w-[420px] min-w-[500px] space-y-6 border text-center">

      <h3 className="text-2xl font-bold">Final Scores</h3>

      <div className="flex justify-center gap-4 items-end">

        {/* 2nd */}
        {podium[1] && (
          <div className="flex flex-col items-center space-y-2">
            <PersonBadge person={podium[1]} />
            <div className="font-semibold text-gray-700">2nd Place</div>
            <div className="text-sm text-gray-600">
              {podium[1].quizScore} pts
            </div>
          </div>
        )}

        {/* 1st */}
        {podium[0] && (
          <div className="flex flex-col items-center space-y-2 border-4 border-yellow-400 rounded-xl p-2">
            <PersonBadge person={podium[0]} />
            <div className="font-bold text-yellow-600 text-xl">
              1st Place
            </div>
            <div className="text-sm text-gray-600">
              {podium[0].quizScore} pts
            </div>
          </div>
        )}

        {/* 3rd */}
        {podium[2] && (
          <div className="flex flex-col items-center space-y-2">
            <PersonBadge person={podium[2]} />
            <div className="font-semibold text-gray-700">3rd Place</div>
            <div className="text-sm text-gray-600">
              {podium[2].quizScore} pts
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowPodium(false)}
        className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Close
      </button>
    </div>
  </div>
)}


    </div>
  );
}
