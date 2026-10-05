import { create, type StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { useMemo } from "react";
import {
  DISCOVERY_QUESTION_TEMPLATES,
  DISCOVERY_TEMPLATE_CATEGORIES
} from "../../data/discoveryTemplates";

/* ---------------------------------------------------------
   Types
--------------------------------------------------------- */
export type QuestionStatus = "unanswered" | "answered" | "parked" | "not-applicable";

export const INSIGHT_KEYS = [
  "painPoints",
  "problemStatements",
  "systems",
  "processSteps",
  "dependencies",
  "stakeholders",
  "risks",
  "opportunities",
  "notes"
] as const;
export type InsightKey = (typeof INSIGHT_KEYS)[number];

export interface TemplateQuestion {
  id: string;
  question: string;
  category?: string;
  type?: string; // user type, e.g. business-analyst
  pointers?: string[];
}

export interface Templates {
  questions: TemplateQuestion[];
  categories: string[];
}

export interface InterviewQuestion {
  id: string;
  templateId: string | null;
  question: string;
  status: QuestionStatus;
  notes: string;
}

export interface Insight {
  id: string;
  text: string;
  source: string; // interviewId
  createdAt: string;
}

export type InsightGroups = Record<InsightKey, Insight[]>;

export interface Interview {
  id: string;
  stakeholder: string;
  role: string;
  createdAt: string;
  questions: InterviewQuestion[];
  insights: InsightGroups;
}

export interface CarryForwardQuestion {
  id: string;
  question: string;
  originInterviewId: string;
  status: QuestionStatus;
}

export type CarryForwardInsight = Insight;

export interface CarryForward {
  questions: CarryForwardQuestion[];
  insights: CarryForwardInsight[];
}

export interface Workshop {
  id: string;
  title: string;
  createdAt: string;
  questions: string[]; // carryForward question ids
  insights: string[]; // insight ids
  notes: string[];
}

export type ObservationSeverity = "low" | "medium" | "high";

export interface Observation {
  id: string;
  interviewId: string;
  text: string;
  createdAt: string;
  severity: ObservationSeverity | null;
  tags: string[];
  linkedInsightIds: string[]; // global or carry-forward insight ids
  linkedProcessStepIds: string[]; // InsightGroups.processSteps ids
  linkedSystemIds: string[]; // InsightGroups.systems ids
}

export interface CustomQuestion {
  id: string;
  question: string;
  createdAt: string;
}

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */
const uid = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const now = (): string => new Date().toISOString();

export const createEmptyInsightGroups = (): InsightGroups =>
  INSIGHT_KEYS.reduce((acc, key) => {
    acc[key] = [];
    return acc;
  }, {} as InsightGroups);

/* ---------------------------------------------------------
   Slices
--------------------------------------------------------- */
export interface TemplatesSlice {
  templates: Templates;
}
export interface InterviewsSlice {
  interviews: Interview[];
  addInterview: (input: { stakeholder: string; role: string }) => string;
  addInterviewQuestion: (
    interviewId: string,
    input: { question: string; templateId?: string | null }
  ) => string | null;
  updateQuestionStatus: (interviewId: string, questionId: string, status: QuestionStatus) => void;
  updateQuestionNotes: (interviewId: string, questionId: string, notes: string) => void;
  addInterviewInsight: (interviewId: string, key: InsightKey, text: string) => string | null;
}
export interface InsightsSlice {
  insights: InsightGroups;
  addInsight: (key: InsightKey, input: { text: string; source: string }) => string;
}
export interface CarryForwardSlice {
  carryForward: CarryForward;
  addCarryForwardQuestion: (input: Omit<CarryForwardQuestion, "id">) => string;
  addCarryForwardInsight: (input: { text: string; source: string }) => string;
}
export interface WorkshopsSlice {
  workshops: Workshop[];
  addWorkshop: (input: { title: string }) => string;
  addQuestionToWorkshop: (workshopId: string, questionId: string) => boolean;
  removeQuestionFromWorkshop: (workshopId: string, questionId: string) => boolean;
  addInsightToWorkshop: (workshopId: string, insightId: string) => boolean;
  removeInsightFromWorkshop: (workshopId: string, insightId: string) => boolean;
  updateWorkshopNotes: (workshopId: string, notes: string[]) => boolean;
}
export interface ObservationsSlice {
  observations: Observation[];
  addObservation: (input: { interviewId: string; text: string }) => string;
  addObservationTag: (observationId: string, tag: string) => boolean;
  removeObservationTag: (observationId: string, tag: string) => boolean;
  addObservationSeverity: (observationId: string, severity: ObservationSeverity) => boolean;
  addObservationInsightLink: (observationId: string, insightId: string) => boolean;
  removeObservationInsightLink: (observationId: string, insightId: string) => boolean;
  addObservationProcessStepLink: (observationId: string, processStepId: string) => boolean;
  removeObservationProcessStepLink: (observationId: string, processStepId: string) => boolean;
  addObservationSystemLink: (observationId: string, systemId: string) => boolean;
  removeObservationSystemLink: (observationId: string, systemId: string) => boolean;
}
export interface DiscoveryQuestion {
  id: string;
  question: string;
  templateId: string | null; // set when copied from a template, otherwise a custom question
  category: string;
  pointers?: string[]; // optional prompts shown under the question
}

export interface DiscoveryQuestionSet {
  id: string;
  name: string;
  category: string;
  tags: string[];
  notes: string;
  metadata: Record<string, string>;
  questions: DiscoveryQuestion[];
  createdAt: string;
}

export type DiscoveryQuestionSetFields = Partial<
  Pick<DiscoveryQuestionSet, "category" | "tags" | "notes" | "metadata">
>;

export interface DiscoveryQuestionSetsSlice {
  discoveryQuestionSets: DiscoveryQuestionSet[];
  createDiscoveryQuestionSet: (name: string, fields?: DiscoveryQuestionSetFields) => string;
  renameDiscoveryQuestionSet: (setId: string, name: string) => boolean;
  updateDiscoveryQuestionSetFields: (setId: string, fields: DiscoveryQuestionSetFields) => boolean;
  deleteDiscoveryQuestionSet: (setId: string) => boolean;
  createDiscoveryQuestionSetFromTemplates: (
    name: string,
    categories: string[],
    fields?: DiscoveryQuestionSetFields
  ) => string;
  saveDiscoveryQuestionSetAsTemplate: (setId: string, category?: string) => boolean;
  addDiscoveryQuestion: (
    setId: string,
    input: { question: string; templateId?: string | null; category?: string }
  ) => string | null;
  updateDiscoveryQuestion: (
    setId: string,
    questionId: string,
    patch: Partial<Omit<DiscoveryQuestion, "id">>
  ) => boolean;
  removeDiscoveryQuestion: (setId: string, questionId: string) => boolean;
  replaceDiscoveryQuestions: (setId: string, questions: DiscoveryQuestion[]) => boolean;
}

export interface CustomQuestionsSlice {
  customQuestions: CustomQuestion[];
  addCustomQuestion: (question: string) => string;
}

export type DiscoveryStore = TemplatesSlice &
  InterviewsSlice &
  InsightsSlice &
  CarryForwardSlice &
  WorkshopsSlice &
  ObservationsSlice &
  CustomQuestionsSlice &
  DiscoveryQuestionSetsSlice;

type Slice<T> = StateCreator<DiscoveryStore, [["zustand/persist", unknown]], [], T>;

export const templatesSlice: Slice<TemplatesSlice> = () => ({
  templates: {
    questions: DISCOVERY_QUESTION_TEMPLATES,
    categories: DISCOVERY_TEMPLATE_CATEGORIES
  }
});

export const interviewsSlice: Slice<InterviewsSlice> = (set) => ({
  interviews: [],

  addInterview: ({ stakeholder, role }) => {
    const id = uid();
    set((s) => ({
      interviews: [
        ...s.interviews,
        { id, stakeholder, role, createdAt: now(), questions: [], insights: createEmptyInsightGroups() }
      ]
    }));
    return id;
  },

  addInterviewQuestion: (interviewId, { question, templateId = null }) => {
    const id = uid();
    let found = false;
    set((s) => ({
      interviews: s.interviews.map((i) => {
        if (i.id !== interviewId) return i;
        found = true;
        return {
          ...i,
          questions: [...i.questions, { id, templateId, question, status: "unanswered", notes: "" }]
        };
      })
    }));
    return found ? id : null;
  },

  updateQuestionStatus: (interviewId, questionId, status) =>
    set((s) => ({
      interviews: s.interviews.map((i) =>
        i.id === interviewId
          ? { ...i, questions: i.questions.map((q) => (q.id === questionId ? { ...q, status } : q)) }
          : i
      )
    })),

  updateQuestionNotes: (interviewId, questionId, notes) =>
    set((s) => ({
      interviews: s.interviews.map((i) =>
        i.id === interviewId
          ? { ...i, questions: i.questions.map((q) => (q.id === questionId ? { ...q, notes } : q)) }
          : i
      )
    })),

  addInterviewInsight: (interviewId, key, text) => {
    const id = uid();
    let found = false;
    set((s) => ({
      interviews: s.interviews.map((i) => {
        if (i.id !== interviewId) return i;
        found = true;
        return {
          ...i,
          insights: {
            ...i.insights,
            [key]: [...i.insights[key], { id, text, source: interviewId, createdAt: now() }]
          }
        };
      })
    }));
    return found ? id : null;
  }
});

export const insightsSlice: Slice<InsightsSlice> = (set) => ({
  insights: createEmptyInsightGroups(),

  addInsight: (key, { text, source }) => {
    const id = uid();
    set((s) => ({
      insights: { ...s.insights, [key]: [...s.insights[key], { id, text, source, createdAt: now() }] }
    }));
    return id;
  }
});

export const carryForwardSlice: Slice<CarryForwardSlice> = (set) => ({
  carryForward: { questions: [], insights: [] },

  addCarryForwardQuestion: (input) => {
    const id = uid();
    set((s) => ({
      carryForward: { ...s.carryForward, questions: [...s.carryForward.questions, { id, ...input }] }
    }));
    return id;
  },

  addCarryForwardInsight: ({ text, source }) => {
    const id = uid();
    set((s) => ({
      carryForward: {
        ...s.carryForward,
        insights: [...s.carryForward.insights, { id, text, source, createdAt: now() }]
      }
    }));
    return id;
  }
});

export const workshopsSlice: Slice<WorkshopsSlice> = (set, get) => ({
  workshops: [],

  addWorkshop: ({ title }) => {
    const id = uid();
    set((s) => ({
      workshops: [
        ...s.workshops,
        { id, title, createdAt: now(), questions: [], insights: [], notes: [] }
      ]
    }));
    return id;
  },

  addQuestionToWorkshop: (workshopId, questionId) => {
    const w = get().workshops.find((x) => x.id === workshopId);
    if (!w || w.questions.includes(questionId)) return false;
    set((s) => ({
      workshops: s.workshops.map((x) =>
        x.id === workshopId ? { ...x, questions: [...x.questions, questionId] } : x
      )
    }));
    return true;
  },

  removeQuestionFromWorkshop: (workshopId, questionId) => {
    const w = get().workshops.find((x) => x.id === workshopId);
    if (!w || !w.questions.includes(questionId)) return false;
    set((s) => ({
      workshops: s.workshops.map((x) =>
        x.id === workshopId ? { ...x, questions: x.questions.filter((id) => id !== questionId) } : x
      )
    }));
    return true;
  },

  // Insight ids are not validated, so both global and carry-forward ids are accepted.
  addInsightToWorkshop: (workshopId, insightId) => {
    const w = get().workshops.find((x) => x.id === workshopId);
    if (!w || w.insights.includes(insightId)) return false;
    set((s) => ({
      workshops: s.workshops.map((x) =>
        x.id === workshopId ? { ...x, insights: [...x.insights, insightId] } : x
      )
    }));
    return true;
  },

  removeInsightFromWorkshop: (workshopId, insightId) => {
    const w = get().workshops.find((x) => x.id === workshopId);
    if (!w || !w.insights.includes(insightId)) return false;
    set((s) => ({
      workshops: s.workshops.map((x) =>
        x.id === workshopId ? { ...x, insights: x.insights.filter((id) => id !== insightId) } : x
      )
    }));
    return true;
  },

  updateWorkshopNotes: (workshopId, notes) => {
    if (!get().workshops.some((x) => x.id === workshopId)) return false;
    set((s) => ({
      workshops: s.workshops.map((x) => (x.id === workshopId ? { ...x, notes: [...notes] } : x))
    }));
    return true;
  }
});

type ObservationListField = "tags" | "linkedInsightIds" | "linkedProcessStepIds" | "linkedSystemIds";

// Fills in fields missing from observations persisted before the metadata existed.
const withObservationDefaults = (o: Observation): Observation => ({
  ...o,
  severity: o.severity ?? null,
  tags: o.tags ?? [],
  linkedInsightIds: o.linkedInsightIds ?? [],
  linkedProcessStepIds: o.linkedProcessStepIds ?? [],
  linkedSystemIds: o.linkedSystemIds ?? []
});

export const observationsSlice: Slice<ObservationsSlice> = (set, get) => {
  const addToList = (observationId: string, field: ObservationListField, value: string): boolean => {
    const found = get().observations.find((o) => o.id === observationId);
    if (!found || (found[field] ?? []).includes(value)) return false;
    set((s) => ({
      observations: s.observations.map((o) =>
        o.id === observationId
          ? { ...withObservationDefaults(o), [field]: [...(o[field] ?? []), value] }
          : o
      )
    }));
    return true;
  };

  const removeFromList = (observationId: string, field: ObservationListField, value: string): boolean => {
    const found = get().observations.find((o) => o.id === observationId);
    if (!found || !(found[field] ?? []).includes(value)) return false;
    set((s) => ({
      observations: s.observations.map((o) =>
        o.id === observationId
          ? { ...withObservationDefaults(o), [field]: (o[field] ?? []).filter((v) => v !== value) }
          : o
      )
    }));
    return true;
  };

  return {
    observations: [],

    addObservation: ({ interviewId, text }) => {
      const id = uid();
      set((s) => ({
        observations: [
          ...s.observations,
          {
            id,
            interviewId,
            text,
            createdAt: now(),
            severity: null,
            tags: [],
            linkedInsightIds: [],
            linkedProcessStepIds: [],
            linkedSystemIds: []
          }
        ]
      }));
      return id;
    },

    addObservationTag: (observationId, tag) => addToList(observationId, "tags", tag),
    removeObservationTag: (observationId, tag) => removeFromList(observationId, "tags", tag),

    addObservationSeverity: (observationId, severity) => {
      if (!get().observations.some((o) => o.id === observationId)) return false;
      set((s) => ({
        observations: s.observations.map((o) =>
          o.id === observationId ? { ...withObservationDefaults(o), severity } : o
        )
      }));
      return true;
    },

    // Insight ids are not validated, so both global and carry-forward ids are accepted.
    addObservationInsightLink: (observationId, insightId) =>
      addToList(observationId, "linkedInsightIds", insightId),
    removeObservationInsightLink: (observationId, insightId) =>
      removeFromList(observationId, "linkedInsightIds", insightId),

    addObservationProcessStepLink: (observationId, processStepId) =>
      addToList(observationId, "linkedProcessStepIds", processStepId),
    removeObservationProcessStepLink: (observationId, processStepId) =>
      removeFromList(observationId, "linkedProcessStepIds", processStepId),

    addObservationSystemLink: (observationId, systemId) =>
      addToList(observationId, "linkedSystemIds", systemId),
    removeObservationSystemLink: (observationId, systemId) =>
      removeFromList(observationId, "linkedSystemIds", systemId)
  };
};

export const discoveryQuestionSetsSlice: Slice<DiscoveryQuestionSetsSlice> = (set, get) => {
  const patchSet = (setId: string, fn: (s: DiscoveryQuestionSet) => DiscoveryQuestionSet): boolean => {
    if (!get().discoveryQuestionSets.some((x) => x.id === setId)) return false;
    set((st) => ({
      discoveryQuestionSets: st.discoveryQuestionSets.map((x) => (x.id === setId ? fn(x) : x))
    }));
    return true;
  };

  return {
    discoveryQuestionSets: [],

    createDiscoveryQuestionSet: (name, fields = {}) => {
      const id = uid();
      set((st) => ({
        discoveryQuestionSets: [
          ...st.discoveryQuestionSets,
          {
            id,
            name,
            category: fields.category ?? "",
            tags: fields.tags ?? [],
            notes: fields.notes ?? "",
            metadata: fields.metadata ?? {},
            questions: [],
            createdAt: now()
          }
        ]
      }));
      return id;
    },

    renameDiscoveryQuestionSet: (setId, name) => patchSet(setId, (x) => ({ ...x, name })),

    updateDiscoveryQuestionSetFields: (setId, fields) => patchSet(setId, (x) => ({ ...x, ...fields })),

    deleteDiscoveryQuestionSet: (setId) => {
      if (!get().discoveryQuestionSets.some((x) => x.id === setId)) return false;
      set((st) => ({ discoveryQuestionSets: st.discoveryQuestionSets.filter((x) => x.id !== setId) }));
      return true;
    },

    // Copies (never links) template questions, so later edits to the set leave templates untouched.
    createDiscoveryQuestionSetFromTemplates: (name, categories, fields = {}) => {
      const id = uid();
      const copied: DiscoveryQuestion[] = get()
        .templates.questions.filter((q) => q.category && categories.includes(q.category))
        .map((q) => ({ id: uid(), question: q.question, templateId: q.id, category: q.category ?? "" }));
      set((st) => ({
        discoveryQuestionSets: [
          ...st.discoveryQuestionSets,
          {
            id,
            name,
            category: fields.category ?? "",
            tags: fields.tags ?? [],
            notes: fields.notes ?? "",
            metadata: fields.metadata ?? {},
            questions: copied,
            createdAt: now()
          }
        ]
      }));
      return id;
    },

    // Explicit user action: copies the set's questions into templates under a category.
    saveDiscoveryQuestionSetAsTemplate: (setId, category) => {
      const source = get().discoveryQuestionSets.find((x) => x.id === setId);
      if (!source) return false;
      const cat = (category ?? source.name).trim() || source.name;
      set((st) => ({
        templates: {
          categories: st.templates.categories.includes(cat)
            ? st.templates.categories
            : [...st.templates.categories, cat],
          questions: [
            ...st.templates.questions,
            ...source.questions.map((q) => ({ id: uid(), question: q.question, category: cat }))
          ]
        }
      }));
      return true;
    },

    addDiscoveryQuestion: (setId, { question, templateId = null, category = "" }) => {
      const id = uid();
      const ok = patchSet(setId, (x) => ({
        ...x,
        questions: [...x.questions, { id, question, templateId, category }]
      }));
      return ok ? id : null;
    },

    updateDiscoveryQuestion: (setId, questionId, patch) => {
      const set_ = get().discoveryQuestionSets.find((x) => x.id === setId);
      if (!set_ || !set_.questions.some((q) => q.id === questionId)) return false;
      return patchSet(setId, (x) => ({
        ...x,
        questions: x.questions.map((q) => (q.id === questionId ? { ...q, ...patch } : q))
      }));
    },

    removeDiscoveryQuestion: (setId, questionId) => {
      const set_ = get().discoveryQuestionSets.find((x) => x.id === setId);
      if (!set_ || !set_.questions.some((q) => q.id === questionId)) return false;
      return patchSet(setId, (x) => ({ ...x, questions: x.questions.filter((q) => q.id !== questionId) }));
    },

    replaceDiscoveryQuestions: (setId, questions) =>
      patchSet(setId, (x) => ({ ...x, questions: questions.map((q) => ({ ...q })) }))
  };
};

export const customQuestionsSlice: Slice<CustomQuestionsSlice> = (set) => ({
  customQuestions: [],

  addCustomQuestion: (question) => {
    const id = uid();
    set((s) => ({
      customQuestions: [...s.customQuestions, { id, question, createdAt: now() }]
    }));
    return id;
  }
});

/* ---------------------------------------------------------
   Store (persisted to localStorage)
--------------------------------------------------------- */
const useDiscoveryStore = create<DiscoveryStore>()(
  persist(
    (...a) => ({
      ...templatesSlice(...a),
      ...interviewsSlice(...a),
      ...insightsSlice(...a),
      ...carryForwardSlice(...a),
      ...workshopsSlice(...a),
      ...observationsSlice(...a),
      ...customQuestionsSlice(...a),
      ...discoveryQuestionSetsSlice(...a)
    }),
    {
      name: "discovery-store",
      // Backfill new observation fields on data persisted by earlier versions.
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<DiscoveryStore>;
        return {
          ...current,
          ...saved,
          // data/discoveryTemplates is the source of truth; keep only user-saved extras from storage.
          templates: {
            questions: [
              ...current.templates.questions,
              ...(saved.templates?.questions ?? []).filter(
                (q) => !current.templates.questions.some((c) => c.id === q.id)
              )
            ],
            categories: [
              ...new Set([...current.templates.categories, ...(saved.templates?.categories ?? [])])
            ]
          },
          observations: (saved.observations ?? current.observations).map(withObservationDefaults)
        };
      }
    }
  )
);

