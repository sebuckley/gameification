import { create } from "zustand";
import { agendaTemplates } from "../../data/AgendaTemplates";
import { agendaTypes, getAgendaDefaultMinutes } from "../../data/AgendaTypes";
import { nanoid } from "nanoid";

console.log(agendaTemplates)

const STORAGE_KEY = "people-app";

/* ---------------------------------------------------------
   QUESTION NORMALISER
--------------------------------------------------------- */
const normalizeImportedQuestions = (rawList) => {
  if (!Array.isArray(rawList)) {
    console.error("normalizeImportedQuestions expected an array but got:", rawList);
    return [];
  }

  return rawList.map(q => ({
    ...q,
    id: q.id || nanoid(),
    options: q.options || [],
    type: q.type || (q.options?.length ? "multi" : "single")
  }));
};




/* ---------------------------------------------------------
   Load initial state
--------------------------------------------------------- */
const loadInitial = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return {
        people: [],
        groupsHistory: [],
        questions: [],
        agendaItems: [],
        agendaStartTime: "09:00",
        quizSettings: { correctPoints: 1, wrongPoints: -1 }
      };
    }
    return JSON.parse(saved);
  } catch {
    return {
      people: [],
      groupsHistory: [],
      questions: [],
      agendaItems: [],
      agendaStartTime: "09:00",
      quizSettings: { correctPoints: 1, wrongPoints: -1 }
    };
  }
};



/* ---------------------------------------------------------
   Safe autosave (always writes FINAL state)
--------------------------------------------------------- */
const save = (get) => {
  const finalState = get();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(finalState));
};

/* ---------------------------------------------------------
   Time helpers
--------------------------------------------------------- */
const timeToMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const minutesToTime = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const recalcAgendaTimes = (startTime, items) => {
  let cursor = timeToMinutes(startTime);
  return items.map((item) => {
    const start = cursor;
    const end = start + item.minutes;
    cursor = end;
    return {
      ...item,
      startTime: minutesToTime(start),
      endTime: minutesToTime(end)
    };
  });
};

