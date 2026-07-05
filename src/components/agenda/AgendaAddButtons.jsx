import { useState, useEffect, useRef } from "react";
import { agendaTypes } from "../../data/AgendaTypes";

export default function AgendaAddButtons({ onAdd, typeList = agendaTypes }) {
  const [addedId, setAddedId] = useState(null);
  const [widths, setWidths] = useState({});
  const refs = useRef({});

  // Measure each button's natural width once
  useEffect(() => {
    const newWidths = {};
    typeList.forEach((t) => {
      const el = refs.current[t.id];
      if (el) {
        newWidths[t.id] = el.getBoundingClientRect().width;
      }
    });
    setWidths(newWidths);
  }, [typeList]);

  const handleClick = (id) => {
    onAdd(id);
    setAddedId(id);

    setTimeout(() => setAddedId(null), 900);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {typeList.map((t) => {
        const Icon = t.icon;
        const isAdded = addedId === t.id;

        return (
          <button
            key={t.id}
            ref={(el) => (refs.current[t.id] = el)}
            onClick={() => handleClick(t.id)}
            className={`
              px-3 py-2 rounded font-semibold text-sm flex items-center gap-2
              transition-all duration-300 justify-center
              ${isAdded ? "scale-105" : "scale-100"}
            `}
            style={{
              backgroundColor: isAdded ? t.textColor : t.color,
              color: isAdded ? t.color : t.textColor,
              border: `2px solid ${t.color}`,
              width: widths[t.id] ? `${widths[t.id]}px` : "auto"
            }}
            title={t.description}
          >
            {isAdded ? (
              "Added!"
            ) : (
              <>
                <Icon size={16} />
                {t.label}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
