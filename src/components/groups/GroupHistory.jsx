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
                      {/* ⭐ Indigo Header with drag handle, text, circle, buttons */}
                      <div className="bg-indigo-600 text-white px-4 py-2 rounded-t font-semibold text-lg flex items-center justify-between">

                        {/* LEFT SIDE: drag handle + text + circle */}
                        <div className="flex items-center gap-3 min-w-0">

                          {/* Drag handle */}
                          <div
                            {...provided.dragHandleProps}
                            className="text-indigo-200 hover:text-white cursor-grab select-none transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            ⋮⋮
                          </div>

                          {/* Session name */}
                          <span className="truncate">
                            {entry.sessionName || "Untitled Session"}
                          </span>

                          {/* Circle with group count */}
                          <div
                            className="
                              w-8 h-8 rounded-full 
                              bg-indigo-500 
                              flex items-center justify-center 
                              text-white font-bold shadow
                            "
                          >
                            {entry.groups.length}
                          </div>
                        </div>

                        {/* RIGHT SIDE: buttons */}
                        <div className="flex items-center gap-3">

                          {/* Lighter gray Edit button */}
                          <button
                            onClick={() => onEdit(i)}
                            className="flex-1 md:flex-none px-3 py-2 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                          >
                            Edit
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => removeGroupHistory(i)}
                            className="flex-1 md:flex-none px-3 py-2 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                          
                          >
                            Delete
                          </button>

                        </div>
                      </div>

                      {/* ⭐ No body — header only */}
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
