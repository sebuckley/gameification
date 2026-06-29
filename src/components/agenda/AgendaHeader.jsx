export default function AgendaHeader({
  agendaStartTime,
  finishTime,
  setAgendaStartTime
}) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <div className="font-bold text-lg">Agenda Scheduler</div>
        <div className="text-sm text-gray-600">
          Start: {agendaStartTime} · Finish: {finishTime}
        </div>
      </div>

      <input
        type="time"
        value={agendaStartTime}
        onChange={(e) => setAgendaStartTime(e.target.value)}
        className="border rounded p-2"
      />
    </div>
  );
}