export default useDiscoveryStore;

/* ---------------------------------------------------------
   Selectors (pure reads via getState)
--------------------------------------------------------- */
const state = (): DiscoveryStore => useDiscoveryStore.getState();

export const getInterviewById = (id: string): Interview | undefined =>
  state().interviews.find((i) => i.id === id);

export const getInterviewQuestions = (id: string): InterviewQuestion[] =>
  getInterviewById(id)?.questions ?? [];

export const getUnansweredQuestions = (id: string): InterviewQuestion[] =>
  getInterviewQuestions(id).filter((q) => q.status === "unanswered");

export const getInterviewInsights = (id: string): InsightGroups =>
  getInterviewById(id)?.insights ?? createEmptyInsightGroups();

export const getQuestionById = (
  interviewId: string,
  questionId: string
): InterviewQuestion | undefined =>
  getInterviewQuestions(interviewId).find((q) => q.id === questionId);

export const getInsightsByType = (type: InsightKey): Insight[] => state().insights[type];

export const getAllInsights = (): Insight[] =>
  INSIGHT_KEYS.flatMap((key) => state().insights[key]);

export const getCarryForwardQuestions = (): CarryForwardQuestion[] =>
  state().carryForward.questions;

export const getCarryForwardInsights = (): CarryForwardInsight[] =>
  state().carryForward.insights;

