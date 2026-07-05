import { useState } from "react";
import { FileText } from "lucide-react";
import {
  getAgendaColor,
  getAgendaTextColor,
  getAgendaIcon,
  agendaTypes
} from "../../data/AgendaTypes";
import ToggleButton from "../shared/Toggle";

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
  const isOtherItem = String(item.type || "") === "other";
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
  const previousNotes = item.notes?.length > 1 ? item.notes.slice(0, -1) : [];
  const currentArtefactKeys = new Set(
    (item.artefacts || []).map((a) => `${(a?.name || "").trim().toLowerCase()}::${(a?.url || "").trim().toLowerCase()}`)
  );
  const reusableArtefacts = allArtefacts.filter((a) => {
    const key = `${(a?.name || "").trim().toLowerCase()}::${(a?.url || "").trim().toLowerCase()}`;
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

          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-700">
              Documents (links, slides, exercises)
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
                  className="flex items-center gap-2 text-blue-600 underline text-sm"
                  title={a.name}
                >
                  <FileText size={16} />
                  <span>{a.name}</span>
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

            {/* Add new document URL */}
            <div className="flex flex-col md:flex-row gap-3">
              <input
                className={`border rounded p-3 text-sm w-full ${
                  isMissingArtefact ? "border-red-500 bg-red-50" : ""
                }`}
                placeholder="Friendly name (e.g., Workshop Slides)"
                value={newArtefactName}
                onChange={(e) => setNewArtefactName(e.target.value)}
              />

              <input
                className={`border rounded p-3 text-sm w-full ${
                  isMissingArtefact ? "border-red-500 bg-red-50" : ""
                }`}
                placeholder="Paste document URL"
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

            {/* Reuse document URL */}
            {reusableArtefacts.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-gray-600">Reuse existing:</div>
                <div className="flex flex-wrap gap-2">
                  {reusableArtefacts.map((a, idx) => (
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
