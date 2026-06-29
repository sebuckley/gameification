import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";

import { getAgendaDefaultMinutes  } from "../../data/AgendaTypes";
import { useMemo } from "react";
import usePeople from "../store/usePeopleStore";

// NEW COMPONENT IMPORTS
import AgendaHeader from "./AgendaHeader";
import AgendaAddButtons from "./AgendaAddButtons";
import AgendaItemCard from "./AgendaItemCard";

export default function AgendaScheduler() {
  const {
    agendaStartTime,
    agendaItems,
    setAgendaStartTime,
    addAgendaItem,
    updateAgendaItemsOrder,
    updateAgendaItem,
    removeAgendaItem,
    people
  } = usePeople();

  const presenters = people.filter((p) => p.isPresenter);

  console.log(agendaItems.map(i => i.id));

  const finishTime = useMemo(() => {
    const [h, m] = agendaStartTime.split(":").map(Number);
    const start = h * 60 + m;
    const total = agendaItems.reduce((sum, i) => sum + i.minutes, 0);
    const end = start + total;
    const hh = String(Math.floor(end / 60)).padStart(2, "0");
    const mm = String(end % 60).padStart(2, "0");
    return `${hh}:${mm}`;
  }, [agendaStartTime, agendaItems]);

const handleAddItem = (type) => {
  addAgendaItem({
    type,
    label: type === "other" ? "Session" : type.replace("-", " "),
    minutes: getAgendaDefaultMinutes(type),
    presenterId: presenters[0]?.id ?? null,
    guestPresenter: "",
    notes: "",
    artefactUrl: ""
  });
};

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = [...agendaItems];
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    updateAgendaItemsOrder(reordered);
  };

  return (
    <div className="bg-white rounded-xl shadow border border-gray-300 p-5 space-y-4">

      {/* Header */}
      <AgendaHeader
        agendaStartTime={agendaStartTime}
        finishTime={finishTime}
        setAgendaStartTime={setAgendaStartTime}
      />

      {/* Add buttons */}
      <AgendaAddButtons onAdd={handleAddItem} />

      {/* Drag & Drop Agenda */}
 <DragDropContext onDragEnd={onDragEnd}>
  <Droppable droppableId="agenda">
    {(dropProvided) => (
      <div
        className="space-y-2"
        ref={dropProvided.innerRef}
        {...dropProvided.droppableProps}
      >
        {agendaItems.map((item, index) => (
          <Draggable key={item.id} draggableId={item.id} index={index}>
            {(dragProvided) => (
              <div
                ref={dragProvided.innerRef}
                {...dragProvided.draggableProps}
                {...dragProvided.dragHandleProps}
              >
                <AgendaItemCard
                  item={item}
                  presenters={presenters}
                  updateAgendaItem={updateAgendaItem}
                  removeAgendaItem={removeAgendaItem}
                />
              </div>
            )}
          </Draggable>
        ))}

        {dropProvided.placeholder}
      </div>
    )}
  </Droppable>
</DragDropContext>
    </div>
  );
}
