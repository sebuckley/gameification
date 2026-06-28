import { useState } from "react";
import GroupGenerator from "../groups/GroupGenerator";
import GroupHistory from "../groups/GroupHistory";
import GroupEditor from "../groups/GroupEditor";

export default function GroupsPage() {
  const [editingIndex, setEditingIndex] = useState(null);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Groups</h1>

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
    </div>
  );
}
