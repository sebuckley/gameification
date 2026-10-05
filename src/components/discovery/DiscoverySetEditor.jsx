import { useState } from "react";
import { nanoid } from "nanoid";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import useDiscoveryStore from "../store/useDiscoveryStore";


const input = "border rounded-lg p-2 text-sm w-full";
const primary = "px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 text-sm";
const secondary = "px-4 py-2 border rounded-lg text-sm hover:bg-slate-50";

const INTRO_CATEGORY = "Introductions";

function PromptAdder({ onAdd }) {
  const [text, setText] = useState("");

  const add = () => {
    if (!text.trim()) return;
    onAdd(text.trim());
    setText("");
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <input
        className="border rounded-lg p-2 text-sm flex-1"
        placeholder="Add prompt..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
      />

      <button
        type="button"
        className="px-3 py-2 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
        onClick={add}
      >
        Add
      </button>
    </div>
  );
}



function QuestionCard({
  q,
  number,
  provided,
  snapshot,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  sections
}) {
  const [open, setOpen] = useState(false);
  const pointers = q.pointers || [];

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={`rounded-xl border border-slate-200 bg-white shadow-sm transition-all ${
        snapshot.isDragging ? "scale-[1.03] shadow-lg" : ""
      }`}
    >
      {/* QUIZ-STYLE HEADER */}
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
    <span className="font-semibold text-white">{number}.</span>

    {/* Responsive truncation */}
    <span className="text-white font-medium truncate max-w-[150px] sm:max-w-[250px] md:max-w-[300px]">
      {q.question || "Untitled Question"}
    </span>

    {/* NEW — Templated badge */}
    {q.templateId && (
      <span className="shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide bg-amber-200 text-amber-800" title="Templated question">
        T
      </span>
    )}

    {/* Intro badge */}
    {q.category === "Introductions" && (
      <span className="shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide bg-white/20 text-white">
        Intro
      </span>
    )}

    {/* Prompt count badge */}
    {pointers.length > 0 && (
      <span className="shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide bg-white/20 text-white">
        {pointers.length} prompts
      </span>
    )}
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
      onClick={onMoveUp}
      className="flex-1 md:flex-none px-3 py-2 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
    >
      ↑
    </button>

    <button
      onClick={onMoveDown}
      className="flex-1 md:flex-none px-3 py-2 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
    >
      ↓
    </button>
  </div>
</div>


      {/* BODY */}
      {open && (
        <div className="p-4 space-y-4">

{q.templateId ? (
  // Templated question → not editable
  <div className="text-sm font-medium text-slate-700">{q.question}</div>
) : (
  // Custom question → editable
  <input
    className="border rounded-lg p-2 text-sm w-full"
    value={q.question}
    onChange={(e) => onUpdate({ question: e.target.value })}
    placeholder="Question"
  />
)}

          {/* SECTION SELECTOR */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">
              Section
            </label>

            {!q.templateId ? (
              <select
                className="border rounded-lg p-2 text-sm w-full"
                value={q.category || ""}
                onChange={(e) => onUpdate({ category: e.target.value })}
              >
                {sections.map((s) => (
                  <option key={s.cat} value={s.cat}>
                    {s.cat}
                  </option>
                ))}
                <option value="New Section">New Section</option>
              </select>
            ) : (
              <input
                className="border rounded-lg p-2 text-sm w-full"
                value={q.category}
                disabled
              />
            )}
          </div>

          {/* PROMPTS */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">
              Prompts
            </label>

<div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 w-full">
  {pointers.map((p, i) => (
    <div key={i} className="flex items-center gap-2 w-full">
      <input
        className="border rounded-lg p-2 text-sm w-full"
        value={p}
        onChange={(e) => {
          const updated = [...pointers];
          updated[i] = e.target.value;
          onUpdate({ pointers: updated });
        }}
      />

      <button
        type="button"
        className="px-3 py-2 bg-red-600 text-white rounded text-xs hover:bg-red-700 shrink-0"
        onClick={() =>
          onUpdate({
            pointers: pointers.filter((_, j) => j !== i)
          })
        }
      >
        X
      </button>
    </div>
  ))}


  {/* Add prompt input + button */}
  <PromptAdder onAdd={(text) => onUpdate({ pointers: [...pointers, text] })} />
</div>


        
            </div>


          {/* DELETE BUTTON INSIDE CARD */}
          <button
            type="button"
            className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            onClick={onRemove}
          >
            Delete Question
          </button>
        </div>
      )}
    </div>
  );
}



export default function DiscoverySetEditor({ setId, onClose }) {
  const set = useDiscoveryStore((s) =>
    s.discoveryQuestionSets.find((x) => x.id === setId)
  );

  const renameSet = useDiscoveryStore((s) => s.renameDiscoveryQuestionSet);
  const updateFields = useDiscoveryStore((s) => s.updateDiscoveryQuestionSetFields);
  const replaceQuestions = useDiscoveryStore((s) => s.replaceDiscoveryQuestions);
  const saveAsTemplate = useDiscoveryStore((s) => s.saveDiscoveryQuestionSetAsTemplate);

  const [name, setName] = useState(set?.name ?? "");
  const [category, setCategory] = useState(set?.category ?? "");
  const [tags, setTags] = useState((set?.tags ?? []).join(", "));
  const [notes, setNotes] = useState(set?.notes ?? "");

  const [questions, setQuestions] = useState(() => {
    const initial = set?.questions ?? [];
    return initial;
  });

  const [message, setMessage] = useState("");

  if (!set)
    return <p className="text-sm text-slate-500">Discovery set not found.</p>;

  // Group questions by category
  const sections = Object.entries(
    questions.reduce((acc, q) => {
      const cat = q.category || "Uncategorised";
      acc[cat] = acc[cat] || [];
      acc[cat].push(q);
      return acc;
    }, {})
  ).map(([cat, qs]) => ({ cat, qs }));

  const updateQuestion = (id, patch) =>
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));

  const removeQuestion = (id) =>
    setQuestions((qs) => qs.filter((q) => q.id !== id));

  const reorderSections = (result) => {
    if (!result.destination) return;
    const next = [...sections];
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);

    // Flatten back into questions
    const flattened = next.flatMap((s) => s.qs);
    setQuestions(flattened);
  };

  const reorderInsideSection = (sectionIndex, result) => {
    if (!result.destination) return;

    const nextSections = [...sections];
    const section = nextSections[sectionIndex];
    const nextQs = [...section.qs];

    const [moved] = nextQs.splice(result.source.index, 1);
    nextQs.splice(result.destination.index, 0, moved);

    nextSections[sectionIndex] = { ...section, qs: nextQs };

    const flattened = nextSections.flatMap((s) => s.qs);
    setQuestions(flattened);
  };

  const save = () => {
    renameSet(setId, name);
    updateFields(setId, {
      category: category.trim(),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      notes
    });
    replaceQuestions(setId, questions.filter((q) => q.question.trim()));
    onClose();
  };

  const makeTemplate = () => {
    replaceQuestions(setId, questions);
    saveAsTemplate(setId, name);
    setMessage(`Saved "${name}" as a template section.`);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Edit Discovery Set</h2>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Set name</label>
          <input
            className={input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Set name"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className={input}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
          />
          <input
            className={input}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma separated)"
          />
        </div>

        <textarea
          className={input}
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes"
        />
      </div>

      {/* Sections */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 space-y-6">
        <h3 className="text-lg font-semibold text-slate-800">Sections</h3>

        <DragDropContext onDragEnd={reorderSections}>
          <Droppable droppableId="sections" type="SECTION">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-6">
                {sections.map((section, sectionIndex) => (
                  <Draggable
                    key={section.cat}
                    draggableId={section.cat}
                    index={sectionIndex}
                  >
                    {(sectionProvided, sectionSnapshot) => (
                      <div
                        ref={sectionProvided.innerRef}
                        {...sectionProvided.draggableProps}
                        className={`rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm ${
                          sectionSnapshot.isDragging ? "scale-[1.02] shadow-lg" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div
                              {...sectionProvided.dragHandleProps}
                              className="text-slate-400 hover:text-slate-600 cursor-grab select-none"
                            >
                              {"\u22EE\u22EE"}
                            </div>
                            <h4 className="font-semibold text-slate-800">
                              {section.cat}
                            </h4>
                          </div>
                        </div>

                        {/* Questions inside section */}
                        <DragDropContext
                          onDragEnd={(result) =>
                            reorderInsideSection(sectionIndex, result)
                          }
                        >
                          <Droppable droppableId={`sec-${section.cat}`} type="QUESTION">
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="space-y-3"
                              >
                                {section.qs.map((q, index) => (
                                  <Draggable
                                    key={q.id}
                                    draggableId={q.id}
                                    index={index}
                                  >
                                    {(dragProvided, snapshot) => (
                                      <QuestionCard
                                        q={q}
                                        number={index + 1}
                                        provided={dragProvided}
                                        snapshot={snapshot}
                                        onUpdate={(patch) =>
                                          updateQuestion(q.id, patch)
                                        }
                                        onRemove={() => removeQuestion(q.id)}
                                        sections={sections}
                                      />
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>

                        <button
                          type="button"
                          className={`${secondary} mt-3`}
                          onClick={() =>
                            setQuestions((qs) => [
                              ...qs,
                              {
                                id: nanoid(),
                                question: "",
                                category: section.cat,
                                pointers: []
                              }
                            ])
                          }
                        >
                          Add question to this section
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

        <button
          type="button"
          className={secondary}
          onClick={() =>
            setQuestions((qs) => [
              ...qs,
              {
                id: nanoid(),
                question: "",
                category: "New Section",
                pointers: []
              }
            ])
          }
        >
          Add new section
        </button>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={primary} onClick={save}>
          Save
        </button>
        <button type="button" className={secondary} onClick={onClose}>
          Cancel
        </button>
        <button type="button" className={`${secondary} ml-auto`} onClick={makeTemplate}>
          Save as template
        </button>
      </div>

      {message && <p className="text-xs text-emerald-700">{message}</p>}
    </div>
  );
}
