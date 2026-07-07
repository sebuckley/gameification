import { create } from "zustand";
import { agendaTemplates } from "../../data/AgendaTemplates";
import { agendaTypes, getAgendaDefaultMinutes } from "../../data/AgendaTypes";
import { nanoid } from "nanoid";

console.log(agendaTemplates)

const STORAGE_KEY = "people-app";

const DEFAULT_STATE = {
  people: [],
  groupsHistory: [],
  questions: [],
  questionSets: [],
  activeQuestionSetId: null,
  iceBreakerSets: [],
  activeIceBreakerSetId: null,
  agendaItems: [],
  events: [],
  currentEventId: null,
  agendaStartTime: "09:00",
  agendaEventTitle: "",
  agendaEventDate: "",
  agendaEventTime: "09:00",
  agendaLocationType: "",
  agendaVirtualPlatform: "",
  agendaVirtualJoinLink: "",
  agendaPhysicalAddress: "",
  agendaEventLocation: "",
  userProfile: {
    fullName: "",
    preferredName: "",
    email: "",
    userType: "",
    updatedAt: null,
  },
  quizMode: "standard",
  quizSettings: { correctPoints: 1, wrongPoints: -1 }
  ,
  selectedIceBreaker: null,
  participants: [],
  collectFreeTextAnswers: false
};

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

const normalizeQuestionSets = (rawSets, fallbackQuestions = []) => {
  const sets = Array.isArray(rawSets)
    ? rawSets
        .filter(Boolean)
        .map((setItem, index) => ({
          id: setItem.id || crypto.randomUUID(),
          name: (setItem.name || `Question Set ${index + 1}`).trim(),
          agendaQuizType: isQuizAgendaType(setItem.agendaQuizType) ? setItem.agendaQuizType : "quiz",
          quizMode: setItem.quizMode || DEFAULT_STATE.quizMode,
          questions: normalizeImportedQuestions(setItem.questions || [])
        }))
    : [];

  if (sets.length > 0) return sets;

  return [
    {
      id: crypto.randomUUID(),
      name: "Question Set 1",
      agendaQuizType: "quiz",
      quizMode: DEFAULT_STATE.quizMode,
      questions: normalizeImportedQuestions(fallbackQuestions)
    }
  ];
};

const normalizeIceBreakerSets = (rawSets, fallbackSelected = null) => {
  const sets = Array.isArray(rawSets)
    ? rawSets
        .filter(Boolean)
        .map((setItem, index) => ({
          id: setItem.id || crypto.randomUUID(),
          name: (setItem.name || `Icebreaker Set ${index + 1}`).trim(),
          selectedIceBreaker: setItem.selectedIceBreaker || null,
        }))
    : [];

  if (sets.length > 0) return sets;

  return [
    {
      id: crypto.randomUUID(),
      name: "Icebreaker Set 1",
      selectedIceBreaker: fallbackSelected || null,
    },
  ];
};

const selectActiveIceBreakerSetId = (iceBreakerSets, currentActiveId) => {
  if (!Array.isArray(iceBreakerSets) || iceBreakerSets.length === 0) return null;
  const exists = iceBreakerSets.some((setItem) => setItem.id === currentActiveId);
  return exists ? currentActiveId : iceBreakerSets[0].id;
};

const syncIceBreakerSetsWithActive = ({
  iceBreakerSets,
  activeIceBreakerSetId,
  selectedIceBreaker,
}) => {
  const normalizedSets = normalizeIceBreakerSets(iceBreakerSets, selectedIceBreaker);
  const activeId = selectActiveIceBreakerSetId(normalizedSets, activeIceBreakerSetId);

  const mergedSets = normalizedSets.map((setItem) =>
    setItem.id === activeId
      ? {
          ...setItem,
          selectedIceBreaker: selectedIceBreaker || null,
        }
      : setItem
  );

  return {
    iceBreakerSets: mergedSets,
    activeIceBreakerSetId: activeId,
    selectedIceBreaker: mergedSets.find((setItem) => setItem.id === activeId)?.selectedIceBreaker || null,
  };
};

const isQuizAgendaType = (type) => String(type || "").startsWith("quiz");
const isIceBreakerAgendaType = (type) => String(type || "") === "ice-breaker";

const getAgendaTypeLabel = (type) =>
  agendaTypes.find((agendaType) => agendaType.id === type)?.label || "Session";

const splitIntoGroups = (people, groupCount) => {
  const safeCount = Math.max(1, Math.min(Number(groupCount) || 1, people.length));
  const buckets = Array.from({ length: safeCount }, () => []);
  const shuffled = [...people].sort(() => Math.random() - 0.5);

  shuffled.forEach((person, index) => {
    buckets[index % safeCount].push(person);
  });

  return buckets.filter((group) => group.length > 0);
};

const buildAgendaGroupSessionName = (item) => {
  const label = (item?.label || "Session").trim();
  const start = item?.startTime || "";
  const end = item?.endTime || "";
  const timeText = start && end ? `${start}-${end}` : start || end;
  return timeText ? `${label} (${timeText})` : label;
};

const refreshAgendaGroupSessionNames = (agendaItems, groupsHistory) => {
  const itemsById = new Map((agendaItems || []).map((item) => [item.id, item]));

  return (groupsHistory || []).map((entry) => {
    const matchingItem = entry.agendaItemId
      ? itemsById.get(entry.agendaItemId)
      : (agendaItems || []).find((item) => item.groupHistoryEntryId === entry._id);

    if (!matchingItem) return entry;

    return {
      ...entry,
      sessionName: buildAgendaGroupSessionName(matchingItem),
      updatedAt: Date.now(),
    };
  });
};

const ensureInteractiveSetCoverage = ({ agendaItems, questionSets, iceBreakerSets }) => {
  const quizCount = (agendaItems || []).filter((item) => isQuizAgendaType(item.type)).length;
  const iceBreakerCount = (agendaItems || []).filter((item) => isIceBreakerAgendaType(item.type)).length;

  const nextQuestionSets = [...(questionSets || [])];
  const nextIceBreakerSets = [...(iceBreakerSets || [])];

  while (nextQuestionSets.length < quizCount) {
    const nextIndex = nextQuestionSets.length + 1;
    nextQuestionSets.push({
      id: crypto.randomUUID(),
      name: `Question Set ${nextIndex}`,
      agendaQuizType: "quiz",
      quizMode: DEFAULT_STATE.quizMode,
      questions: [],
    });
  }

  while (nextIceBreakerSets.length < iceBreakerCount) {
    const nextIndex = nextIceBreakerSets.length + 1;
    nextIceBreakerSets.push({
      id: crypto.randomUUID(),
      name: `Icebreaker Set ${nextIndex}`,
      selectedIceBreaker: null,
    });
  }

  return {
    questionSets: nextQuestionSets,
    iceBreakerSets: nextIceBreakerSets,
  };
};

const syncAgendaLinkedArtefacts = ({ agendaItems, questionSets, iceBreakerSets }) => {
  const quizSetMap = new Map((questionSets || []).map((setItem) => [setItem.id, setItem]));
  const iceBreakerSetMap = new Map((iceBreakerSets || []).map((setItem) => [setItem.id, setItem]));

  return (agendaItems || []).map((item) => {
    if (isQuizAgendaType(item.type)) {
      const linkedSet = item.linkedQuestionSetId ? quizSetMap.get(item.linkedQuestionSetId) : null;
      if (linkedSet && Array.isArray(linkedSet.questions) && linkedSet.questions.length > 0) {
        return {
          ...item,
          artefacts: [
            {
              name: `Quiz Set: ${linkedSet.name}`,
              url: `quiz-set://${linkedSet.id}`,
            },
          ],
        };
      }
    }

    if (isIceBreakerAgendaType(item.type)) {
      const linkedSet = item.linkedIceBreakerSetId ? iceBreakerSetMap.get(item.linkedIceBreakerSetId) : null;
      if (linkedSet?.selectedIceBreaker) {
        return {
          ...item,
          artefacts: [
            {
              name: `Icebreaker Set: ${linkedSet.name}`,
              url: `icebreaker-set://${linkedSet.id}`,
            },
          ],
        };
      }
    }

    return item;
  });
};

