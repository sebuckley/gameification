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
  {
    id: "welcome",
    label: "Welcome",
    color: "#6CA8D1",
    defaultMinutes: 10,
    icon: Handshake,
    description: "Kick off the workshop, set expectations, outline goals and agenda."
  },
  {
    id: "ice-breaker",
    label: "Ice Breaker",
    color: "#D16C7A",
    defaultMinutes: 10,
    icon: Sparkles,
    description: "Warm-up activity to energise participants and build rapport."
  },
  {
    id: "break",
    label: "Break",
    color: "#000000",
    defaultMinutes: 15,
    icon: Coffee,
    description: "Short rest period for refreshments and informal discussion."
  },
  {
    id: "lunch",
    label: "Lunch",
    color: "#000000",
    defaultMinutes: 45,
    icon: Sandwich,
    description: "Midday meal and informal networking time."
  },
  {
    id: "brainstorming",
    label: "Brainstorming",
    color: "#E3C26F",
    defaultMinutes: 30,
    icon: Lightbulb,
    description: "Generate ideas collaboratively using structured or free-form techniques."
  },
  {
    id: "storymapping",
    label: "Story Mapping",
    color: "#D18F6C",
    defaultMinutes: 45,
    icon: Map,
    description: "Visualise user journeys and break down work into meaningful slices."
  },
  {
    id: "painpoints",
    label: "Pain Points",
    color: "#D16C6C",
    defaultMinutes: 30,
    icon: Bug,
    description: "Identify challenges, blockers, and frustrations in current processes."
  },

  // ⭐ NEW WORKSHOP ACTIVITIES
  {
    id: "requirements-gathering",
    label: "Requirements Gathering",
    color: "#6CA8D1",
    defaultMinutes: 40,
    icon: ClipboardList,
    description: "Capture functional and non-functional requirements from stakeholders."
  },
  {
    id: "stakeholder-interviews",
    label: "Stakeholder Interviews",
    color: "#6CD1D1",
    defaultMinutes: 30,
    icon: Users,
    description: "One-on-one or group interviews to understand stakeholder needs."
  },
  {
    id: "visioning",
    label: "Visioning",
    color: "#E3C26F",
    defaultMinutes: 30,
    icon: Target,
    description: "Define the future state vision and strategic goals."
  },
  {
    id: "process-mapping",
    label: "Process Mapping",
    color: "#D18F6C",
    defaultMinutes: 45,
    icon: Workflow,
    description: "Document current processes and identify opportunities for improvement."
  },
  {
    id: "training",
    label: "Training",
    color: "#6CA8D1",
    defaultMinutes: 30,
    icon: BookOpen,
    description: "Teach participants new tools, processes, or methodologies."
  },
  {
    id: "ideation",
    label: "Ideation",
    color: "#E3C26F",
    defaultMinutes: 25,
    icon: Brain,
    description: "Creative thinking session to explore innovative solutions."
  },
  {
    id: "discussion",
    label: "Group Discussion",
    color: "#6CD1A8",
    defaultMinutes: 20,
    icon: MessageSquare,
    description: "Open conversation to align perspectives and share insights."
  },
  {
    id: "prioritisation",
    label: "Prioritisation",
    color: "#9B7ED1",
    defaultMinutes: 30,
    icon: ListChecks,
    description: "Rank ideas or requirements using MoSCoW, voting, or scoring."
  },

  // ⭐ NEW CLOSE SESSION
  {
    id: "close",
    label: "Close",
    color: "#6CA8D1",
    defaultMinutes: 10,
    icon: DoorClosed,
    description: "Wrap up the workshop, summarise outcomes, confirm next steps."
  },

  // Catch-all
  {
    id: "other",
    label: "Other",
    color: "#6CD1D1",
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

export const getAgendaDefaultMinutes = (id) =>
  getAgendaType(id)?.defaultMinutes || 30;

export const getAgendaIcon = (id) =>
  getAgendaType(id)?.icon || Sparkles;

export const getAgendaDescription = (id) =>
  getAgendaType(id)?.description || "Workshop activity.";
