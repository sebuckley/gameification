import {
  Handshake,
  Sparkles,
  Coffee,
  Sandwich,
  Lightbulb,
  Map,
  Bug,
  ClipboardList,
  Users,
  Target,
  BookOpen,
  Brain,
  MessageSquare,
  Workflow,
  ListChecks,
  DoorClosed
} from "lucide-react";

export const agendaTypes = [
  // ⭐ OPENING — Indigo family
  {
    id: "welcome",
    label: "Welcome",
    color: "#4F46E5",
    textColor: "#FFFFFF",
    defaultMinutes: 10,
    icon: Handshake,
    description: "Kick off the workshop, set expectations, outline goals and agenda."
  },
  {
    id: "ice-breaker",
    label: "Ice Breaker",
    color: "#EC4899",
    textColor: "#FFFFFF",
    defaultMinutes: 10,
    icon: Sparkles,
    description: "Warm-up activity to energise participants and build rapport."
  },

  // ⭐ QUIZ TYPES — Lime family
  {
    id: "quiz",
    label: "Quiz",
    color: "#84CC16",
    textColor: "#FFFFFF",
    defaultMinutes: 10,
    icon: ListChecks,
    description: "A short interactive quiz to engage participants."
  },
  {
    id: "quiz-fun",
    label: "Fun Quiz",
    color: "#A3E635",
    textColor: "#111827", // gray-900
    defaultMinutes: 10,
    icon: Sparkles,
    description: "A light-hearted trivia quiz just for fun."
  },
  {
    id: "quiz-knowledge",
    label: "Knowledge Test",
    color: "#65A30D",
    textColor: "#FFFFFF",
    defaultMinutes: 10,
    icon: Brain,
    description: "A quiz designed to test understanding or reinforce learning."
  },

  // ⭐ BREAKS & MEALS — Gray family
  {
    id: "break",
    label: "Break",
    color: "#6B7280",
    textColor: "#FFFFFF",
    defaultMinutes: 15,
    icon: Coffee,
    description: "Short rest period for refreshments and informal discussion."
  },
  {
    id: "lunch",
    label: "Lunch",
    color: "#4B5563",
    textColor: "#FFFFFF",
    defaultMinutes: 45,
    icon: Sandwich,
    description: "Midday meal and informal networking time."
  },

  // ⭐ COLLABORATION & IDEATION — Amber family
  {
    id: "brainstorming",
    label: "Brainstorming",
    color: "#F59E0B",
    textColor: "#111827",
    defaultMinutes: 30,
    icon: Lightbulb,
    description: "Generate ideas collaboratively using structured or free-form techniques."
  },
  {
    id: "ideation",
    label: "Ideation",
    color: "#FBBF24",
    textColor: "#111827",
    defaultMinutes: 25,
    icon: Brain,
    description: "Creative thinking session to explore innovative solutions."
  },
  {
    id: "storymapping",
    label: "Story Mapping",
    color: "#D97706",
    textColor: "#FFFFFF",
    defaultMinutes: 45,
    icon: Map,
    description: "Visualise user journeys and break down work into meaningful slices."
  },
  {
    id: "painpoints",
    label: "Pain Points",
    color: "#B45309",
    textColor: "#FFFFFF",
    defaultMinutes: 30,
    icon: Bug,
    description: "Identify challenges, blockers, and frustrations in current processes."
  },

  // ⭐ DISCOVERY & ANALYSIS — Cyan family
  {
    id: "requirements-gathering",
    label: "Requirements Gathering",
    color: "#06B6D4",
    textColor: "#FFFFFF",
    defaultMinutes: 40,
    icon: ClipboardList,
    description: "Capture functional and non-functional requirements from stakeholders."
  },
  {
    id: "stakeholder-interviews",
    label: "Stakeholder Interviews",
    color: "#22D3EE",
    textColor: "#111827",
    defaultMinutes: 30,
    icon: Users,
    description: "One-on-one or group interviews to understand stakeholder needs."
  },
  {
    id: "visioning",
    label: "Visioning",
    color: "#0891B2",
    textColor: "#FFFFFF",
    defaultMinutes: 30,
    icon: Target,
    description: "Define the future state vision and strategic goals."
  },
  {
    id: "process-mapping",
    label: "Process Mapping",
    color: "#0E7490",
    textColor: "#FFFFFF",
    defaultMinutes: 45,
    icon: Workflow,
    description: "Document current processes and identify opportunities for improvement."
  },

  // ⭐ TRAINING & DISCUSSION — Teal family
  {
    id: "training",
    label: "Training",
    color: "#14B8A6",
    textColor: "#FFFFFF",
    defaultMinutes: 30,
    icon: BookOpen,
    description: "Teach participants new tools, processes, or methodologies."
  },
  {
    id: "discussion",
    label: "Group Discussion",
    color: "#2DD4BF",
    textColor: "#111827",
    defaultMinutes: 20,
    icon: MessageSquare,
    description: "Open conversation to align perspectives and share insights."
  },
  {
    id: "prioritisation",
    label: "Prioritisation",
    color: "#0D9488",
    textColor: "#FFFFFF",
    defaultMinutes: 30,
    icon: ListChecks,
    description: "Rank ideas or requirements using MoSCoW, voting, or scoring."
  },

  // ⭐ CLOSE — Indigo family (dark)
  {
    id: "close",
    label: "Close",
    color: "#4338CA",
    textColor: "#FFFFFF",
    defaultMinutes: 10,
    icon: DoorClosed,
    description: "Wrap up the workshop, summarise outcomes, confirm next steps."
  },

  // ⭐ CATCH-ALL — Cyan (light)
  {
    id: "other",
    label: "Other",
    color: "#E0F2FE",
    textColor: "#111827",
    defaultMinutes: 30,
    icon: Sparkles,
    description: "Custom activity not covered by predefined workshop types."
  }
];



// ⭐ Helpers
export const getAgendaType = (id) =>
  agendaTypes.find((t) => t.id === id);

export const getAgendaColor = (id) =>
  getAgendaType(id)?.color || "#6CA8D1";

export const getAgendaTextColor = (id) =>
  getAgendaType(id)?.textColor || "#000000";

export const getAgendaDefaultMinutes = (id) =>
  getAgendaType(id)?.defaultMinutes || 30;

export const getAgendaIcon = (id) =>
  getAgendaType(id)?.icon || Sparkles;

export const getAgendaDescription = (id) =>
  getAgendaType(id)?.description || "Workshop activity.";
