import { useState, useEffect, useRef } from "react";
import usePeople from "../store/usePeopleStore";
import {
  getAgendaColor,
  getAgendaTextColor,
  getAgendaIcon,
  getAgendaDescription,
  getAgendaType
} from "../../data/AgendaTypes";

import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

const timeToMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export default function AgendaTimeline() {
  const { agendaStartTime, agendaItems } = usePeople();

  const [selectedItem, setSelectedItem] = useState(null);
  const [needsScroll, setNeedsScroll] = useState(false);
  const [zoom, setZoom] = useState(1);

  const wrapperRef = useRef(null);
  const timelineRef = useRef(null);

  const start = timeToMinutes(agendaStartTime);
  const end = start + agendaItems.reduce((sum, i) => sum + i.minutes, 0);
  const totalMinutes = end - start;

  // Build legend
  const legend = Array.from(
    new Map(
      agendaItems.map((item) => {
        const type = item.type;
        return [
          getAgendaType(type),
          {
            type: getAgendaType(type),
            label: item.label,
            Icon: getAgendaIcon(type),
            backgroundColor: getAgendaColor(type),
            textColor: getAgendaTextColor(type)
          }
        ];
      })
    ).values()
  );

  // Detect if icons are too small → enable scroll
  useEffect(() => {
    const el = timelineRef.current;
    if (!el) return;

    const MIN_ICON_WIDTH = 40;
    const totalWidthNeeded = agendaItems.length * MIN_ICON_WIDTH;
    const containerWidth = el.offsetWidth;

    setNeedsScroll(totalWidthNeeded > containerWidth);
  }, [agendaItems]);

  // TOUCH SWIPE HANDLING (fixes desktop touch screens)
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let startX = 0;

    const onTouchStart = (e) => {
      startX = e.touches[0].clientX;
    };

    const onTouchMove = (e) => {
      const dx = startX - e.touches[0].clientX;
      wrapper.scrollLeft += dx;
      startX = e.touches[0].clientX;
      e.preventDefault();
    };

    wrapper.addEventListener("touchstart", onTouchStart, { passive: false });
    wrapper.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      wrapper.removeEventListener("touchstart", onTouchStart);
      wrapper.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  // Zoom controls
  const zoomIn = () => setZoom((z) => Math.min(3, z + 0.2));
  const zoomOut = () => setZoom((z) => Math.max(1, z - 0.2));
  const resetZoom = () => setZoom(1);

  return (
    <div className="bg-white rounded-xl shadow border border-gray-300 p-4 space-y-4">
      <h3 className="text-lg font-bold text-gray-800">Timeline</h3>

      {/* ZOOM BUTTONS */}
      <div className="flex items-center gap-3">
        <button
          onClick={zoomIn}
          className="p-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          <ZoomIn size={18} />
        </button>

        <button
          onClick={zoomOut}
          className="p-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          <ZoomOut size={18} />
        </button>

        <button
          onClick={resetZoom}
          className="p-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* ZOOM + SCROLL WRAPPER */}
      <div
        ref={wrapperRef}
        className={`hide-scrollbar ${
          needsScroll ? "overflow-x-scroll" : "overflow-hidden"
        }`}
        style={{
          touchAction: "none", // IMPORTANT: enables pinch + prevents page scroll
        }}
      >
        <div
          ref={timelineRef}
          className="relative h-16 bg-gray-100 rounded-lg"
          style={{
            width: needsScroll ? "200%" : "100%",
            transform: `scale(${zoom})`,
            transformOrigin: "left center"
          }}
        >
          {agendaItems.map((item) => {
            const itemStart = timeToMinutes(item.startTime);
            const itemEnd = timeToMinutes(item.endTime);

            const leftPct = ((itemStart - start) / totalMinutes) * 100;
            const widthPct = ((itemEnd - itemStart) / totalMinutes) * 100;

            const Icon = getAgendaIcon(item.type);

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="
                  absolute top-0 h-full flex items-center justify-center 
                  cursor-pointer transition-transform active:scale-95
                "
                style={{
                  left: `${leftPct}%`,
                  width: `${widthPct}%`,
                  backgroundColor: getAgendaColor(item.type),
                  color: getAgendaTextColor(item.type)
                }}
              >
                <Icon size={18} />
              </div>
            );
          })}
        </div>
      </div>

      {/* TIME RANGE */}
      <div className="flex justify-between text-sm text-gray-600">
        <span>{agendaStartTime}</span>
        <span>{agendaItems[agendaItems.length - 1]?.endTime || ""}</span>
      </div>

      {/* LEGEND */}
      <div className="pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Legend</h4>

        <div
          className="
            grid 
            grid-cols-2 
            sm:grid-cols-3 
            md:grid-cols-4 
            gap-3
          "
        >
          {legend.map(({ type, label, Icon, backgroundColor, textColor }) => (
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
              <div
                className="
                  w-8 
                  h-8 
                  flex 
                  items-center 
                  justify-center 
                  rounded
                "
                style={{ backgroundColor, color: textColor }}
              >
                <Icon size={18} />
              </div>

              <span className="text-sm text-gray-700 truncate">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL POP OUT */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-80 space-y-3">
            <h3 className="text-lg font-bold">{selectedItem.label}</h3>

            <p className="text-sm text-gray-700">
              {getAgendaDescription(selectedItem.type)}
            </p>

            <button
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md"
              onClick={() => setSelectedItem(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
