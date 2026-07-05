import {
  Handshake,
  Sparkles,
  Lightbulb,
  Bug,
  ClipboardList,
  Users,
  Target,
  BookOpen,
  MessageSquare,
  Workflow,
  ListChecks,
  DoorClosed
} from "lucide-react";

export const USER_TYPES = [
  {
    id: "business-analyst",
    label: "Business Analyst",
    icon: ClipboardList,
    description: "Needs structured agendas with discovery, prioritisation, and stakeholder alignment.",
    recommendedAgendaFocus: ["requirements-gathering", "stakeholder-interviews", "prioritisation", "discussion"],
    recommendedAgendaIcons: [ClipboardList, Users, ListChecks, MessageSquare],
    excludedAgendaTypes: ["training", "quiz-fun", "ice-breaker"]
  },
  {
    id: "user-researcher",
    label: "User Researcher",
    icon: Users,
    description: "Runs evidence-led sessions focused on user insight and hypothesis validation.",
    recommendedAgendaFocus: ["stakeholder-interviews", "process-mapping", "painpoints", "discussion"],
    recommendedAgendaIcons: [Users, Workflow, Bug, MessageSquare],
    excludedAgendaTypes: ["training", "quiz-fun", "ice-breaker"]
  },
  {
    id: "trainer",
    label: "Trainer",
    icon: BookOpen,
    description: "Optimizes for learning flow, engagement checks, and reinforcement activities.",
    recommendedAgendaFocus: ["welcome", "training", "quiz", "discussion", "close"],
    recommendedAgendaIcons: [Handshake, BookOpen, ListChecks, MessageSquare, DoorClosed],
    excludedAgendaTypes: ["stakeholder-interviews", "process-mapping", "requirements-gathering"]
  },
  {
    id: "operational",
    label: "Operational",
    icon: Workflow,
    description: "Prefers execution-focused plans with clear sequencing and practical outputs.",
    recommendedAgendaFocus: ["process-mapping", "brainstorming", "prioritisation", "close"],
    recommendedAgendaIcons: [Workflow, Lightbulb, ListChecks, DoorClosed],
    excludedAgendaTypes: ["ice-breaker", "quiz-fun", "training"]
  },
  {
    id: "project-manager",
    label: "Project Manager",
    icon: Target,
    description: "Focuses on cadence, dependencies, action ownership, and delivery confidence.",
    recommendedAgendaFocus: ["welcome", "visioning", "prioritisation", "close"],
    recommendedAgendaIcons: [Handshake, Target, ListChecks, DoorClosed],
    excludedAgendaTypes: ["training", "quiz-fun", "ice-breaker"]
  },
  {
    id: "product-manager",
    label: "Product Manager",
    icon: Lightbulb,
    description: "Balances user outcomes, business goals, and roadmap decisions.",
    recommendedAgendaFocus: ["visioning", "requirements-gathering", "discussion", "prioritisation"],
    recommendedAgendaIcons: [Target, ClipboardList, MessageSquare, ListChecks],
    excludedAgendaTypes: ["training", "quiz-fun", "ice-breaker"]
  },
  {
    id: "facilitator",
    label: "Facilitator",
    icon: Handshake,
    description: "Designs collaborative sessions and keeps groups aligned and productive.",
    recommendedAgendaFocus: ["welcome", "ice-breaker", "brainstorming", "discussion", "close"],
    recommendedAgendaIcons: [Handshake, Sparkles, Lightbulb, MessageSquare, DoorClosed],
    excludedAgendaTypes: ["process-mapping", "requirements-gathering"]
  },
  {
    id: "consultant",
    label: "Consultant",
    icon: Sparkles,
    description: "Needs adaptable workshop structures for varied clients and domains.",
    recommendedAgendaFocus: ["visioning", "requirements-gathering", "process-mapping", "close"],
    recommendedAgendaIcons: [Target, ClipboardList, Workflow, DoorClosed],
    excludedAgendaTypes: []
  }
];

export const getUserTypeById = (id) =>
  USER_TYPES.find((userType) => {
    if (!id) return false;
    const normalizedId = String(id).trim().toLowerCase();
    return (
      userType.id === normalizedId ||
      userType.label.toLowerCase() === normalizedId
    );
  }) || null;

export const getAgendaTypesForUserType = (userTypeId, agendaTypeList = []) => {
  const selectedUserType = getUserTypeById(userTypeId);
  if (!selectedUserType) return agendaTypeList;

  const excluded = new Set(selectedUserType.excludedAgendaTypes || []);

  return (agendaTypeList || []).filter((agendaType) => {
    if (!agendaType?.id) return false;
    return !excluded.has(agendaType.id);
  });
};
