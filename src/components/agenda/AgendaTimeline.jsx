import usePeople from "../store/usePeopleStore";
import {
  getAgendaColor,
  getAgendaIcon,
  getAgendaDescription,
  agendaTypes
} from "../../data/AgendaTypes";

const timeToMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export default function AgendaTimeline() {
  const { agendaStartTime, agendaItems } = usePeople();

  const start = timeToMinutes(agendaStartTime);
  const end = start + agendaItems.reduce((sum, i) => sum + i.minutes, 0);
  const totalMinutes = end - start;

  // Build unique legend entries
  const legend = Array.from(
    new Map(
      agendaItems.map((item) => [
        item.type,
        {
          type: item.type,
          label: item.label,
          Icon: getAgendaIcon(item.type),
          color: getAgendaColor(item.type)
        }
      ])
    ).values()
  );

  return (
    <div className="bg-white rounded-xl shadow border border-gray-300 p-4 space-y-4">
      <h3 className="text-lg font-bold text-gray-800">Timeline</h3>

      {/* TIMELINE */}
      <div className="relative w-full h-16 bg-gray-100 rounded-lg overflow-hidden">
        {agendaItems.map((item) => {
          const itemStart = timeToMinutes(item.startTime);
          const itemEnd = timeToMinutes(item.endTime);

          const leftPct = ((itemStart - start) / totalMinutes) * 100;
          const widthPct = ((itemEnd - itemStart) / totalMinutes) * 100;

          const Icon = getAgendaIcon(item.type);

          return (
            <div
              key={item.id}
              className="absolute top-0 h-full flex items-center justify-center text-white px-1"
              style={{
                left: `${leftPct}%`,
                width: `${widthPct}%`,
                backgroundColor: getAgendaColor(item.type)
              }}
              title={`${item.label} – ${getAgendaDescription(item.type)}`}
            >
              <Icon size={18} />
            </div>
          );
        })}
      </div>

      {/* TIME RANGE */}
      <div className="flex justify-between text-sm text-gray-600">
        <span>{agendaStartTime}</span>
        <span>{agendaItems[agendaItems.length - 1]?.endTime || ""}</span>
      </div>

{/* LEGEND */}
<div className="pt-4">
  <h4 className="text-sm font-semibold text-gray-700 mb-2">Legend</h4>

  <div className="
    grid 
    grid-cols-2 
    sm:grid-cols-3 
    md:grid-cols-4 
    gap-3
  ">
    {legend.map(({ type, label, Icon, color }) => (
      <div
        key={type}
        className="
          flex 
          items-center 
          gap-3 
          p-3 
          rounded-md 
          border 
          border-gray-200 
          bg-gray-50
          h-14
        "
      >
        {/* ICON BOX — fixed size */}
        <div
          className="
            w-8 
            h-8 
            flex 
            items-center 
            justify-center 
            rounded
          "
          style={{ backgroundColor: color }}
        >
          <Icon size={18} className="text-white" />
        </div>

        {/* LABEL — consistent text layout */}
        <span className="text-sm text-gray-700 truncate">
          {label}
        </span>
      </div>
    ))}
  </div>
</div>

    </div>
  );
}