const assignAgendaItemSetLinks = ({ agendaItems, questionSets, iceBreakerSets }) => {
  const nextQuizSetIds = (questionSets || []).map((setItem) => setItem.id);
  const nextIceBreakerSetIds = (iceBreakerSets || []).map((setItem) => setItem.id);

  const usedQuizSetIds = new Set(
    (agendaItems || [])
      .filter((item) => isQuizAgendaType(item.type) && item.linkedQuestionSetId)
      .map((item) => item.linkedQuestionSetId)
  );
  const usedIceBreakerSetIds = new Set(
    (agendaItems || [])
      .filter((item) => isIceBreakerAgendaType(item.type) && item.linkedIceBreakerSetId)
      .map((item) => item.linkedIceBreakerSetId)
  );

  return (agendaItems || []).map((item) => {
    if (isQuizAgendaType(item.type)) {
      if (item.linkedQuestionSetId && nextQuizSetIds.includes(item.linkedQuestionSetId)) {
        return item;
      }

      const firstUnused = nextQuizSetIds.find((id) => !usedQuizSetIds.has(id));
      const fallback = nextQuizSetIds[0] || null;
      const chosen = firstUnused || fallback;
      if (chosen) usedQuizSetIds.add(chosen);

      return {
        ...item,
        linkedQuestionSetId: chosen,
      };
    }

    if (isIceBreakerAgendaType(item.type)) {
      if (item.linkedIceBreakerSetId && nextIceBreakerSetIds.includes(item.linkedIceBreakerSetId)) {
        return item;
      }

      const firstUnused = nextIceBreakerSetIds.find((id) => !usedIceBreakerSetIds.has(id));
      const fallback = nextIceBreakerSetIds[0] || null;
      const chosen = firstUnused || fallback;
      if (chosen) usedIceBreakerSetIds.add(chosen);

      return {
        ...item,
        linkedIceBreakerSetId: chosen,
      };
    }

    return {
      ...item,
      linkedQuestionSetId: null,
      linkedIceBreakerSetId: null,
    };
  });
};

const getQuestionSetMode = (questionSets, activeQuestionSetId, fallbackMode) =>
  questionSets.find((setItem) => setItem.id === activeQuestionSetId)?.quizMode || fallbackMode || DEFAULT_STATE.quizMode;

const selectActiveQuestionSetId = (questionSets, currentActiveId) => {
  if (!Array.isArray(questionSets) || questionSets.length === 0) return null;
  const exists = questionSets.some((setItem) => setItem.id === currentActiveId);
  return exists ? currentActiveId : questionSets[0].id;
};

const syncQuestionSetsWithActive = ({ questionSets, activeQuestionSetId, questions }) => {
  const normalizedSets = normalizeQuestionSets(questionSets, questions);
  const activeId = selectActiveQuestionSetId(normalizedSets, activeQuestionSetId);

  const mergedSets = normalizedSets.map((setItem) =>
    setItem.id === activeId
      ? {
          ...setItem,
          questions: normalizeImportedQuestions(questions)
        }
      : setItem
  );

  return {
    questionSets: mergedSets,
    activeQuestionSetId: activeId,
    questions: normalizeImportedQuestions(questions)
  };
};




/* ---------------------------------------------------------
   Load initial state
--------------------------------------------------------- */
const loadInitial = () => {
  try {
    const cloneList = (value) => (Array.isArray(value) ? value.map((item) => ({ ...item })) : []);

    const buildEventFromState = (state, eventId = crypto.randomUUID()) => ({
      ...(syncQuestionSetsWithActive({
        questionSets: state.questionSets,
        activeQuestionSetId: state.activeQuestionSetId,
        questions: state.questions
      })),
      ...(syncIceBreakerSetsWithActive({
        iceBreakerSets: state.iceBreakerSets,
        activeIceBreakerSetId: state.activeIceBreakerSetId,
        selectedIceBreaker: state.selectedIceBreaker,
      })),
      id: eventId,
      title: state.agendaEventTitle || "",
      date: state.agendaEventDate || "",
      time: state.agendaEventTime || state.agendaStartTime || "09:00",
      locationType: state.agendaLocationType || "",
      virtualPlatform: state.agendaVirtualPlatform || "",
      virtualJoinLink: state.agendaVirtualJoinLink || "",
      physicalAddress: state.agendaPhysicalAddress || "",
      location: state.agendaEventLocation || "",
      agendaStartTime: state.agendaStartTime || state.agendaEventTime || "09:00",
      agendaItems: cloneList(state.agendaItems),
      people: cloneList(state.people),
      groupsHistory: cloneList(state.groupsHistory),
      quizMode: state.quizMode || DEFAULT_STATE.quizMode,
      quizSettings: { ...DEFAULT_STATE.quizSettings, ...(state.quizSettings || {}) },
      selectedIceBreaker: state.selectedIceBreaker || null,
      participants: cloneList(state.participants),
      collectFreeTextAnswers: !!state.collectFreeTextAnswers,
      updatedAt: Date.now()
    });

    const hydrateFromEvent = (base, event, events) => {
      const eventQuizSettings = { ...DEFAULT_STATE.quizSettings, ...(event.quizSettings || {}) };
      const eventPeople = cloneList(event.people);
      const questionState = syncQuestionSetsWithActive({
        questionSets: event.questionSets,
        activeQuestionSetId: event.activeQuestionSetId,
        questions: event.questions
      });
      const iceBreakerState = syncIceBreakerSetsWithActive({
        iceBreakerSets: event.iceBreakerSets,
        activeIceBreakerSetId: event.activeIceBreakerSetId,
        selectedIceBreaker: event.selectedIceBreaker,
      });
      const activeQuestionSetMode = getQuestionSetMode(
        questionState.questionSets,
        questionState.activeQuestionSetId,
        event.quizMode
      );
      const syncedAgendaItems = syncAgendaLinkedArtefacts({
        agendaItems: recalcAgendaTimes(
          event.agendaStartTime || event.time || "09:00",
          cloneList(event.agendaItems)
        ),
        questionSets: questionState.questionSets,
        iceBreakerSets: iceBreakerState.iceBreakerSets,
      });

      return {
        ...base,
        events,
        currentEventId: event.id,
        agendaEventTitle: event.title || "",
        agendaEventDate: event.date || "",
        agendaEventTime: event.time || event.agendaStartTime || "09:00",
        agendaLocationType: event.locationType || "",
        agendaVirtualPlatform: event.virtualPlatform || "",
        agendaVirtualJoinLink: event.virtualJoinLink || "",
        agendaPhysicalAddress: event.physicalAddress || "",
        agendaEventLocation: event.location || "",
        agendaStartTime: event.agendaStartTime || event.time || "09:00",
        agendaItems: syncedAgendaItems,
        people: eventPeople,
        groupsHistory: cloneList(event.groupsHistory),
        questions: cloneList(questionState.questions),
        questionSets: cloneList(questionState.questionSets),
        activeQuestionSetId: questionState.activeQuestionSetId,
        iceBreakerSets: cloneList(iceBreakerState.iceBreakerSets),
        activeIceBreakerSetId: iceBreakerState.activeIceBreakerSetId,
        quizMode: activeQuestionSetMode,
        quizSettings: eventQuizSettings,
        selectedIceBreaker: iceBreakerState.selectedIceBreaker || null,
        participants: event.participants ? cloneList(event.participants) : cloneList(eventPeople),
        collectFreeTextAnswers: !!event.collectFreeTextAnswers
      };
    };

    const createInitialEventState = () => {
      const base = { ...DEFAULT_STATE };
      const firstEvent = buildEventFromState(base);
      return hydrateFromEvent(base, firstEvent, [firstEvent]);
    };

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return createInitialEventState();
    }
    const parsed = JSON.parse(saved);
    const merged = {
      ...DEFAULT_STATE,
      ...parsed,
      quizSettings: {
        ...DEFAULT_STATE.quizSettings,
        ...(parsed?.quizSettings || {})
      }
    };

    if (!merged.agendaEventTime) {
      merged.agendaEventTime = merged.agendaStartTime || "09:00";
    }

    if (!merged.agendaStartTime) {
      merged.agendaStartTime = merged.agendaEventTime || "09:00";
    }

    if (!Array.isArray(merged.events)) {
      merged.events = [];
    }

    if (!merged.events.length) {
      const migratedEvent = buildEventFromState(merged);
      return hydrateFromEvent(merged, migratedEvent, [migratedEvent]);
    }

    const selectedEvent =
      merged.events.find((e) => e.id === merged.currentEventId) ||
      merged.events[0];

    return hydrateFromEvent(merged, selectedEvent, merged.events);
  } catch {
    const firstEventId = crypto.randomUUID();
    const firstQuestionSetId = crypto.randomUUID();
    const firstIceBreakerSetId = crypto.randomUUID();
    const firstEvent = {
      id: firstEventId,
      title: "",
      date: "",
      time: DEFAULT_STATE.agendaEventTime,
      locationType: "",
      virtualPlatform: "",
      virtualJoinLink: "",
      physicalAddress: "",
      location: "",
      agendaStartTime: DEFAULT_STATE.agendaStartTime,
      agendaItems: [],
      people: [],
      groupsHistory: [],
      questions: [],
      questionSets: [
        {
          id: firstQuestionSetId,
          name: "Question Set 1",
          agendaQuizType: "quiz",
          quizMode: DEFAULT_STATE.quizMode,
          questions: []
        }
      ],
      activeQuestionSetId: firstQuestionSetId,
      iceBreakerSets: [
        {
          id: firstIceBreakerSetId,
          name: "Icebreaker Set 1",
          selectedIceBreaker: null,
        }
      ],
      activeIceBreakerSetId: firstIceBreakerSetId,
      quizMode: DEFAULT_STATE.quizMode,
      quizSettings: { ...DEFAULT_STATE.quizSettings },
      selectedIceBreaker: null,
      participants: [],
      collectFreeTextAnswers: false,
      updatedAt: Date.now()
    };
    return {
      ...DEFAULT_STATE,
      events: [firstEvent],
      currentEventId: firstEventId
    };
  }
};



