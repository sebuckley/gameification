import QuizSetup from "../quiz/QuizSetup";
import QuizPlay from "../quiz/QuizPlay";
import usePeople from "../store/usePeopleStore";

export default function QuizPage({ running, setRunning }) {
  const { people } = usePeople();
  const noPeople = people.length === 0;

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
      {noPeople && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <div className="font-semibold">No people loaded</div>
          <div className="mt-1 text-sm text-amber-800">
            Add participants in the People Manager before starting the quiz.
          </div>
        </div>
      )}

      {/* Setup Section */}
      <QuizSetup />

      {/* Play Section */}
      <QuizPlay running={running} setRunning={setRunning} />
    </div>
  );
}
