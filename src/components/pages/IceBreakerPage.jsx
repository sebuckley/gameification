import {useEffect} from "react"; 
import IceBreakerSetup  from "../icebreaker/IceBreakerSetup";
import IceBreakerPlay from "../icebreaker/IceBreakerPlay";
import usePeopleStore from "../store/usePeopleStore";

export default function IceBreakerPage({ running, setRunning }) {
  const { people, setParticipants } = usePeopleStore();

  useEffect(() => {
    setParticipants(people);
  }, [people, setParticipants]);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <IceBreakerSetup setRunning={setRunning} />
      <IceBreakerPlay running={running} setRunning={setRunning} />
    </div>
  );
}
