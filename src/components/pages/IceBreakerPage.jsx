import {useEffect} from "react"; 
import IceBreakerSetup  from "../icebreaker/IceBreakerSetup";
import IceBreakerPlay from "../icebreaker/IceBreakerPlay";
import usePeopleStore from "../store/usePeopleStore";

export default function IceBreakerPage({ running, setRunning }) {
  const { people, setParticipants } = usePeopleStore();
  const noPeople = people.length === 0;

  useEffect(() => {
    setParticipants(people);
  }, [people, setParticipants]);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {noPeople && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <div className="font-semibold">No people loaded</div>
          <div className="mt-1 text-sm text-amber-800">
            Add participants in the People Manager before starting the ice breaker.
          </div>
        </div>
      )}
      <IceBreakerSetup setRunning={setRunning} />
      <IceBreakerPlay running={running} setRunning={setRunning} />
    </div>
  );
}
