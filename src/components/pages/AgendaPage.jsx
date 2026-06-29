import { useState } from "react";
import usePeople from "../store/usePeopleStore";

import AgendaScheduler from "../agenda/AgendaScheduler";
import AgendaSummaryModal from "../agenda/AgendaSummaryModal";
import AgendaTimeline from "../agenda/AgendaTimeline";

import { agendaTemplates } from "../../data/AgendaTemplates";

export default function AgendaPage() {
  const [showSummary, setShowSummary] = useState(false);
  const [startTime, setStartTime] = useState("09:00");

  const agendaItems = usePeople((s) => s.agendaItems);
  const applyTemplate = usePeople((s) => s.applyAgendaTemplate);
  const clearAgenda = usePeople((s) => s.clearAgenda);

  const isEmpty = agendaItems.length === 0;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Agenda</h1>

        <div className="flex gap-3">
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

      {/* TEMPLATE SELECTOR — ONLY WHEN EMPTY */}
      {isEmpty && (
        <div className="bg-white border rounded-xl p-4 shadow space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Start with a Template</h2>

        {/* Start Time Selector */}
        <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Workshop Start Time</label>
        <input
            type="time"
            className="border rounded p-2 text-sm w-full"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
        />
        </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {Object.entries(agendaTemplates).map(([key, t]) => (
              <div
                key={t.id}
                className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                onClick={() => applyTemplate(key, startTime)}
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