/* ---------------------------------------------------------
   Safe autosave (always writes FINAL state)
--------------------------------------------------------- */
const save = (get) => {
  // Defer persistence so get() reads the committed Zustand state,
  // not the pre-update snapshot from inside the setter callback.
  queueMicrotask(() => {
    const finalState = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(finalState));
  });
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

const buildAgendaLocationSummary = ({ locationType, virtualPlatform, virtualJoinLink, physicalAddress, fallback }) => {
  if (locationType === "virtual") {
    const platform = (virtualPlatform || "Virtual").trim();
    const link = (virtualJoinLink || "").trim();
    return link ? `${platform} - ${link}` : platform;
  }

  if (locationType === "physical") {
    return (physicalAddress || "").trim();
  }

  return (fallback || "").trim();
};

const cloneList = (value) => (Array.isArray(value) ? value.map((item) => ({ ...item })) : []);
const cloneObject = (value, fallback = {}) => ({ ...(fallback || {}), ...(value || {}) });

const cloneAgendaItems = (items) =>
  (Array.isArray(items) ? items : []).map((item) => ({ ...item }));

const upsertAgendaEvent = (events, eventRecord) => [
  eventRecord,
  ...(Array.isArray(events) ? events : []).filter((eventItem) => eventItem.id !== eventRecord.id)
];

const buildAgendaEventRecord = (state, overrides = {}) => {
  const questionState = syncQuestionSetsWithActive({
    questionSets: overrides.questionSets ?? state.questionSets,
    activeQuestionSetId: overrides.activeQuestionSetId ?? state.activeQuestionSetId,
    questions: overrides.questions ?? state.questions
  });
  const iceBreakerState = syncIceBreakerSetsWithActive({
    iceBreakerSets: overrides.iceBreakerSets ?? state.iceBreakerSets,
    activeIceBreakerSetId: overrides.activeIceBreakerSetId ?? state.activeIceBreakerSetId,
    selectedIceBreaker: overrides.selectedIceBreaker ?? state.selectedIceBreaker,
  });

  const linkedAgendaItems = syncAgendaLinkedArtefacts({
    agendaItems: cloneAgendaItems(overrides.agendaItems ?? state.agendaItems),
    questionSets: questionState.questionSets,
    iceBreakerSets: iceBreakerState.iceBreakerSets,
  });

  const locationType = overrides.locationType ?? state.agendaLocationType;
  const virtualPlatform = overrides.virtualPlatform ?? state.agendaVirtualPlatform;
  const virtualJoinLink = overrides.virtualJoinLink ?? state.agendaVirtualJoinLink;
  const physicalAddress = overrides.physicalAddress ?? state.agendaPhysicalAddress;

  const location = buildAgendaLocationSummary({
    locationType,
    virtualPlatform,
    virtualJoinLink,
    physicalAddress,
    fallback: overrides.location ?? state.agendaEventLocation
  });

  return {
    id: overrides.id ?? state.currentEventId ?? crypto.randomUUID(),
    title: ((overrides.title ?? state.agendaEventTitle) || "").trim(),
    date: overrides.date ?? state.agendaEventDate,
    time: overrides.time ?? state.agendaEventTime,
    locationType,
    virtualPlatform,
    virtualJoinLink,
    physicalAddress,
    location,
    agendaStartTime: overrides.agendaStartTime ?? state.agendaStartTime,
    agendaItems: linkedAgendaItems,
    people: cloneList(overrides.people ?? state.people),
    groupsHistory: cloneList(overrides.groupsHistory ?? state.groupsHistory),
    questions: cloneList(questionState.questions),
    questionSets: cloneList(questionState.questionSets),
    activeQuestionSetId: questionState.activeQuestionSetId,
    iceBreakerSets: cloneList(iceBreakerState.iceBreakerSets),
    activeIceBreakerSetId: iceBreakerState.activeIceBreakerSetId,
    quizMode: overrides.quizMode ?? state.quizMode,
    quizSettings: cloneObject(overrides.quizSettings ?? state.quizSettings, DEFAULT_STATE.quizSettings),
    selectedIceBreaker: iceBreakerState.selectedIceBreaker || null,
    participants: cloneList(overrides.participants ?? state.participants),
    collectFreeTextAnswers:
      overrides.collectFreeTextAnswers ?? state.collectFreeTextAnswers ?? DEFAULT_STATE.collectFreeTextAnswers,
    updatedAt: Date.now()
  };
};

const hydrateStateFromEvent = (state, selected) => {
  const startTime = selected.agendaStartTime || selected.time || "09:00";
  const people = cloneList(selected.people);
  const questionState = syncQuestionSetsWithActive({
    questionSets: selected.questionSets,
    activeQuestionSetId: selected.activeQuestionSetId,
    questions: selected.questions
  });
  const iceBreakerState = syncIceBreakerSetsWithActive({
    iceBreakerSets: selected.iceBreakerSets,
    activeIceBreakerSetId: selected.activeIceBreakerSetId,
    selectedIceBreaker: selected.selectedIceBreaker,
  });
  const activeQuestionSetMode = getQuestionSetMode(
    questionState.questionSets,
    questionState.activeQuestionSetId,
    selected.quizMode
  );
  const agendaItems = syncAgendaLinkedArtefacts({
    agendaItems: recalcAgendaTimes(startTime, cloneAgendaItems(selected.agendaItems)),
    questionSets: questionState.questionSets,
    iceBreakerSets: iceBreakerState.iceBreakerSets,
  });

  return {
    ...state,
    currentEventId: selected.id,
    agendaEventTitle: selected.title || "",
    agendaEventDate: selected.date || "",
    agendaEventTime: selected.time || startTime,
    agendaLocationType: selected.locationType || "",
    agendaVirtualPlatform: selected.virtualPlatform || "",
    agendaVirtualJoinLink: selected.virtualJoinLink || "",
    agendaPhysicalAddress: selected.physicalAddress || "",
    agendaEventLocation: selected.location || "",
    agendaStartTime: startTime,
    agendaItems,
    people,
    groupsHistory: cloneList(selected.groupsHistory),
    questions: cloneList(questionState.questions),
    questionSets: cloneList(questionState.questionSets),
    activeQuestionSetId: questionState.activeQuestionSetId,
    iceBreakerSets: cloneList(iceBreakerState.iceBreakerSets),
    activeIceBreakerSetId: iceBreakerState.activeIceBreakerSetId,
    quizMode: activeQuestionSetMode,
    quizSettings: cloneObject(selected.quizSettings, DEFAULT_STATE.quizSettings),
    selectedIceBreaker: iceBreakerState.selectedIceBreaker || null,
    participants: selected.participants ? cloneList(selected.participants) : cloneList(people),
    collectFreeTextAnswers: !!selected.collectFreeTextAnswers
  };
};

