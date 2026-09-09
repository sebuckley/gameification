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
    promptCustomRules,
    addPromptCustomRule,
    removePromptCustomRule,
  } = usePeople();

  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState("");
  const [questionType, setQuestionType] = useState("single");
  const [contentType, setContentType] = useState("question");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaAlt, setMediaAlt] = useState("");
  const [mediaReveal, setMediaReveal] = useState(false);
  const [options, setOptions] = useState(["", "", "", ""]);
  const [bulkText, setBulkText] = useState("");
  const [open, setOpen] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [setNameDraft, setSetNameDraft] = useState("");
  const [promptTopic, setPromptTopic] = useState("");
  const [promptQuestionCount, setPromptQuestionCount] = useState(10);
  const [promptDifficulty, setPromptDifficulty] = useState("mixed");
  const [promptContentMode, setPromptContentMode] = useState("standard");
  const [promptMediaType, setPromptMediaType] = useState("mix");
  const [promptAnswerStyle, setPromptAnswerStyle] = useState("qa");
  const [promptMediaSource, setPromptMediaSource] = useState("public");
  const [newRuleDraft, setNewRuleDraft] = useState("");
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
      mediaReveal: activeSetMode === "media" && contentType === "image" ? mediaReveal : false,
    });

    setQuestion("");
    setAnswer("");
    setQuestionType("single");
    setOptions(["", "", "", ""]);
    setContentType("question");
    setMediaUrl("");
    setMediaAlt("");
    setMediaReveal(false);
  };

  const handleMediaFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setMediaUrl(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const cleanImportedMediaUrl = (value) => {
    const mediaLine = String(value || "").trim();
    const backtickMatch = mediaLine.match(/`(https?:\/\/[^`]+)`/i);
    if (backtickMatch) return backtickMatch[1].trim();

    const urlMatch = mediaLine.match(/https?:\/\/[^\s\])}>]+/i);
    return urlMatch ? urlMatch[0].replace(/[.,;]+$/, "") : "";
  };

  const parseBulkQuestions = (text) => {
    const normalizedText = String(text || "").replace(
      /\s+(?=(?:Q|TYPE|MEDIA|ALT|O|A):)/gi,
      "\n"
    );
    const lines = normalizedText.split("\n").map((l) => l.trim());
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
        currentQ.mediaUrl = cleanImportedMediaUrl(line.substring(6));
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
      q.id === id
        ? {
            ...q,
            [field]: value,
            ...(field === "mediaUrl" || field === "contentType"
              ? { mediaStatus: "" }
              : {})
          }
        : q
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

  const applyBlurToAllImages = () => {
    const updated = questions.map((q) =>
      q.contentType === "image" ? { ...q, mediaReveal: true } : q
    );
    importQuestions(updated);
  };

  const imageQuestionCount = questions.filter((q) => q.contentType === "image").length;

  const promptFormatInstructions = (() => {
    const isMedia = promptContentMode === "media";
    const isOptions = promptAnswerStyle === "options";

    const description = [
      isMedia ? "media items" : "standard text questions",
      isOptions ? "with multiple-choice options" : "with a typed question and answer only",
      isMedia
        ? `using ${
            promptMediaType === "mix"
              ? "a mix of images, audio, and video plus text questions"
              : `${promptMediaType} items`
          }`
        : null
    ]
      .filter(Boolean)
      .join(" ");

    const formatLines = ["Q: [question or prompt]"];
    const keepLabels = ["Q:"];

    if (isMedia) {
      formatLines.push(
        "TYPE: [question|image|audio|video]",
        "MEDIA: [direct media URL only, or blank for question items]",
        "ALT: [short image description, or blank]"
      );
      keepLabels.push("TYPE:", "MEDIA:", "ALT:");
    }

    if (isOptions) {
      formatLines.push(
        "O: [option 1]",
        "O: [option 2]",
        "O: [option 3]",
        "O: [option 4, optional]"
      );
      keepLabels.push("O:");
    }

    formatLines.push("A: [correct answer]");
    keepLabels.push("A:");

    const rules = [`Keep the ${keepLabels.join(", ")} lines for every item.`];

    if (isMedia) {
      rules.push(
        `Use TYPE: question for text questions, or TYPE: ${
          promptMediaType === "mix" ? "image, audio, or video" : promptMediaType
        } for media items.`
      );
      rules.push(
        promptMediaSource === "public"
          ? "For media items, use a real direct browser-loadable URL on the MEDIA: line; never invent a local file path."
          : "Leave MEDIA: blank and add the local file manually after importing; never invent a local file path."
      );
      rules.push(
        "Use stable, well-known direct media URLs from trusted public hosts such as Wikimedia Commons. Prefer URLs that end in a media file extension or are documented direct asset URLs."
      );
      rules.push("If you are unsure of the exact direct asset URL, leave MEDIA: blank instead of guessing.");
      rules.push(
        "MEDIA: must contain only the direct media URL and nothing else. Do not include Bing, Google, search-result, thumbnail, redirect, citation, markdown, parentheses, domain labels, or explanatory text."
      );
      rules.push("Use ALT: for a short image description and leave it blank for audio or video.");
      rules.push(
        promptMediaType === "mix"
          ? "Include a balanced mixture of the requested media and text questions."
          : `Use ${promptMediaType} for every item; do not include other media types.`
      );
    }

    rules.push(
      isOptions
        ? "Include at least 3 O: lines for every item and make A: match one of the O: options exactly. Do not add TYPE, MEDIA, or ALT lines unless this is a media prompt."
        : "Do not include O: lines. Every item must have only a typed A: answer, just a question and answer."
    );

    return {
      description,
      format: formatLines.join("\n"),
      rules: rules.map((rule) => `- ${rule}`).join("\n")
    };
  })();

  const customRulesText = (promptCustomRules || [])
    .map((rule) => `- ${rule}`)
    .join("\n");

  const generatedPrompt = `Create ${
    promptQuestionCount || 10
  } ${promptFormatInstructions.description} about ${
    promptTopic || "<TOPIC HERE>"
  } at ${promptDifficulty} difficulty.\n\nFormat every item exactly as:\n${promptFormatInstructions.format}\n\nRules:\n${promptFormatInstructions.rules}${
    customRulesText ? `\n${customRulesText}` : ""
  }`;


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

          <div className="space-y-2">
            <div className="text-sm font-semibold text-slate-800">Step 2: Choose build method</div>
            <div className="text-xs text-slate-600">Manually add questions, or use the AI Prompt Builder to generate and import a batch at any time.</div>
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
                AI Prompt Builder
              </button>
            </div>
          </div>

          {hasQuestions && (
            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-800">Step 2: Review loaded questions</div>
              <div className="text-xs text-slate-600">
                Loaded questions can be reordered by drag and drop. To use the AI Prompt Builder again, delete all questions first.
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

                {imageQuestionCount > 0 && (
                  <button
                    onClick={applyBlurToAllImages}
                    className="px-4 py-2 bg-violet-600 text-white rounded-lg shadow hover:bg-violet-700"
                  >
                    Blur All Images ({imageQuestionCount})
                  </button>
                )}
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
                    <option value="easy">Easy difficulty</option>
                    <option value="medium">Medium difficulty</option>
                    <option value="hard">Hard difficulty</option>
                    <option value="mixed">Mixed difficulty</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <select
                    className="border rounded p-2 text-sm bg-white"
                    value={promptContentMode}
                    onChange={(e) => setPromptContentMode(e.target.value)}
                  >
                    <option value="standard">Standard</option>
                    <option value="media">Media</option>
                  </select>

                  <select
                    className="border rounded p-2 text-sm bg-white"
                    value={promptAnswerStyle}
                    onChange={(e) => setPromptAnswerStyle(e.target.value)}
                  >
                    <option value="qa">Question and answer only</option>
                    <option value="options">With options (multiple choice)</option>
                  </select>

                  {promptContentMode === "media" && (
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

                <div className="space-y-2 rounded border border-indigo-200 bg-white p-3">
                  <label className="text-sm font-medium text-indigo-900">Prompt rules</label>
                  <p className="text-xs text-slate-500">
                    These rules are appended to every generated prompt. Preset rules can be removed or added to, and everything here persists for you across sessions.
                  </p>

                  {(promptCustomRules || []).length > 0 && (
                    <ul className="space-y-1">
                      {promptCustomRules.map((rule, ruleIndex) => (
                        <li
                          key={`${rule}-${ruleIndex}`}
                          className="flex items-center justify-between gap-2 rounded bg-slate-50 px-2 py-1 text-sm text-slate-700"
                        >
                          <span className="break-words">{rule}</span>
                          <button
                            onClick={() => removePromptCustomRule(ruleIndex)}
                            className="shrink-0 px-2 py-1 text-xs text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      className="border rounded p-2 text-sm w-full"
                      placeholder="e.g. Avoid questions about current events"
                      value={newRuleDraft}
                      onChange={(e) => setNewRuleDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newRuleDraft.trim()) {
                          addPromptCustomRule(newRuleDraft);
                          setNewRuleDraft("");
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (!newRuleDraft.trim()) return;
                        addPromptCustomRule(newRuleDraft);
                        setNewRuleDraft("");
                      }}
                      className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm whitespace-nowrap"
                    >
                      Add Rule
                    </button>
                  </div>
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

                        {contentType === "image" && (
                          <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              checked={mediaReveal}
                              onChange={(e) => setMediaReveal(e.target.checked)}
                            />
                            Blurred zoom reveal (30s) — image starts blurred and zoomed, then sharpens
                          </label>
                        )}
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
