import { useState } from "react";
import GroupGenerator from "../groups/GroupGenerator";
import GroupHistory from "../groups/GroupHistory";
import GroupEditor from "../groups/GroupEditor";
import GroupsExportModal from "../groups/GroupsExportModal";

export default function GroupsPage() {
  const [editingIndex, setEditingIndex] = useState(null);
  const [showExport, setShowExport] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Groups</h1>

        <button
          onClick={() => setShowExport(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
        >
          Export Summary
        </button>
      </div>

      {/* Always show generator */}
      <GroupGenerator />

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
