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

      {/* Draggable People List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="people-list">
          {(provided) => (
            <div
              className="grid gap-4 md:grid-cols-2"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {people.map((p, index) => (
<Draggable key={p.id} draggableId={p.id} index={index}>
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
