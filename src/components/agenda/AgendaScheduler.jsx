import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";

import { agendaTypes, getAgendaDefaultMinutes  } from "../../data/AgendaTypes";
import { useMemo, useState } from "react";
import usePeople from "../store/usePeopleStore";
import { AGENDA_FOCUS_OPTIONS, AGENDA_TYPES_BY_FOCUS } from "../../data/AgendaFocus";

// NEW COMPONENT IMPORTS
import AgendaHeader from "./AgendaHeader";
import AgendaAddButtons from "./AgendaAddButtons";
import AgendaItemCard from "./AgendaItemCard";

import { nanoid } from "nanoid";

export default function AgendaScheduler({ eventType }) {
  const [showAllActivities, setShowAllActivities] = useState(false);
  const {
    agendaStartTime,
    agendaEventType = "all",
    agendaItems,
    events,
    questionSets,
    iceBreakerSets,
    peopleSets,
    setAgendaStartTime,
    addAgendaItem,
    updateAgendaItemsOrder,
    updateAgendaItem,
    removeAgendaItem,
    applyAgendaTemplate,
    addPersonToPeopleSet,
    removePersonFromPeopleSet,
    people,
  } = usePeople();

  const presenters = people.filter((p) => p.isPresenter);

  console.log(agendaItems);

  const finishTime = useMemo(() => {
    const [h, m] = agendaStartTime.split(":").map(Number);
    const start = h * 60 + m;
    const total = agendaItems.reduce((sum, i) => sum + i.minutes, 0);
    const end = start + total;
    const hh = String(Math.floor(end / 60)).padStart(2, "0");
    const mm = String(end % 60).padStart(2, "0");
    return `${hh}:${mm}`;
  }, [agendaStartTime, agendaItems]);

  const activeEventType = AGENDA_FOCUS_OPTIONS.some((focus) => focus.id === agendaEventType)
    ? agendaEventType
    : "all";
  const filteredAgendaTypes = !showAllActivities && AGENDA_TYPES_BY_FOCUS[activeEventType]
    ? agendaTypes.filter((type) => AGENDA_TYPES_BY_FOCUS[activeEventType].includes(type.id))
    : agendaTypes;

const allArtefacts = useMemo(() => {
  const seen = new Set();
  const collected = [];

  const allAgendaItems = [
    ...(events || []).flatMap((eventItem) => eventItem?.agendaItems || []),
    ...(agendaItems || []),
  ];

  allAgendaItems.forEach((agendaItem) => {
    (agendaItem?.artefacts || []).forEach((artefact) => {
      const name = (artefact?.name || "").trim();
      const url = (artefact?.url || "").trim();
      const hash = (artefact?.hash || "").trim();
      const type = artefact?.type || "";

      // Skip if no name
      if (!name) return;

      // Build dedupe key based on type
      const key = `${name.toLowerCase()}::${url.toLowerCase()}::${hash.toLowerCase()}`;

      if (seen.has(key)) return;
      seen.add(key);

      collected.push({
        name,
        url: url || null,
        hash: hash || null,
        type,
      });
    });

    // Legacy URL support
    const legacyUrl = (agendaItem?.artefactUrl || "").trim();
    if (legacyUrl) {
      const legacyName = (agendaItem?.label || "Document").trim();
      const legacyKey = `${legacyName.toLowerCase()}::${legacyUrl.toLowerCase()}::`;

      if (!seen.has(legacyKey)) {
        seen.add(legacyKey);
        collected.push({
          name: legacyName,
          url: legacyUrl,
          hash: null,
          type: "legacy-url",
        });
      }
    }
  });

  return collected;
}, [events, agendaItems]);

const starterSchedules = [
  {
    id: "interviewSession",
    title: "Interview Schedule",
    detail: "Structured · 60 minutes",
    type: "interview",
    style: "border-cyan-700 bg-cyan-50 text-cyan-950 hover:bg-cyan-100",
  },
  {
    id: "observationDay",
    title: "Observation Day",
    detail: "Full day · Multiple methods",
    type: "observation",
    style: "border-emerald-700 bg-emerald-50 text-emerald-950 hover:bg-emerald-100",
  },
  {
    id: "teamMeeting",
    title: "Team Meeting",
    detail: "Structured · 60 minutes",
    type: "team-updates",
    style: "border-blue-700 bg-blue-50 text-blue-950 hover:bg-blue-100",
  },
];




const handleAddItem = (type) => {
  addAgendaItem({
    id: nanoid(),
    type,
    label: type === "other" ? "Session" : type.replace("-", " "),
    minutes: getAgendaDefaultMinutes(type),
    presenterId: presenters[0]?.id ?? null,
    guestPresenter: "",
    description: "",
    notes: "",
    thumbnail: null,
    artefactUrl: "",
    artefacts: [],
    linkedQuestionSetId: null,
    linkedIceBreakerSetId: null,
    linkedPeopleSetId: null,
    enableGroupSetup: false,
    groupCount: 2,
    groupHistoryEntryId: null,
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
        agendaStartTime={ agendaStartTime }
        finishTime={ finishTime }
        setAgendaStartTime={ setAgendaStartTime }
      />

      {/* Add buttons
      <section className="space-y-2">
        <h2 className="text-sm font-bold text-slate-800">Starter schedules</h2>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {starterSchedules.map((schedule) => {
            const Icon = agendaTypes.find((type) => type.id === schedule.type)?.icon;
            return (
              <button
                key={schedule.id}
                type="button"
                onClick={() => handleStarterSchedule(schedule.id)}
                className={`flex min-h-20 items-center gap-3 rounded-md border-2 px-4 py-3 text-left transition-colors ${schedule.style}`}
              >
                {Icon && <Icon size={22} aria-hidden="true" />}
                <span>
                  <span className="block font-bold">{schedule.title}</span>
                  <span className="block text-xs opacity-75">{schedule.detail}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section> */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-medium text-slate-700">
            Event type: <span className="font-bold">{AGENDA_FOCUS_OPTIONS.find((focus) => focus.id === activeEventType)?.label || "All Activities"}</span>
          </div>
          <div className="inline-flex rounded-md border border-slate-300 bg-white p-1" role="group" aria-label="Activity button filter">
            <button
              type="button"
              aria-pressed={!showAllActivities}
              onClick={() => setShowAllActivities(false)}
              className={`rounded px-3 py-1.5 text-sm font-semibold ${!showAllActivities ? "bg-indigo-600 text-white" : "text-slate-700 hover:bg-slate-100"}`}
            >Filter to event type</button>
            <button
              type="button"
              aria-pressed={showAllActivities}
              onClick={() => setShowAllActivities(true)}
              className={`rounded px-3 py-1.5 text-sm font-semibold ${showAllActivities ? "bg-indigo-600 text-white" : "text-slate-700 hover:bg-slate-100"}`}
            >Show all activities</button>
          </div>
        </div>
        <AgendaAddButtons onAdd={handleAddItem} typeList={filteredAgendaTypes} />
      </div>

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
                      agendaTypeOptions={filteredAgendaTypes}
                      questionSets={questionSets}
                      iceBreakerSets={iceBreakerSets}
                      peopleSets={peopleSets}
                      people={people}
                      updateAgendaItem={updateAgendaItem}
                      removeAgendaItem={removeAgendaItem}
                      addPersonToPeopleSet={addPersonToPeopleSet}
                      removePersonFromPeopleSet={removePersonFromPeopleSet}
                      allArtefacts={allArtefacts}
                      eventType={eventType}
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