export const getWorkshopById = (id: string): Workshop | undefined =>
  state().workshops.find((w) => w.id === id);

export const getWorkshopQuestions = (id: string): CarryForwardQuestion[] => {
  const workshop = getWorkshopById(id);
  if (!workshop) return [];
  return state().carryForward.questions.filter((q) => workshop.questions.includes(q.id));
};

// Workshop insight ids may reference global or carry-forward insights.
export const getWorkshopInsights = (id: string): Insight[] => {
  const workshop = getWorkshopById(id);
  if (!workshop) return [];
  const pool = [...getAllInsights(), ...state().carryForward.insights];
  return pool.filter((i) => workshop.insights.includes(i.id));
};

export const getObservationsByInterview = (interviewId: string): Observation[] =>
  state().observations.filter((o) => o.interviewId === interviewId);

export const getTemplateQuestions = (): TemplateQuestion[] => state().templates.questions;

export const getTemplateCategories = (): string[] => state().templates.categories;

/* ---------------------------------------------------------
   React hooks (subscribe to state)
--------------------------------------------------------- */
// Derived arrays are wrapped in useShallow so a new array with the same items
// does not trigger re-renders (required with zustand v5).
const EMPTY: never[] = [];

export function useInterview(id: string): Interview | undefined {
  return useDiscoveryStore((s) => s.interviews.find((i) => i.id === id));
}

