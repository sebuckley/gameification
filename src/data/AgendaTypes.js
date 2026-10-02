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
  DoorClosed,
  UserPlus,        // Registration
  Mic,             // Keynote Speaker
  Presentation,    // Show & Tell
  Share2           // Networking
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
    id: "registration",
    label: "Registration",
    color: "#6366F1",
    textColor: "#FFFFFF",
    defaultMinutes: 15,
    icon: UserPlus,
    description: "Check-in, name badges, and welcoming participants as they arrive."
  },
  {
    id: "keynote",
    label: "Keynote Speaker",
    color: "#4338CA",
    textColor: "#FFFFFF",
    defaultMinutes: 30,
    icon: Mic,
    description: "A featured speaker delivering insights, inspiration, or domain expertise."
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
    textColor: "#111827",
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
  {
    id: "networking",
    label: "Networking",
    color: "#9CA3AF",
    textColor: "#111827",
    defaultMinutes: 20,
    icon: Share2,
    description: "Open networking time for participants to connect and share insights."
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
    id: "show-and-tell",
    label: "Show & Tell",
    color: "#FCD34D",
    textColor: "#111827",
    defaultMinutes: 20,
    icon: Presentation,
    description: "Participants present work, ideas, or examples to the group."
  },
  {
    id: "painpoints",
    label: "Pain Points",
    color: "#b40909",
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
    id: "research-briefing",
    label: "Research Briefing & Consent",
    color: "#155E75",
    textColor: "#FFFFFF",
    defaultMinutes: 10,
    icon: ClipboardList,
    description: "Explain the research purpose, session plan, privacy, recording, and obtain informed consent."
  },
  {
    id: "interview-prep",
    label: "Interview Preparation",
    color: "#0E7490",
    textColor: "#FFFFFF",
    defaultMinutes: 10,
    icon: ListChecks,
    description: "Review research questions, participant context, and the interview discussion guide."
  },
  {
    id: "interview",
    label: "Interview",
    color: "#0891B2",
    textColor: "#FFFFFF",
    defaultMinutes: 60,
    icon: Users,
    description: "A scheduled one-to-one or group interview, typically one hour."
  },
  {
    id: "direct-observation",
    label: "Direct Observation",
    color: "#115E59",
    textColor: "#FFFFFF",
    defaultMinutes: 60,
    icon: ClipboardList,
    description: "Observe normal activity with minimal interruption; capture what people do and the context."
  },
  {
    id: "ethnographic-observation",
    label: "Ethnographic Field Study",
    color: "#134E4A",
    textColor: "#FFFFFF",
    defaultMinutes: 180,
    icon: Users,
    description: "Spend sustained time in the natural setting to understand practices, relationships, and culture."
  },
  {
    id: "contextual-inquiry",
    label: "Contextual Inquiry",
    color: "#0F766E",
    textColor: "#FFFFFF",
    defaultMinutes: 60,
    icon: Workflow,
    description: "Observe people doing real work and ask focused questions to understand why and how."
  },
  {
    id: "observation",
    label: "Observation",
    color: "#0F766E",
    textColor: "#FFFFFF",
    defaultMinutes: 60,
    icon: ClipboardList,
    description: "Observe people carrying out their normal activities."
  },
  {
    id: "job-shadowing",
    label: "Job Shadowing",
    color: "#047857",
    textColor: "#FFFFFF",
    defaultMinutes: 90,
    icon: Users,
    description: "Follow a participant through their work to understand context and workflow."
  },
  {
    id: "contextual-observation",
    label: "Contextual Observation",
    color: "#0D9488",
    textColor: "#FFFFFF",
    defaultMinutes: 60,
    icon: Workflow,
    description: "Observe and ask questions in the participant's usual environment."
  },
  {
    id: "debrief",
    label: "Debrief & Synthesis",
    color: "#0E7490",
    textColor: "#FFFFFF",
    defaultMinutes: 30,
    icon: MessageSquare,
    description: "Capture observations, themes, and follow-up questions."
  },
  {
    id: "research-analysis",
    label: "Research Analysis & Synthesis",
    color: "#155E75",
    textColor: "#FFFFFF",
    defaultMinutes: 60,
    icon: Brain,
    description: "Review notes, separate observations from interpretations, identify themes, and agree findings and actions."
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
    id: "hands-on-practice",
    label: "Hands-on Practice",
    color: "#0F766E",
    textColor: "#FFFFFF",
    defaultMinutes: 30,
    icon: BookOpen,
    description: "Give participants time to apply the training with a supported exercise."
  },
  {
    id: "panel-discussion",
    label: "Panel Discussion",
    color: "#6D28D9",
    textColor: "#FFFFFF",
    defaultMinutes: 45,
    icon: MessageSquare,
    description: "Host a moderated discussion with multiple speakers and audience questions."
  },
  {
    id: "workshop",
    label: "Workshop Activity",
    color: "#7C3AED",
    textColor: "#FFFFFF",
    defaultMinutes: 60,
    icon: Lightbulb,
    description: "Facilitate a practical group exercise toward a defined outcome."
  },
  {
    id: "team-updates",
    label: "Team Updates",
    color: "#2563EB",
    textColor: "#FFFFFF",
    defaultMinutes: 15,
    icon: Users,
    description: "Share progress, blockers, and important updates across the team."
  },
  {
    id: "action-planning",
    label: "Action Planning",
    color: "#1D4ED8",
    textColor: "#FFFFFF",
    defaultMinutes: 15,
    icon: ListChecks,
    description: "Agree owners, actions, and next steps."
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
