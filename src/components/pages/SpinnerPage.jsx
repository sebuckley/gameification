import { useState } from "react";
import { Link } from "react-router-dom";
import usePeople from "../store/usePeopleStore";
import { getPeopleSetRoster } from "../../utils/peopleSetMembers";

import SpinnerWheel from "../spinner/SpinnerWheel";
import Leaderboard from "../shared/Leaderboard";
import ResultModal from "../spinner/ResultModal";

export default function SpinnerPage() {
  const { people, peopleSets = [], incrementAnswers, addHistory } = usePeople();
  const [winner, setWinner] = useState(null);
  const [autoRemove, setAutoRemove] = useState(false);
  const [activePeopleSetId, setActivePeopleSetId] = useState(() => peopleSets[0]?.id || "all");
  const activePeopleSet = peopleSets.find((setItem) => setItem.id === activePeopleSetId);
  const spinnerPeople = getPeopleSetRoster(people, activePeopleSet).filter((person) =>
    person?.inSpinner !== false && person?.isPresenter !== true
  );
  const hasPeople = spinnerPeople.length > 0;

  const handleResult = (person) => {
    incrementAnswers(person.id);
    addHistory(
      person.id,
      `Answered at ${new Date().toLocaleString()}`
    );


    setWinner({ ...person, wonAt: Date.now() });
  };

  if (!hasPeople) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold">Spinner</h1>
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
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">Spinner</h1>

      <label className="flex max-w-xl flex-col gap-1 text-sm font-semibold text-slate-700">
        People set
        <select
          value={activePeopleSetId}
          onChange={(event) => setActivePeopleSetId(event.target.value)}
          className="rounded border border-slate-300 bg-white px-3 py-2"
        >
          <option value="all">Full people list</option>
          {peopleSets.map((peopleSet) => <option key={peopleSet.id} value={peopleSet.id}>{peopleSet.name}</option>)}
        </select>
      </label>

      <SpinnerWheel people={spinnerPeople} onResult={handleResult} autoRemove={autoRemove} setAutoRemove={setAutoRemove}/>

      { !autoRemove ? <Leaderboard people={spinnerPeople} running={ false }/> : null }

      <ResultModal
        winner={winner}
        onClose={() => setWinner(null)}
      />
    </div>
  );
}
