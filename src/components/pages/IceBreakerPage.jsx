import {useEffect} from "react"; 
import { Link } from "react-router-dom";
import IceBreakerSetup  from "../icebreaker/IceBreakerSetup";
import IceBreakerPlay from "../icebreaker/IceBreakerPlay";
import usePeopleStore from "../store/usePeopleStore";

export default function IceBreakerPage({ running, setRunning }) {
  const { people, setParticipants } = usePeopleStore();
  const hasPeople = people.length > 0;

  useEffect(() => {
    setParticipants(people);
  }, [people, setParticipants]);

  if (!hasPeople) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold">Ice Breaker</h1>
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
      <IceBreakerSetup setRunning={setRunning} />
      <IceBreakerPlay running={running} setRunning={setRunning} />
    </div>
  );
}