/* ---------------------------------------------------------
   STORE (safe version)
--------------------------------------------------------- */
const usePeople = create((set, get) => ({
  ...loadInitial(),

  /* ---------------------------------------------------------
     PEOPLE
  --------------------------------------------------------- */
  addPerson: (data) =>
    set((state) => {
      const updated = {
        ...state,
        people: [
          ...state.people,
          {
            id: crypto.randomUUID(),
            fullName: data.fullName.trim(),
            preferredName: data.preferredName.trim(),
            color: data.color,
            isPresenter: false,
            inSpinner: true,
            inGroups: true,
            answers: 0,
            quizScore: 0,
            history: []
          }
        ]
      };
      save(get);
      return updated;
    }),

  updatePerson: (id, updates) =>
    set((state) => {
      const updated = {
        ...state,
        people: state.people.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        )
      };
      save(get);
      return updated;
    }),

    setPeople: (list) =>
    set((state) => {
      const updated = { ...state, people: list };
      save(get);
      return updated;
    }),

    addHistory: (personId, message) =>
  set((state) => {
    const updatedPeople = state.people.map((p) =>
      p.id === personId
        ? {
            ...p,
            history: [
              ...p.history,
              `${message} at ${new Date().toLocaleString()}`
            ]
          }
        : p
    );

    const updated = { ...state, people: updatedPeople };
    save(get);
    return updated;
  }),

  removePerson: (id) =>
  set((state) => {
    const updated = {
      ...state,
      people: state.people.filter((p) => p.id !== id)
    };
    save(get);
    return updated;
  }),

  reorderPeople: (startIndex, endIndex) =>
  set((state) => {
    const updated = Array.from(state.people);
    const [removed] = updated.splice(startIndex, 1);
    updated.splice(endIndex, 0, removed);
    return { people: updated };
  }),


  resetAnswers: () =>
  set((state) => {
    const updated = {
      ...state,
      people: state.people.map((p) => ({
        ...p,
        answers: 0
      }))
    };
    save(get);
    return updated;
  }),


  /* ---------------------------------------------------------
     GROUPS
  --------------------------------------------------------- */
  saveGroups: (groups, sessionName = null) =>
    set((state) => {
      const updated = {
        ...state,
        groupsHistory: [
          {
            timestamp: Date.now(),
            sessionName,
            groups
          },
          ...state.groupsHistory
        ]
      };
      save(get);
      return updated;
    }),

    removeGroupHistory: (index) =>
    set((state) => {
      const updated = {
        ...state,
        groupsHistory: state.groupsHistory.filter((_, i) => i !== index)
      };
      save(get);
      return updated;
    }),

  updateGroupHistory: (index, updatedEntry) =>
    set((state) => {
      const updated = {
        ...state,
        groupsHistory: state.groupsHistory.map((entry, i) =>
          i === index ? { ...entry, ...updatedEntry } : entry
        )
      };
      save(get);
      return updated;
    }),


  /* ---------------------------------------------------------
     QUIZ
  --------------------------------------------------------- */
  quizMode: "standard",

  setQuizMode: (mode) => set({ quizMode: mode }),

  updateQuizSettings: (settings) =>
    set((state) => {
      const updated = {
        ...state,
        quizSettings: { ...state.quizSettings, ...settings }
      };
      save(get);
      return updated;
    }),

  applyQuizResult: (personId, isCorrect) =>
    set((state) => {
      const updated = {
        ...state,
        people: state.people.map((p) =>
          p.id === personId
            ? {
                ...p,
                quizScore:
                  p.quizScore +
                  (isCorrect
                    ? state.quizSettings.correctPoints
                    : state.quizSettings.wrongPoints)
              }
            : p
        )
      };
      save(get);
      return updated;
    }),

  incrementAnswers: (personId) =>
  set((state) => {
    const updatedPeople = state.people.map((p) =>
      p.id === personId
        ? {
            ...p,
            answers: p.answers + 1,
            history: [
              ...p.history,
              `Answered at ${new Date().toLocaleString()}`
            ]
          }
        : p
    );

    const updated = { ...state, people: updatedPeople };
    save(get);
    return updated;
  }),


  resetQuizScores: () =>
    set((state) => {
      const updated = {
        ...state,
        people: state.people.map((p) => ({ ...p, quizScore: 0 }))
      };
      save(get);
      return updated;
    }),

  /* ---------------------------------------------------------
     QUESTIONS
  --------------------------------------------------------- */
  addQuestion: (q) =>
    set((state) => {
      const updated = {
        ...state,
        questions: [...state.questions, q]
      };
      save(get);
      return updated;
    }),

  importQuestions: (list) =>
    set((state) => {
      const updated = {
        ...state,
        questions: normalizeImportedQuestions(list)
      };
      save(get);
      return updated;
    }),


  /* ---------------------------------------------------------
     AGENDA
  --------------------------------------------------------- */
  setAgendaStartTime: (time) =>
    set((state) => {
      const updated = {
        ...state,
        agendaStartTime: time,
        agendaItems: recalcAgendaTimes(time, state.agendaItems)
      };
      save(get);
      return updated;
    }),

  addAgendaItem: (item) =>
    set((state) => {
      const updated = {
        ...state,
        agendaItems: recalcAgendaTimes(state.agendaStartTime, [
          ...state.agendaItems,
          { id: crypto.randomUUID(), ...item }
        ])
      };
      save(get);
      return updated;
    }),

  updateAgendaItemsOrder: (newOrder) =>
    set((state) => {
      const updated = {
        ...state,
        agendaItems: recalcAgendaTimes(state.agendaStartTime, newOrder)
      };
      save(get);
      return updated;
    }),

  updateAgendaItem: (id, updates) =>
    set((state) => {
      const updatedItems = state.agendaItems.map((i) =>
        i.id === id ? { ...i, ...updates } : i
      );
      const updated = {
        ...state,
        agendaItems: recalcAgendaTimes(state.agendaStartTime, updatedItems)
      };
      save(get);
      return updated;
    }),

  removeAgendaItem: (id) =>
    set((state) => {
      const updatedItems = state.agendaItems.filter((i) => i.id !== id);
      const updated = {
        ...state,
        agendaItems: recalcAgendaTimes(state.agendaStartTime, updatedItems)
      };
      save(get);
      return updated;
    }),

applyAgendaTemplate: (templateId, startTime) =>
  set((state) => {
    console.log(templateId)
    const template = agendaTemplates[templateId];
    console.log(template)
    if (!template) return state;

    // If UI didn't pass a start time, fall back to template or 09:00
    const finalStartTime = startTime || template.startTime || "09:00";

    const items = template.items.map((t) => ({
      id: crypto.randomUUID(),
      type: t.type,
      label: agendaTypes.find((x) => x.id === t.type)?.label || "Session",
      minutes: getAgendaDefaultMinutes(t.type),
      presenterId: null,
      guestPresenter: "",
      notes: "",
      artefactUrl: ""
    }));

    const recalced = recalcAgendaTimes(finalStartTime, items);

    const updated = {
      ...state,
      agendaStartTime: finalStartTime,
      agendaItems: recalced
    };

    save(get);
    return updated;
  }),



/* ---------------------------------------------------------
   AGENDA EXPORTS
--------------------------------------------------------- */

// Markdown (already conceptually there, keeping name)
exportAgendaMarkdown: () => {
  const state = get();
  const lines = [];

  lines.push(`# Agenda Summary`);
  lines.push(`Start Time: **${state.agendaStartTime}**`);
  lines.push("");

  state.agendaItems.forEach((item, index) => {
    const presenter =
      item.presenterId
        ? state.people.find((p) => p.id === item.presenterId)?.fullName
        : item.guestPresenter || "None";

    lines.push(`## ${index + 1}. ${item.label}`);
    lines.push(`- **Time:** ${item.startTime} → ${item.endTime}`);
    lines.push(`- **Duration:** ${item.minutes} minutes`);
    lines.push(`- **Presenter:** ${presenter}`);
    if (item.notes) lines.push(`- **Notes:** ${item.notes}`);
    if (item.artefactUrl) lines.push(`- **Artefact:** ${item.artefactUrl}`);
    lines.push("");
  });

  return lines.join("\n");
},


// CSV
exportAgendaCSV: () => {
  const state = get();

  const rows = [
    ["#", "Session", "Start", "End", "Minutes", "Presenter", "Notes", "Artefact"]
  ];

  state.agendaItems.forEach((item, index) => {
    const presenter =
      item.presenterId
        ? state.people.find((p) => p.id === item.presenterId)?.fullName
        : item.guestPresenter || "None";

    rows.push([
      index + 1,
      item.label,
      item.startTime,
      item.endTime,
      item.minutes,
      presenter,
      item.notes || "",
      item.artefactUrl || ""
    ]);
  });

  return rows
    .map((r) =>
      r
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
},


// HTML table
exportAgendaHtmlTable: () => {
  const state = get();

  const esc = (v) =>
    String(v || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const header = `
<table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse; font-family:Arial; width:100%;">
  <thead>
    <tr style="background:#4F46E5; color:#FFFFFF; font-weight:bold;">
      <th style="width:40px; text-align:center; color:#FFFFFF; font-weight:bold;">#</th>
      <th style="text-align:left; color:#FFFFFF; font-weight:bold; ">Session</th>
      <th style="text-align:center; color:#FFFFFF; font-weight:bold; ">Start</th>
      <th style="text-align:center; color:#FFFFFF; font-weight:bold; ">End</th>
      <th style="text-align:center; color:#FFFFFF; font-weight:bold;">Minutes</th>
      <th style="text-align:left; color:#FFFFFF; font-weight:bold; ">Presenter</th>
    </tr>
  </thead>
  <tbody>
`;

  const rows = state.agendaItems
    .map((item, index) => {
      const presenter =
        item.presenterId
          ? state.people.find((p) => p.id === item.presenterId)?.fullName
          : item.guestPresenter || "None";

      // Even lighter banding (PowerPoint-friendly)
      const band = index % 2 === 0 ? "#FFFFFF" : "#F8F9FF";

      return `
    <tr style="background:${band};">
      <td style="width:40px; text-align:center;">${index + 1}</td>
      <td style="text-align:left;">${esc(item.label)}</td>
      <td style="text-align:center;">${esc(item.startTime)}</td>
      <td style="text-align:center;">${esc(item.endTime)}</td>
      <td style="text-align:center;">${esc(item.minutes)}</td>
      <td style="text-align:left;">${esc(presenter)}</td>
    </tr>
`;
    })
    .join("");

  return header + rows + "</tbody></table>";
},





// PDF-friendly text (simple, linear)
exportAgendaPdfText: () => {
  const state = get();
  const lines = [];

  lines.push("Agenda Summary");
  lines.push(`Start Time: ${state.agendaStartTime}`);
  lines.push("");

  state.agendaItems.forEach((item, index) => {
    const presenter =
      item.presenterId
        ? state.people.find((p) => p.id === item.presenterId)?.fullName
        : item.guestPresenter || "None";

    lines.push(`${index + 1}. ${item.label}`);
    lines.push(`   Time: ${item.startTime} → ${item.endTime}`);
    lines.push(`   Duration: ${item.minutes} minutes`);
    lines.push(`   Presenter: ${presenter}`);
    if (item.notes) lines.push(`   Notes: ${item.notes}`);
    if (item.artefactUrl) lines.push(`   Artefact: ${item.artefactUrl}`);
    lines.push("");
  });

  return lines.join("\n");
},


// PowerPoint XML table (basic PPTX-compatible table markup)
exportAgendaPowerPointXml: () => {
  const state = get();

  const rows = [
    ["#", "Session", "Start", "End", "Minutes", "Presenter", "Notes", "Artefact"]
  ];

  state.agendaItems.forEach((item, index) => {
    const presenter =
      item.presenterId
        ? state.people.find((p) => p.id === item.presenterId)?.fullName
        : item.guestPresenter || "None";

    rows.push([
      index + 1,
      item.label,
      item.startTime,
      item.endTime,
      item.minutes,
      presenter,
      item.notes || "",
      item.artefactUrl || ""
    ]);
  });

  // Very simple DrawingML table fragment (for advanced use)
  const esc = (v) =>
    String(v || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const xmlRows = rows
    .map(
      (r) =>
        "<a:tr>" +
        r
          .map(
            (cell) =>
              "<a:tc><a:txBody><a:p><a:r><a:t>" +
              esc(cell) +
              "</a:t></a:r></a:p></a:txBody></a:tc>"
          )
          .join("") +
        "</a:tr>"
    )
    .join("");

  return (
    "<a:tbl>" +
    "<a:tblGrid>" +
    rows[0].map(() => "<a:gridCol w=\"3000000\"/>").join("") +
    "</a:tblGrid>" +
    xmlRows +
    "</a:tbl>"
  );
},

exportAgendaPowerPointTable: () => {
  const state = get();

  const rows = [
    ["#", "Session", "Start", "End", "Minutes", "Presenter", "Notes", "Artefact"]
  ];

  state.agendaItems.forEach((item, index) => {
    const presenter =
      item.presenterId
        ? state.people.find((p) => p.id === item.presenterId)?.fullName
        : item.guestPresenter || "None";

    rows.push([
      index + 1,
      item.label,
      item.startTime,
      item.endTime,
      item.minutes,
      presenter,
      item.notes || "",
      item.artefactUrl || ""
    ]);
  });

  // Add trailing tab to force PowerPoint to treat it as a table
  return rows.map((r) => r.join("\t") + "\t").join("\n");
},


  clearAgenda: () =>
  set((state) => {
    const updated = { ...state, agendaItems: [] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }),

}));

export default usePeople;