export function useInterviewQuestions(id: string): InterviewQuestion[] {
  return useDiscoveryStore(
    (s) => s.interviews.find((i) => i.id === id)?.questions ?? EMPTY
  );
}

export function useUnansweredQuestions(id: string): InterviewQuestion[] {
  return useDiscoveryStore(
    useShallow((s) =>
      (s.interviews.find((i) => i.id === id)?.questions ?? EMPTY).filter(
        (q: InterviewQuestion) => q.status === "unanswered"
      )
    )
  );
}

export function useInterviewInsights(id: string): InsightGroups {
  const insights = useDiscoveryStore((s) => s.interviews.find((i) => i.id === id)?.insights);
  return useMemo(() => insights ?? createEmptyInsightGroups(), [insights]);
}

export function useQuestion(
  interviewId: string,
  questionId: string
): InterviewQuestion | undefined {
  return useDiscoveryStore((s) =>
    s.interviews.find((i) => i.id === interviewId)?.questions.find((q) => q.id === questionId)
  );
}

export function useInsightsByType(type: InsightKey): Insight[] {
  return useDiscoveryStore((s) => s.insights[type]);
}

export function useAllInsights(): Insight[] {
  return useDiscoveryStore(
    useShallow((s) => INSIGHT_KEYS.flatMap((key) => s.insights[key]))
  );
}

