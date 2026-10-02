import { useState } from "react";
import { FileText } from "lucide-react";
import {
  getAgendaColor,
  getAgendaTextColor,
  getAgendaIcon,
  agendaTypes
} from "../../data/AgendaTypes";
import ToggleButton from "../shared/Toggle";
import { hashFile, saveFile } from "../store/db";   // your IndexedDB helpers

export default function AgendaItemCard({
  item,
  presenters,
  agendaTypeOptions = agendaTypes,
  questionSets = [],
  iceBreakerSets = [],
  peopleSets = [],
  people = [],
  updateAgendaItem,
  removeAgendaItem,
  addPersonToPeopleSet,
  removePersonFromPeopleSet,
  allArtefacts = [],
  eventType
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [newArtefactName, setNewArtefactName] = useState("");
  const [newArtefactUrl, setNewArtefactUrl] = useState("");
  const [newArtefactFile, setNewArtefactFile] = useState(null);
  const [newArtefactType, setNewArtefactType] = useState("");
  const [newArtefactPage, setNewArtefactPage] = useState(1);
  const [newArtefactFrom, setNewArtefactFrom] = useState(1);
  const [newArtefactTo, setNewArtefactTo] = useState(1);
  const [newNote, setNewNote] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [peopleSearch, setPeopleSearch] = useState("");


  const Icon = getAgendaIcon(item.type);

  // Presenter name for header
  const selectedPresenter =
    presenters.find((p) => p.id === item.presenterId)?.preferredName ||
    presenters.find((p) => p.id === item.presenterId)?.fullName ||
    null;

    console.log(eventType);
  const presenterList = eventType === "team" ? people : presenters;

  const presenterName = selectedPresenter || item.guestPresenter || "No presenter";
  const isGuestSelected = item.presenterId === "guest";
  const isOtherItem = String(item.type || "") === "other";
  const isQuizItem = String(item.type || "").startsWith("quiz");
  const isIceBreakerItem = String(item.type || "") === "ice-breaker";
  const linkedQuestionSet = questionSets.find((setItem) => setItem.id === item.linkedQuestionSetId) || null;
  const linkedIceBreakerSet = iceBreakerSets.find((setItem) => setItem.id === item.linkedIceBreakerSetId) || null;
  const linkedPeopleSet = peopleSets.find((setItem) => setItem.id === item.linkedPeopleSetId) || null;
  const linkedPeople = linkedPeopleSet
    ? linkedPeopleSet.personIds.map((personId) => people.find((person) => person.id === personId)).filter(Boolean)
    : [];
  const linkedPeopleIds = new Set(linkedPeopleSet?.personIds || []);
  const matchingPeople = peopleSearch.trim()
    ? people.filter((person) => {
        if (linkedPeopleIds.has(person.id)) return false;
        const searchText = [person.preferredName, person.fullName, person.email].filter(Boolean).join(" ").toLowerCase();
        return searchText.includes(peopleSearch.trim().toLowerCase());
      }).slice(0, 8)
    : [];
  const hasQuizSetQuestions = !!(linkedQuestionSet?.questions?.length);
  const hasIceBreakerSelected = !!linkedIceBreakerSet?.selectedIceBreaker;

  // Validation (NOTES REMOVED FROM VALIDATION)
  const isMissingLabel = !item.label?.trim();
  const isMissingMinutes = !item.minutes || item.minutes <= 0;
  const isMissingPresenter = !item.presenterId && !item.guestPresenter;
  const isMissingSetLink =
    (isQuizItem && !item.linkedQuestionSetId) ||
    (isIceBreakerItem && !item.linkedIceBreakerSetId);
  const isMissingGroupCount = !!item.enableGroupSetup && (!item.groupCount || Number(item.groupCount) < 1);
  const isMissingArtefact =
    !isQuizItem &&
    !isIceBreakerItem &&
    (!item.artefacts || item.artefacts.length === 0);

  const isIncomplete =
    isMissingLabel ||
    isMissingMinutes ||
    isMissingPresenter ||
    isMissingSetLink ||
    isMissingGroupCount ||
    isMissingArtefact;

  // Filter session types for searchable dropdown
  const filteredTypes = agendaTypeOptions.filter((t) =>
    t.label.toLowerCase().includes(search.toLowerCase())
  );

// Add artefact
const addArtefact = async () => {
  if (!newArtefactName.trim() || !newArtefactType.trim()) return;

  let newEntry = null;

  // FILE‑BACKED PDF (slides)
  if (newArtefactType === "pdf-upload") {
    if (!newArtefactFile) {
      alert("Please upload a PDF file for the slides.");
      return;
    }

    // 1️⃣ Hash the file (stable identity across sessions)
    const hash = await hashFile(newArtefactFile);

    // 2️⃣ Store the file permanently in IndexedDB
    await saveFile(hash, newArtefactFile);

    // 3️⃣ Store only metadata + hash in agenda
    newEntry = {
      name: newArtefactName.trim(),
      type: "pdf-upload",
      hash,                 // used to reload file later
      page: newArtefactPage
    };
  }

  // URL‑BASED ARTEFACTS
  else {
    if (!newArtefactUrl.trim()) {
      alert("Please enter a URL for this artefact.");
      return;
    }

    newEntry = {
      name: newArtefactName.trim(),
      type: newArtefactType.trim(),
      url: newArtefactUrl.trim(),
      page: newArtefactPage,
    };
  }

  // Add to agenda
  const updated = [...(item.artefacts || []), newEntry];
  updateAgendaItem(item.id, { artefacts: updated });

  // Reset UI fields
  setNewArtefactName("");
  setNewArtefactUrl("");
  setNewArtefactType("");
  setNewArtefactPage(1);
  setNewArtefactFile(null);
};



const reuseArtefact = (artefact) => {
  const updated = [
    ...(item.artefacts || []),
    {
      name: artefact.name,
      url: artefact.url || null,
      type: artefact.type,
      hash: artefact.hash || null,
      from: artefact.from ?? artefact.page ?? 1,
      to: artefact.to ?? artefact.page ?? 1
    }
  ];

  updateAgendaItem(item.id, { artefacts: updated });
};

  // Add timestamped note
  const addNote = () => {
    if (!newNote.trim()) return;

    const now = new Date();
    const ts = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const updatedNotes = [
      ...(item.notes || []),
      { ts, text: newNote.trim() }
    ];

    updateAgendaItem(item.id, { notes: updatedNotes });
    setNewNote("");
  };

  const latestNote = item.notes?.length ? item.notes[item.notes.length - 1] : null;
  const previousNotes = item.notes?.length > 1 ? item.notes.slice(0, -1) : [];
const currentArtefactKeys = new Set(
  (item.artefacts || []).map((a) =>
    `${(a?.name || "").trim().toLowerCase()}::${(a?.url || "").trim().toLowerCase()}::${(a?.hash || "").trim().toLowerCase()}`
  )
);

const reusableArtefacts = allArtefacts.filter((a) => {
  const key = `${(a?.name || "").trim().toLowerCase()}::${(a?.url || "").trim().toLowerCase()}::${(a?.hash || "").trim().toLowerCase()}`;
  return !currentArtefactKeys.has(key);
});


  return (
    <div
      className="flex-1 border rounded-lg p-3 bg-white border-gray-300"
      style={{ borderLeft: `8px solid ${getAgendaColor(item.type)}` }}
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

        {/* LEFT SIDE */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">

          {/* MOVE HANDLE + TIME */}
          <div className="flex items-center gap-2">
            <div className="text-gray-800 hover:text-gray-600 cursor-grab select-none pr-1">
              ⋮⋮
            </div>
            <div className="text-sm font-semibold text-gray-700 whitespace-nowrap">
              {item.startTime} – {item.endTime}
            </div>
          </div>

          {/* NAME BUBBLE */}
          <div
            className="px-3 py-2 text-sm font-semibold rounded-md text-white flex items-center gap-2 w-full md:w-auto"
            style={{ backgroundColor: getAgendaColor(item.type), color: getAgendaTextColor(item.type) }}
          >
            <Icon size={16} />
            {item.label}
          </div>

          {/* BADGES */}
          <div className="flex gap-2 flex-wrap">

            {/* MINUTES */}
            <div className="px-2 py-1 text-xs font-semibold rounded-md bg-gray-200 text-gray-700">
              {item.minutes}m
            </div>

            {/* PRESENTER */}
            <div className="px-2 py-1 text-xs font-semibold rounded-md bg-gray-100 text-gray-700">
              {presenterName}
            </div>

            {linkedPeopleSet && (
              <div className="px-2 py-1 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
                {linkedPeopleSet.name} · {linkedPeople.length} people
              </div>
            )}

            {/* ARTEFACTS */}
            {(item.artefacts || []).length > 0 && (
              <div  className="px-2 py-1 text-xs font-semibold rounded-md bg-gray-100 text-gray-700">
                {(item.artefacts || []).map((a, idx) => (
                  <span
                    key={`${a.url}-${idx}`}
                    
                  >
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 underline"
                      title={a.name}
                    >
                      <FileText size={14} />
                    </a>
                  </span>
                ))}
              </div>
            )}

            {/* WARNING BADGE */}
            {isIncomplete && (
              <div className="px-2 py-1 text-xs font-semibold rounded-md bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                ⚠ Incomplete
              </div>
            )}
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="flex gap-2 md:gap-3 w-full md:w-auto">

          <button
            onClick={() => setOpen(!open)}
            className="flex-1 md:flex-none px-3 py-2 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
          >
            {open ? "Edit Off" : "Edit"}
          </button>

          <button
            onClick={() => removeAgendaItem(item.id)}
            className="flex-1 md:flex-none px-3 py-2 bg-red-600 text-white rounded text-xs hover:bg-red-700"
          >
            Remove
          </button>
        </div>
      </div>

      {/* EDIT SECTION */}
      {open && (
        <div className="space-y-4 mt-4">

          {/* SEARCHABLE SESSION NAME */}
          <div className="relative">
            <input
              className={`border rounded p-3 w-full text-sm ${
                isMissingLabel ? "border-red-500 bg-red-50" : ""
              }`}
              placeholder={isOtherItem ? "Type custom session name" : "Search session type"}
              value={search || item.label}
              onChange={(e) => {
                const nextValue = e.target.value;
                if (isOtherItem) {
                  updateAgendaItem(item.id, { label: nextValue });
                } else {
                  setSearch(nextValue);
                }
              }}
            />

            {/* DROPDOWN */}
            {search.length > 0 && !isOtherItem && (
              <div className="absolute left-0 right-0 bg-white border rounded shadow mt-1 z-20 max-h-60 overflow-auto">
                {filteredTypes.map((t) => {
                  const TIcon = t.icon;
                  return (
                    <div
                      key={t.id}
                      className="flex items-center gap-2 px-3 py-3 cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        updateAgendaItem(item.id, {
                          type: t.id,
                          label: t.label,
                          minutes: t.defaultMinutes
                        });
                        setSearch("");
                      }}
                    >
                      <TIcon size={18} />
                      <span className="text-sm">{t.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>


           {/* Description */}
          <div>
            <textarea
              className="border rounded p-3 w-full text-sm"
              placeholder="Add a description for this agenda item"
              value={item.description || ""}
              onChange={(e) => updateAgendaItem(item.id, { description: e.target.value })}
            />
          </div>

          {isQuizItem && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700" htmlFor={`quiz-set-${item.id}`}>
                Linked quiz set
              </label>
              <select
                id={`quiz-set-${item.id}`}
                className={`w-full rounded border p-3 text-sm ${isMissingSetLink ? "border-red-500 bg-red-50" : ""}`}
                value={item.linkedQuestionSetId || ""}
                onChange={(event) => updateAgendaItem(item.id, { linkedQuestionSetId: event.target.value || null })}
              >
                <option value="">Select a quiz set</option>
                {questionSets.map((setItem) => (
                  <option key={setItem.id} value={setItem.id}>{setItem.name}</option>
                ))}
              </select>
              {linkedQuestionSet && (
                <p className="text-xs text-slate-500">
                  {linkedQuestionSet.questions?.length || 0} questions
                  {linkedQuestionSet.peopleSetId ? ` · Audience: ${peopleSets.find((set) => set.id === linkedQuestionSet.peopleSetId)?.name || "Linked people set"}` : " · Event audience"}
                </p>
              )}
            </div>
          )}

          {isIceBreakerItem && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700" htmlFor={`icebreaker-set-${item.id}`}>
                Linked icebreaker set
              </label>
              <select
                id={`icebreaker-set-${item.id}`}
                className={`w-full rounded border p-3 text-sm ${isMissingSetLink ? "border-red-500 bg-red-50" : ""}`}
                value={item.linkedIceBreakerSetId || ""}
                onChange={(event) => updateAgendaItem(item.id, { linkedIceBreakerSetId: event.target.value || null })}
              >
                <option value="">Select an icebreaker set</option>
                {iceBreakerSets.map((setItem) => (
                  <option key={setItem.id} value={setItem.id}>{setItem.name}</option>
                ))}
              </select>
              {linkedIceBreakerSet && (
                <p className="text-xs text-slate-500">
                  {linkedIceBreakerSet.selectedIceBreaker?.label || "No prompt selected in this set"}
                </p>
              )}
            </div>
          )}

          {/* Minutes + Presenter */}
          <div className="flex flex-col md:flex-row gap-3">

            {/* Minutes */}
            <input
              type="number"
              className={`border rounded p-3 w-full md:w-24 text-sm ${
                isMissingMinutes ? "border-red-500 bg-red-50" : ""
              }`}
              value={item.minutes}
              onChange={(e) =>
                updateAgendaItem(item.id, {
                  minutes: Number(e.target.value) || 0
                })
              }
            />

            {/* Presenter Dropdown */}
            <select
              className={`border rounded p-3 text-sm w-full md:w-auto ${
                isMissingPresenter ? "border-red-500 bg-red-50" : ""
              }`}
              value={isGuestSelected ? "guest" : item.presenterId ?? ""}
              onChange={(e) => {
                const val = e.target.value;

                if (val === "guest") {
                  updateAgendaItem(item.id, {
                    presenterId: "guest",
                    guestPresenter: item.guestPresenter || ""
                  });
                } else {
                  updateAgendaItem(item.id, {
                    presenterId: val || null,
                    guestPresenter: ""
                  });
                }
              }}
            >
              <option value="">Select presenter...</option>

              {presenterList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.preferredName || p.fullName}
                </option>
              ))}

              <option value="guest">Guest Presenter</option>
            </select>

            {/* Guest Presenter Input */}
            {isGuestSelected && (
              <input
                className={`border rounded p-3 text-sm w-full ${
                  isMissingPresenter && !item.guestPresenter
                    ? "border-red-500 bg-red-50"
                    : ""
                }`}
                placeholder="Guest presenter name"
                value={item.guestPresenter ?? ""}
                onChange={(e) =>
                  updateAgendaItem(item.id, {
                    guestPresenter: e.target.value
                  })
                }
              />
            )}
          </div>

          {/* Group Setup */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700" htmlFor={`people-set-${item.id}`}>
              Audience list
            </label>
            <select
              id={`people-set-${item.id}`}
              className="w-full rounded border p-3 text-sm"
              value={item.linkedPeopleSetId || ""}
              onChange={(event) => updateAgendaItem(item.id, { linkedPeopleSetId: event.target.value || null })}
            >
              <option value="">No linked people set</option>
              {peopleSets.map((peopleSet) => (
                <option key={peopleSet.id} value={peopleSet.id}>
                  {peopleSet.type === "stakeholders" ? "Stakeholders" : peopleSet.type === "training-event" ? "Training / Event" : "Team"}: {peopleSet.name}
                </option>
              ))}
            </select>
            {linkedPeopleSet && (
              <div className="space-y-3 rounded border border-slate-200 bg-slate-50 p-3">
                <div className="font-semibold text-slate-800">People in {linkedPeopleSet.name}</div>
                <input
                  value={peopleSearch}
                  onChange={(event) => setPeopleSearch(event.target.value)}
                  placeholder="Search people to add"
                  className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm"
                />
                {matchingPeople.length > 0 && (
                  <div className="divide-y divide-slate-200 rounded border border-slate-200 bg-white">
                    {matchingPeople.map((person) => (
                      <button
                        key={person.id}
                        type="button"
                        onClick={() => {
                          addPersonToPeopleSet(linkedPeopleSet.id, person.id);
                          setPeopleSearch("");
                        }}
                        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-slate-50"
                      >
                        <span>{person.preferredName || person.fullName}</span>
                        <span className="text-indigo-700">Add</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {linkedPeople.map((person) => (
                    <div key={person.id} className="flex items-center gap-2 rounded border border-slate-200 bg-white px-2 py-1 text-sm">
                      <span>{person.preferredName || person.fullName}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${person.preferredName || person.fullName} from ${linkedPeopleSet.name}`}
                        onClick={() => removePersonFromPeopleSet(linkedPeopleSet.id, person.id)}
                        className="font-bold text-slate-500 hover:text-rose-700"
                      >×</button>
                    </div>
                  ))}
                  {linkedPeople.length === 0 && <span className="text-sm text-slate-500">This set has no people in the current event roster.</span>}
                </div>
              </div>
            )}
          </div>

          {/* Group Setup */}
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-700">Group setup</div>

            <div className="flex flex-wrap items-center gap-3">

              {/* LEFT: Toggle */}
              <div className="flex items-center gap-2">
                <ToggleButton
                  value={!!item.enableGroupSetup}
                  onChange={(newValue) =>
                    updateAgendaItem(item.id, {
                      enableGroupSetup: newValue,
                      groupCount: newValue
                        ? Math.max(1, Number(item.groupCount) || 2)
                        : item.groupCount
                    })
                  }
                  onLabel="Yes"
                  offLabel="No"
                  onBg="bg-green-600"
                  onHoverBg="hover:bg-green-700"
                  onBorder="border-green-600"
                  offBg="bg-gray-600"
                  offBorder="border-gray-500"
                />
              </div>

              {/* RIGHT: Always same height, content hidden when OFF */}
              <div className="flex items-center gap-2 min-h-[40px]">

                {item.enableGroupSetup ? (
                  <>
                    <span className="text-sm text-gray-700">Number of groups</span>
                    <input
                      type="number"
                      min={1}
                      className={`border rounded p-2 text-sm w-24 ${
                        isMissingGroupCount ? "border-red-500 bg-red-50" : ""
                      }`}
                      value={Math.max(1, Number(item.groupCount) || 1)}
                      onChange={(e) =>
                        updateAgendaItem(item.id, {
                          groupCount: Math.max(1, Number(e.target.value) || 1),
                        })
                      }
                    />
                  </>
                ) : (
                  // Invisible placeholder to keep height stable
                  <div className="invisible flex items-center gap-2">
                    <span className="text-sm">Number of groups</span>
                    <input className="border rounded p-2 text-sm w-24" />
                  </div>
                )}

              </div>
            </div>
          </div>

{!isQuizItem && !isIceBreakerItem && <>{/* Artefacts Section */}
<div className="space-y-6">

  {/* Header */}
  <div>
    <h3 className="text-sm font-semibold text-gray-700">Documents & Artefacts</h3>
    <p className="text-xs text-gray-500">Slides, links, worksheets, exercises</p>
  </div>

  {/* Existing Artefacts */}
  {(item.artefacts || []).length > 0 && (
    <div className="space-y-3">
      {item.artefacts.map((a, idx) => (
        <div
          key={idx}
          className="border rounded-lg bg-white p-4 shadow-sm flex justify-between items-start"
        >
          {/* Left side */}
          <div className="flex flex-col gap-2 text-sm w-full">

            {/* Name + Icon */}
            <div className="flex items-center gap-2 font-medium text-gray-800">
              <FileText size={16} />
              <span>{a.name}</span>
            </div>

            {/* PDF Range Editor */}
            {a.type === "pdf-upload" && (
              <div className="flex items-center gap-3 text-xs">
                <span className="text-gray-600">Slides:</span>

                <input
                  type="number"
                  className="border rounded p-1 w-16"
                  value={a.from || 1}
                  onChange={(e) => {
                    const updated = [...item.artefacts];
                    updated[idx] = { ...a, from: Number(e.target.value) };
                    updateAgendaItem(item.id, { artefacts: updated });
                  }}
                />

                <span className="text-gray-600">to</span>

                <input
                  type="number"
                  className="border rounded p-1 w-16"
                  value={a.to || a.from || 1}
                  onChange={(e) => {
                    const updated = [...item.artefacts];
                    updated[idx] = { ...a, to: Number(e.target.value) };
                    updateAgendaItem(item.id, { artefacts: updated });
                  }}
                />
              </div>
            )}

            {/* URL Display */}
            {a.url && (
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-xs"
              >
                Open document
              </a>
            )}

            {/* Hash Display */}
            {a.hash && (
              <div className="text-xs text-gray-500">
                Hash: {a.hash.slice(0, 6)}…{a.hash.slice(-4)}
              </div>
            )}
          </div>

          {/* Remove Button */}
          <button
            className="text-xs text-red-600 hover:text-red-800 ml-4"
            onClick={() => {
              const updated = item.artefacts.filter((_, i) => i !== idx);
              updateAgendaItem(item.id, { artefacts: updated });
            }}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  )}

  {/* Add New Artefact */}
<div className="border rounded-lg bg-white p-4 shadow-sm space-y-3">

  <h4 className="text-sm font-semibold text-gray-700">Add new artefact</h4>

  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">

    {/* Friendly name */}
    <input
      className={`border rounded p-3 text-sm w-full ${
        isMissingArtefact ? "border-red-500 bg-red-50" : ""
      }`}
      placeholder="Friendly name"
      value={newArtefactName}
      onChange={(e) => setNewArtefactName(e.target.value)}
    />

    {/* Document type */}
    <select
      className={`border rounded p-3 text-sm w-full ${
        isMissingArtefact ? "border-red-500 bg-red-50" : ""
      }`}
      value={newArtefactType}
      onChange={(e) => setNewArtefactType(e.target.value)}
    >
      <option value="">Document type</option>
      <option value="pdf-upload">Upload Slides (PDF)</option>
      <option value="pdf">PDF from URL</option>
      <option value="google-slides">Google Slides</option>
      <option value="miro">Miro Board</option>
      <option value="worksheet">Worksheet</option>
      <option value="image">Image</option>
      <option value="link">General Link</option>
    </select>

    {/* FROM + TO (only for slide-based PDFs) */}
    {newArtefactType === "pdf-upload" ? (
      <div className="flex items-center gap-2 w-full">
        <input
          type="number"
          className={`border rounded p-3 text-sm w-full ${
            isMissingArtefact ? "border-red-500 bg-red-50" : ""
          }`}
          placeholder="From"
          value={newArtefactFrom}
          onChange={(e) => setNewArtefactFrom(Number(e.target.value))}
        />

        <input
          type="number"
          className={`border rounded p-3 text-sm w-full ${
            isMissingArtefact ? "border-red-500 bg-red-50" : ""
          }`}
          placeholder="To"
          value={newArtefactTo}
          onChange={(e) => setNewArtefactTo(Number(e.target.value))}
        />
      </div>
    ) : (
      /* Non-PDF artefacts still use single page number */
      <input
        type="number"
        className={`border rounded p-3 text-sm w-full ${
          isMissingArtefact ? "border-red-500 bg-red-50" : ""
        }`}
        placeholder="Page #"
        value={newArtefactPage}
        onChange={(e) => setNewArtefactPage(Number(e.target.value))}
      />
    )}

    {/* File upload OR URL */}
    {newArtefactType === "pdf-upload" ? (
      <input
        type="file"
        accept=".pdf"
        className="border rounded p-3 text-sm w-full"
        onChange={(e) => setNewArtefactFile(e.target.files[0])}
      />
    ) : (
      <input
        className={`border rounded p-3 text-sm w-full ${
          isMissingArtefact ? "border-red-500 bg-red-50" : ""
        }`}
        placeholder="Paste document URL"
        value={newArtefactUrl}
        onChange={(e) => setNewArtefactUrl(e.target.value)}
      />
    )}
  </div>

  <button
    className="px-4 py-2 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
    onClick={addArtefact}
  >
    Add Artefact
  </button>
</div>


  {/* Reuse Existing */}
  {reusableArtefacts.length > 0 && (
    <div className="border rounded-lg bg-white p-4 shadow-sm space-y-2">
      <div className="text-xs text-gray-600">Reuse existing artefact:</div>

      <div className="flex flex-wrap gap-2">
        {reusableArtefacts.map((a, idx) => {
          const shortHash = a.hash ? a.hash.slice(0, 6) + "…" + a.hash.slice(-4) : "";
          return (
            <button
              key={idx}
              className="px-3 py-1 text-xs bg-gray-100 border rounded hover:bg-gray-200"
              onClick={() => reuseArtefact(a)}
            >
              {a.name} {shortHash && <span className="text-gray-500">({shortHash})</span>}
            </button>
          );
        })}
      </div>
    </div>
  )}

</div>
  </>}

  

          {/* Notes */}
          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-700">Notes (optional)</div>

            {/* Add note (NOT highlighted red) */}
            <div className="flex flex-col md:flex-row gap-3">
              <input
                className="border rounded p-3 text-sm w-full"
                placeholder="Add a note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <button
                className="px-3 py-2 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
                onClick={addNote}
              >
                Add Note
              </button>
            </div>

            {latestNote && (
              <div className="border rounded p-3 bg-blue-50 border-blue-200 space-y-2">
                <div className="text-xs font-semibold text-blue-800">Latest note ({latestNote.ts})</div>
                <div className="text-sm text-blue-900">{latestNote.text}</div>
              </div>
            )}

            {/* Notes dropdown */}
            {previousNotes.length > 0 && (
              <div className="space-y-2">
                <button
                  className="text-xs text-gray-600 underline"
                  onClick={() => setShowNotes(!showNotes)}
                >
                  {showNotes ? "Hide earlier notes" : "Show earlier notes"}
                </button>

                {showNotes && (
                  <div className="space-y-2">
                    {previousNotes.map((n, idx) => (
                      <div
                        key={idx}
                        className="border rounded p-2 bg-gray-50 text-sm"
                      >
                        <div className="text-gray-500 text-xs">{n.ts}</div>
                        <div>{n.text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
