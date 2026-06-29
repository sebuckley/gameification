// src/data/AgendaTemplates.js

export const agendaTemplates = {
  discoveryWorkshop: {
    id: "discovery-workshop",
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
