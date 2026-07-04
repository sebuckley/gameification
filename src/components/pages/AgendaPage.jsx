import { useEffect, useState } from "react";
import usePeople from "../store/usePeopleStore";

import AgendaScheduler from "../agenda/AgendaScheduler";
import AgendaSummaryModal from "../agenda/AgendaSummaryModal";
import AgendaTimeline from "../agenda/AgendaTimeline";

import { agendaTemplates } from "../../data/AgendaTemplates";

export default function AgendaPage() {
  const [showSummary, setShowSummary] = useState(false);

  const agendaItems = usePeople((s) => s.agendaItems);
  const events = usePeople((s) => s.events);
  const currentEventId = usePeople((s) => s.currentEventId);
  const agendaEventTitle = usePeople((s) => s.agendaEventTitle);
  const agendaEventDate = usePeople((s) => s.agendaEventDate);
  const agendaEventTime = usePeople((s) => s.agendaEventTime);
  const agendaLocationType = usePeople((s) => s.agendaLocationType);
  const agendaVirtualPlatform = usePeople((s) => s.agendaVirtualPlatform);
  const agendaVirtualJoinLink = usePeople((s) => s.agendaVirtualJoinLink);
  const agendaPhysicalAddress = usePeople((s) => s.agendaPhysicalAddress);
  const agendaEventLocation = usePeople((s) => s.agendaEventLocation);
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

  useEffect(() => {
    setEventTitle(agendaEventTitle || "");
    setEventDate(agendaEventDate || "");
    setEventTime(agendaEventTime || "09:00");
    setLocationType(agendaLocationType || "");
    setVirtualPlatform(agendaVirtualPlatform || "");
    setVirtualJoinLink(agendaVirtualJoinLink || "");
    setPhysicalAddress(agendaPhysicalAddress || "");
  }, [
    currentEventId,
    agendaEventTitle,
    agendaEventDate,
    agendaEventTime,
    agendaLocationType,
    agendaVirtualPlatform,
    agendaVirtualJoinLink,
    agendaPhysicalAddress
  ]);

  const isEmpty = !Array.isArray(agendaItems) || agendaItems.length === 0;
  const eventReady = Boolean(
    eventDate &&
      eventTime &&
      ((locationType === "virtual" && virtualPlatform.trim()) ||
        (locationType === "physical" && physicalAddress.trim()))
  );

  const linkedLocation =
    locationType === "virtual"
      ? `${virtualPlatform || agendaVirtualPlatform || "Virtual"}${(virtualJoinLink || agendaVirtualJoinLink) ? ` - ${virtualJoinLink || agendaVirtualJoinLink}` : ""}`
      : locationType === "physical"
      ? physicalAddress || agendaPhysicalAddress
      : agendaEventLocation;

  const saveEventDetails = () => {
    setAgendaEventDetails({
      title: eventTitle.trim(),
      date: eventDate,
      time: eventTime,
      locationType,
      virtualPlatform: virtualPlatform.trim(),
      virtualJoinLink: virtualJoinLink.trim(),
      physicalAddress: physicalAddress.trim(),
      location: linkedLocation || ""
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Agenda</h1>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              createEvent();
              setShowEventEditor(true);
            }}
            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg shadow hover:bg-indigo-200"
          >
            Add New Event
          </button>

          {!isEmpty && (
            <button
              onClick={clearAgenda}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300"
            >
              Clear Agenda
            </button>
          )}

          <button
            onClick={() => setShowSummary(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
          >
            Export Summary
          </button>
        </div>
      </div>

      {events.length > 1 && (
        <div className="bg-white border rounded-xl p-4 shadow space-y-2">
          <label className="text-sm font-medium text-gray-700">Working Event</label>
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

          <button
            onClick={() => {
              saveEventDetails();
              setShowEventEditor(false);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
          >
            Save Event Details
          </button>

          {isEmpty && (
            <>
              <div className="pt-3 border-t" />

              <h2 className="text-lg font-semibold text-gray-800">Start with a Template</h2>

              {!eventReady && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  Set date, time, and location first, then choose a template.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {Object.entries(agendaTemplates).map(([key, t]) => (
                  <div
                    key={t.id}
                    className={`border rounded-lg p-3 ${eventReady ? "bg-gray-50 hover:bg-gray-100 cursor-pointer" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                    onClick={() => {
                      if (!eventReady) return;
                      saveEventDetails();
                      applyTemplate(key, eventTime);
                    }}
                  >
                    <div className="font-semibold text-gray-800">{t.name}</div>
                    <div className="text-sm text-gray-600">{t.description}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {!showEventEditor && hasSavedEventDetails && (
        <div className="bg-white border rounded-xl p-4 shadow space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Linked Event</h2>
              {agendaEventTitle && <div className="text-sm font-medium text-gray-700">{agendaEventTitle}</div>}
            </div>
            <button
              onClick={() => setShowEventEditor(true)}
              className="px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
            >
              Edit Event Details
            </button>
          </div>
          <div className="text-sm text-gray-700">
            {agendaEventDate || "No date"} · {agendaEventTime || "No time"}
          </div>
          <div className="text-sm text-gray-600">{agendaEventLocation || "No location"}</div>
        </div>
      )}

      {isEmpty && !showEventEditor && (
        <div className="bg-white border rounded-xl p-4 shadow space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Start with a Template</h2>

          {!eventReady && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              Set date, time, and location first, then choose a template.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {Object.entries(agendaTemplates).map(([key, t]) => (
              <div
                key={t.id}
                className={`border rounded-lg p-3 ${eventReady ? "bg-gray-50 hover:bg-gray-100 cursor-pointer" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                onClick={() => {
                  if (!eventReady) return;
                  saveEventDetails();
                  applyTemplate(key, eventTime);
                }}
              >
                <div className="font-semibold text-gray-800">{t.name}</div>
                <div className="text-sm text-gray-600">{t.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TIMELINE */}
      {!isEmpty && <AgendaTimeline />}

      {/* SCHEDULER */}
      {!isEmpty && <AgendaScheduler />}

      {/* SUMMARY MODAL */}
      {showSummary && (
        <AgendaSummaryModal onClose={() => setShowSummary(false)} />
      )}
    </div>
  );
}
