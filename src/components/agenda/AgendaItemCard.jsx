import { useState } from "react";
import {
  getAgendaColor,
  getAgendaIcon,
  agendaTypes
} from "../../data/AgendaTypes";

export default function AgendaItemCard({
  item,
  presenters,
  agendaTypeOptions = agendaTypes,
  questionSets = [],
  iceBreakerSets = [],
  updateAgendaItem,
  removeAgendaItem,
  allArtefacts = []
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [newArtefactName, setNewArtefactName] = useState("");
  const [newArtefactUrl, setNewArtefactUrl] = useState("");
  const [newNote, setNewNote] = useState("");
  const [showNotes, setShowNotes] = useState(false);


  const Icon = getAgendaIcon(item.type);

  // Presenter name for header
  const selectedPresenter =
    presenters.find((p) => p.id === item.presenterId)?.preferredName ||
    presenters.find((p) => p.id === item.presenterId)?.fullName ||
    null;

  const presenterName = selectedPresenter || item.guestPresenter || "No presenter";
  const isGuestSelected = item.presenterId === "guest";
  const isQuizItem = String(item.type || "").startsWith("quiz");
  const isIceBreakerItem = String(item.type || "") === "ice-breaker";
  const linkedQuestionSet = questionSets.find((setItem) => setItem.id === item.linkedQuestionSetId) || null;
  const linkedIceBreakerSet = iceBreakerSets.find((setItem) => setItem.id === item.linkedIceBreakerSetId) || null;
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
  const addArtefact = () => {
    if (!newArtefactName.trim() || !newArtefactUrl.trim()) return;

    const updated = [
      ...(item.artefacts || []),
      { name: newArtefactName.trim(), url: newArtefactUrl.trim() }
    ];

    updateAgendaItem(item.id, { artefacts: updated });

    setNewArtefactName("");
    setNewArtefactUrl("");
  };

  // Reuse artefact
  const reuseArtefact = (artefact) => {
    const updated = [
      ...(item.artefacts || []),
      { name: artefact.name, url: artefact.url }
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

  return (
    <div
      className="flex-1 border rounded-lg p-3 bg-white border-gray-300"
      style={{ borderLeft: `8px solid ${getAgendaColor(item.type)}` }}
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

        {/* LEFT SIDE */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">

          {/* MOVE HANDLE */}
          <div className="text-gray-500 text-xl leading-none select-none cursor-grab md:self-center">
            ☰
          </div>

          {/* TIME */}
          <div className="text-sm font-semibold text-gray-700">
            {item.startTime} – {item.endTime}
          </div>

          {/* NAME BUBBLE */}
          <div
            className="px-3 py-2 text-sm font-semibold rounded-md text-white flex items-center gap-2 w-full md:w-auto"
            style={{ backgroundColor: getAgendaColor(item.type) }}
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

            {/* LATEST NOTE */}
            {latestNote && (
              <div className="px-2 py-1 text-xs rounded-md bg-blue-50 text-blue-800 border border-blue-300">
                📝 {latestNote.text}
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
              placeholder="Search or type session name"
              value={search || item.label}
              onChange={(e) => {
                setSearch(e.target.value);
                updateAgendaItem(item.id, { label: e.target.value });
              }}
            />

            {/* DROPDOWN */}
            {search.length > 0 && (
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

              {presenters.map((p) => (
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

          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-700">Group setup</div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name={`group-setup-${item.id}`}
                  checked={!item.enableGroupSetup}
                  onChange={() =>
                    updateAgendaItem(item.id, {
                      enableGroupSetup: false,
                      groupCount: Math.max(1, Number(item.groupCount) || 2),
                    })
                  }
                />
                No
              </label>

              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name={`group-setup-${item.id}`}
                  checked={!!item.enableGroupSetup}
                  onChange={() =>
                    updateAgendaItem(item.id, {
                      enableGroupSetup: true,
                      groupCount: Math.max(1, Number(item.groupCount) || 2),
                    })
                  }
                />
                Yes
              </label>

              {item.enableGroupSetup && (
                <div className="flex items-center gap-2">
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
                </div>
              )}
            </div>

            {item.enableGroupSetup && (
              <div className="rounded border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-800">
                A group session is created/updated in Group History using this session name and time.
              </div>
            )}
          </div>

          {/* Artefacts */}
          {(isQuizItem || isIceBreakerItem) && (
            <div className="space-y-3">
              <div className="text-sm font-semibold text-gray-700">Linked set</div>

              {isQuizItem && (
                <>
                  <select
                    className={`border rounded p-3 text-sm w-full ${
                      isMissingSetLink ? "border-red-500 bg-red-50" : ""
                    }`}
                    value={item.linkedQuestionSetId || ""}
                    onChange={(e) =>
                      updateAgendaItem(item.id, {
                        linkedQuestionSetId: e.target.value || null,
                      })
                    }
                  >
                    <option value="">Select question set...</option>
                    {questionSets.map((setItem) => (
                      <option key={setItem.id} value={setItem.id}>
                        {setItem.name}
                      </option>
                    ))}
                  </select>

                  {linkedQuestionSet && (
                    <div className="rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                      Linked to {linkedQuestionSet.name}
                      {!hasQuizSetQuestions && (
                        <span className="block mt-1 text-blue-700">Add questions to this set to enable the set artefact link.</span>
                      )}
                    </div>
                  )}

                  {item.linkedQuestionSetId && (
                    <button
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                      onClick={() => updateAgendaItem(item.id, { linkedQuestionSetId: null, artefacts: [] })}
                    >
                      Unlink Question Set
                    </button>
                  )}
                </>
              )}

              {isIceBreakerItem && (
                <>
                  <select
                    className={`border rounded p-3 text-sm w-full ${
                      isMissingSetLink ? "border-red-500 bg-red-50" : ""
                    }`}
                    value={item.linkedIceBreakerSetId || ""}
                    onChange={(e) =>
                      updateAgendaItem(item.id, {
                        linkedIceBreakerSetId: e.target.value || null,
                      })
                    }
                  >
                    <option value="">Select icebreaker set...</option>
                    {iceBreakerSets.map((setItem) => (
                      <option key={setItem.id} value={setItem.id}>
                        {setItem.name}
                      </option>
                    ))}
                  </select>

                  {linkedIceBreakerSet && (
                    <div className="rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                      Linked to {linkedIceBreakerSet.name}
                      {!hasIceBreakerSelected && (
                        <span className="block mt-1 text-blue-700">Choose an icebreaker prompt in this set to enable the set artefact link.</span>
                      )}
                    </div>
                  )}

                  {item.linkedIceBreakerSetId && (
                    <button
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                      onClick={() => updateAgendaItem(item.id, { linkedIceBreakerSetId: null, artefacts: [] })}
                    >
                      Unlink Icebreaker Set
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {!isQuizItem && !isIceBreakerItem && (
            <div className="space-y-3">

            <div className="text-sm font-semibold text-gray-700">
              Artefacts (links, slides, exercises)
            </div>

            {(item.artefacts || []).map((a, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between border rounded p-2 bg-gray-50"
              >
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm"
                >
                  {a.name}
                </a>
                <button
                  className="text-xs text-red-600"
                  onClick={() => {
                    const updated = item.artefacts.filter((_, i) => i !== idx);
                    updateAgendaItem(item.id, { artefacts: updated });
                  }}
                >
                  Remove
                </button>
              </div>
            ))}

            {/* Add new artefact */}
            <div className="flex flex-col md:flex-row gap-3">
              <input
                className={`border rounded p-3 text-sm w-full ${
                  isMissingArtefact ? "border-red-500 bg-red-50" : ""
                }`}
                placeholder="Friendly name (e.g., Icebreaker Slides)"
                value={newArtefactName}
                onChange={(e) => setNewArtefactName(e.target.value)}
              />

              <input
                className={`border rounded p-3 text-sm w-full ${
                  isMissingArtefact ? "border-red-500 bg-red-50" : ""
                }`}
                placeholder="Paste link"
                value={newArtefactUrl}
                onChange={(e) => setNewArtefactUrl(e.target.value)}
              />

              <button
                className="px-3 py-2 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
                onClick={addArtefact}
              >
                Add
              </button>
            </div>

            {/* Reuse artefact */}
            {allArtefacts.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-gray-600">Reuse existing:</div>
                <div className="flex flex-wrap gap-2">
                  {allArtefacts.map((a, idx) => (
                    <button
                      key={idx}
                      className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                      onClick={() => reuseArtefact(a)}
                    >
                      {a.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            </div>
          )}

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

            {/* Notes dropdown */}
            {item.notes?.length > 0 && (
              <div className="space-y-2">
                <button
                  className="text-xs text-gray-600 underline"
                  onClick={() => setShowNotes(!showNotes)}
                >
                  {showNotes ? "Hide all notes" : "Show all notes"}
                </button>

                {showNotes && (
                  <div className="space-y-2">
                    {item.notes.map((n, idx) => (
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
