import { useEffect, useState } from "react";
import { Settings } from "lucide-react";
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
    updateQuestionSetQuizMode,
    quizSettings,
    updateQuizSettings,
  } = usePeople();

  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState("");
  const [questionType, setQuestionType] = useState("single");
  const [contentType, setContentType] = useState("question");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaAlt, setMediaAlt] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [bulkText, setBulkText] = useState("");
  const [open, setOpen] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [setNameDraft, setSetNameDraft] = useState("");
  const [promptTopic, setPromptTopic] = useState("");
  const [promptQuestionCount, setPromptQuestionCount] = useState(10);
  const [promptDifficulty, setPromptDifficulty] = useState("mixed");
  const [promptFormat, setPromptFormat] = useState("standard-qa");
  const [promptMediaType, setPromptMediaType] = useState("mix");
  const [promptMediaSource, setPromptMediaSource] = useState("public");
  const [buildMode, setBuildMode] = useState("manual");

  const hasQuestions = questions.length > 0;
  const activeSet =
    questionSets.find((setItem) => setItem.id === activeQuestionSetId) || null;
  const activeSetMode = activeSet?.quizMode || "standard";

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

    if (activeSetMode === "media" && contentType !== "question" && !mediaUrl.trim()) {
      alert("Add a media URL or choose a media file.");
      return;
    }

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
      contentType: activeSetMode === "media" ? contentType : "question",
      mediaUrl: activeSetMode === "media" ? mediaUrl.trim() : "",
      mediaAlt: activeSetMode === "media" ? mediaAlt.trim() : "",
    });

    setQuestion("");
    setAnswer("");
    setQuestionType("single");
    setOptions(["", "", "", ""]);
    setContentType("question");
    setMediaUrl("");
    setMediaAlt("");
  };

  const handleMediaFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setMediaUrl(String(reader.result || ""));
    reader.readAsDataURL(file);
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
          contentType: "question",
          mediaUrl: "",
          mediaAlt: "",
        };
      } else if (line.startsWith("TYPE:") && currentQ) {
        const value = line.substring(5).trim().toLowerCase();
        currentQ.contentType = ["question", "image", "audio", "video"].includes(value)
          ? value
          : "question";
      } else if (line.startsWith("MEDIA:") && currentQ) {
        currentQ.mediaUrl = line.substring(6).trim();
      } else if (line.startsWith("ALT:") && currentQ) {
        currentQ.mediaAlt = line.substring(4).trim();
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

  const promptFormatInstructions = {
    "standard-qa": {
      description: "standard text questions with typed answers",
      rules: "- Use TYPE: question for every item.\n- Do not include O: lines.\n- Every item must include exactly one A: line."
    },
    "standard-multiple": {
      description: "standard multiple-choice questions",
      rules: "- Use TYPE: question for every item.\n- Include exactly 4 O: lines per item.\n- Make A: exactly match one of the O: options."
    },
    "mixed-media": {
      description: `mixed media using ${
        promptMediaType === "mix" ? "a mix of images, audio, and video" : promptMediaType
      }${promptMediaType === "mix" ? " plus text questions" : " items"}`,
      rules: `- Use TYPE: question for text questions, or TYPE: ${
        promptMediaType === "mix" ? "image, audio, or video" : promptMediaType
      } for media items.\n- ${promptMediaSource === "public"
        ? "For media items, use a real direct browser-loadable URL on the MEDIA: line; never invent a local file path."
        : "Leave MEDIA: blank and add the local file manually after importing; never invent a local file path."}\n- Use ALT: for a short image description and leave it blank for audio or video.\n- ${
        promptMediaType === "mix"
          ? "Include a balanced mixture of the requested media and text questions."
          : `Use ${promptMediaType} for every item; do not include other media types.`
      }\n- O: lines are optional; when used, include at least 3 and make A: match one option.`
    }
  }[promptFormat];

  const generatedPrompt = `Create ${
    promptQuestionCount || 10
  } ${promptFormatInstructions.description} about ${
    promptTopic || "<TOPIC HERE>"
  } at ${promptDifficulty} difficulty.\n\nFormat every item exactly as:\nQ: [question or prompt]\nTYPE: [question|image|audio|video]\nMEDIA: [direct media URL, or blank for question items]\nALT: [short image description, or blank]\nO: [option 1, optional]\nO: [option 2, optional]\nO: [option 3, optional]\nO: [option 4, optional]\nA: [correct answer]\n\nRules:\n- Keep the Q:, TYPE:, MEDIA:, ALT:, and A: lines for every item.\n${promptFormatInstructions.rules}\n- Return only the formatted plain text in the chat window.`;

  return (
    <div className="border rounded shadow bg-white">
      <div
        className="flex items-center justify-between px-4 py-3 border-b cursor-pointer select-none bg-white rounded-t"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="text-gray-500 mr-2">
          <Settings size={16} />
        </div>
        <div className="font-medium text-gray-800 flex-1">Quiz Setup</div>
        <span className="text-gray-700 text-lg">{open ? "▼" : "◀"}</span>
      </div>

      {open && (
        <div className="p-5 space-y-6">
          <div className="text-sm text-gray-600">
            You can build your own set manually or import. If you choose to import, you can still add, remove and change any question.
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold text-slate-800">Step 1: Manage question set</div>
            <div className="text-xs text-slate-600">Create a set, choose the set to edit, map its agenda quiz type, and choose the quiz mode.</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
            <button
                onClick={() => createQuestionSet()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
              >
                Create New Set
              </button>

            <div className="text-sm font-semibold text-slate-700">Select set</div>
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

            {activeSet && (
              <>
                <div className="text-sm font-semibold text-slate-700">Set name</div>
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
                  {/* <button
                    onClick={saveSetName}
                    className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-800 text-sm"
                  >
                    Save Set Name
                  </button> */}
                </div>
              </>
            )}

            {activeSet && (
              <>
              <div className="text-sm font-semibold text-slate-700">Question set type</div>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
                
                <select
                  className="border rounded p-2 text-sm w-full"
                  value={activeSetMode}
                  onChange={(e) => updateQuestionSetQuizMode(activeSet.id, e.target.value)}
                >
                  <option value="standard">Standard</option>
                  <option value="standard-points">Standard Points</option>
                  <option value="gameshow">Game-Show</option>
                  <option value="media">Media</option>
                </select>
                <div className="px-3 py-2 text-xs rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Set question type for this set, including mixed media quizzes.
                </div>
              </div>
              </>
            )}

            {activeSet && (
              <>
              <div className="text-sm font-semibold text-slate-700">Agenday dsiplay type</div>
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
                        {agendaType.label}
                      </option>
                    ))}
                </select>
                <div className="px-3 py-2 text-xs rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Linked agenda type for this question set.
                </div>
              </div>
              </>
            )}

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
                {questionSets.length <= 1 ? "Clear Current Set" : `Delete ${activeSet.name}`}
              </button>
          </div>

          {!hasQuestions && (
            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-800">Step 2: Choose build method</div>
              <div className="text-xs text-slate-600">Pick how to create the first batch of questions for this set.</div>
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
            </div>
          )}

          {hasQuestions && (
            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-800">Step 2: Review loaded questions</div>
              <div className="text-xs text-slate-600">
                Loaded questions can be reordered by drag and drop.
              </div>
            </div>
          )}

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
                  Delete All Questions
                </button>
              </div>

            </>
          )}

          {!hasQuestions && buildMode === "import" && (
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <select
                    className="border rounded p-2 text-sm bg-white"
                    value={promptFormat}
                    onChange={(e) => setPromptFormat(e.target.value)}
                  >
                    <option value="standard-qa">Standard: Q&amp;A</option>
                    <option value="standard-multiple">Standard: Multiple Choice</option>
                    <option value="mixed-media">Mixed Media</option>
                  </select>

                  {promptFormat === "mixed-media" && (
                    <>
                      <select
                        className="border rounded p-2 text-sm bg-white"
                        value={promptMediaType}
                        onChange={(e) => setPromptMediaType(e.target.value)}
                      >
                        <option value="mix">Mix images, audio, video, and questions</option>
                        <option value="image">Images only</option>
                        <option value="audio">Audio only</option>
                        <option value="video">Video only</option>
                      </select>
                      <select
                        className="border rounded p-2 text-sm bg-white"
                        value={promptMediaSource}
                        onChange={(e) => setPromptMediaSource(e.target.value)}
                      >
                        <option value="public">Use public media URLs</option>
                        <option value="local">I will upload local files after import</option>
                      </select>
                    </>
                  )}
                </div>

                {activeSetMode === "media" && (
                  <div className="space-y-2 rounded border border-indigo-200 bg-indigo-50 p-3">
                    <label className="text-sm font-medium text-indigo-900">Content type</label>
                    <select
                      className="border p-2 rounded w-full bg-white"
                      value={contentType}
                      onChange={(e) => setContentType(e.target.value)}
                    >
                      <option value="question">Question only</option>
                      <option value="image">Image</option>
                      <option value="audio">Audio</option>
                      <option value="video">Video</option>
                    </select>

                    {contentType !== "question" && (
                      <>
                        <input
                          className="border p-2 rounded w-full bg-white"
                          placeholder="Media URL"
                          value={mediaUrl.startsWith("data:") ? "Local file selected" : mediaUrl}
                          onChange={(e) => setMediaUrl(e.target.value)}
                        />
                        <input
                          type="file"
                          accept={contentType === "image" ? "image/*" : `${contentType}/*`}
                          className="block w-full text-sm"
                          onChange={handleMediaFile}
                        />
                        <input
                          className="border p-2 rounded w-full bg-white"
                          placeholder="Image alt text (optional)"
                          value={mediaAlt}
                          onChange={(e) => setMediaAlt(e.target.value)}
                        />
                      </>
                    )}
                  </div>
                )}

                <p className="text-sm text-gray-700">
                  The prompt will generate {promptFormatInstructions.description}.
                  AI prompts cannot access files on this computer, so use public
                  media URLs or upload local files after importing the questions.
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
                placeholder="Paste items using Q:, TYPE:, MEDIA:, ALT:, optional O:, and A:"
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
            <div className="text-sm font-semibold text-slate-800">Step 3: Add questions manually</div>
            <p className="text-xs text-slate-600">
              You can add additional questions manually below, even after importing or loading a set.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">

            {!hasQuestions && buildMode === "import" ? (
              <div className="text-xs text-slate-500 rounded border border-slate-200 bg-white px-3 py-2">
                Switch build method to Manual in Step 2 to add questions one by one.
              </div>
            ) : (
              <>
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
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
                >
                  Add Question
                </button>
              </>
            )}
          </div>

          {activeSetMode === "standard-points" && (
            <>
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-800">Step 4: Configure points</div>
                <div className="text-xs text-slate-600">Points are only used for Standard Points mode.</div>
              </div>
              <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
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
            </>
          )}

        </div>
      )}
    </div>
  );
}
