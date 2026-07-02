import QuizSetup from "../quiz/QuizSetup";
import QuizPlay from "../quiz/QuizPlay";
import usePeople from "../store/usePeopleStore";

export default function QuizPage({ running, setRunning }) {
  const { people } = usePeople();

  // ⭐ When quiz is running → FULLSCREEN MODE
  if (running) {
    return (
      <div className="w-full h-screen">
        <QuizPlay running={running} setRunning={setRunning} />
      </div>
    );
  }

  // ⭐ When quiz is NOT running → normal centered layout
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">

      {/* Setup Section */}
      <QuizSetup />

      {/* Play Section */}
      <QuizPlay running={running} setRunning={setRunning} />

    </div>
  );
}
