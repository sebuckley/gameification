import usePeople from "../store/usePeopleStore";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

export default function GroupHistory({ onEdit }) {
  const groupsHistory = usePeople((s) => s.groupsHistory);
  const removeGroupHistory = usePeople((s) => s.removeGroupHistory);
  const updateOrder = usePeople((s) => s.updateGroupHistoryOrder);

  // Add stable IDs to each history entry
  const historyWithIds = groupsHistory.map((entry) => ({
    ...entry,
    _id: entry._id || crypto.randomUUID(),
  }));

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const newOrder = Array.from(historyWithIds);
    const [moved] = newOrder.splice(source.index, 1);
    newOrder.splice(destination.index, 0, moved);

    updateOrder(newOrder);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="history-list">
        {(provided) => (
          <div
            className="space-y-4"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {historyWithIds.map((entry, i) => {
              const createdDate = new Date(entry.timestamp).toLocaleDateString("en-GB");
              const createdTime = new Date(entry.timestamp)
                .toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
                .toLowerCase();

              const updatedDate = entry.updatedAt
                ? new Date(entry.updatedAt).toLocaleDateString("en-GB")
                : null;

              const updatedTime = entry.updatedAt
                ? new Date(entry.updatedAt)
                    .toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                    .toLowerCase()
                : null;

              return (
                <Draggable key={entry._id} draggableId={entry._id} index={i}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`
                        border rounded bg-white shadow 
                        transition-transform transition-shadow duration-150
                        ${snapshot.isDragging ? "shadow-lg scale-[1.02]" : ""}
                      `}
                    >
                      {/* ⭐ Purple Header with drag handle */}
                      <div
                        className="bg-indigo-600 text-white px-4 py-2 rounded-t font-semibold text-lg cursor-grab"
                        {...provided.dragHandleProps}
                      >
                        {entry.sessionName || "Untitled Session"}
                      </div>

                      {/* Body */}
                      <div className="p-4 space-y-3">

                        {/* Created */}
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">Created:</span>{" "}
                          {createdDate} at {createdTime}
                        </div>

                        {/* Updated */}
                        {updatedDate && (
                          <div className="text-sm text-gray-700">
                            <span className="font-medium">Last Updated:</span>{" "}
                            {updatedDate} at {updatedTime}
                          </div>
                        )}

                        {/* Group count */}
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">Groups:</span>{" "}
                          {entry.groups.length}
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => onEdit(i)}
                            className="
                              px-3 py-1 rounded 
                              bg-indigo-600 text-white 
                              hover:bg-indigo-700 
                              text-sm font-medium
                            "
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => removeGroupHistory(i)}
                            className="
                              px-3 py-1 rounded 
                              bg-red-600 text-white 
                              hover:bg-red-700 
                              text-sm font-medium
                            "
                          >
                            Delete
                          </button>
                        </div>

                      </div>
                    </div>
                  )}
                </Draggable>
              );
            })}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