export function useCarryForwardQuestions(): CarryForwardQuestion[] {
  return useDiscoveryStore((s) => s.carryForward.questions);
}

export function useCarryForwardInsights(): CarryForwardInsight[] {
  return useDiscoveryStore((s) => s.carryForward.insights);
}

export function useWorkshop(id: string): Workshop | undefined {
  return useDiscoveryStore((s) => s.workshops.find((w) => w.id === id));
}

export function useWorkshopQuestions(id: string): CarryForwardQuestion[] {
  return useDiscoveryStore(
    useShallow((s) => {
      const workshop = s.workshops.find((w) => w.id === id);
      if (!workshop) return EMPTY;
      return s.carryForward.questions.filter((q) => workshop.questions.includes(q.id));
    })
  );
}

export function useWorkshopInsights(id: string): Insight[] {
  return useDiscoveryStore(
    useShallow((s) => {
      const workshop = s.workshops.find((w) => w.id === id);
      if (!workshop) return EMPTY;
      const pool = [...INSIGHT_KEYS.flatMap((key) => s.insights[key]), ...s.carryForward.insights];
      return pool.filter((i) => workshop.insights.includes(i.id));
    })
  );
}

export function useObservationsByInterview(interviewId: string): Observation[] {
  return useDiscoveryStore(
    useShallow((s) => s.observations.filter((o) => o.interviewId === interviewId))
  );
}

