import QuizSetup from "../quiz/QuizSetup";
import QuizPlay from "../quiz/QuizPlay";
import usePeople from "../store/usePeopleStore";

export default function QuizPage({running, setRunning}) {
  const { people } = usePeople();

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">

       {/* Setup Section */}
      { !running && (
      
        <QuizSetup />

      )}

      {/* Play Section */}
      <QuizPlay running={ running } setRunning={ setRunning } />

    </div>
  );
}
