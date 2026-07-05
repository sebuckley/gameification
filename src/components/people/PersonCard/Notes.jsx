import { StickyNote, Plus } from "lucide-react";
import DropdownSection from "./DropdownSection";

export default function NotesSection({
  notesHistory = [],
  olderNotesOpen,
  setOlderNotesOpen,
  noteDraft,
  setNoteDraft,
  addNote,
}) {
  const hasNotes = notesHistory.length > 0;

  return (
    <div className="flex flex-col gap-3">

      {/* Header */}
      <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <StickyNote size={16} />
        Notes
      </span>

      {/* Add Note */}
      <div>
        <textarea
          className="border p-2 rounded w-full resize-none border-gray-300 text-sm"
          rows={3}
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          placeholder="Add a note about this person..."
        />

        <button
          className="px-3 py-2 bg-gray-100 rounded border text-sm flex items-center gap-2 mt-2"
          onClick={addNote}
        >
          <Plus size={16} /> Add Note
        </button>
      </div>

      {/* Notes Display */}
      {hasNotes && (
        <div className="mt-1">

          {/* Most Recent Note */}
          <div className="p-3 bg-gray-50 border rounded-lg mb-2">
            <div className="text-xs text-gray-500 font-medium">
              {notesHistory[0].split(" — ")[1]}
            </div>
            <div className="text-sm text-gray-800">
              {notesHistory[0].split(" — ")[0]}
            </div>
          </div>

          {/* Older Notes */}
          {notesHistory.length > 1 && (
            <DropdownSection
              label="Older Notes"
              icon={<StickyNote size={14} />}
              open={olderNotesOpen}
              setOpen={setOlderNotesOpen}
            >
              <ul className="ml-4 list-disc text-sm text-gray-700 space-y-2">
                {notesHistory.slice(1).map((note, i) => {
                  const [text, timestamp] = note.split(" — ");
                  return (
                    <li key={i}>
                      <div className="text-xs text-gray-500">{timestamp}</div>
                      <div>{text}</div>
                    </li>
                  );
                })}
              </ul>
            </DropdownSection>
          )}
        </div>
      )}
    </div>
  );
}
