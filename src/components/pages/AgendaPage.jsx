import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePeople from "../store/usePeopleStore";
import { formatUKDateTime } from "../../utils/formatUKTime";

import AgendaScheduler from "../agenda/AgendaScheduler";
import AgendaSummaryModal from "../agenda/AgendaSummaryModal";
import AgendaTimeline from "../agenda/AgendaTimeline";

import { agendaTemplates } from "../../data/AgendaTemplates";
import { AGENDA_EVENT_TYPE_OPTIONS } from "../../data/AgendaFocus";

export default function AgendaPage() {
  const navigate = useNavigate();
  const [showSummary, setShowSummary] = useState(false);

  const agendaItems = usePeople((s) => s.agendaItems);
  const events = usePeople((s) => s.events);
  const peopleSets = usePeople((s) => s.peopleSets || []);
  const currentEventId = usePeople((s) => s.currentEventId);
  const agendaEventTitle = usePeople((s) => s.agendaEventTitle);
  const agendaEventDate = usePeople((s) => s.agendaEventDate);
  const agendaEventTime = usePeople((s) => s.agendaEventTime);
  const agendaLocationType = usePeople((s) => s.agendaLocationType);
  const agendaVirtualPlatform = usePeople((s) => s.agendaVirtualPlatform);
  const agendaVirtualJoinLink = usePeople((s) => s.agendaVirtualJoinLink);
  const agendaPhysicalAddress = usePeople((s) => s.agendaPhysicalAddress);
  const agendaEventLocation = usePeople((s) => s.agendaEventLocation);
  const agendaEventType = usePeople((s) => s.agendaEventType || "all");
  const agendaLinkedPeopleSetId = usePeople((s) => s.agendaLinkedPeopleSetId);
  const setAgendaEventDetails = usePeople((s) => s.setAgendaEventDetails);
  const createEvent = usePeople((s) => s.createEvent);
  const selectEvent = usePeople((s) => s.selectEvent);
  const applyTemplate = usePeople((s) => s.applyAgendaTemplate);
  const clearAgenda = usePeople((s) => s.clearAgenda);

  const hasSavedEventDetails = Boolean(
    agendaEventDate &&
      agendaEventTime &&
      ((agendaLocationType === "virtual" && agendaVirtualPlatform.trim()) ||
        (agendaLocationType === "physical" && agendaPhysicalAddress.trim()))
  );

  const [showEventEditor, setShowEventEditor] = useState(!hasSavedEventDetails);

  const [eventTitle, setEventTitle] = useState(agendaEventTitle || "");
  const [eventDate, setEventDate] = useState(agendaEventDate || "");
  const [eventTime, setEventTime] = useState(agendaEventTime || "09:00");
  const [locationType, setLocationType] = useState(agendaLocationType || "");
  const [virtualPlatform, setVirtualPlatform] = useState(agendaVirtualPlatform || "");
  const [virtualJoinLink, setVirtualJoinLink] = useState(agendaVirtualJoinLink || "");
  const [physicalAddress, setPhysicalAddress] = useState(agendaPhysicalAddress || "");
  const [eventType, setEventType] = useState(agendaEventType);
  const [linkedPeopleSetId, setLinkedPeopleSetId] = useState(agendaLinkedPeopleSetId || "");

  useEffect(() => {
    setEventTitle(agendaEventTitle || "");
    setEventDate(agendaEventDate || "");
    setEventTime(agendaEventTime || "09:00");
    setLocationType(agendaLocationType || "");
    setVirtualPlatform(agendaVirtualPlatform || "");
    setVirtualJoinLink(agendaVirtualJoinLink || "");
    setPhysicalAddress(agendaPhysicalAddress || "");
    setEventType(agendaEventType || "all");
    setLinkedPeopleSetId(agendaLinkedPeopleSetId || "");
  }, [
    currentEventId,
    agendaEventTitle,
    agendaEventDate,
    agendaEventTime,
    agendaLocationType,
    agendaVirtualPlatform,
    agendaVirtualJoinLink,
    agendaPhysicalAddress,
    agendaEventType,
    agendaLinkedPeopleSetId
  ]);

  const isEmpty = !Array.isArray(agendaItems) || agendaItems.length === 0;
  const eventReady = Boolean(
    eventDate &&
      eventTime &&
      ((locationType === "virtual" && virtualPlatform.trim()) ||
        (locationType === "physical" && physicalAddress.trim()))
  );
        const templatesForEventType = Object.entries(agendaTemplates).filter(([, template]) => template.eventType === eventType);
        const hasPendingTypeChange = eventType !== agendaEventType;

  const linkedLocation =
    locationType === "virtual"
      ? `${virtualPlatform || agendaVirtualPlatform || "Virtual"}${(virtualJoinLink || agendaVirtualJoinLink) ? ` - ${virtualJoinLink || agendaVirtualJoinLink}` : ""}`
      : locationType === "physical"
      ? physicalAddress || agendaPhysicalAddress
      : agendaEventLocation;

  const saveEventDetails = (eventTypeValue = eventType) => {
    setAgendaEventDetails({
      title: eventTitle.trim(),
      date: eventDate,
      time: eventTime,
      locationType,
      virtualPlatform: virtualPlatform.trim(),
      virtualJoinLink: virtualJoinLink.trim(),
      physicalAddress: physicalAddress.trim(),
      agendaEventType: eventTypeValue,
      linkedPeopleSetId: linkedPeopleSetId || null,
      location: linkedLocation || ""
    });
  };

  const finishEventSetupWithTemplate = (templateKey) => {
    if (!eventReady) return;
    saveEventDetails(eventType);
    applyTemplate(templateKey, eventTime);
    setShowEventEditor(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Agenda</h1>


        <div className="flex flex-wrap gap-3">
        

          {!isEmpty && (
            <button
              onClick={clearAgenda}
              className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
            >
              Clear Agenda
            </button>
          )}


            <button
              onClick={() => setShowSummary(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
            >
              Export Agenda
            </button>
      
       
        </div>
      </div>

      {events.length > 0 && (
        <div className="bg-white border rounded-xl p-4 shadow space-y-2">
                    <button
            onClick={() => {
              createEvent();
              setShowEventEditor(true);
            }}
            className="block mb-5 px-4 py-2 bg-indigo-700 text-white rounded-lg shadow hover:bg-indigo-800"

          >
            Add New Event
          </button>
          <label className="text-sm font-medium text-gray-700">Selected Event</label>
          <select
            className="border rounded p-2 text-sm w-full"
            value={currentEventId || ""}
            onChange={(e) => {
              const eventId = e.target.value;
              if (!eventId) return;
              selectEvent(eventId);
              setShowEventEditor(false);
            }}
          >
            {events.map((eventItem, index) => {
              const label =
                eventItem.title?.trim() ||
                eventItem.date ||
                `Event ${events.length - index}`;
              return (
                <option key={eventItem.id} value={eventItem.id}>
                  {label}
                </option>
              );
            })}
          </select>


        </div>
      )}

      {/* EVENT SETUP */}
      {(isEmpty || showEventEditor) && (
        <div className="bg-white border rounded-xl p-4 shadow space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Event Setup</h2>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="agenda-event-type">Event Type</label>
            <select
              id="agenda-event-type"
              className="w-full rounded border p-2 text-sm"
              value={eventType}
              onChange={(event) => {
                const nextType = event.target.value;
                if (nextType === eventType) return;
                const hasEventTypeToProtect = hasSavedEventDetails || agendaItems.length > 0;
                if (hasEventTypeToProtect && !window.confirm("Changing the event type will require choosing a new matching template and will replace the current agenda. Continue?")) return;
                setEventType(nextType);
              }}
            >
              {AGENDA_EVENT_TYPE_OPTIONS.map((focus) => (
                <option key={focus.id} value={focus.id}>{focus.label}</option>
              ))}
            </select>
            <p className="text-xs text-slate-500">The event type determines which agenda activities are suggested.</p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Event Title</label>
            <input
              type="text"
              placeholder="e.g. Quarterly Planning Workshop"
              className="border rounded p-2 text-sm w-full"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
            />
          </div>



             <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                className="border rounded p-2 text-sm w-full"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Time</label>
              <input
                type="time"
                className="border rounded p-2 text-sm w-full"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Location</label>
              <select
                className="border rounded p-2 text-sm w-full"
                value={locationType}
                onChange={(e) => {
                  const nextType = e.target.value;
                  setLocationType(nextType);
                  if (nextType === "virtual") {
                    setPhysicalAddress("");
                  }
                  if (nextType === "physical") {
                    setVirtualPlatform("");
                    setVirtualJoinLink("");
                  }
                }}
              >
                <option value="">Select location type</option>
                <option value="virtual">Virtual Event</option>
                <option value="physical">Physical Event</option>
              </select>
            </div>
          </div>

            

          {locationType === "virtual" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Virtual Platform</label>
                <select
                  className="border rounded p-2 text-sm w-full"
                  value={virtualPlatform}
                  onChange={(e) => setVirtualPlatform(e.target.value)}
                >
                  <option value="">Choose platform</option>
                  <option value="Microsoft Teams">Microsoft Teams</option>
                  <option value="Zoom">Zoom</option>
                  <option value="Google Meet">Google Meet</option>
                  <option value="Webex">Webex</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Join Link (optional)</label>
                <input
                  type="url"
                  placeholder="https://... (optional)"
                  className="border rounded p-2 text-sm w-full"
                  value={virtualJoinLink}
                  onChange={(e) => setVirtualJoinLink(e.target.value)}
                />
              </div>
            </div>
          )}

          {locationType === "physical" && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Building / Address</label>
              <input
                type="text"
                placeholder="e.g. 123 Main St, Building A"
                className="border rounded p-2 text-sm w-full"
                value={physicalAddress}
                onChange={(e) => setPhysicalAddress(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="event-people-set">People list</label>
            <select
              id="event-people-set"
              className="w-full rounded border p-2 text-sm"
              value={linkedPeopleSetId}
              onChange={(event) => setLinkedPeopleSetId(event.target.value)}
            >
              <option value="">No linked people set</option>
              {peopleSets.map((peopleSet) => (
                <option key={peopleSet.id} value={peopleSet.id}>
                  {peopleSet.type === "stakeholders" ? "Stakeholders" : peopleSet.type === "training-event" ? "Training / Event" : "Team"}: {peopleSet.name}
                </option>
              ))}
            </select>
            {linkedPeopleSetId && (
              <p className="text-xs text-slate-500">
                {peopleSets.find((peopleSet) => peopleSet.id === linkedPeopleSetId)?.personIds.length || 0} people in this set
              </p>
            )}
          </div>



          {(isEmpty || hasPendingTypeChange) && (
            <div className="space-y-3 border-t pt-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {isEmpty ? "Select a template to complete event setup" : "Select a template for the new event type"}
                </h2>
                <p className="text-sm text-slate-600">
                  {AGENDA_EVENT_TYPE_OPTIONS.find((focus) => focus.id === eventType)?.label}: {templatesForEventType.length} template{templatesForEventType.length === 1 ? "" : "s"}
                </p>
              </div>

              {!eventReady && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  Set date, time, and location first, then choose a template.
                </div>
              )}

              {templatesForEventType.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                  {templatesForEventType.map(([key, template]) => (
                    <button
                      key={template.id}
                      type="button"
                      disabled={!eventReady}
                      onClick={() => finishEventSetupWithTemplate(key)}
                      className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-left transition hover:border-indigo-400 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <span className="block font-semibold">{template.name}</span>
                      <span className="mt-1 block text-sm text-slate-600">{template.description}</span>
                      <span className="mt-3 block text-xs font-semibold text-indigo-700">Use this template</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-amber-800">No templates are configured for this event type yet.</p>
              )}
            </div>
          )}

          {!isEmpty && !hasPendingTypeChange && (
            <button
              type="button"
              onClick={() => {
                saveEventDetails();
                setShowEventEditor(false);
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
            >Save Event Changes</button>
          )}

     
        </div>
      )}

      {!showEventEditor && hasSavedEventDetails && (
        <div className="bg-white border rounded-xl p-4 shadow space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-black-800">{agendaEventTitle}</h2>
              <p className="mt-1 text-sm text-slate-600">
                Event type: {AGENDA_EVENT_TYPE_OPTIONS.find((focus) => focus.id === agendaEventType)?.label || "Workshop"}
              </p>
              {agendaLinkedPeopleSetId && (
                <p className="mt-1 text-sm text-slate-600">
                  People list: {peopleSets.find((peopleSet) => peopleSet.id === agendaLinkedPeopleSetId)?.name || "Unknown set"}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => navigate("/agenda-player")}
                className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Launch Slides
              </button>

              <button
                onClick={() => setShowEventEditor(true)}
                className="px-3 py-1.5 text-sm bg-gray-100 text-black-700 rounded hover:bg-gray-200"
              >
                Edit
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-700">
            {formatUKDateTime(agendaEventDate, agendaEventTime) || "No date · No time"}
          </div>

          <div className="text-sm text-gray-600">
            {agendaLocationType === "virtual" ? (
              agendaVirtualJoinLink ? (
                <a
                  href={agendaVirtualJoinLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 font-medium rounded hover:bg-indigo-200"
                >
                  Start meeting
                </a>
              ) : (
                <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 font-medium rounded">
                  Virtual event — no meeting link added
                </span>
              )
            ) : (
              <span>{agendaEventLocation || "No location"}</span>
          )}
          </div>
        </div>
      )}


      {isEmpty && !showEventEditor && (
        <div className="bg-white border rounded-xl p-4 shadow space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Select a template to complete event setup</h2>

          {!eventReady && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              Set date, time, and location first, then choose a template.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {templatesForEventType.map(([key, t]) => (
              <button
                key={t.id}
                type="button"
                disabled={!eventReady}
                className="w-full border rounded-lg p-3 text-left enabled:bg-gray-50 enabled:hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400"
                onClick={() => {
                  finishEventSetupWithTemplate(key);
                }}
              >
                <div className="font-semibold text-gray-800">{t.name}</div>
                <div className="text-sm text-gray-600">{t.description}</div>
                <div className="mt-3 text-xs font-semibold text-indigo-700">Use this template</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TIMELINE */}
      {!isEmpty && <AgendaTimeline />}

      {/* SCHEDULER */}
      {!isEmpty && <AgendaScheduler eventType={eventType} />}

      {/* SUMMARY MODAL */}
      {showSummary && (
        <AgendaSummaryModal onClose={() => setShowSummary(false)} />
      )}
    </div>
  );
}