/* ---------------------------------------------------------
   STORE (safe version)
--------------------------------------------------------- */
const usePeople = create((set, get) => ({
  ...loadInitial(),

  updateUserProfile: (updates) =>
    set((state) => {
      const updated = {
        ...state,
        userProfile: {
          ...(state.userProfile || DEFAULT_STATE.userProfile),
          ...(updates || {}),
        },
      };
      save(get);
      return updated;
    }),

  resetUserProfile: () =>
    set((state) => {
      const updated = {
        ...state,
        userProfile: { ...DEFAULT_STATE.userProfile },
      };
      save(get);
      return updated;
    }),

  /* ---------------------------------------------------------
     PEOPLE
  --------------------------------------------------------- */
  addPerson: (data) =>
    set((state) => {
      const personType = (data.personType || "participant").trim();
      const presenterTypes = new Set(["presenter", "keynote-speaker"]);
      const nextState = {
        ...state,
        people: [
          ...state.people,
          {
            id: crypto.randomUUID(),
            fullName: data.fullName.trim(),
            preferredName: data.preferredName.trim(),
            color: data.color,
            personType,
            isPresenter: presenterTypes.has(personType),
            inSpinner: true,
            inGroups: personType === "participant",
            answers: 0,
            quizScore: 0,
            history: []
          }
        ]
      };
      const updated = state.currentEventId
        ? {
            ...nextState,
            events: upsertAgendaEvent(
              state.events,
              buildAgendaEventRecord(nextState, {
                id: state.currentEventId,
                people: nextState.people,
              })
            )
          }
        : nextState;
      save(get);
      return updated;
    }),

  updatePerson: (id, updates) =>
    set((state) => {
      const presenterTypes = new Set(["presenter", "keynote-speaker"]);
      const nextState = {
        ...state,
        people: state.people.map((p) =>
          p.id === id
            ? (() => {
                const merged = { ...p, ...updates };

                if (Object.prototype.hasOwnProperty.call(updates || {}, "personType")) {
                  const normalizedType = String(updates.personType || "participant").trim() || "participant";
                  merged.personType = normalizedType;

                  if (!Object.prototype.hasOwnProperty.call(updates || {}, "isPresenter")) {
                    merged.isPresenter = presenterTypes.has(normalizedType);
                  }

                  if (!Object.prototype.hasOwnProperty.call(updates || {}, "inGroups")) {
                    merged.inGroups = normalizedType === "participant";
                  }

                  if (!Object.prototype.hasOwnProperty.call(updates || {}, "inSpinner")) {
                    merged.inSpinner = !presenterTypes.has(normalizedType);
                  }
                }

                return merged;
              })()
            : p
        )
      };
      const updated = state.currentEventId
        ? {
            ...nextState,
            events: upsertAgendaEvent(
              state.events,
              buildAgendaEventRecord(nextState, {
                id: state.currentEventId,
                people: nextState.people,
              })
            )
          }
        : nextState;
      save(get);
      return updated;
    }),

    setPeople: (list) =>
    set((state) => {
      const presenterTypes = new Set(["presenter", "keynote-speaker"]);
      const nextState = {
        ...state,
        people: Array.isArray(list)
          ? list.map((person) => ({
              ...person,
              personType: person?.personType
                ? person.personType
                : (person?.isPresenter ? "presenter" : "participant"),
              isPresenter: person?.personType
                ? presenterTypes.has(person.personType)
                : !!person?.isPresenter,
              inGroups: person?.personType
                ? person.personType === "participant"
                : (person?.isPresenter ? false : true),
              inSpinner: person?.personType
                ? !presenterTypes.has(person.personType)
                : (person?.isPresenter ? false : true),
              history: Array.isArray(person?.history) ? person.history : [],
              answers: Number.isFinite(person?.answers) ? person.answers : 0,
              quizScore: Number.isFinite(person?.quizScore) ? person.quizScore : 0
            }))
          : []
      };
      const updated = state.currentEventId
        ? {
            ...nextState,
            events: upsertAgendaEvent(
              state.events,
              buildAgendaEventRecord(nextState, {
                id: state.currentEventId,
                people: nextState.people,
              })
            )
          }
        : nextState;
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
              ...(Array.isArray(p.history) ? p.history : []),
              `${message} at ${new Date().toLocaleString()}`
            ]
          }
        : p
    );

    const nextState = { ...state, people: updatedPeople };
    const updated = state.currentEventId
      ? {
          ...nextState,
          events: upsertAgendaEvent(
            state.events,
            buildAgendaEventRecord(nextState, {
              id: state.currentEventId,
              people: nextState.people,
            })
          )
        }
      : nextState;
    save(get);
    return updated;
  }),

  removePerson: (id) =>
  set((state) => {
    const nextState = {
      ...state,
      people: state.people.filter((p) => p.id !== id)
    };
    const updated = state.currentEventId
      ? {
          ...nextState,
          events: upsertAgendaEvent(
            state.events,
            buildAgendaEventRecord(nextState, {
              id: state.currentEventId,
              people: nextState.people,
            })
          )
        }
      : nextState;
    save(get);
    return updated;
  }),

  reorderPeople: (startIndex, endIndex) =>
  set((state) => {
    const reorderedPeople = Array.from(state.people);
    const [removed] = reorderedPeople.splice(startIndex, 1);
    reorderedPeople.splice(endIndex, 0, removed);

    const nextState = {
      ...state,
      people: reorderedPeople,
    };
    const updated = state.currentEventId
      ? {
          ...nextState,
          events: upsertAgendaEvent(
            state.events,
            buildAgendaEventRecord(nextState, {
              id: state.currentEventId,
              people: nextState.people,
            })
          )
        }
      : nextState;

    save(get);
    return updated;
  }),


  resetAnswers: () =>
  set((state) => {
    const nextState = {
      ...state,
      people: state.people.map((p) => ({
        ...p,
        answers: 0
      }))
    };
    const updated = state.currentEventId
      ? {
          ...nextState,
          events: upsertAgendaEvent(
            state.events,
            buildAgendaEventRecord(nextState, {
              id: state.currentEventId,
              people: nextState.people,
            })
          )
        }
      : nextState;
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

    localStorage.setItem("people-app", JSON.stringify(updated));
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

  setQuizMode: (mode) =>
    set((state) => {
      const updatedSets = state.questionSets.map((setItem) =>
        setItem.id === state.activeQuestionSetId
          ? { ...setItem, quizMode: mode }
          : setItem
      );

      const updated = {
        ...state,
        quizMode: mode,
        questionSets: updatedSets
      };
      save(get);
      return updated;
    }),

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
            answers: (Number(p.answers) || 0) + 1,
            history: [
              ...(Array.isArray(p.history) ? p.history : []),
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
      const nextQuestions = [...state.questions, q];
      const synced = syncQuestionSetsWithActive({
        questionSets: state.questionSets,
        activeQuestionSetId: state.activeQuestionSetId,
        questions: nextQuestions
      });
      const syncedAgendaItems = syncAgendaLinkedArtefacts({
        agendaItems: state.agendaItems,
        questionSets: synced.questionSets,
        iceBreakerSets: state.iceBreakerSets,
      });
      const updated = {
        ...state,
        ...synced,
        agendaItems: syncedAgendaItems,
      };
      save(get);
      return updated;
    }),

  importQuestions: (list) =>
    set((state) => {
      const normalizedQuestions = normalizeImportedQuestions(list);
      const synced = syncQuestionSetsWithActive({
        questionSets: state.questionSets,
        activeQuestionSetId: state.activeQuestionSetId,
        questions: normalizedQuestions
      });
      const syncedAgendaItems = syncAgendaLinkedArtefacts({
        agendaItems: state.agendaItems,
        questionSets: synced.questionSets,
        iceBreakerSets: state.iceBreakerSets,
      });
      const updated = {
        ...state,
        ...synced,
        agendaItems: syncedAgendaItems,
      };
      save(get);
      return updated;
    }),

  createQuestionSet: (name = "") =>
    set((state) => {
      const synced = syncQuestionSetsWithActive({
        questionSets: state.questionSets,
        activeQuestionSetId: state.activeQuestionSetId,
        questions: state.questions
      });

      const nextIndex = synced.questionSets.length + 1;
      const nextSet = {
        id: crypto.randomUUID(),
        name: (name || `Question Set ${nextIndex}`).trim(),
        agendaQuizType: "quiz",
        quizMode: DEFAULT_STATE.quizMode,
        questions: []
      };

      const updated = {
        ...state,
        questionSets: [...synced.questionSets, nextSet],
        activeQuestionSetId: nextSet.id,
        quizMode: nextSet.quizMode,
        questions: []
      };
      save(get);
      return updated;
    }),

  selectQuestionSet: (setId) =>
    set((state) => {
      const synced = syncQuestionSetsWithActive({
        questionSets: state.questionSets,
        activeQuestionSetId: state.activeQuestionSetId,
        questions: state.questions
      });

      const selectedSet = synced.questionSets.find((setItem) => setItem.id === setId);
      if (!selectedSet) return state;

      const updated = {
        ...state,
        questionSets: synced.questionSets,
        activeQuestionSetId: selectedSet.id,
        quizMode: selectedSet.quizMode || DEFAULT_STATE.quizMode,
        questions: cloneList(selectedSet.questions)
      };
      save(get);
      return updated;
    }),

  renameQuestionSet: (setId, name) =>
    set((state) => {
      const trimmed = (name || "").trim();
      if (!trimmed) return state;

      const updatedSets = state.questionSets.map((setItem) =>
        setItem.id === setId ? { ...setItem, name: trimmed } : setItem
      );

      const updated = {
        ...state,
        questionSets: updatedSets,
        agendaItems: syncAgendaLinkedArtefacts({
          agendaItems: state.agendaItems,
          questionSets: updatedSets,
          iceBreakerSets: state.iceBreakerSets,
        }),
      };
      save(get);
      return updated;
    }),

  deleteQuestionSet: (setId) =>
    set((state) => {
      const synced = syncQuestionSetsWithActive({
        questionSets: state.questionSets,
        activeQuestionSetId: state.activeQuestionSetId,
        questions: state.questions
      });

      const remaining = synced.questionSets.filter((setItem) => setItem.id !== setId);
      const safeSets = remaining.length
        ? remaining
        : [
            {
              id: crypto.randomUUID(),
              name: "Question Set 1",
              agendaQuizType: "quiz",
              quizMode: DEFAULT_STATE.quizMode,
              questions: []
            }
          ];

      const nextActiveId = selectActiveQuestionSetId(safeSets, synced.activeQuestionSetId);
      const nextActiveSet = safeSets.find((setItem) => setItem.id === nextActiveId);
      const cleanedAgendaItems = state.agendaItems.map((item) => ({
        ...item,
        linkedQuestionSetId: item.linkedQuestionSetId === setId ? null : item.linkedQuestionSetId,
      }));
      const syncedAgendaItems = syncAgendaLinkedArtefacts({
        agendaItems: cleanedAgendaItems,
        questionSets: safeSets,
        iceBreakerSets: state.iceBreakerSets,
      });

      const updated = {
        ...state,
        questionSets: safeSets,
        activeQuestionSetId: nextActiveId,
        quizMode: getQuestionSetMode(safeSets, nextActiveId, state.quizMode),
        questions: cloneList(nextActiveSet?.questions || []),
        agendaItems: syncedAgendaItems,
      };
      save(get);
      return updated;
    }),

  updateQuestionSetAgendaType: (setId, agendaQuizType) =>
    set((state) => {
      if (!isQuizAgendaType(agendaQuizType)) return state;

      const updatedSets = state.questionSets.map((setItem) =>
        setItem.id === setId ? { ...setItem, agendaQuizType } : setItem
      );

      const updatedAgendaItems = state.agendaItems.map((item) =>
        item.linkedQuestionSetId === setId && isQuizAgendaType(item.type)
          ? {
              ...item,
              type: agendaQuizType,
              label: getAgendaTypeLabel(agendaQuizType),
            }
          : item
      );

      const syncedAgendaItems = syncAgendaLinkedArtefacts({
        agendaItems: updatedAgendaItems,
        questionSets: updatedSets,
        iceBreakerSets: state.iceBreakerSets,
      });

      const updated = {
        ...state,
        questionSets: updatedSets,
        agendaItems: syncedAgendaItems,
      };

      save(get);
      return updated;
    }),

  createIceBreakerSet: (name = "") =>
    set((state) => {
      const synced = syncIceBreakerSetsWithActive({
        iceBreakerSets: state.iceBreakerSets,
        activeIceBreakerSetId: state.activeIceBreakerSetId,
        selectedIceBreaker: state.selectedIceBreaker,
      });

      const nextIndex = synced.iceBreakerSets.length + 1;
      const nextSet = {
        id: crypto.randomUUID(),
        name: (name || `Icebreaker Set ${nextIndex}`).trim(),
        selectedIceBreaker: null,
      };

      const updated = {
        ...state,
        iceBreakerSets: [...synced.iceBreakerSets, nextSet],
        activeIceBreakerSetId: nextSet.id,
        selectedIceBreaker: null,
      };
      save(get);
      return updated;
    }),

  selectIceBreakerSet: (setId) =>
    set((state) => {
      const synced = syncIceBreakerSetsWithActive({
        iceBreakerSets: state.iceBreakerSets,
        activeIceBreakerSetId: state.activeIceBreakerSetId,
        selectedIceBreaker: state.selectedIceBreaker,
      });

      const selectedSet = synced.iceBreakerSets.find((setItem) => setItem.id === setId);
      if (!selectedSet) return state;

      const updated = {
        ...state,
        iceBreakerSets: synced.iceBreakerSets,
        activeIceBreakerSetId: selectedSet.id,
        selectedIceBreaker: selectedSet.selectedIceBreaker || null,
      };
      save(get);
      return updated;
    }),

  renameIceBreakerSet: (setId, name) =>
    set((state) => {
      const trimmed = (name || "").trim();
      if (!trimmed) return state;

      const updatedSets = state.iceBreakerSets.map((setItem) =>
        setItem.id === setId ? { ...setItem, name: trimmed } : setItem
      );

      const updated = {
        ...state,
        iceBreakerSets: updatedSets,
        agendaItems: syncAgendaLinkedArtefacts({
          agendaItems: state.agendaItems,
          questionSets: state.questionSets,
          iceBreakerSets: updatedSets,
        }),
      };
      save(get);
      return updated;
    }),

  deleteIceBreakerSet: (setId) =>
    set((state) => {
      const synced = syncIceBreakerSetsWithActive({
        iceBreakerSets: state.iceBreakerSets,
        activeIceBreakerSetId: state.activeIceBreakerSetId,
        selectedIceBreaker: state.selectedIceBreaker,
      });

      const remaining = synced.iceBreakerSets.filter((setItem) => setItem.id !== setId);
      const safeSets = remaining.length
        ? remaining
        : [
            {
              id: crypto.randomUUID(),
              name: "Icebreaker Set 1",
              selectedIceBreaker: null,
            },
          ];

      const nextActiveId = selectActiveIceBreakerSetId(safeSets, synced.activeIceBreakerSetId);
      const nextActiveSet = safeSets.find((setItem) => setItem.id === nextActiveId);
      const cleanedAgendaItems = state.agendaItems.map((item) => ({
        ...item,
        linkedIceBreakerSetId:
          item.linkedIceBreakerSetId === setId ? null : item.linkedIceBreakerSetId,
      }));
      const syncedAgendaItems = syncAgendaLinkedArtefacts({
        agendaItems: cleanedAgendaItems,
        questionSets: state.questionSets,
        iceBreakerSets: safeSets,
      });

      const updated = {
        ...state,
        iceBreakerSets: safeSets,
        activeIceBreakerSetId: nextActiveId,
        selectedIceBreaker: nextActiveSet?.selectedIceBreaker || null,
        agendaItems: syncedAgendaItems,
      };
      save(get);
      return updated;
    }),

  exportQuestions: () => {
    const state = get();
    return (state.questions || [])
      .map((q) => {
        const lines = [`Q: ${q.question || ""}`];
        if (Array.isArray(q.options) && q.options.length > 0) {
          q.options.forEach((opt) => lines.push(`O: ${opt}`));
        }
        lines.push(`A: ${q.answer || ""}`);
        return lines.join("\n");
      })
      .join("\n\n");
  },

  clearQuestionsInActiveSet: () =>
    set((state) => {
      const synced = syncQuestionSetsWithActive({
        questionSets: state.questionSets,
        activeQuestionSetId: state.activeQuestionSetId,
        questions: []
      });
      const syncedAgendaItems = syncAgendaLinkedArtefacts({
        agendaItems: state.agendaItems,
        questionSets: synced.questionSets,
        iceBreakerSets: state.iceBreakerSets,
      });

      const updated = {
        ...state,
        ...synced,
        agendaItems: syncedAgendaItems,
      };
      save(get);
      return updated;
    }),

  updateQuestionSetQuizMode: (setId, mode) =>
    set((state) => {
      const updatedSets = state.questionSets.map((setItem) =>
        setItem.id === setId ? { ...setItem, quizMode: mode } : setItem
      );

      const updated = {
        ...state,
        questionSets: updatedSets,
        quizMode: setId === state.activeQuestionSetId ? mode : state.quizMode
      };
      save(get);
      return updated;
    }),


  /* ---------------------------------------------------------
     AGENDA
  --------------------------------------------------------- */
  setAgendaStartTime: (time) =>
    set((state) => {
      const recalcedItems = recalcAgendaTimes(time, state.agendaItems);
      const nextState = {
        ...state,
        agendaEventTime: time,
        agendaStartTime: time,
        agendaItems: recalcedItems,
        groupsHistory: refreshAgendaGroupSessionNames(recalcedItems, state.groupsHistory),
      };
      const updated = state.currentEventId
        ? {
            ...nextState,
            events: upsertAgendaEvent(
              state.events,
              buildAgendaEventRecord(nextState, {
                id: state.currentEventId,
                time,
                agendaStartTime: time
              })
            )
          }
        : nextState;
      save(get);
      return updated;
    }),

  setAgendaEventDetails: ({
    title,
    date,
    time,
    location,
    locationType,
    virtualPlatform,
    virtualJoinLink,
    physicalAddress
  }) =>
    set((state) => {
      const nextTime = time || state.agendaEventTime || state.agendaStartTime || "09:00";
      const nextLocationType = locationType ?? state.agendaLocationType;
      const nextVirtualPlatform = virtualPlatform ?? state.agendaVirtualPlatform;
      const nextVirtualJoinLink = virtualJoinLink ?? state.agendaVirtualJoinLink;
      const nextPhysicalAddress = physicalAddress ?? state.agendaPhysicalAddress;
      const nextEventId = state.currentEventId || crypto.randomUUID();

      const nextLocation = buildAgendaLocationSummary({
        locationType: nextLocationType,
        virtualPlatform: nextVirtualPlatform,
        virtualJoinLink: nextVirtualJoinLink,
        physicalAddress: nextPhysicalAddress,
        fallback: location ?? state.agendaEventLocation
      });

      const nextState = {
        ...state,
        currentEventId: nextEventId,
        agendaEventTitle: title ?? state.agendaEventTitle,
        agendaEventDate: date ?? state.agendaEventDate,
        agendaEventTime: nextTime,
        agendaLocationType: nextLocationType,
        agendaVirtualPlatform: nextVirtualPlatform,
        agendaVirtualJoinLink: nextVirtualJoinLink,
        agendaPhysicalAddress: nextPhysicalAddress,
        agendaEventLocation: nextLocation,
        agendaStartTime: nextTime,
        agendaItems: recalcAgendaTimes(nextTime, state.agendaItems)
      };
      const updated = {
        ...nextState,
        events: upsertAgendaEvent(
          state.events,
          buildAgendaEventRecord(nextState, { id: nextEventId, time: nextTime, location: nextLocation })
        )
      };
      save(get);
      return updated;
    }),

  createEvent: () =>
    set((state) => {
      const baseEvents = state.currentEventId
        ? upsertAgendaEvent(
            state.events,
            buildAgendaEventRecord(state, { id: state.currentEventId })
          )
        : [...(state.events || [])];

      const nextEventId = crypto.randomUUID();
      const initialQuestionSetId = crypto.randomUUID();
      const initialIceBreakerSetId = crypto.randomUUID();
      const nextState = {
        ...state,
        currentEventId: nextEventId,
        agendaEventTitle: "",
        agendaEventDate: "",
        agendaEventTime: "09:00",
        agendaLocationType: "",
        agendaVirtualPlatform: "",
        agendaVirtualJoinLink: "",
        agendaPhysicalAddress: "",
        agendaEventLocation: "",
        agendaStartTime: "09:00",
        agendaItems: [],
        people: [],
        groupsHistory: [],
        questions: [],
        questionSets: [
          {
            id: initialQuestionSetId,
            name: "Question Set 1",
            agendaQuizType: "quiz",
            quizMode: DEFAULT_STATE.quizMode,
            questions: []
          }
        ],
        activeQuestionSetId: initialQuestionSetId,
        iceBreakerSets: [
          {
            id: initialIceBreakerSetId,
            name: "Icebreaker Set 1",
            selectedIceBreaker: null,
          }
        ],
        activeIceBreakerSetId: initialIceBreakerSetId,
        quizMode: DEFAULT_STATE.quizMode,
        quizSettings: { ...DEFAULT_STATE.quizSettings },
        selectedIceBreaker: null,
        participants: [],
        collectFreeTextAnswers: false
      };

      const updated = {
        ...nextState,
        events: upsertAgendaEvent(
          baseEvents,
          buildAgendaEventRecord(nextState, { id: nextEventId })
        )
      };
      save(get);
      return updated;
    }),

  selectEvent: (eventId) =>
    set((state) => {
      const baseEvents = state.currentEventId
        ? upsertAgendaEvent(
            state.events,
            buildAgendaEventRecord(state, { id: state.currentEventId })
          )
        : [...(state.events || [])];

      const selected = baseEvents.find((eventItem) => eventItem.id === eventId);
      if (!selected) return state;

      const hydrated = hydrateStateFromEvent(state, selected);
      const updated = {
        ...hydrated,
        events: baseEvents
      };
      save(get);
      return updated;
    }),

  addAgendaItem: (item) =>
    set((state) => {
      const incomingItem = { id: crypto.randomUUID(), ...item };
      const withDefaults = {
        ...incomingItem,
        linkedQuestionSetId: incomingItem.linkedQuestionSetId || null,
        linkedIceBreakerSetId: incomingItem.linkedIceBreakerSetId || null,
        enableGroupSetup: !!incomingItem.enableGroupSetup,
        groupCount: Number(incomingItem.groupCount) > 0 ? Number(incomingItem.groupCount) : 2,
        groupHistoryEntryId: incomingItem.groupHistoryEntryId || null,
      };

      const draftItems = [...state.agendaItems, withDefaults];
      const coverage = ensureInteractiveSetCoverage({
        agendaItems: draftItems,
        questionSets: state.questionSets,
        iceBreakerSets: state.iceBreakerSets,
      });
      const linkedItems = assignAgendaItemSetLinks({
        agendaItems: draftItems,
        questionSets: coverage.questionSets,
        iceBreakerSets: coverage.iceBreakerSets,
      });
      const agendaItems = recalcAgendaTimes(state.agendaStartTime, linkedItems);

      let syncedQuestionSets = coverage.questionSets;
      agendaItems.forEach((agendaItem) => {
        if (!isQuizAgendaType(agendaItem.type) || !agendaItem.linkedQuestionSetId) return;

        syncedQuestionSets = syncedQuestionSets.map((setItem) =>
          setItem.id === agendaItem.linkedQuestionSetId
            ? { ...setItem, agendaQuizType: agendaItem.type }
            : setItem
        );
      });

      const syncedAgendaItems = syncAgendaLinkedArtefacts({
        agendaItems,
        questionSets: syncedQuestionSets,
        iceBreakerSets: coverage.iceBreakerSets,
      });

      const nextState = {
        ...state,
        agendaItems: syncedAgendaItems,
        questionSets: syncedQuestionSets,
        iceBreakerSets: coverage.iceBreakerSets,
      };
      const updated = state.currentEventId
        ? {
            ...nextState,
            events: upsertAgendaEvent(
              state.events,
              buildAgendaEventRecord(nextState, { id: state.currentEventId })
            )
          }
        : nextState;
      save(get);
      return updated;
    }),

  updateAgendaItemsOrder: (newOrder) =>
    set((state) => {
      const coverage = ensureInteractiveSetCoverage({
        agendaItems: newOrder,
        questionSets: state.questionSets,
        iceBreakerSets: state.iceBreakerSets,
      });
      const linkedItems = assignAgendaItemSetLinks({
        agendaItems: newOrder,
        questionSets: coverage.questionSets,
        iceBreakerSets: coverage.iceBreakerSets,
      });
      const agendaItems = recalcAgendaTimes(state.agendaStartTime, linkedItems);
      const syncedAgendaItems = syncAgendaLinkedArtefacts({
        agendaItems,
        questionSets: coverage.questionSets,
        iceBreakerSets: coverage.iceBreakerSets,
      });

      const nextState = {
        ...state,
        agendaItems: syncedAgendaItems,
        questionSets: coverage.questionSets,
        iceBreakerSets: coverage.iceBreakerSets,
        groupsHistory: refreshAgendaGroupSessionNames(syncedAgendaItems, state.groupsHistory),
      };
      const updated = state.currentEventId
        ? {
            ...nextState,
            events: upsertAgendaEvent(
              state.events,
              buildAgendaEventRecord(nextState, { id: state.currentEventId })
            )
          }
        : nextState;
      save(get);
      return updated;
    }),

  updateAgendaItem: (id, updates) =>
    set((state) => {
      const previousById = new Map(state.agendaItems.map((item) => [item.id, item]));
      const updatedItems = state.agendaItems.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updates,
              linkedQuestionSetId:
                updates.type && !isQuizAgendaType(updates.type)
                  ? null
                  : updates.linkedQuestionSetId !== undefined
                  ? updates.linkedQuestionSetId
                  : item.linkedQuestionSetId,
              linkedIceBreakerSetId:
                updates.type && !isIceBreakerAgendaType(updates.type)
                  ? null
                  : updates.linkedIceBreakerSetId !== undefined
                  ? updates.linkedIceBreakerSetId
                  : item.linkedIceBreakerSetId,
              enableGroupSetup:
                updates.enableGroupSetup !== undefined
                  ? !!updates.enableGroupSetup
                  : !!item.enableGroupSetup,
              groupCount:
                updates.groupCount !== undefined
                  ? Math.max(1, Number(updates.groupCount) || 1)
                  : Math.max(1, Number(item.groupCount) || 1),
            }
          : item
      );

      const coverage = ensureInteractiveSetCoverage({
        agendaItems: updatedItems,
        questionSets: state.questionSets,
        iceBreakerSets: state.iceBreakerSets,
      });

      const validLinkedItems = updatedItems.map((item) => ({
        ...item,
        linkedQuestionSetId:
          item.linkedQuestionSetId && coverage.questionSets.some((setItem) => setItem.id === item.linkedQuestionSetId)
            ? item.linkedQuestionSetId
            : null,
        linkedIceBreakerSetId:
          item.linkedIceBreakerSetId && coverage.iceBreakerSets.some((setItem) => setItem.id === item.linkedIceBreakerSetId)
            ? item.linkedIceBreakerSetId
            : null,
      }));

      const agendaItems = recalcAgendaTimes(state.agendaStartTime, validLinkedItems);

      let syncedQuestionSets = coverage.questionSets;
      agendaItems.forEach((item) => {
        if (!isQuizAgendaType(item.type) || !item.linkedQuestionSetId) return;

        syncedQuestionSets = syncedQuestionSets.map((setItem) =>
          setItem.id === item.linkedQuestionSetId
            ? { ...setItem, agendaQuizType: item.type }
            : setItem
        );
      });

      let groupsHistory = [...state.groupsHistory];
      const eligiblePeople = state.people.filter((person) => person?.inGroups !== false && person?.isPresenter !== true);

      const agendaItemsWithGroups = agendaItems.map((item) => {
        if (!item.enableGroupSetup) {
          if (item.groupHistoryEntryId) {
            groupsHistory = groupsHistory.filter((entry) => entry._id !== item.groupHistoryEntryId);
          }

          return {
            ...item,
            groupHistoryEntryId: null,
          };
        }

        const previousItem = previousById.get(item.id);
        const countChanged = Number(previousItem?.groupCount || 1) !== Number(item.groupCount || 1);
        const hadGrouping = !!previousItem?.enableGroupSetup;

        if (!item.groupHistoryEntryId && eligiblePeople.length === 0) {
          return item;
        }

        const sessionName = buildAgendaGroupSessionName(item);

        if (item.groupHistoryEntryId && !countChanged && hadGrouping) {
          groupsHistory = groupsHistory.map((entry) =>
            entry._id === item.groupHistoryEntryId
              ? { ...entry, sessionName, updatedAt: Date.now() }
              : entry
          );

          return item;
        }

        const groups = eligiblePeople.length > 0
          ? splitIntoGroups(eligiblePeople, item.groupCount)
          : [];

        if (item.groupHistoryEntryId) {
          groupsHistory = groupsHistory.map((entry) =>
            entry._id === item.groupHistoryEntryId
              ? { ...entry, sessionName, groups, updatedAt: Date.now() }
              : entry
          );

          return item;
        }

        const historyId = crypto.randomUUID();
        groupsHistory = [
          {
            _id: historyId,
            timestamp: Date.now(),
            sessionName,
            groups,
            agendaItemId: item.id,
          },
          ...groupsHistory,
        ];

        return {
          ...item,
          groupHistoryEntryId: historyId,
        };
      });

      const syncedAgendaItems = syncAgendaLinkedArtefacts({
        agendaItems: agendaItemsWithGroups,
        questionSets: syncedQuestionSets,
        iceBreakerSets: coverage.iceBreakerSets,
      });

      const nextState = {
        ...state,
        agendaItems: syncedAgendaItems,
        questionSets: syncedQuestionSets,
        iceBreakerSets: coverage.iceBreakerSets,
        groupsHistory,
      };
      const updated = state.currentEventId
        ? {
            ...nextState,
            events: upsertAgendaEvent(
              state.events,
              buildAgendaEventRecord(nextState, { id: state.currentEventId })
            )
          }
        : nextState;
      save(get);
      return updated;
    }),

  removeAgendaItem: (id) =>
    set((state) => {
      const updatedItems = state.agendaItems.filter((i) => i.id !== id);
      const removedItem = state.agendaItems.find((i) => i.id === id);
      const coverage = ensureInteractiveSetCoverage({
        agendaItems: updatedItems,
        questionSets: state.questionSets,
        iceBreakerSets: state.iceBreakerSets,
      });
      const validLinkedItems = updatedItems.map((item) => ({
        ...item,
        linkedQuestionSetId:
          item.linkedQuestionSetId && coverage.questionSets.some((setItem) => setItem.id === item.linkedQuestionSetId)
            ? item.linkedQuestionSetId
            : null,
        linkedIceBreakerSetId:
          item.linkedIceBreakerSetId && coverage.iceBreakerSets.some((setItem) => setItem.id === item.linkedIceBreakerSetId)
            ? item.linkedIceBreakerSetId
            : null,
      }));
      const agendaItems = recalcAgendaTimes(state.agendaStartTime, validLinkedItems);
      const syncedAgendaItems = syncAgendaLinkedArtefacts({
        agendaItems,
        questionSets: coverage.questionSets,
        iceBreakerSets: coverage.iceBreakerSets,
      });
      const nextState = {
        ...state,
        agendaItems: syncedAgendaItems,
        questionSets: coverage.questionSets,
        iceBreakerSets: coverage.iceBreakerSets,
        groupsHistory: removedItem?.groupHistoryEntryId
          ? state.groupsHistory.filter((entry) => entry._id !== removedItem.groupHistoryEntryId)
          : state.groupsHistory,
      };
      const updated = state.currentEventId
        ? {
            ...nextState,
            events: upsertAgendaEvent(
              state.events,
              buildAgendaEventRecord(nextState, { id: state.currentEventId })
            )
          }
        : nextState;
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
    const finalStartTime = startTime || state.agendaEventTime || template.startTime || "09:00";

    const items = template.items.map((t) => ({
      id: crypto.randomUUID(),
      type: t.type,
      label: agendaTypes.find((x) => x.id === t.type)?.label || "Session",
      minutes: getAgendaDefaultMinutes(t.type),
      presenterId: null,
      guestPresenter: "",
      notes: "",
      artefactUrl: "",
      linkedQuestionSetId: null,
      linkedIceBreakerSetId: null,
      enableGroupSetup: false,
      groupCount: 2,
      groupHistoryEntryId: null,
    }));

    const coverage = ensureInteractiveSetCoverage({
      agendaItems: items,
      questionSets: state.questionSets,
      iceBreakerSets: state.iceBreakerSets,
    });
    const linkedItems = assignAgendaItemSetLinks({
      agendaItems: items,
      questionSets: coverage.questionSets,
      iceBreakerSets: coverage.iceBreakerSets,
    });
    const recalced = recalcAgendaTimes(finalStartTime, linkedItems);

    let syncedQuestionSets = coverage.questionSets;
    recalced.forEach((agendaItem) => {
      if (!isQuizAgendaType(agendaItem.type) || !agendaItem.linkedQuestionSetId) return;

      syncedQuestionSets = syncedQuestionSets.map((setItem) =>
        setItem.id === agendaItem.linkedQuestionSetId
          ? { ...setItem, agendaQuizType: agendaItem.type }
          : setItem
      );
    });

    const syncedAgendaItems = syncAgendaLinkedArtefacts({
      agendaItems: recalced,
      questionSets: syncedQuestionSets,
      iceBreakerSets: coverage.iceBreakerSets,
    });

    const updated = {
      ...state,
      agendaEventTime: finalStartTime,
      agendaStartTime: finalStartTime,
      agendaItems: syncedAgendaItems,
      questionSets: syncedQuestionSets,
      iceBreakerSets: coverage.iceBreakerSets,
    };

    const finalUpdated = state.currentEventId
      ? {
          ...updated,
          events: upsertAgendaEvent(
            state.events,
            buildAgendaEventRecord(updated, {
              id: state.currentEventId,
              time: finalStartTime,
              agendaStartTime: finalStartTime,
              agendaItems: syncedAgendaItems,
              questionSets: syncedQuestionSets,
              iceBreakerSets: coverage.iceBreakerSets,
            })
          )
        }
      : updated;

    save(get);
    return finalUpdated;
  }),



