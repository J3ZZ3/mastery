export const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const TIME_FORMAT = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });

export const formatDate = (iso) => {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return DATE_FORMAT.format(date);
};

export const formatDateTime = (iso) => {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return `${DATE_FORMAT.format(date)} · ${TIME_FORMAT.format(date)}`;
};

export const relativeTime = (iso) => {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const abs = Math.abs(seconds);

  if (abs < 60) return "Just now";
  if (abs < 3600) return formatter.format(Math.round(seconds / 60), "minute");
  if (abs < 86400) return formatter.format(Math.round(seconds / 3600), "hour");
  if (abs < 604800) return formatter.format(Math.round(seconds / 86400), "day");
  return formatDate(iso);
};

export const percent = (value) => (Number.isFinite(value) ? `${Math.round(value)}%` : "—");

export const signedPoints = (value) => {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0 pts";
  return `${value > 0 ? "+" : ""}${Math.round(value)} pts`;
};

export const lastAttempt = (session) => {
  if (!session?.attempts?.length) return null;
  return session.attempts[session.attempts.length - 1];
};

export const workflowPhase = (session) => {
  if (!session) return { key: "diagnostic", index: 0 };
  if (session.status === "diagnostic") return { key: "diagnostic", index: 0 };
  if (session.status === "analyzing") return { key: "diagnosis", index: 1 };
  if (session.status === "learning" || session.status === "retry") {
    const attempt = lastAttempt(session);
    const started = attempt?.practice?.startedAt;
    return started ? { key: "practice", index: 3 } : { key: "lesson", index: 2 };
  }
  if (session.status === "mastery") return { key: "mastery", index: 4 };
  if (session.status === "complete") return { key: "result", index: 5 };
  if (session.status === "error") return { key: "diagnosis", index: 1 };
  return { key: "diagnostic", index: 0 };
};

export const answeredCount = (questions = [], answers = {}) =>
  questions.filter((question) => String(answers[question.id] ?? "").trim()).length;
