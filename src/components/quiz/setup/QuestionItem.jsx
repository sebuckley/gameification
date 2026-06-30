import { useState } from "react";

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
        className="flex items-center justify-between p-3 bg-gray-100 border-b rounded-t"
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-700">{index + 1}.</span>
          <span className="text-gray-800 font-medium truncate max-w-[300px]">
            {q.question || "Untitled Question"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen(!open)}
            className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
          >
            {open ? "Hide" : "Show"}
          </button>

          <button
            onClick={() => moveQuestion(index, -1)}
            className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
          >
            ↑
          </button>
          <button
            onClick={() => moveQuestion(index, 1)}
            className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
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
                <div key={optIndex} className="flex gap-2">
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
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
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
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 text-sm"
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
