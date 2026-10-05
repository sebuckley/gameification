// Placeholder template data - replace with real content. Shapes are defined in useDiscoveryStore.ts.
import type { TemplateQuestion } from "../components/store/useDiscoveryStore";

export const DISCOVERY_TEMPLATE_CATEGORIES = [
  "Introductions",
  "Scoping & Boundaries",
  "General Foundations",
  "Artefact Requests",
  "Process Understanding",
  "Systems & Tools",
  "Pain Points",
  "Stakeholders & Dependencies",
  "Outcomes & Measures",
  "User Goals & Motivations",
  "User Behaviours",
  "User Friction",
  "User Context",
  "User Needs & Opportunities",
  "Workflow Bottlenecks",
  "Service Quality",
  "Data & Reporting",
  "Compliance & Governance",
  "Team Dynamics",
  "User Emotions",
  "Accessibility & Inclusion",
  "Future Improvements",
  "Closing Reflections"
];

export const DISCOVERY_INTRODUCTION_TEMPLATES = [
  // -------------------------
  // BUSINESS ANALYST INTRODUCTIONS
  // -------------------------
  {
    id: "intro-ba-1",
    type: "business-analyst",
    category: "Introductions",
    prompt: "Tell me about your role.",
    pointers: [
      "Grade",
      "Job title",
      "Core responsibilities",
      "Team structure",
      "Who you collaborate with most",
      "Decision-making authority"
    ]
  },
  {
    id: "intro-ba-2",
    type: "business-analyst",
    category: "Introductions",
    prompt: "Help me understand your place in the wider process.",
    pointers: [
      "Where your work fits in the end-to-end workflow",
      "Upstream dependencies",
      "Downstream consumers",
      "Key handoffs",
      "Where you add the most value"
    ]
  },
  {
    id: "intro-ba-3",
    type: "business-analyst",
    category: "Introductions",
    prompt: "Walk me through a typical day in your role.",
    pointers: [
      "Morning tasks",
      "Key meetings",
      "Decision points",
      "Tools you use most",
      "Where time is lost"
    ]
  },
  {
    id: "intro-ba-4",
    type: "business-analyst",
    category: "Introductions",
    prompt: "Tell me about the history of your role.",
    pointers: [
      "How long you’ve been in post",
      "How the role has evolved",
      "Previous responsibilities",
      "Changes in expectations",
      "What’s stayed consistent"
    ]
  },

  // -------------------------
  // USER RESEARCHER INTRODUCTIONS
  // -------------------------
  {
    id: "intro-ur-1",
    type: "user-researcher",
    category: "Introductions",
    prompt: "Tell me about your role and how you interact with users.",
    pointers: [
      "Job title",
      "Research responsibilities",
      "User groups you work with",
      "Frequency of user contact",
      "Research methods you typically use",
      "How insights feed into the team"
    ]
  },
  {
    id: "intro-ur-2",
    type: "user-researcher",
    category: "Introductions",
    prompt: "Help me understand your involvement in the service.",
    pointers: [
      "Where you join the user journey",
      "Touchpoints you observe",
      "Teams you collaborate with",
      "How you capture insights",
      "How you validate assumptions"
    ]
  },
  {
    id: "intro-ur-3",
    type: "user-researcher",
    category: "Introductions",
    prompt: "Describe how you prepare for a user research session.",
    pointers: [
      "Planning",
      "Recruitment",
      "Materials",
      "Session goals",
      "How you capture insights"
    ]
  },
  {
    id: "intro-ur-4",
    type: "user-researcher",
    category: "Introductions",
    prompt: "Walk me through your typical research workflow.",
    pointers: [
      "Preparation",
      "Running sessions",
      "Synthesising insights",
      "Sharing findings",
      "Follow-up activities"
    ]
  }
];

