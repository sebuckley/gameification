import { create } from "zustand";

const STORAGE_KEY = "people-app";

const chicColors = [
  "#D16C7A", "#6CA8D1", "#E3C26F", "#D18F6C",
  "#9B7ED1", "#6CD1A8", "#D16C6C", "#6CD1D1"
];

const shiftHue = (hex) => {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);

  const newR = (r + 25) % 255;
  const newG = (g + 25) % 255;
  const newB = (b + 25) % 255;

  return (
    "#" +
    newR.toString(16).padStart(2, "0") +
    newG.toString(16).padStart(2, "0") +
    newB.toString(16).padStart(2, "0")
  );
};

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


const loadInitial = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved
      ? JSON.parse(saved)
      : { people: [], groupsHistory: [], questions: [] };

    let used = [];

    const patchedPeople = parsed.people.map((p) => {
      const preferredName = p.preferredName || p.fullName || p.name || "";
      const fullName = p.fullName || p.name || preferredName;

      let color = p.color;
      if (!color) {
        const available = chicColors.filter(
          (c) => !used.includes(c.toLowerCase())
        );
        color = available.length > 0 ? available[0] : shiftHue("#6CA8D1");
      }

      used.push(color.toLowerCase());

      return {
        ...p,
        fullName,
        preferredName,
        color,
        quizScore: p.quizScore ?? 0
      };
    });

    return {
      people: patchedPeople,
      groupsHistory: parsed.groupsHistory ?? [],
      questions: parsed.questions ?? []
    };
  } catch {
    return { people: [], groupsHistory: [], questions: [] };
  }
};

const usePeople = create((set, get) => ({
  ...loadInitial(),

  // ⭐ Hydration flag
  hydrated: false,

  // Called once from App.jsx
  initHydration: () =>
    set((state) => ({ ...state, hydrated: true })),

  // ---------------------------------------------------------
  // PEOPLE
  // ---------------------------------------------------------

  addPerson: (data) =>
    set((state) => {
      if (!state.hydrated) return state;

      const newPerson = {
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
      };

      const updated = { ...state, people: [...state.people, newPerson] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }),

  updatePerson: (id, updates) =>
    set((state) => {
      if (!state.hydrated) return state;

      const updated = {
        ...state,
        people: state.people.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        )
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }),

  addHistory: (id, entry) =>
    set((state) => {
      if (!state.hydrated) return state;

      const updated = {
        ...state,
        people: state.people.map((p) =>
          p.id === id
            ? { ...p, history: [entry, ...p.history].slice(0, 3) }
            : p
        )
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }),

  incrementAnswers: (id) =>
    set((state) => {
      if (!state.hydrated) return state;

      const updated = {
        ...state,
        people: state.people.map((p) =>
          p.id === id ? { ...p, answers: p.answers + 1 } : p
        )
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }),

  resetAnswers: () =>
    set((state) => {
      if (!state.hydrated) return state;

      const updated = {
        ...state,
        people: state.people.map((p) => ({ ...p, answers: 0 }))
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }),

  // ---------------------------------------------------------
  // GROUPS
  // ---------------------------------------------------------

  saveGroups: (groups, sessionName = null) =>
    set((state) => {
      if (!state.hydrated) return state;

      const entry = {
        timestamp: Date.now(),
        sessionName,
        groups
      };

      const updated = {
        ...state,
        groupsHistory: [entry, ...state.groupsHistory]
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }),

  removeGroupHistory: (index) =>
    set((state) => {
      if (!state.hydrated) return state;

      const updated = {
        ...state,
        groupsHistory: state.groupsHistory.filter((_, i) => i !== index)
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }),

  updateGroupHistoryOrder: (newOrder) =>
    set((state) => {
      if (!state.hydrated) return state;

      const updated = {
        ...state,
        groupsHistory: newOrder
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }),

  updateGroupHistory: (index, updatedGroups) =>
    set((state) => {
      if (!state.hydrated) return state;

      const newHistory = [...state.groupsHistory];
      newHistory[index] = {
        ...newHistory[index],
        groups: updatedGroups,
        updatedAt: Date.now()
      };

      const updated = { ...state, groupsHistory: newHistory };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }),

  // ---------------------------------------------------------
  // QUIZ SYSTEM
  // ---------------------------------------------------------

  quizSettings: {
    correctPoints: 1,
    wrongPoints: -1
  },

  updateQuizSettings: (settings) =>
    set((state) => {
      if (!state.hydrated) return state;

      const updated = {
        ...state,
        quizSettings: { ...state.quizSettings, ...settings }
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }),

  applyQuizResult: (personId, isCorrect) =>
    set((state) => {
      if (!state.hydrated) return state;

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

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }),

  applyAllWrong: () =>
    set((state) => {
      if (!state.hydrated) return state;

      const updated = {
        ...state,
        people: state.people.map((p) => ({
          ...p,
          quizScore: p.quizScore + state.quizSettings.wrongPoints
        }))
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }),

  resetQuizScores: () =>
    set((state) => {
      if (!state.hydrated) return state;

      const updated = {
        ...state,
        people: state.people.map((p) => ({ ...p, quizScore: 0 }))
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }),

  // ---------------------------------------------------------
  // QUESTIONS
  // ---------------------------------------------------------

  addQuestion: (q) =>
    set((state) => {
      if (!state.hydrated) return state;

      const updated = {
        ...state,
        questions: [...state.questions, q]
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }),

importQuestions: (list) =>
  set((state) => {
    if (!state.hydrated) return state;

    const normalized = normalizeImportedQuestions(list);

    const updated = {
      ...state,
      questions: normalized
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }),


  exportQuestions: () => JSON.stringify(get().questions, null, 2)
}));

export default usePeople;
