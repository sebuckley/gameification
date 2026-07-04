import { useEffect, useState } from "react";
import usePeople from "../store/usePeopleStore";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import { nanoid } from "nanoid";
import { QuestionItem } from "./setup/QuestionItem";
import { agendaTypes } from "../../data/AgendaTypes";

export default function QuizSetup() {
  const {
    questions,
    questionSets,
    activeQuestionSetId,
    addQuestion,
    importQuestions,
    exportQuestions,
    createQuestionSet,
    selectQuestionSet,
    renameQuestionSet,
    deleteQuestionSet,
    clearQuestionsInActiveSet,
    updateQuestionSetAgendaType,
    quizSettings,
    updateQuizSettings,
  } = usePeople();

  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState("");
  const [questionType, setQuestionType] = useState("single");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [bulkText, setBulkText] = useState("");
  const [open, setOpen] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [setNameDraft, setSetNameDraft] = useState("");
  const [promptTopic, setPromptTopic] = useState("");
  const [promptQuestionCount, setPromptQuestionCount] = useState(10);
  const [promptDifficulty, setPromptDifficulty] = useState("mixed");
  const [buildMode, setBuildMode] = useState("manual");

  const hasQuestions = questions.length > 0;
  const activeSet =
    questionSets.find((setItem) => setItem.id === activeQuestionSetId) || null;

  useEffect(() => {
    setSetNameDraft(activeSet?.name || "");
  }, [activeSet?.id, activeSet?.name]);

  const saveSetName = () => {
    if (!activeSet) return;
    const safeName = setNameDraft.trim() || "Question Set";
    renameQuestionSet(activeSet.id, safeName);
    setSetNameDraft(safeName);
  };

  const handleAdd = () => {
    if (!question.trim() || !answer.trim()) return;

    const cleanedOptions = options.map((opt) => opt.trim()).filter(Boolean);
    if (questionType === "multi" && cleanedOptions.length < 3) {
      alert("For multi-choice questions, add at least 3 options.");
      return;
    }

    addQuestion({
      id: crypto.randomUUID(),
      question: question.trim(),
      answer: answer.trim(),
      type: questionType,
      options: questionType === "multi" ? cleanedOptions : [],
    });

    setQuestion("");
    setAnswer("");
    setQuestionType("single");
    setOptions(["", "", "", ""]);
  };

  const parseBulkQuestions = (text) => {
    const lines = text.split("\n").map((l) => l.trim());
    const parsedQuestions = [];

    let currentQ = null;

    lines.forEach((line) => {
      if (line.startsWith("Q:")) {
        if (currentQ) parsedQuestions.push(currentQ);

        currentQ = {
          id: nanoid(),
          question: line.substring(2).trim(),
          options: [],
          answer: "",
          type: "single",
        };
      } else if (line.startsWith("O:") && currentQ) {
        currentQ.options.push(line.substring(2).trim());
        currentQ.type = "multi";
      } else if (line.startsWith("A:") && currentQ) {
        currentQ.answer = line.substring(2).trim();
      }
    });

    if (currentQ) parsedQuestions.push(currentQ);

    return parsedQuestions;
  };

  const handleBulkImport = () => {
    const parsed = parseBulkQuestions(bulkText);
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
    clearQuestionsInActiveSet();
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

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = [...questions];
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    importQuestions(reordered);
  };

  const generatedPrompt = `Create ${
    promptQuestionCount || 10
  } quiz questions about ${
    promptTopic || "<TOPIC HERE>"
  } at ${promptDifficulty} difficulty.\n\nFormat each question exactly as:\nQ: [question text]\nO: [option 1]\nO: [option 2]\nO: [option 3]\nO: [option 4]\nA: [correct option]\n\nRules:\n- Ensure every question includes at least one question and one answer.\n- For multi-choice questions, include at least 3 options.\n- Return as plain text in the chat window.`;

  return (
    <div className="border rounded shadow bg-white">
      <div
        className="flex items-center justify-between px-4 py-3 border-b cursor-pointer select-none bg-white rounded-t"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="text-gray-500 mr-2">⋮⋮</div>
        <div className="font-medium text-gray-800 flex-1">Quiz Setup</div>
        <span className="text-gray-700 text-lg">{open ? "▼" : "◀"}</span>
      </div>

      {open && (
        <div className="p-5 space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
               <button
                onClick={() => createQuestionSet()}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
              >
                Add Set
              </button>
            <div className="text-sm font-semibold text-slate-700">
              Select question set to edit
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
              <select
                className="border rounded p-2 text-sm"
                value={activeQuestionSetId || ""}
                onChange={(e) => selectQuestionSet(e.target.value)}
              >
                {questionSets.map((setItem, index) => (
                  <option key={setItem.id} value={setItem.id}>
                    {setItem.name || `Question Set ${index + 1}`}
                  </option>
                ))}
              </select>
           
            </div>
          </div>

          
            <div className="text-sm font-semibold text-slate-700">Set Name</div>
            {activeSet && (
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
                <input
                  className="border rounded p-2 text-sm w-full"
                  value={setNameDraft}
                  onChange={(e) => setSetNameDraft(e.target.value)}
                  onBlur={saveSetName}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      saveSetName();
                    }
                  }}
                  placeholder="Set name"
                />
                <button
                  onClick={saveSetName}
                  className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-800 text-sm"
                >
                  Update Name
                </button>
              </div>
            )}

            {activeSet && (
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
                <select
                  className="border rounded p-2 text-sm w-full"
                  value={activeSet.agendaQuizType || "quiz"}
                  onChange={(e) => updateQuestionSetAgendaType(activeSet.id, e.target.value)}
                >
                  {agendaTypes
                    .filter((agendaType) => String(agendaType.id || "").startsWith("quiz"))
                    .map((agendaType) => (
                      <option key={agendaType.id} value={agendaType.id}>
                        Agenda Type: {agendaType.label}
                      </option>
                    ))}
                </select>
                <div className="px-3 py-2 text-xs rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Linked agenda quiz items mirror this type
                </div>
              </div>
            )}


          
            <div className="text-sm font-semibold text-slate-700">Build Method</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setBuildMode("manual")}
                className={`px-3 py-2 rounded text-sm ${
                  buildMode === "manual"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Manually Build Questions
              </button>
              <button
                onClick={() => setBuildMode("import")}
                className={`px-3 py-2 rounded text-sm ${
                  buildMode === "import"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Import Questions
              </button>
            </div>
       

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
                            <QuestionItem
                              q={q}
                              index={index}
                              provided={provided}
                              snapshot={snapshot}
                              moveQuestion={moveQuestion}
                              updateSingleQuestion={updateSingleQuestion}
                              removeQuestion={removeQuestion}
                            />
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
                >
                  Export Questions
                </button>
                <button
                  onClick={deleteAllQuestions}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
                >
                  Delete All
                </button>
              </div>
            </>
          )}

          {buildMode === "import" && (
            <div className="space-y-3">
              <div className="bg-indigo-50 border border-indigo-200 rounded p-4 space-y-4">
                <div className="font-semibold text-indigo-700">Prompt Builder</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    className="border rounded p-2 text-sm bg-white"
                    placeholder="Topic (e.g. Marvel films)"
                    value={promptTopic}
                    onChange={(e) => setPromptTopic(e.target.value)}
                  />
                  <input
                    type="number"
                    min={1}
                    className="border rounded p-2 text-sm bg-white"
                    value={promptQuestionCount}
                    onChange={(e) =>
                      setPromptQuestionCount(Number(e.target.value) || 1)
                    }
                  />
                  <select
                    className="border rounded p-2 text-sm bg-white"
                    value={promptDifficulty}
                    onChange={(e) => setPromptDifficulty(e.target.value)}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>

                <p className="text-sm text-gray-700">
                  Minimum needed to build a question is one question and one
                  answer. For multi-choice, include at least 3 options.
                </p>

                <div className="bg-white border border-indigo-100 rounded p-3">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                    {generatedPrompt}
                  </pre>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPrompt);
                    setCopiedPrompt(true);
                    setTimeout(() => setCopiedPrompt(false), 1500);
                  }}
                  className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                >
                  {copiedPrompt ? "Prompt Copied!" : "Copy Prompt"}
                </button>
              </div>

              <textarea
                className="border p-2 rounded w-full h-32"
                placeholder="Paste questions in format: Q:, optional O:, A:"
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
          )}

          <div className="space-y-2">
            <label className="font-medium">Correct Answer Points</label>
            <input
              type="number"
              className="border p-2 rounded w-full"
              value={quizSettings.correctPoints}
              onChange={(e) =>
                updateQuizSettings({
                  correctPoints: Number(e.target.value),
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
                  wrongPoints: Number(e.target.value),
                })
              }
            />
          </div>

          {buildMode === "manual" && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold text-slate-700">Add Question</div>
                <div className="text-xs text-slate-500">Bottom Quick Add</div>
              </div>

              <p className="text-sm text-slate-600">
                You only need a minimum of a question and answer. If you choose
                multi-choice, provide at least 3 options.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  className="border p-2 rounded w-full md:col-span-2"
                  placeholder="Question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />

                <select
                  className="border p-2 rounded w-full"
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                >
                  <option value="single">Single Answer</option>
                  <option value="multi">Multi-Choice</option>
                </select>
              </div>

              {questionType === "multi" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    className="border p-2 rounded w-full"
                    placeholder="Option 1 (required for multi-choice)"
                    value={options[0]}
                    onChange={(e) =>
                      setOptions((prev) => [
                        e.target.value,
                        prev[1],
                        prev[2],
                        prev[3],
                      ])
                    }
                  />
                  <input
                    className="border p-2 rounded w-full"
                    placeholder="Option 2 (required for multi-choice)"
                    value={options[1]}
                    onChange={(e) =>
                      setOptions((prev) => [
                        prev[0],
                        e.target.value,
                        prev[2],
                        prev[3],
                      ])
                    }
                  />
                  <input
                    className="border p-2 rounded w-full"
                    placeholder="Option 3 (required for multi-choice)"
                    value={options[2]}
                    onChange={(e) =>
                      setOptions((prev) => [
                        prev[0],
                        prev[1],
                        e.target.value,
                        prev[3],
                      ])
                    }
                  />
                  <input
                    className="border p-2 rounded w-full"
                    placeholder="Option 4 (optional)"
                    value={options[3]}
                    onChange={(e) =>
                      setOptions((prev) => [
                        prev[0],
                        prev[1],
                        prev[2],
                        e.target.value,
                      ])
                    }
                  />
                </div>
              )}

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
          )}

          <div className="flex justify-end">
            <button
              onClick={() => {
                if (!activeSet) return;
                if (questionSets.length <= 1) {
                  clearQuestionsInActiveSet();
                  return;
                }
                deleteQuestionSet(activeSet.id);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
            >
              {questionSets.length <= 1 ? "Clear Set" : "Delete Set"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
