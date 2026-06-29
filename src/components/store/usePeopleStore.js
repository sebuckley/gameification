import { create } from "zustand";
import { agendaTemplates } from "../../data/AgendaTemplates";
import { agendaTypes, getAgendaDefaultMinutes } from "../../data/AgendaTypes";

console.log(agendaTemplates)

const STORAGE_KEY = "people-app";

/* ---------------------------------------------------------
   QUESTION NORMALISER
--------------------------------------------------------- */
const normalizeImportedQuestions = (rawList) => {
  return rawList
    .map((item) => {
      if (!item) return null;

      // Format: "Q: ... A: ..."
      if (typeof item === "string") {
        const parts = item.split("A:");
        if (parts.length === 2) {
          return {
            question: parts[0].replace("Q:", "").trim(),
            answer: parts[1].trim()
          };
        }
      }

      // Format: { q: "...", a: "..." }
      if (item.q && item.a) {
        return {
          question: item.q.trim(),
          answer: item.a.trim()
        };
      }

      // Format: { question: "...", answer: "..." }
      if (item.question && item.answer) {
        return {
          question: item.question.trim(),
          answer: item.answer.trim()
        };
      }

      return null;
    })
    .filter(Boolean);
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

  /* ---------------------------------------------------------
     QUIZ
  --------------------------------------------------------- */
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


  clearAgenda: () =>
  set((state) => {
    const updated = { ...state, agendaItems: [] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }),

}));

export default usePeople;
