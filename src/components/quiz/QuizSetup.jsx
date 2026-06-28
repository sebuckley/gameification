import { useState } from "react";
import usePeople from "../store/usePeopleStore";

export default function QuizSetup() {
  const {
    questions,
    addQuestion,
    importQuestions,
    exportQuestions,
    quizSettings,
    updateQuizSettings
  } = usePeople();

  console.log(questions);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [open, setOpen] = useState(false); // ⭐ collapsible

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
    importQuestions(updated); // reuse import to overwrite list
  };

  const removeQuestion = (id) => {
    const updated = questions.filter((q) => q.id !== id);
    importQuestions(updated);
  };

  const hasQuestions = questions.length > 0;

  return (
    <div className="bg-white rounded-xl shadow border border-gray-300">

      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-4 py-3 bg-indigo-600 text-white font-semibold text-lg"
      >
        <span>Quiz Setup</span>
        <span>{open ? "▼" : "◀"}</span>
      </button>

      {/* Collapsible Body */}
      {open && (
        <div className="p-5 space-y-6">

          {/* ⭐ If questions exist → show editable list + export only */}
          {hasQuestions && (
            <>
              <div className="space-y-3">
                <h3 className="font-bold text-gray-700">Questions Loaded</h3>

                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="p-3 border rounded bg-gray-50 space-y-2"
                  >
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
                ))}
              </div>

              <button
                onClick={handleExport}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
              >
                Export Questions
              </button>
            </>
          )}

          {/* ⭐ If NO questions → show add/import/settings */}
          {!hasQuestions && (
            <>
              {/* Add Single Question */}
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

              {/* Bulk Import */}
              <div className="space-y-2">
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

              {/* Scoring Settings */}
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