export function useTemplateQuestions(): TemplateQuestion[] {
  return useDiscoveryStore((s) => s.templates.questions);
}

export function useTemplateCategories(): string[] {
  return useDiscoveryStore((s) => s.templates.categories);
}

/* ---------------------------------------------------------
   Derived state helpers (pure, read via getState)
--------------------------------------------------------- */
const normaliseText = (text: string): string => text.trim().toLowerCase();

// One representative insight per distinct text, ordered by how many distinct
// source interviews mention it (ties keep first-seen order).
const rankInsightsByMentions = (items: Insight[]): Insight[] => {
  const groups = new Map<string, { item: Insight; sources: Set<string> }>();
  for (const item of items) {
    const key = normaliseText(item.text);
    const group = groups.get(key);
    if (group) group.sources.add(item.source);
    else groups.set(key, { item, sources: new Set([item.source]) });
  }
  return [...groups.values()]
    .sort((a, b) => b.sources.size - a.sources.size)
    .map((g) => g.item);
};

export function getInterviewProgress(interviewId: string): {
  total: number;
  answered: number;
  unanswered: number;
  parked: number;
  notApplicable: number;
  completion: number;
} {
  const questions = getInterviewQuestions(interviewId);
  const count = (status: QuestionStatus) => questions.filter((q) => q.status === status).length;
  const total = questions.length;
  const answered = count("answered");
  return {
    total,
    answered,
    unanswered: count("unanswered"),
    parked: count("parked"),
    notApplicable: count("not-applicable"),
    completion: total === 0 ? 0 : answered / total
  };
}

export function getInterviewInsightCount(
  interviewId: string
): Record<InsightKey, number> & { total: number } {
  const insights = getInterviewInsights(interviewId);
  const counts = INSIGHT_KEYS.reduce((acc, key) => {
    acc[key] = insights[key].length;
    return acc;
  }, {} as Record<InsightKey, number>);
  const total = INSIGHT_KEYS.reduce((sum, key) => sum + counts[key], 0);
  return { ...counts, total };
}

export function getTopPainPoints(): Insight[] {
  return rankInsightsByMentions(getInsightsByType("painPoints"));
}

export function getMostMentionedSystems(): Insight[] {
  return rankInsightsByMentions(getInsightsByType("systems"));
}

export function getMostCommonDependencies(): Insight[] {
  return rankInsightsByMentions(getInsightsByType("dependencies"));
}

export function getInsightSummary(): { total: number; byType: Record<InsightKey, number> } {
  const byType = INSIGHT_KEYS.reduce((acc, key) => {
    acc[key] = getInsightsByType(key).length;
    return acc;
  }, {} as Record<InsightKey, number>);
  const total = INSIGHT_KEYS.reduce((sum, key) => sum + byType[key], 0);
  return { total, byType };
}

