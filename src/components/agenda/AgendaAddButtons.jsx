import { agendaTypes } from "../../data/AgendaTypes";

export default function AgendaAddButtons({ onAdd, typeList = agendaTypes }) {
  return (
    <div className="flex flex-wrap gap-2">
      {typeList.map((t) => {
        const Icon = t.icon;

        return (
          <button
            key={t.id}
            onClick={() => onAdd(t.id)}
            className="px-3 py-2 rounded text-white font-semibold text-sm flex items-center gap-2"
            style={{
              backgroundColor: t.color,
              color: t.textColor
            }}
            title={t.description} // tooltip
          >
            <Icon size={16} />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