/* ---------------------------------------------------------
   AGENDA EXPORTS
--------------------------------------------------------- */

// Markdown (already conceptually there, keeping name)
exportAgendaMarkdown: () => {
  const state = get();
  const lines = [];

  lines.push(`# Agenda Summary`);
  if (state.agendaEventTitle) lines.push(`Title: **${state.agendaEventTitle}**`);
  if (state.agendaEventDate) lines.push(`Date: **${state.agendaEventDate}**`);
  if (state.agendaEventTime) lines.push(`Event Time: **${state.agendaEventTime}**`);
  if (state.agendaEventLocation) lines.push(`Location: **${state.agendaEventLocation}**`);
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

  const rows = [];

  if (state.agendaEventTitle) rows.push(["Event Title", state.agendaEventTitle]);
  if (state.agendaEventDate) rows.push(["Event Date", state.agendaEventDate]);
  if (state.agendaEventTime) rows.push(["Event Time", state.agendaEventTime]);
  if (state.agendaEventLocation) rows.push(["Event Location", state.agendaEventLocation]);
  if (rows.length) rows.push([]);

  rows.push(
    ["#", "Session", "Start", "End", "Minutes", "Presenter", "Notes", "Artefact"]
  );

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

  const headerMeta = `
<div style="font-family:Arial; margin-bottom:10px;">
    ${state.agendaEventTitle ? `<div><strong>Title:</strong> ${esc(state.agendaEventTitle)}</div>` : ""}
  ${state.agendaEventDate ? `<div><strong>Date:</strong> ${esc(state.agendaEventDate)}</div>` : ""}
  ${state.agendaEventTime ? `<div><strong>Event Time:</strong> ${esc(state.agendaEventTime)}</div>` : ""}
  ${state.agendaEventLocation ? `<div><strong>Location:</strong> ${esc(state.agendaEventLocation)}</div>` : ""}
  <div><strong>Agenda Start:</strong> ${esc(state.agendaStartTime)}</div>
</div>
`;

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

  return headerMeta + header + rows + "</tbody></table>";
},





