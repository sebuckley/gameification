import { useState } from "react";
import { Link } from "react-router-dom";
import GroupGenerator from "../groups/GroupGenerator";
import GroupHistory from "../groups/GroupHistory";
import GroupEditor from "../groups/GroupEditor";
import GroupsExportModal from "../groups/GroupsExportModal";
import usePeople from "../store/usePeopleStore";

export default function GroupsPage() {
  const [editingIndex, setEditingIndex] = useState(null);
  const [showExport, setShowExport] = useState(false);

  const people = usePeople((s) => s.people);
  const currentEventId = usePeople((s) => s.currentEventId);
  const events = usePeople((s) => s.events);
  const agendaEventTitle = usePeople((s) => s.agendaEventTitle);
  const agendaEventDate = usePeople((s) => s.agendaEventDate);
  const hasPeople = people.some((p) => p?.inGroups !== false);

  const activeEvent = events.find((event) => event.id === currentEventId);
  const eventName = activeEvent?.title || agendaEventTitle || "Unnamed Event";
  const eventDate = activeEvent?.date || agendaEventDate || null;

  if (!hasPeople) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold">Groups</h1>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <p className="text-sm">No people loaded for this event yet.</p>
          <Link
            to="/people"
            className="inline-block mt-3 px-3 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700"
          >
            Go to People
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Groups</h1>

        <button
          onClick={() => setShowExport(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
        >
          Export Groups
        </button>
      </div>

      {/* Always show generator */}
      <GroupGenerator />

      {/* ⭐ Event name + date */}
      <div className="bg-white border rounded p-4 flex flex-col gap-1">
        <div className="text-lg font-semibold text-gray-800">
          {eventName}
        </div>

        {eventDate && (
          <div className="text-sm text-gray-600">
            {new Date(eventDate).toLocaleDateString("en-GB", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        )}
      </div>

      {/* Show history OR editor */}
      {editingIndex === null ? (
        <GroupHistory onEdit={(i) => setEditingIndex(i)} />
      ) : (
        <GroupEditor
          index={editingIndex}
          onClose={() => setEditingIndex(null)}
        />
      )}

      {showExport && <GroupsExportModal onClose={() => setShowExport(false)} />}
    </div>
  );
}