// Unresolved = still "unanswered" or "parked".
export function getUnresolvedCarryForwardQuestions(): CarryForwardQuestion[] {
  return getCarryForwardQuestions().filter(
    (q) => q.status === "unanswered" || q.status === "parked"
  );
}

// Carry-forward insights have no status, so unresolved = not yet used by any workshop.
export function getUnresolvedCarryForwardInsights(): CarryForwardInsight[] {
  const used = new Set(state().workshops.flatMap((w) => w.insights));
  return getCarryForwardInsights().filter((i) => !used.has(i.id));
}

export function getWorkshopAgenda(workshopId: string): {
  questions: CarryForwardQuestion[];
  insights: Insight[];
  totalItems: number;
} {
  const questions = getWorkshopQuestions(workshopId);
  const insights = getWorkshopInsights(workshopId);
  return { questions, insights, totalItems: questions.length + insights.length };
}

export function getObservationSummary(): {
  total: number;
  byInterview: Record<string, number>;
} {
  const observations = state().observations;
  const byInterview: Record<string, number> = {};
  for (const o of observations) {
    byInterview[o.interviewId] = (byInterview[o.interviewId] ?? 0) + 1;
  }
  return { total: observations.length, byInterview };
}

/* ---------------------------------------------------------
   Observation analytics (pure, read via getState)
--------------------------------------------------------- */
// Observations saved before the metadata fields existed may lack them, so reads use ?? fallbacks.
const allObservations = (): Observation[] => state().observations;

const emptySeverity = () => ({ low: 0, medium: 0, high: 0, none: 0 });

const tallySeverity = (observations: Observation[]) => {
  const counts = emptySeverity();
  for (const o of observations) counts[o.severity ?? "none"] += 1;
  return counts;
};

const tallyTags = (observations: Observation[]): Record<string, number> => {
  const freq: Record<string, number> = {};
  for (const o of observations) {
    for (const tag of o.tags ?? EMPTY) freq[tag] = (freq[tag] ?? 0) + 1;
  }
  return freq;
};

const tallyField = (
  observations: Observation[],
  field: "linkedInsightIds" | "linkedSystemIds" | "linkedProcessStepIds"
): Record<string, number> => {
  const freq: Record<string, number> = {};
  for (const o of observations) {
    for (const id of o[field] ?? EMPTY) freq[id] = (freq[id] ?? 0) + 1;
  }
  return freq;
};

export function getObservationSeverityCounts(): {
  low: number;
  medium: number;
  high: number;
  none: number;
  total: number;
} {
  const observations = allObservations();
  return { ...tallySeverity(observations), total: observations.length };
}

export function getObservationSeverityByInterview(): Record<
  string,
  { low: number; medium: number; high: number; none: number; total: number }
> {
  const result: Record<string, { low: number; medium: number; high: number; none: number; total: number }> = {};
  for (const o of allObservations()) {
    const entry = (result[o.interviewId] ??= { ...emptySeverity(), total: 0 });
    entry[o.severity ?? "none"] += 1;
    entry.total += 1;
  }
  return result;
}

export function getObservationTagFrequency(): Record<string, number> {
  return tallyTags(allObservations());
}

export function getObservationTagsByInterview(): Record<string, Record<string, number>> {
  const result: Record<string, Record<string, number>> = {};
  for (const o of allObservations()) {
    const tags = (result[o.interviewId] ??= {});
    for (const tag of o.tags ?? EMPTY) tags[tag] = (tags[tag] ?? 0) + 1;
  }
  return result;
}

export function getObservationInsightFrequency(): Record<string, number> {
  return tallyField(allObservations(), "linkedInsightIds");
}

export function getObservationsLinkedToInsight(insightId: string): Observation[] {
  return allObservations().filter((o) => (o.linkedInsightIds ?? EMPTY).includes(insightId));
}

export function getObservationSystemFrequency(): Record<string, number> {
  return tallyField(allObservations(), "linkedSystemIds");
}

export function getObservationProcessStepFrequency(): Record<string, number> {
  return tallyField(allObservations(), "linkedProcessStepIds");
}

export function getObservationsLinkedToSystem(systemId: string): Observation[] {
  return allObservations().filter((o) => (o.linkedSystemIds ?? EMPTY).includes(systemId));
}

export function getObservationsLinkedToProcessStep(processStepId: string): Observation[] {
  return allObservations().filter((o) =>
    (o.linkedProcessStepIds ?? EMPTY).includes(processStepId)
  );
}

// An observation with several tags appears in each of its tag clusters.
export function getObservationClustersByTag(): Record<string, Observation[]> {
  const clusters: Record<string, Observation[]> = {};
  for (const o of allObservations()) {
    for (const tag of o.tags ?? EMPTY) (clusters[tag] ??= []).push(o);
  }
  return clusters;
}

export function getObservationClustersBySeverity(): {
  low: Observation[];
  medium: Observation[];
  high: Observation[];
  none: Observation[];
} {
  const clusters: { low: Observation[]; medium: Observation[]; high: Observation[]; none: Observation[] } = {
    low: [],
    medium: [],
    high: [],
    none: []
  };
  for (const o of allObservations()) clusters[o.severity ?? "none"].push(o);
  return clusters;
}

