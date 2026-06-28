import { useState } from "react";
import usePeople from "../store/usePeopleStore";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

// Lighten colour
const lighten = (hex, amount = 0.45) => {
  if (!hex) return "#f3f4f6";
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);

  const lr = Math.min(255, Math.floor(r + (255 - r) * amount));
  const lg = Math.min(255, Math.floor(g + (255 - g) * amount));
  const lb = Math.min(255, Math.floor(b + (255 - b) * amount));

  return (
    "#" +
    lr.toString(16).padStart(2, "0") +
    lg.toString(16).padStart(2, "0") +
    lb.toString(16).padStart(2, "0")
  );
};

// Initials from FULL NAME
const initials = (fullName) =>
  fullName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .join("");

export default function GroupEditor({ index, onClose }) {
  const groupsHistory = usePeople((s) => s.groupsHistory);
  const updateGroupHistory = usePeople((s) => s.updateGroupHistory);

  const session = groupsHistory[index];

  // ⭐ Add stable IDs to groups
  const [groups, setGroups] = useState(
    session.groups.map((g) => ({
      id: crypto.randomUUID(),
      members: g,
    }))
  );

  const onDragEnd = (result) => {
    const { source, destination, type } = result;
    if (!destination) return;

    // ⭐ Reorder entire groups
    if (type === "GROUP") {
      const newGroups = Array.from(groups);
      const [moved] = newGroups.splice(source.index, 1);
      newGroups.splice(destination.index, 0, moved);

      setGroups(newGroups);
      updateGroupHistory(index, newGroups.map((g) => g.members));
      return;
    }

    // ⭐ Move people between groups
    const sourceGroup = parseInt(source.droppableId, 10);
    const destGroup = parseInt(destination.droppableId, 10);

    const newGroups = groups.map((g) => ({
      ...g,
      members: [...g.members],
    }));

    const [movedPerson] = newGroups[sourceGroup].members.splice(
      source.index,
      1
    );
    newGroups[destGroup].members.splice(destination.index, 0, movedPerson);

    setGroups(newGroups);
    updateGroupHistory(index, newGroups.map((g) => g.members));
  };

  return (
    <div className="space-y-6">

      {/* Back button */}
      <button
        onClick={onClose}
        className="
          px-3 py-1 rounded 
          bg-indigo-600 text-white 
          hover:bg-indigo-700 
          text-sm font-medium
        "
      >
        Back to Groups
      </button>

      <h2 className="text-xl font-bold">
        Editing: {session.sessionName || "Untitled Session"}
      </h2>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable
          droppableId="all-groups"
          direction="horizontal"
          type="GROUP"
        >
          {(provided) => (
            <div
              className="flex flex-wrap gap-4"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {groups.map((group, groupIndex) => (
                <Draggable
                  key={group.id}
                  draggableId={group.id}
                  index={groupIndex}
                >
                  {(groupProvided, groupSnapshot) => (
                    <div
                      ref={groupProvided.innerRef}
                      {...groupProvided.draggableProps}
                      className={`
                        rounded border bg-white shadow-sm 
                        w-64 flex-shrink-0
                        transition-transform transition-shadow duration-150
                        ${
                          groupSnapshot.isDragging
                            ? "shadow-lg scale-[1.02]"
                            : "shadow"
                        }
                      `}
                    >
                      {/* Group header */}
                      <div
                        className="bg-indigo-600 text-white px-4 py-2 rounded-t font-semibold cursor-grab"
                        {...groupProvided.dragHandleProps}
                      >
                        Group {groupIndex + 1}
                      </div>

                      <Droppable droppableId={String(groupIndex)} type="PERSON">
                        {(provided, snapshot) => (
                          <ul
                            className={`
                              p-3 space-y-3 min-h-[3rem]
                              transition-colors duration-150
                              ${
                                snapshot.isDraggingOver
                                  ? "bg-indigo-50"
                                  : "bg-white"
                              }
                            `}
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {group.members.map((p, personIndex) => {
                              const bg = lighten(p.color, 0.55);
                              const border = p.color;

                              return (
                                <Draggable
                                  key={p.id}
                                  draggableId={p.id}
                                  index={personIndex}
                                >
                                  {(provided, snapshot) => (
                                    <li
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={`
                                        p-2 rounded flex items-center gap-3
                                        transition-transform transition-shadow duration-150
                                        ${
                                          snapshot.isDragging
                                            ? "shadow-lg scale-[1.02]"
                                            : "shadow-sm"
                                        }
                                      `}
                                      style={{
                                        backgroundColor: bg,
                                        border: `2px solid ${border}`,
                                        ...provided.draggableProps.style,
                                      }}
                                    >
                                      {/* Drag handle: initials circle */}
                                      <div
                                        {...provided.dragHandleProps}
                                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow cursor-grab"
                                        style={{
                                          backgroundColor: p.color,
                                          border: `2px solid ${border}`,
                                        }}
                                      >
                                        {initials(p.fullName)}
                                      </div>

                                      <span className="font-medium text-gray-800">
                                        {p.preferredName || p.fullName}
                                      </span>
                                    </li>
                                  )}
                                </Draggable>
                              );
                            })}

                            {provided.placeholder}
                          </ul>
                        )}
                      </Droppable>
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
