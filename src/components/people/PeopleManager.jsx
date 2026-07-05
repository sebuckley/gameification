import { useState } from "react";
import usePeople from "../store/usePeopleStore";
import AddPersonForm from "./AddPersonForm";
import PersonCard from "./PersonCard";

import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

export default function PeopleManager() {
  const { people, reorderPeople } = usePeople();
  const [activeTypeFilter, setActiveTypeFilter] = useState("all");

  const getPersonType = (person) => {
    if (person?.personType) return String(person.personType);
    if (person?.isPresenter) return "presenter";
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

  const typeCounts = people.reduce((acc, person) => {
    const type = getPersonType(person);
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const dynamicTypes = Object.keys(typeCounts)
    .filter((type) => !["participant", "presenter"].includes(type) && typeCounts[type] > 0)
    .sort((a, b) => (personTypeLabels[a] || a).localeCompare(personTypeLabels[b] || b));

  const filterCards = [
    { key: "all", label: "All People", count: people.length },
    { key: "participant", label: "Participants", count: typeCounts.participant || 0 },
    { key: "presenter", label: "Presenters", count: typeCounts.presenter || 0 },
    ...dynamicTypes.map((type) => ({
      key: type,
      label: personTypeLabels[type] || type,
      count: typeCounts[type] || 0,
    })),
  ];

  const filteredPeople =
    activeTypeFilter === "all"
      ? people
      : people.filter((person) => getPersonType(person) === activeTypeFilter);

  // Counts
  const totalPeople = people.length;
  const totalDietary = people.reduce(
    (sum, p) => sum + (p.dietaryRequirements?.length || 0),
    0
  );
  const totalAccessibility = people.reduce(
    (sum, p) => sum + (p.accessibilityRequirements?.length || 0),
    0
  );
  const totalIncomplete = people.filter((p) => {
    const fields = [
      p.fullName,
      p.preferredName,
      p.email,
      p.dietaryRequirements?.length,
      p.accessibilityRequirements?.length,
      p.notesHistory?.length,
    ];
    return fields.filter(Boolean).length !== fields.length;
  }).length;

  // Drag handler
  const handleDragEnd = (result) => {
    if (activeTypeFilter !== "all") return;
    if (!result.destination) return;

    reorderPeople(result.source.index, result.destination.index);
  };

  return (
    <div className="space-y-6">

      {/* Add Person */}
      <AddPersonForm />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="p-3 bg-white border rounded-lg shadow-sm">
          <div className="font-semibold text-gray-700">People Added</div>
          <div className="text-xl font-bold">{totalPeople}</div>
        </div>

        <div className="p-3 bg-white border rounded-lg shadow-sm">
          <div className="font-semibold text-gray-700">Dietary Items</div>
          <div className="text-xl font-bold">{totalDietary}</div>
        </div>

        <div className="p-3 bg-white border rounded-lg shadow-sm">
          <div className="font-semibold text-gray-700">Accessibility Items</div>
          <div className="text-xl font-bold">{totalAccessibility}</div>
        </div>

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
