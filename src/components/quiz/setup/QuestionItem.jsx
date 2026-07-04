import { useState } from "react";
import { GripVertical } from "lucide-react";


export function QuestionItem({
  q,
  index,
  provided,
  snapshot,
  moveQuestion,
  updateSingleQuestion,
  removeQuestion
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={`
        border rounded bg-white shadow-sm transition-all
        ${snapshot.isDragging ? "scale-[1.03] shadow-lg" : ""}
      `}
    >
{/* HEADER */}
<div
  {...provided.dragHandleProps}
  className="flex flex-wrap md:flex-nowrap items-center justify-between p-3 bg-indigo-600 border-b rounded-t gap-3"
>
  {/* Left side */}
  <div className="flex items-center gap-3 min-w-0">
    {/* Move icon */}
    <div
      {...provided.dragHandleProps}
      className="text-indigo-200 hover:text-white cursor-grab select-none pr-1 transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      ⋮⋮
    </div>

    {/* Number */}
    <span className="font-semibold text-white">{index + 1}.</span>

    {/* Responsive truncation */}
    <span className="text-white font-medium truncate max-w-[150px] sm:max-w-[250px] md:max-w-[300px]">
      {q.question || "Untitled Question"}
    </span>
  </div>

  {/* Right side buttons */}
  <div className="flex items-center gap-2 flex-wrap">
    <button
      onClick={() => setOpen(!open)}
      className="flex-1 md:flex-none px-3 py-2 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
    >
      {open ? "Close Edit" : "Edit"}
    </button>

    <button
      onClick={() => moveQuestion(index, -1)}
      className="flex-1 md:flex-none px-3 py-2 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
    >
      ↑
    </button>

    <button
      onClick={() => moveQuestion(index, 1)}
      className="flex-1 md:flex-none px-3 py-2 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
    >
      ↓
    </button>
  </div>
</div>




      {open && (
        <div className="p-4 space-y-4">
          {/* Question */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Question</label>
            <input
              className="border p-2 rounded w-full"
              value={q.question}
              onChange={(e) =>
                updateSingleQuestion(q.id, "question", e.target.value)
              }
            />
          </div>

          {/* Answer */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Answer</label>
            <input
              className="border p-2 rounded w-full"
              value={q.answer}
              onChange={(e) =>
                updateSingleQuestion(q.id, "answer", e.target.value)
              }
            />
          </div>

          {/* Multi-choice */}
          {q.type === "multi" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Options</label>

              {q.options.map((opt, optIndex) => (
                <div key={optIndex} className="flex flex-col sm:flex-row gap-2">
                  <input
                    className="border p-2 rounded w-full"
                    value={opt}
                    onChange={(e) => {
                      const updated = [...q.options];
                      updated[optIndex] = e.target.value;
                      updateSingleQuestion(q.id, "options", updated);
                    }}
                  />

                  <button
                    onClick={() => {
                      const updated = q.options.filter((_, i) => i !== optIndex);
                      updateSingleQuestion(q.id, "options", updated);

                      if (updated.length === 0) {
                        updateSingleQuestion(q.id, "type", "single");
                      }
                    }}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 sm:w-auto w-full"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                onClick={() => {
                  const updated = [...q.options, ""];
                  updateSingleQuestion(q.id, "options", updated);
                  updateSingleQuestion(q.id, "type", "multi");
                }}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 text-sm w-full sm:w-auto"
              >
                Add Option
              </button>
            </div>
          )}

          <button
            onClick={() => removeQuestion(q.id)}
            className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 w-full"
          >
            Remove Question
          </button>
        </div>
      )}
    </div>
  );
}
