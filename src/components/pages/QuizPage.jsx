import QuizSetup from "../quiz/QuizSetup";
import QuizPlay from "../quiz/QuizPlay";
import { Link } from "react-router-dom";
import usePeople from "../store/usePeopleStore";

export default function QuizPage({ running, setRunning }) {
  const { people } = usePeople();
  const hasPeople = people.some((p) => p?.inSpinner !== false);

  // ⭐ When quiz is running → FULLSCREEN MODE
  if (running) {
    return (
      <div className="w-full h-screen">
        <QuizPlay running={running} setRunning={setRunning} />
      </div>
    );
  }

  // ⭐ When quiz is NOT running → normal centered layout
  if (!hasPeople) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold">Quiz</h1>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <p className="text-sm">No people loaded for this event yet.</p>
          <Link
            to="/people"
            className="inline-block mt-3 px-3 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700"
          >
            Go to People
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Setup Section */}
      <QuizSetup />

      {/* Play Section */}
      <QuizPlay running={running} setRunning={setRunning} />
    </div>
  );
}