// PDF-friendly text (simple, linear)
exportAgendaPdfText: () => {
  const state = get();
  const lines = [];

  lines.push("Agenda Summary");
  if (state.agendaEventTitle) lines.push(`Title: ${state.agendaEventTitle}`);
  if (state.agendaEventDate) lines.push(`Date: ${state.agendaEventDate}`);
  if (state.agendaEventTime) lines.push(`Event Time: ${state.agendaEventTime}`);
  if (state.agendaEventLocation) lines.push(`Location: ${state.agendaEventLocation}`);
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
    const nextState = { ...state, agendaItems: [] };
    const updated = state.currentEventId
      ? {
          ...nextState,
          events: upsertAgendaEvent(
            state.events,
            buildAgendaEventRecord(nextState, {
              id: state.currentEventId,
              agendaItems: []
            })
          )
        }
      : nextState;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }),

// -------------------------------------
// ICE BREAKER (CLEAN VERSION)
// -------------------------------------

selectedIceBreaker: null,
participants: [],
// Whether to collect free-text answers for non-choice prompts
collectFreeTextAnswers: false,

// SELECT ICE BREAKER
selectIceBreaker: (iceBreaker) => {
  set((state) => {
    const synced = syncIceBreakerSetsWithActive({
      iceBreakerSets: state.iceBreakerSets,
      activeIceBreakerSetId: state.activeIceBreakerSetId,
      selectedIceBreaker: state.selectedIceBreaker,
    });

    const updatedSets = synced.iceBreakerSets.map((setItem) =>
      setItem.id === synced.activeIceBreakerSetId
        ? { ...setItem, selectedIceBreaker: iceBreaker || null }
        : setItem
    );

    const updated = {
      ...state,
      iceBreakerSets: updatedSets,
      activeIceBreakerSetId: synced.activeIceBreakerSetId,
      selectedIceBreaker: iceBreaker || null,
      agendaItems: syncAgendaLinkedArtefacts({
        agendaItems: state.agendaItems,
        questionSets: state.questionSets,
        iceBreakerSets: updatedSets,
      }),
    };
    save(get);
    return updated;
  });
},

