import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  MessageSquare,
  SearchCheck,
  Target,
} from "lucide-react";

export const AGENTS = [
  {
    key: "assessment",
    name: "Assessment Agent",
    short: "Assessment",
    description: "Evaluates each answer and finds recurring error patterns.",
    icon: ClipboardList,
  },
  {
    key: "diagnostic",
    name: "Diagnostic Agent",
    short: "Diagnostic",
    description: "Tests hypotheses about the prerequisite gap behind the errors.",
    icon: SearchCheck,
  },
  {
    key: "designer",
    name: "Learning Designer",
    short: "Designer",
    description: "Builds a personalised lesson, worked examples and practice.",
    icon: BookOpen,
  },
  {
    key: "tutor",
    name: "Tutor Agent",
    short: "Tutor",
    description: "Guides practice with hints and feedback as the learner works.",
    icon: MessageSquare,
  },
  {
    key: "mastery",
    name: "Mastery Agent",
    short: "Mastery",
    description: "Checks understanding with fresh questions against the threshold.",
    icon: Target,
  },
  {
    key: "insight",
    name: "Teacher Insight Agent",
    short: "Insight",
    description: "Turns the evidence into a concise teacher summary and next step.",
    icon: GraduationCap,
  },
];

export const AGENT_BY_KEY = Object.fromEntries(AGENTS.map((agent) => [agent.key, agent]));

export const WORKFLOW_STEPS = [
  { key: "diagnostic", label: "Diagnostic" },
  { key: "diagnosis", label: "Diagnosis" },
  { key: "lesson", label: "Lesson" },
  { key: "practice", label: "Practice" },
  { key: "mastery", label: "Mastery" },
  { key: "result", label: "Result" },
];

export const TONE_CLASS = {
  mint: "bg-mint-50 text-mint-800 ring-mint-200",
  sky: "bg-sky-50 text-sky-800 ring-sky-200",
  amber: "bg-amber-50 text-amber-900 ring-amber-200",
  rose: "bg-rose-50 text-rose-800 ring-rose-200",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  ink: "bg-ink-950 text-white ring-ink-800",
};

export const STATUS_META = {
  not_started: { label: "Not started", tone: "slate" },
  diagnostic: { label: "Diagnostic ready", tone: "sky" },
  analyzing: { label: "Agents analysing", tone: "sky" },
  learning: { label: "In intervention", tone: "mint" },
  retry: { label: "Adapted lesson ready", tone: "amber" },
  mastery: { label: "Mastery check", tone: "sky" },
  complete_pass: { label: "Recovered", tone: "mint" },
  complete_support: { label: "Needs support", tone: "amber" },
  error: { label: "Needs attention", tone: "rose" },
  abandoned: { label: "Restarted", tone: "slate" },
};

export const AGENT_STATE_META = {
  waiting: { label: "Waiting", tone: "slate" },
  next: { label: "Up next", tone: "sky" },
  active: { label: "Working", tone: "mint" },
  complete: { label: "Completed", tone: "mint" },
  failed: { label: "Failed", tone: "rose" },
};

export const SESSION_STATUS_COPY = {
  diagnostic: "Diagnostic ready",
  analyzing: "Your agents are analysing the evidence",
  learning: "Personalised intervention ready",
  retry: "Adapted intervention ready",
  mastery: "Follow-up mastery check",
  complete: "Recovery cycle complete",
  error: "A step needs attention",
};

export const GAP_COPY = {
  negative_operations: "Negative number operations",
  integer_multiplication: "Integer multiplication signs",
  algebra_integers: "Solving equations with integers",
  surface_errors: "Isolated calculation slips",
  secure: "Secure integer foundations",
};

export const SKILL_LABELS = {
  integer_addition: "Adding integers",
  integer_subtraction: "Subtracting integers",
  double_negative: "Subtracting a negative",
  integer_multiplication: "Multiplying integers",
  algebra_integers: "Equations with integers",
};

export const skillLabel = (key) => SKILL_LABELS[key] || key;

export const AGENT_STATUS_META = {
  started: { label: "Working", tone: "sky" },
  progress: { label: "Checked", tone: "slate" },
  completed: { label: "Completed", tone: "mint" },
  failed: { label: "Failed", tone: "rose" },
};
