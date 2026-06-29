import { useState } from "react";
import usePeople from "../store/usePeopleStore";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import { nanoid } from "nanoid";

export default function QuizSetup() {
  const {
    questions,
    addQuestion,
    importQuestions,
    exportQuestions,
    quizSettings,
    updateQuizSettings
  } = usePeople();

  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [open, setOpen] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  


  const handleAdd = () => {
    if (!question || !answer) return;
    addQuestion({ id: crypto.randomUUID(), question, answer });
    setQuestion("");
    setAnswer("");
  };

const parseBulkQuestions = (text) => {
  const lines = text.split("\n").map((l) => l.trim());
  const questions = [];

  let currentQ = null;

  lines.forEach((line) => {
    if (line.startsWith("Q:")) {
      if (currentQ) questions.push(currentQ);

      currentQ = {
        id: nanoid(),
        question: line.substring(2).trim(),
        options: [],
        answer: "",
        type: "single"
      };
    }

    else if (line.startsWith("O:") && currentQ) {
      currentQ.options.push(line.substring(2).trim());
      currentQ.type = "multi";
    }

    else if (line.startsWith("A:") && currentQ) {
      currentQ.answer = line.substring(2).trim();
    }
  });

  if (currentQ) questions.push(currentQ);

  return questions;
};



const handleBulkImport = () => {
  const parsed = parseBulkQuestions(bulkText);

  // Ensure parsed is ALWAYS an array
  if (!Array.isArray(parsed)) {
    console.error("Parsed questions is not an array:", parsed);
    return;
  }

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
          p-3 border rounded bg-gray-50 space-y-3 transition-all
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

        {/* Question */}
        <input
          className="border p-2 rounded w-full"
          value={q.question}
          onChange={(e) =>
            updateSingleQuestion(q.id, "question", e.target.value)
          }
        />

        {/* Answer */}
        <input
          className="border p-2 rounded w-full"
          value={q.answer}
          onChange={(e) =>
            updateSingleQuestion(q.id, "answer", e.target.value)
          }
        />

        {/* Multi‑choice options */}
        {q.type === "multi" && (
          <div className="space-y-2">
            <div className="font-medium text-gray-700">Options</div>

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

                    // If no options remain, revert to single‑answer
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

        {/* Remove Question */}
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

{/* Suggested AI Prompts */}
<div className="bg-indigo-50 border border-indigo-200 rounded p-3 space-y-4">

  <div className="font-semibold text-indigo-700 mb-1">
    Suggested AI Prompts
  </div>

  {/* Standard Q/A Prompt */}
  <div className="bg-white border border-indigo-100 rounded p-3">
    <p className="text-sm text-gray-700">
      <strong>Standard Format:</strong><br />
      Create 10 quiz questions for my topic. Format each question exactly as:<br />
      <code>Q: [question text]</code><br />
      <code>A: [answer text]</code><br />
      The topic I want questions on is <strong>&lt;TOPIC HERE&gt;</strong>.
    </p>

    <button
      onClick={() => {
        navigator.clipboard.writeText(
`Create 10 quiz questions for my topic. Format each question exactly as:
Q: [question text]
A: [answer text]
The topic I want questions on is <TOPIC HERE>.`
        );
        setCopiedPrompt("qa");
        setTimeout(() => setCopiedPrompt(false), 1500);
      }}
      className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
    >
      {copiedPrompt === "qa" ? "Prompt Copied!" : "Copy Q/A Prompt"}
    </button>
  </div>

  {/* Multi‑Choice Prompt */}
  <div className="bg-white border border-indigo-100 rounded p-3">
    <p className="text-sm text-gray-700">
      <strong>Multi‑Choice Format:</strong><br />
      Create 10 multi‑choice quiz questions for my topic. Format each question exactly as:<br />
      <code>Q: [question text]</code><br />
      <code>O: [option 1]</code><br />
      <code>O: [option 2]</code><br />
      <code>O: [option 3]</code><br />
      <code>O: [option 4]</code><br />
      <code>A: [correct option]</code><br />
      Ensure the AI includes 3–5 options and only one correct answer.<br />
      The topic I want questions on is <strong>&lt;TOPIC HERE&gt;</strong>.
    </p>

    <button
      onClick={() => {
        navigator.clipboard.writeText(
`Create 10 multi-choice quiz questions for my topic. Format each question exactly as:
Q: [question text]
O: [option 1]
O: [option 2]
O: [option 3]
O: [option 4]
A: [correct option]
Ensure there are 3–5 options and only one correct answer.
The topic I want questions on is <TOPIC HERE>.`
        );
        setCopiedPrompt("multi");
        setTimeout(() => setCopiedPrompt(false), 1500);
      }}
      className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
    >
      {copiedPrompt === "multi" ? "Prompt Copied!" : "Copy Multi‑Choice Prompt"}
    </button>
  </div>

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
