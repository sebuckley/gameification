import QuizSetup from "../quiz/QuizSetup";
import QuizPlay from "../quiz/QuizPlay";
import Leaderboard from "../shared/Leaderboard"; // uses your existing leaderboard style
import usePeople from "../store/usePeopleStore";

export default function QuizPage() {
  const { people } = usePeople();

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">

      {/* Setup Section */}
      <QuizSetup />

      {/* Play Section */}
      <QuizPlay />

      {/* Leaderboard */}
      <Leaderboard people={people} data={"quiz"}/>
    </div>
  );
}
