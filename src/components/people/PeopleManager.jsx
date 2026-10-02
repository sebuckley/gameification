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

      {/* Add Person */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="flex min-w-64 flex-1 flex-col gap-1 text-sm font-semibold text-slate-700">
          People list
          <select
            value={activePeopleSetId}
            onChange={(event) => setActivePeopleSetId(event.target.value)}
            className="rounded border border-slate-300 bg-white px-3 py-2"
          >
            <option value="all">Full people list</option>
            {peopleSets.map((setItem) => (
              <option key={setItem.id} value={setItem.id}>
                {setItem.type === "stakeholders" ? "Stakeholders" : setItem.type === "training-event" ? "Training / Event" : "Team"}: {setItem.name}
              </option>
            ))}
          </select>
        </label>
        {activeSet && <div className="pb-2 text-sm text-slate-500">Showing {listPeople.length} people in {activeSet.name}</div>}
      </div>

      <AddPersonForm peopleSetId={activeSet?.id} purpose={activeSet?.type || "all"} />

      {/* Stats */}
      <div className={`grid grid-cols-2 gap-4 text-sm ${showRequirements ? "md:grid-cols-4" : "md:grid-cols-2"}`}>
        <div className="p-3 bg-white border rounded-lg shadow-sm">
          <div className="font-semibold text-gray-700">People Added</div>
          <div className="text-xl font-bold">{totalPeople}</div>
        </div>

        {showRequirements && <div className="p-3 bg-white border rounded-lg shadow-sm">
          <div className="font-semibold text-gray-700">Dietary Items</div>
          <div className="text-xl font-bold">{totalDietary}</div>
        </div>}

        {showRequirements && <div className="p-3 bg-white border rounded-lg shadow-sm">
          <div className="font-semibold text-gray-700">Accessibility Items</div>
          <div className="text-xl font-bold">{totalAccessibility}</div>
        </div>}

        <div className="p-3 bg-white border rounded-lg shadow-sm">
          <div className="font-semibold text-gray-700">Not Complete</div>
          <div className="text-xl font-bold text-red-600">{totalIncomplete}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold text-slate-700">Filter by person type</div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-sm">
          {filterCards.map((card) => {
            const isActive = activeTypeFilter === card.key;
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => setActiveTypeFilter(card.key)}
                className={`p-3 border rounded-lg shadow-sm text-left transition-colors ${
                  isActive
                    ? "bg-indigo-50 border-indigo-300"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="font-semibold text-gray-700">{card.label}</div>
                <div className={`text-xl font-bold ${isActive ? "text-indigo-700" : "text-gray-900"}`}>
                  {card.count}
                </div>
              </button>
            );
          })}
        </div>
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
