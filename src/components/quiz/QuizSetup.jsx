import { useState } from "react";
import usePeople from "../store/usePeopleStore";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

export default function QuizSetup() {
  const {
    questions,
    addQuestion,
    importQuestions,
    exportQuestions,
    quizSettings,
    updateQuizSettings
  } = usePeople();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [open, setOpen] = useState(false);

  const handleAdd = () => {
    if (!question || !answer) return;
    addQuestion({ id: crypto.randomUUID(), question, answer });
    setQuestion("");
    setAnswer("");
  };

  const parseBulkQuestions = (text) => {
    const blocks = text.split(/\n\s*\n/);

    return blocks
      .map((block) => {
        const qMatch = block.match(/Q:\s*(.*)/i);
        const aMatch = block.match(/A:\s*(.*)/i);
        if (!qMatch || !aMatch) return null;

        return {
          id: crypto.randomUUID(),
          question: qMatch[1].trim(),
          answer: aMatch[1].trim()
        };
      })
      .filter(Boolean);
  };

  const handleBulkImport = () => {
    const parsed = parseBulkQuestions(bulkText);
    importQuestions(parsed);
    setBulkText("");
  };

  const handleExport = () => {
    const data = exportQuestions();
    navigator.clipboard.writeText(data);
    alert("Questions copied to clipboard!");
  };

  const updateSingleQuestion = (id, field, value) => {
    const updated = questions.map((q) =>
      q.id === id ? { ...q, [field]: value } : q
    );
    importQuestions(updated);
  };

  const removeQuestion = (id) => {
    const updated = questions.filter((q) => q.id !== id);
    importQuestions(updated);
  };

  const deleteAllQuestions = () => {
    importQuestions([]);
  };

  const moveQuestion = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const reordered = [...questions];
    const temp = reordered[index];
    reordered[index] = reordered[newIndex];
    reordered[newIndex] = temp;

    importQuestions(reordered);
  };

  /* ---------------------------------------------------------
     DRAG & DROP (hello-pangea/dnd)
  --------------------------------------------------------- */
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = [...questions];
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    importQuestions(reordered);
  };

  const hasQuestions = questions.length > 0;

  return (
    <div className="border rounded shadow bg-white">

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b cursor-pointer select-none bg-white rounded-t"
        onClick={() => setOpen(o => !o)}
      >
        <div className="text-gray-500 mr-2">⋮⋮</div>

        <div className="font-medium text-gray-800 flex-1">
          Quiz Setup
        </div>

        <span className="text-gray-700 text-lg">
          {open ? "▼" : "◀"}
        </span>
      </div>

      {/* Body */}
      {open && (
        <div className="p-5 space-y-6">

          {hasQuestions && (
            <>
              <h3 className="font-bold text-gray-700">Questions Loaded</h3>

              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="questions">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-3"
                    >
                      {questions.map((q, index) => (
                        <Draggable key={q.id} draggableId={q.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`
                                p-3 border rounded bg-gray-50 space-y-2 transition-all
                                ${snapshot.isDragging ? "scale-[1.03] shadow-lg bg-white" : ""}
                              `}
                            >
                              {/* Number + reorder buttons */}
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-700">
                                  {index + 1}.
                                </span>

                                <div className="flex gap-2">
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

                              <input
                                className="border p-2 rounded w-full"
                                value={q.question}
                                onChange={(e) =>
                                  updateSingleQuestion(q.id, "question", e.target.value)
                                }
                              />
                              <input
                                className="border p-2 rounded w-full"
                                value={q.answer}
                                onChange={(e) =>
                                  updateSingleQuestion(q.id, "answer", e.target.value)
                                }
                              />

                              <button
                                onClick={() => removeQuestion(q.id)}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}

                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <div className="flex gap-3">
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
                >
                  Export Questions
                </button>

                <button
                  onClick={deleteAllQuestions}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete All
                </button>
              </div>
            </>
          )}

          {!hasQuestions && (
            <>
              <div className="space-y-2">
                <input
                  className="border p-2 rounded w-full"
                  placeholder="Question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
                <input
                  className="border p-2 rounded w-full"
                  placeholder="Answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />

                <button
                  onClick={handleAdd}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Add Question
                </button>
              </div>

<div className="space-y-2">

  {/* Suggested AI Prompt */}
  <div className="bg-indigo-50 border border-indigo-200 rounded p-3">
    <div className="font-semibold text-indigo-700 mb-1">
      Suggested AI Prompt
    </div>

    <p className="text-sm text-gray-700">
      Create 10 quiz questions for my topic: <strong>YOUR TOPIC HERE</strong>.
    </p>

    <button
      onClick={() => {
        navigator.clipboard.writeText(
          "Create 10 quiz questions for my topic: YOUR TOPIC HERE."
        );
        setCopiedPrompt(true);
        setTimeout(() => setCopiedPrompt(false), 1500);
      }}
      className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
    >
      {copiedPrompt ? "Prompt Copied!" : "Copy Prompt"}
    </button>
  </div>

  {/* Bulk Import */}
  <textarea
    className="border p-2 rounded w-full h-32"
    placeholder="Paste questions here in format: Q: ... A: ..."
    value={bulkText}
    onChange={(e) => setBulkText(e.target.value)}
  />

  <button
    onClick={handleBulkImport}
    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
  >
    Import Questions
  </button>
</div>

              <div className="space-y-2">
                <label className="font-medium">Correct Answer Points</label>
                <input
                  type="number"
                  className="border p-2 rounded w-full"
                  value={quizSettings.correctPoints}
                  onChange={(e) =>
                    updateQuizSettings({
                      correctPoints: Number(e.target.value)
                    })
                  }
                />

                <label className="font-medium">Wrong Answer Points</label>
                <input
                  type="number"
                  className="border p-2 rounded w-full"
                  value={quizSettings.wrongPoints}
                  onChange={(e) =>
                    updateQuizSettings({
                      wrongPoints: Number(e.target.value)
                    })
                  }
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
