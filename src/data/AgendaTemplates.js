// src/data/AgendaTemplates.js

export const agendaTemplates = {
  interviewSession: {
    id: "interview-session",
    eventType: "interview",
    name: "Interview Schedule",
    description: "A structured 60-minute interview with an introduction and wrap-up.",
    items: [
      { type: "welcome", minutes: 5, label: "Welcome & Introduction" },
      { type: "research-briefing", minutes: 5, label: "Purpose, Privacy & Consent" },
      { type: "interview", minutes: 40, label: "In-depth Interview" },
      { type: "debrief", minutes: 10, label: "Wrap-up & Notes" },
    ],
  },

  observationDay: {
    id: "observation-day",
    eventType: "observation",
    name: "Observation Day",
    description: "A full-day schedule combining observations, interviews, breaks, and synthesis.",
    items: [
      { type: "research-briefing", minutes: 15, label: "Research Briefing & Consent" },
      { type: "direct-observation", minutes: 60, label: "Direct Observation" },
      { type: "break", minutes: 15 },
      { type: "observation", minutes: 120, label: "Field Observation Block" },
      { type: "lunch", minutes: 45 },
      { type: "contextual-inquiry", minutes: 60 },
      { type: "job-shadowing", minutes: 60 },
      { type: "interview", minutes: 45, label: "Follow-up Interview" },
      { type: "research-analysis", minutes: 45 },
      { type: "close", minutes: 15, label: "Findings & Next Steps" },
    ],
  },

  teamMeeting: {
    id: "team-meeting",
    eventType: "team",
    name: "Team Meeting",
    description: "A focused 60-minute team meeting with updates, discussion, and actions.",
    items: [
      { type: "welcome", minutes: 5, label: "Opening & Goals" },
      { type: "team-updates", minutes: 15 },
      { type: "discussion", minutes: 20 },
      { type: "prioritisation", minutes: 10, label: "Decisions" },
      { type: "action-planning", minutes: 5 },
      { type: "close", minutes: 5 },
    ],
  },

  discoveryWorkshop: {
    id: "discovery-workshop",
    eventType: "workshop",
    name: "Discovery Workshop",
    description: "A structured discovery session for new projects.",
    items: [
      { type: "welcome" },
      { type: "ice-breaker" },
      { type: "visioning" },
      { type: "stakeholder-interviews" },
      { type: "brainstorming" },
      { type: "painpoints" },
      { type: "prioritisation" },
      { type: "close" }
    ]
  },

  processMapping: {
    id: "process-mapping",
    eventType: "workshop",
    name: "Process Mapping Session",
    description: "Map current processes and identify improvements.",
    items: [
      { type: "welcome" },
      { type: "ice-breaker" },
      { type: "process-mapping" },
      { type: "painpoints" },
      { type: "brainstorming" },
      { type: "discussion" },
      { type: "close" }
    ]
  },

  ideationSprint: {
    id: "ideation-sprint",
    eventType: "workshop",
    name: "Ideation Sprint",
    description: "Fast-paced creative ideation session.",
    items: [
      { type: "welcome" },
      { type: "ice-breaker" },
      { type: "ideation" },
      { type: "brainstorming" },
      { type: "prioritisation" },
      { type: "discussion" },
      { type: "close" }
    ]
  },

  requirementsWorkshop: {
    id: "requirements-workshop",
    eventType: "workshop",
    name: "Requirements Workshop",
    description: "Capture functional and non-functional requirements.",
    items: [
      { type: "welcome" },
      { type: "requirements-gathering" },
      { type: "stakeholder-interviews" },
      { type: "discussion" },
      { type: "prioritisation" },
      { type: "close" }
    ]
  },

  trainingSession: {
    id: "training-session",
    eventType: "training",
    name: "Training Session",
    description: "Teach tools, processes, or methodologies.",
    items: [
      { type: "welcome" },
      { type: "training" },
      { type: "discussion" },
      { type: "brainstorming" },
      { type: "close" }
    ]
  },

  fullDayWorkshop: {
    id: "full-day-workshop",
    eventType: "event",
    name: "Full Day Workshop",
    description: "Comprehensive full-day workshop structure.",
    items: [
      { type: "welcome" },
      { type: "ice-breaker" },
      { type: "visioning" },
      { type: "requirements-gathering" },
      { type: "break" },
      { type: "process-mapping" },
      { type: "painpoints" },
      { type: "lunch" },
      { type: "ideation" },
      { type: "brainstorming" },
      { type: "prioritisation" },
      { type: "discussion" },
      { type: "close" }
    ]
  }
};