// linkedInsights / linkedSystems / linkedProcessSteps count distinct linked ids.
const summariseObservations = (observations: Observation[]) => ({
  total: observations.length,
  severity: tallySeverity(observations),
  tags: tallyTags(observations),
  linkedInsights: Object.keys(tallyField(observations, "linkedInsightIds")).length,
  linkedSystems: Object.keys(tallyField(observations, "linkedSystemIds")).length,
  linkedProcessSteps: Object.keys(tallyField(observations, "linkedProcessStepIds")).length
});

export function getInterviewObservationSummary(interviewId: string): {
  total: number;
  severity: { low: number; medium: number; high: number; none: number };
  tags: Record<string, number>;
  linkedInsights: number;
  linkedSystems: number;
  linkedProcessSteps: number;
} {
  return summariseObservations(allObservations().filter((o) => o.interviewId === interviewId));
}

export function getGlobalObservationSummary(): {
  total: number;
  severity: { low: number; medium: number; high: number; none: number };
  tags: Record<string, number>;
  linkedInsights: number;
  linkedSystems: number;
  linkedProcessSteps: number;
} {
  return summariseObservations(allObservations());
}

/* ---------------------------------------------------------
   View models (pure, composed from selectors/derived/analytics)
--------------------------------------------------------- */
export function getInterviewViewModel(interviewId: string): {
  interview: Interview | undefined;
  questions: InterviewQuestion[];
  insights: InsightGroups;
  progress: ReturnType<typeof getInterviewProgress>;
  observationSummary: ReturnType<typeof getInterviewObservationSummary>;
} {
  return {
    interview: getInterviewById(interviewId),
    questions: getInterviewQuestions(interviewId),
    insights: getInterviewInsights(interviewId),
    progress: getInterviewProgress(interviewId),
    observationSummary: getInterviewObservationSummary(interviewId)
  };
}

export function getWorkshopPrepViewModel(workshopId: string): {
  workshop: Workshop | undefined;
  questions: CarryForwardQuestion[];
  insights: Insight[];
  agenda: ReturnType<typeof getWorkshopAgenda>;
  observationClustersByTag: ReturnType<typeof getObservationClustersByTag>;
  observationClustersBySeverity: ReturnType<typeof getObservationClustersBySeverity>;
} {
  const agenda = getWorkshopAgenda(workshopId);
  return {
    workshop: getWorkshopById(workshopId),
    questions: agenda.questions,
    insights: agenda.insights,
    agenda,
    observationClustersByTag: getObservationClustersByTag(),
    observationClustersBySeverity: getObservationClustersBySeverity()
  };
}

export function getObservationDashboardViewModel(): {
  severity: ReturnType<typeof getObservationSeverityCounts>;
  tags: ReturnType<typeof getObservationTagFrequency>;
  insights: ReturnType<typeof getObservationInsightFrequency>;
  systems: ReturnType<typeof getObservationSystemFrequency>;
  processSteps: ReturnType<typeof getObservationProcessStepFrequency>;
  clustersByTag: ReturnType<typeof getObservationClustersByTag>;
  clustersBySeverity: ReturnType<typeof getObservationClustersBySeverity>;
  globalSummary: ReturnType<typeof getGlobalObservationSummary>;
} {
  return {
    severity: getObservationSeverityCounts(),
    tags: getObservationTagFrequency(),
    insights: getObservationInsightFrequency(),
    systems: getObservationSystemFrequency(),
    processSteps: getObservationProcessStepFrequency(),
    clustersByTag: getObservationClustersByTag(),
    clustersBySeverity: getObservationClustersBySeverity(),
    globalSummary: getGlobalObservationSummary()
  };
}

export function getInsightSummaryViewModel(): {
  summary: ReturnType<typeof getInsightSummary>;
  topPainPoints: Insight[];
  mostMentionedSystems: Insight[];
  mostCommonDependencies: Insight[];
  observationInsightFrequency: ReturnType<typeof getObservationInsightFrequency>;
} {
  return {
    summary: getInsightSummary(),
    topPainPoints: getTopPainPoints(),
    mostMentionedSystems: getMostMentionedSystems(),
    mostCommonDependencies: getMostCommonDependencies(),
    observationInsightFrequency: getObservationInsightFrequency()
  };
}

export function getCarryForwardViewModel(): {
  questions: CarryForwardQuestion[];
  unresolvedQuestions: ReturnType<typeof getUnresolvedCarryForwardQuestions>;
  insights: CarryForwardInsight[];
  unresolvedInsights: ReturnType<typeof getUnresolvedCarryForwardInsights>;
} {
  return {
    questions: getCarryForwardQuestions(),
    unresolvedQuestions: getUnresolvedCarryForwardQuestions(),
    insights: getCarryForwardInsights(),
    unresolvedInsights: getUnresolvedCarryForwardInsights()
  };
}