// SET PARTICIPANTS
setParticipants: (people) => {
  set((state) => {
    const updated = { ...state, participants: people };
    save(get);
    return updated;
  });
},

// CLEAR SELECTION (called when ending)
clearIceBreaker: () => {
  set((state) => {
    const synced = syncIceBreakerSetsWithActive({
      iceBreakerSets: state.iceBreakerSets,
      activeIceBreakerSetId: state.activeIceBreakerSetId,
      selectedIceBreaker: state.selectedIceBreaker,
    });

    const updatedSets = synced.iceBreakerSets.map((setItem) =>
      setItem.id === synced.activeIceBreakerSetId
        ? { ...setItem, selectedIceBreaker: null }
        : setItem
    );

    const updated = {
      ...state,
      iceBreakerSets: updatedSets,
      activeIceBreakerSetId: synced.activeIceBreakerSetId,
      selectedIceBreaker: null,
      participants: [],
      agendaItems: syncAgendaLinkedArtefacts({
        agendaItems: state.agendaItems,
        questionSets: state.questionSets,
        iceBreakerSets: updatedSets,
      }),
    };
    save(get);
    return updated;
  });
}

  ,
  // Toggle collecting free-text answers for simple/random prompts
  setCollectFreeTextAnswers: (val) =>
    set((state) => {
      const updated = { ...state, collectFreeTextAnswers: !!val };
      save(get);
      return updated;
    }),

}));

export default usePeople;
