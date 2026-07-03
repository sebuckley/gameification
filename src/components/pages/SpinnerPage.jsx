import { useState } from "react";
import usePeople from "../store/usePeopleStore";

import SpinnerWheel from "../spinner/SpinnerWheel";
import Leaderboard from "../shared/Leaderboard";
import ResultModal from "../spinner/ResultModal";

export default function SpinnerPage() {
  const { people, incrementAnswers, addHistory } = usePeople();
  const [winner, setWinner] = useState(null);
  const [autoRemove, setAutoRemove] = useState(false);

  const handleResult = (person) => {
    incrementAnswers(person.id);
    addHistory(
      person.id,
      `Answered at ${new Date().toLocaleString()}`
    );
    setWinner(person);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">Spinner</h1>

      <SpinnerWheel people={people} onResult={handleResult} autoRemove={autoRemove} setAutoRemove={setAutoRemove}/>

      { !autoRemove ? <Leaderboard people={people} running={ false }/> : null }

      <ResultModal
        winner={winner}
        onClose={() => setWinner(null)}
      />
    </div>
  );
}