export const DISCOVERY_QUESTION_TEMPLATES = [
  // -------------------------
  // GENERAL FOUNDATIONS (BA + UR)
  // -------------------------
  { 
    id: "ba-found-1", 
    type: "business-analyst", 
    question: "Can you walk me through your role and responsibilities?", 
    category: "General Foundations" 
  },
  { 
    id: "ba-found-2", 
    type: "business-analyst", 
    question: "Who owns the process documentation and keeps it up to date?", 
    category: "General Foundations" 
  },
  { 
    id: "ba-found-3", 
    type: "business-analyst", 
    question: "How do you monitor performance?", 
    category: "General Foundations" 
  },
  { 
    id: "ba-found-4", 
    type: "business-analyst", 
    question: "What are your key performance indicators?", 
    category: "General Foundations" 
  },
  { 
    id: "ur-found-1", 
    type: "user-researcher", 
    question: "Can you introduce your role and how you interact with users?", 
    category: "General Foundations" 
  },
  { 
    id: "ur-found-2", 
    type: "user-researcher", 
    question: "What assumptions exist about user behaviour or needs?", 
    category: "General Foundations" 
  },
  {
    id: "ba-found-5",
    type: "business-analyst",
    question: "What does ‘good’ look like in your part of the service?",
    category: "General Foundations"
  },
  {
    id: "ur-found-3",
    type: "user-researcher",
    question: "What do stakeholders expect from your role?",
    category: "General Foundations"
  },

  // -------------------------
  // PROCESS UNDERSTANDING (BA)
  // -------------------------
  { 
    id: "ba-proc-1", 
    type: "business-analyst", 
    question: "Can you describe in 4 to 6 steps the core processes?", 
    category: "Process Understanding" 
  },
  { 
    id: "ba-proc-2", 
    type: "business-analyst", 
    question: "Which steps consistently cause delays or rework?", 
    category: "Process Understanding" 
  },
  {
    id: "ba-proc-3",
    type: "business-analyst",
    question: "What areas do you have the most manual work or inefficiencies?",
    category: "Process Understanding"
  },
  {
    id: "ba-proc-4",
    type: "business-analyst",
    question: "Which steps are most vulnerable to errors?",
    category: "Process Understanding"
  },

  // -------------------------
  // SYSTEMS & TOOLS (BA)
  // -------------------------
  { 
    id: "ba-sys-1", 
    type: "business-analyst", 
    question: "Which systems or tools do you rely on most?", 
    category: "Systems & Tools" 
  },
  { 
    id: "ba-sys-2", 
    type: "business-analyst", 
    question: "What tasks are still manual or require workarounds?", 
    category: "Systems & Tools" 
  },
  {
    id: "ba-sys-3",
    type: "business-analyst",
    question: "Where do systems fail or behave unpredictably?",
    category: "Systems & Tools"
  },
  {
    id: "ba-sys-4",
    type: "business-analyst",
    question: "Which tools would you replace if you could?",
    category: "Systems & Tools"
  },

  // -------------------------
  // PAIN POINTS (BA)
  // -------------------------
  { 
    id: "ba-pain-1", 
    type: "business-analyst", 
    question: "What slows you down the most in your day-to-day work?", 
    category: "Pain Points" 
  },
  { 
    id: "ba-pain-2", 
    type: "business-analyst", 
    question: "Which tasks feel repetitive or unnecessarily complex?", 
    category: "Pain Points" 
  },
  {
    id: "ba-pain-3",
    type: "business-analyst",
    question: "Where do you feel the most frustration in your workflow?",
    category: "Pain Points"
  },
  {
    id: "ba-pain-4",
    type: "business-analyst",
    question: "Which pain points have existed the longest?",
    category: "Pain Points"
  },

  // -------------------------
  // STAKEHOLDERS (BA)
  // -------------------------
  { 
    id: "ba-stake-1", 
    type: "business-analyst", 
    question: "Who do you depend on to complete your work?", 
    category: "Stakeholders & Dependencies" 
  },
  { 
    id: "ba-stake-2", 
    type: "business-analyst", 
    question: "Where do communication gaps occur?", 
    category: "Stakeholders & Dependencies" 
  },
  {
    id: "ba-stake-3",
    type: "business-analyst",
    question: "Which stakeholders influence your work the most?",
    category: "Stakeholders & Dependencies"
  },
  {
    id: "ba-stake-4",
    type: "business-analyst",
    question: "Where do dependencies create bottlenecks?",
    category: "Stakeholders & Dependencies"
  },

  // -------------------------
  // OUTCOMES (BA)
  // -------------------------
  { 
    id: "ba-out-1", 
    type: "business-analyst", 
    question: "How do you measure success in this process?", 
    category: "Outcomes & Measures" 
  },
  { 
    id: "ba-out-2", 
    type: "business-analyst", 
    question: "What would improve your ability to deliver outcomes?", 
    category: "Outcomes & Measures" 
  },
  {
    id: "ba-out-3",
    type: "business-analyst",
    question: "Which outcomes matter most to stakeholders?",
    category: "Outcomes & Measures"
  },
  {
    id: "ba-out-4",
    type: "business-analyst",
    question: "Where do you feel outcomes are misaligned with reality?",
    category: "Outcomes & Measures"
  },

  // -------------------------
  // WORKFLOW BOTTLENECKS (BA)
  // -------------------------
  {
    id: "ba-workflow-1",
    type: "business-analyst",
    question: "Which workflow steps create the most friction for you?",
    category: "Workflow Bottlenecks"
  },
  {
    id: "ba-workflow-2",
    type: "business-analyst",
    question: "Where do handoffs typically break down?",
    category: "Workflow Bottlenecks"
  },
  {
    id: "ba-workflow-3",
    type: "business-analyst",
    question: "Which steps take longer than they should?",
    category: "Workflow Bottlenecks"
  },
  {
    id: "ba-workflow-4",
    type: "business-analyst",
    question: "Where do bottlenecks impact users the most?",
    category: "Workflow Bottlenecks"
  },

  // -------------------------
  // SERVICE QUALITY (BA)
  // -------------------------
  {
    id: "ba-quality-1",
    type: "business-analyst",
    question: "How do you assess the quality of the service you deliver?",
    category: "Service Quality"
  },
  {
    id: "ba-quality-2",
    type: "business-analyst",
    question: "What indicators tell you something is going wrong?",
    category: "Service Quality"
  },
  {
    id: "ba-quality-3",
    type: "business-analyst",
    question: "Where does quality vary the most?",
    category: "Service Quality"
  },
  {
    id: "ba-quality-4",
    type: "business-analyst",
    question: "What quality issues are hardest to detect early?",
    category: "Service Quality"
  },

  // -------------------------
  // DATA & REPORTING (BA)
  // -------------------------
  {
    id: "ba-data-1",
    type: "business-analyst",
    question: "Which reports or dashboards do you rely on most?",
    category: "Data & Reporting"
  },
  {
    id: "ba-data-2",
    type: "business-analyst",
    question: "Where does data quality impact your ability to work?",
    category: "Data & Reporting"
  },
  {
    id: "ba-data-3",
    type: "business-analyst",
    question: "Which data sources are most reliable?",
    category: "Data & Reporting"
  },
  {
    id: "ba-data-4",
    type: "business-analyst",
    question: "Where does missing data create blind spots?",
    category: "Data & Reporting"
  },

  // -------------------------
  // COMPLIANCE & GOVERNANCE (BA)
  // -------------------------
  {
    id: "ba-governance-1",
    type: "business-analyst",
    question: "Which compliance requirements affect your workflow?",
    category: "Compliance & Governance"
  },
  {
    id: "ba-governance-2",
    type: "business-analyst",
    question: "Where do governance rules create delays or confusion?",
    category: "Compliance & Governance"
  },
  {
    id: "ba-governance-3",
    type: "business-analyst",
    question: "Which governance steps feel unclear or overly complex?",
    category: "Compliance & Governance"
  },
  {
    id: "ba-governance-4",
    type: "business-analyst",
    question: "Where does compliance conflict with efficiency?",
    category: "Compliance & Governance"
  },

  // -------------------------
  // SCOPING & BOUNDARIES (BA + UR)
  // -------------------------
  {
    id: "ba-scope-1",
    type: "business-analyst",
    question: "What parts of the process are in scope for this work?",
    category: "Scoping & Boundaries"
  },
  {
    id: "ba-scope-2",
    type: "business-analyst",
    question: "Which areas are explicitly out of scope?",
    category: "Scoping & Boundaries"
  },
  {
    id: "ba-scope-3",
    type: "business-analyst",
    question: "What constraints or limitations shape the scope?",
    category: "Scoping & Boundaries"
  },
  {
    id: "ba-scope-4",
    type: "business-analyst",
    question: "Where does the scope feel unclear or contested?",
    category: "Scoping & Boundaries"
  },
  {
    id: "ur-scope-1",
    type: "user-researcher",
    question: "Which user groups are in scope for this research?",
    category: "Scoping & Boundaries"
  },
  {
    id: "ur-scope-2",
    type: "user-researcher",
    question: "Which user groups are out of scope, and why?",
    category: "Scoping & Boundaries"
  },
  {
    id: "ur-scope-3",
    type: "user-researcher",
    question: "What behaviours or touchpoints are we focusing on?",
    category: "Scoping & Boundaries"
  },
  {
    id: "ur-scope-4",
    type: "user-researcher",
    question: "What assumptions are shaping the scope of this research?",
    category: "Scoping & Boundaries"
  },
  {
    id: "scope-5",
    type: "business-analyst",
    question: "If the scope expanded slightly, what would be the first area you'd include?",
    category: "Scoping & Boundaries"
  },
  {
    id: "scope-6",
    type: "user-researcher",
    question: "Which out-of-scope behaviours still influence user outcomes?",
    category: "Scoping & Boundaries"
  },

  // -------------------------
  // USER GOALS (UR)
  // -------------------------
  { 
    id: "ur-goal-1", 
    type: "user-researcher", 
    question: "What are users trying to achieve when they use this service?", 
    category: "User Goals & Motivations" },
  { 
    id: "ur-goal-2", 
    type: "user-researcher", 
    question: "What does a successful experience look like from the user’s perspective?", 
    category: "User Goals & Motivations" },
  {
    id: "ur-goal-3",
    type: "user-researcher",
    question: "What motivates users to engage with the service?",
    category: "User Goals & Motivations"
  },
  {
    id: "ur-goal-4",
    type: "user-researcher",
    question: "Where do user goals conflict with organisational goals?",
    category: "User Goals & Motivations"
  },

  // -------------------------
  // USER BEHAVIOURS (UR)
  // -------------------------
  { 
    id: "ur-beh-1", 
    type: "user-researcher", 
    question: "How do users currently navigate the process?", 
    category: "User Behaviours" 
  },
  { 
    id: "ur-beh-2", 
    type: "user-researcher", 
    question: "Where do users hesitate, struggle, or drop off?", 
    category: "User Behaviours" 
  },
  {
    id: "ur-beh-3",
    type: "user-researcher",
    question: "What shortcuts or workarounds do users rely on?",
    category: "User Behaviours"
  },
  {
    id: "ur-beh-4",
    type: "user-researcher",
    question: "Which behaviours indicate confusion or uncertainty?",
    category: "User Behaviours"
  },
  // -------------------------
  // USER FRICTION (UR)
  // -------------------------
  { 
    id: "ur-fric-1", 
    type: "user-researcher", 
    question: "What frustrates users the most?", 
    category: "User Friction" },
  { 
    id: "ur-fric-2", 
    type: "user-researcher", 
    question: "Which steps feel confusing or unclear?", 
    category: "User Friction" },
  {
    id: "ur-fric-3",
    type: "user-researcher",
    question: "Where do users encounter unnecessary effort or repetition?",
    category: "User Friction"
  },
  {
    id: "ur-fric-4",
    type: "user-researcher",
    question: "Which parts of the service create emotional friction for users?",
    category: "User Friction"
  },

  // -------------------------
  // USER CONTEXT (UR)
  // -------------------------
  { 
    id: "ur-context-1", 
    type: "user-researcher", 
    question: "In what context do users interact with the service?", 
    category: "User Context" },
  { 
    id: "ur-context-2", 
    type: "user-researcher", 
    question: "What constraints or pressures affect their behaviour?", 
    category: "User Context" },
  {
    id: "ur-context-3",
    type: "user-researcher",
    question: "What environmental factors influence user decisions?",
    category: "User Context"
  },
  {
    id: "ur-context-4",
    type: "user-researcher",
    question: "How does a user’s situation change their expectations?",
    category: "User Context"
  },

  // -------------------------
  // USER NEEDS & OPPORTUNITIES (UR)
  // -------------------------
  { id: "ur-need-1", 
    type: "user-researcher", 
    question: "What unmet needs do users express?", 
    category: "User Needs & Opportunities" },
  { id: "ur-need-2", 
    type: "user-researcher", 
    question: "What improvements would make the biggest difference?", 
    category: "User Needs & Opportunities" },
  {
    id: "ur-need-3",
    type: "user-researcher",
    question: "Where do users feel the service falls short of expectations?",
    category: "User Needs & Opportunities"
  },
  {
    id: "ur-need-4",
    type: "user-researcher",
    question: "What opportunities exist to simplify or streamline the experience?",
    category: "User Needs & Opportunities"
  },

  // -------------------------
  // USER EMOTIONS (UR)
  // -------------------------
  {
    id: "ur-emotions-1",
    type: "user-researcher",
    question: "How do users feel at key moments in the journey?",
    category: "User Emotions"
  },
  {
    id: "ur-emotions-2",
    type: "user-researcher",
    question: "Where do users experience frustration or anxiety?",
    category: "User Emotions"
  },
  {
    id: "ur-emotions-3",
    type: "user-researcher",
    question: "Which moments create positive emotional impact?",
    category: "User Emotions"
  },
  {
    id: "ur-emotions-4",
    type: "user-researcher",
    question: "How do emotions influence user decision-making?",
    category: "User Emotions"
  },

  // -------------------------
  // ACCESSIBILITY & INCLUSION (UR)
  // -------------------------
  {
    id: "ur-access-1",
    type: "user-researcher",
    question: "What accessibility barriers do users encounter?",
    category: "Accessibility & Inclusion"
  },
  {
    id: "ur-access-2",
    type: "user-researcher",
    question: "Which user groups struggle most with the current design?",
    category: "Accessibility & Inclusion"
  },
  {
    id: "ur-access-3",
    type: "user-researcher",
    question: "Where does the service fail to meet accessibility expectations?",
    category: "Accessibility & Inclusion"
  },
  {
    id: "ur-access-4",
    type: "user-researcher",
    question: "How inclusive is the service for users with different backgrounds or abilities?",
    category: "Accessibility & Inclusion"
  },

  // -------------------------
  // FUTURE IMPROVEMENTS (UR)
  // -------------------------
  {
    id: "ur-future-1",
    type: "user-researcher",
    question: "What improvements would users value most?",
    category: "Future Improvements"
  },
  {
    id: "ur-future-2",
    type: "user-researcher",
    question: "Which unmet needs should we prioritise next?",
    category: "Future Improvements"
  },
  {
    id: "ur-future-3",
    type: "user-researcher",
    question: "What would an ideal version of this service look like?",
    category: "Future Improvements"
  },
  {
    id: "ur-future-4",
    type: "user-researcher",
    question: "Which improvements would have the biggest impact with minimal effort?",
    category: "Future Improvements"
  },

  // -------------------------
  // TEAM DYNAMICS (BA + UR)
  // -------------------------
  {
    id: "cross-team-1",
    type: "business-analyst",
    question: "Which teams do you rely on most, and how smooth are those interactions?",
    category: "Team Dynamics"
  },
  {
    id: "cross-team-2",
    type: "user-researcher",
    question: "Where do team dynamics impact the user experience?",
    category: "Team Dynamics"
  },
  {
    id: "cross-team-3",
    type: "business-analyst",
    question: "Where do team roles overlap or conflict?",
    category: "Team Dynamics"
  },
  {
    id: "cross-team-4",
    type: "user-researcher",
    question: "How do team relationships influence research outcomes?",
    category: "Team Dynamics"
  },

  // -------------------------
  // CLOSING REFLECTIONS (BA + UR)
  // -------------------------
  {
    id: "cross-close-1",
    type: "business-analyst",
    question: "If you could change one thing tomorrow, what would it be?",
    category: "Closing Reflections"
  },
  {
    id: "cross-close-2",
    type: "user-researcher",
    question: "What is the biggest insight you want stakeholders to understand?",
    category: "Closing Reflections"
  },
  {
    id: "cross-close-3",
    type: "business-analyst",
    question: "What should we keep an eye on as this work progresses?",
    category: "Closing Reflections"
  },
  {
    id: "cross-close-4",
    type: "user-researcher",
    question: "What assumptions should we revisit later?",
    category: "Closing Reflections"
  }
];
