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
const initials = (fullName) => {
  if (!fullName) return "";
  return fullName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .join("");
};

export default function GroupGenerator() {
  const people = usePeople((s) => s.people);
  const saveGroups = usePeople((s) => s.saveGroups);

  const [size, setSize] = useState(2);
  const [groups, setGroups] = useState([]);
  const [sessionName, setSessionName] = useState("");

  const generate = () => {
    const eligible = people.filter(
      (p) => p.inGroups === true && p.isPresenter === false
    );

    if (!eligible.length || size <= 0) return;

    const shuffled = [...eligible].sort(() => Math.random() - 0.5);

    const result = [];
    for (let i = 0; i < shuffled.length; i += size) {
      result.push(shuffled.slice(i, i + size));
    }

    setGroups(result);
    autoSave(result);
  };

  // Save FULL PERSON OBJECTS
  const autoSave = (currentGroups) => {
    saveGroups(currentGroups, sessionName);
  };

  const onDragEnd = (result) => {
    const { source, destination, type } = result;
    if (!destination) return;

    // Reorder groups
    if (type === "GROUP") {
      const newGroups = Array.from(groups);
      const [movedGroup] = newGroups.splice(source.index, 1);
      newGroups.splice(destination.index, 0, movedGroup);
      setGroups(newGroups);
      autoSave(newGroups);
      return;
    }

    // Move people between groups
    const sourceGroupIndex = parseInt(source.droppableId, 10);
    const destGroupIndex = parseInt(destination.droppableId, 10);

    const newGroups = groups.map((g) => [...g]);

    const [movedPerson] = newGroups[sourceGroupIndex].splice(source.index, 1);
    newGroups[destGroupIndex].splice(destination.index, 0, movedPerson);

    setGroups(newGroups);
    autoSave(newGroups);
  };

  return (
    <div className="space-y-6">

      {/* Session Name */}
      <div className="flex gap-2 items-center">
        <label className="text-sm font-medium">Session Name</label>
        <input
          type="text"
          className="border p-2 rounded w-64"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          placeholder="e.g. Morning Groups"
        />
      </div>

      {/* Group Size */}
      <div className="flex gap-2 items-center">
        <label className="text-sm font-medium">Group size</label>
        <input
          type="number"
          className="border p-2 rounded w-24"
          value={size}
          min={1}
          onChange={(e) => setSize(Number(e.target.value))}
        />
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          onClick={generate}
        >
          Generate
        </button>
      </div>

    </div>
  );
}
