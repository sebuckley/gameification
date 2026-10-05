import { useEffect, useState } from "react";
import usePeople from "../store/usePeopleStore";
import AddPersonForm from "./AddPersonForm";
import PersonCard from "./PersonCard";
import { PERSON_TYPE_OPTIONS } from "../../data/PersonOptions";
import { getPersonForPeopleSet } from "../../utils/peopleSetMembers";

import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

export default function PeopleManager() {
  const { people, peopleSets = [], reorderPeople } = usePeople();
  const [activePeopleSetId, setActivePeopleSetId] = useState(() => peopleSets[0]?.id || "all");
  const [activeTypeFilter, setActiveTypeFilter] = useState("all");
  const activeSet = peopleSets.find((setItem) => setItem.id === activePeopleSetId) || null;
  const listPeople = activeSet
    ? people.filter((person) => activeSet.personIds.includes(person.id))
    : people;

  useEffect(() => {
    setActiveTypeFilter("all");
  }, [activePeopleSetId]);

  const typeLabelMap = PERSON_TYPE_OPTIONS.reduce((acc, option) => {
    acc[option.value] = option.label;
    return acc;
  }, {});

  const getPersonType = (person) => {
    const contextualPerson = getPersonForPeopleSet(person, activeSet?.id);
    if (contextualPerson?.personType) return String(contextualPerson.personType);
    if (contextualPerson?.isPresenter) return "presenter";
    return "participant";
  };

  const personTypeLabels = {
    participant: "Participants",
    presenter: "Presenters",
    "keynote-speaker": "Key Note Speakers",
    organiser: "Organisers",
    volunteer: "Volunteers",
    facilitator: "Facilitators",
    moderator: "Moderators",
    panelist: "Panelists",
    observer: "Observers",
  };

  const getTypeLabel = (type) => personTypeLabels[type] || typeLabelMap[type] || type;

  const typeCounts = listPeople.reduce((acc, person) => {
    const type = getPersonType(person);
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const filterCards = [
    { key: "all", label: activeSet ? "All in Set" : "All People", count: listPeople.length },
    ...Object.keys(typeCounts).sort((a, b) => getTypeLabel(a).localeCompare(getTypeLabel(b))).map((type) => ({
      key: type,
      label: getTypeLabel(type),
      count: typeCounts[type] || 0,
    })),
  ];

  const filteredPeople =
    activeTypeFilter === "all"
      ? listPeople
      : listPeople.filter((person) => getPersonType(person) === activeTypeFilter);

  // Counts
  const totalPeople = listPeople.length;
  const showRequirements = activeSet?.type !== "stakeholders";
  const totalDietary = listPeople.reduce(
    (sum, p) => sum + (p.dietaryRequirements?.length || 0),
    0
  );
  const totalAccessibility = listPeople.reduce(
    (sum, p) => sum + (p.accessibilityRequirements?.length || 0),
    0
  );
  const totalIncomplete = listPeople.filter((p) => {
    const contextualPerson = getPersonForPeopleSet(p, activeSet?.id);
    const fields = activeSet?.type === "stakeholders"
      ? [p.fullName, p.preferredName, p.email, p.organization, contextualPerson.personType]
      : activeSet?.type === "team"
        ? [p.fullName, p.preferredName, contextualPerson.personType]
        : [p.fullName, p.preferredName, p.email, contextualPerson.personType];
    return fields.filter(Boolean).length !== fields.length;
  }).length;

  // Drag handler
  const handleDragEnd = (result) => {
    if (activeTypeFilter !== "all" || activeSet) return;
    if (!result.destination) return;

    reorderPeople(result.source.index, result.destination.index);
  };

  return (
    <div className="space-y-6">

      {/* Which list to view */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="People list">
          {[{ id: "all", name: "Everyone" }, ...peopleSets].map((setItem) => {
            const isActive = activePeopleSetId === setItem.id;
            return (
              <button
                key={setItem.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActivePeopleSetId(setItem.id)}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {setItem.name}
              </button>
            );
          })}
        </div>
        {activeSet && (
          <p className="text-sm text-slate-500">
            {activeSet.type === "stakeholders" ? "Stakeholders" : activeSet.type === "training-event" ? "Training / Event" : "Team"} set · {listPeople.length} {listPeople.length === 1 ? "person" : "people"}
          </p>
        )}
      </div>

      <AddPersonForm peopleSetId={activeSet?.id} purpose={activeSet?.type || "all"} />

      {/* Summary + type filter */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
          <span><strong className="text-slate-900">{totalPeople}</strong> {totalPeople === 1 ? "person" : "people"}</span>
          {showRequirements && <span><strong className="text-slate-900">{totalDietary}</strong> dietary</span>}
          {showRequirements && <span><strong className="text-slate-900">{totalAccessibility}</strong> accessibility</span>}
          {totalIncomplete > 0 && <span className="font-semibold text-red-600">{totalIncomplete} incomplete</span>}
        </div>

        {filterCards.length > 2 && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-500">Show:</span>
            {filterCards.map((card) => {
              const isActive = activeTypeFilter === card.key;
              return (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => setActiveTypeFilter(card.key)}
                  className={`rounded-md border px-3 py-1 transition-colors ${
                    isActive
                      ? "border-indigo-300 bg-indigo-50 font-semibold text-indigo-800"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {card.key === "all" ? "All" : card.label} · {card.count}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {/* Draggable People List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="people-list">
          {(provided) => (
            <div
              className="grid gap-4 md:grid-cols-2"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {filteredPeople.map((p, index) => (
<Draggable key={p.id} draggableId={p.id} index={index} isDragDisabled={activeTypeFilter !== "all"}>
  {(provided) => (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className="relative"
    >
      <PersonCard
        person={p}
        index={index}
                purpose={activeSet?.type || "all"}
                peopleSetId={activeSet?.id || null}
        dragHandleProps={provided.dragHandleProps}
      />
    </div>
  )}
</Draggable>
              ))}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
