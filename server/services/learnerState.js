import { demoMasteryAnswers, demoDiagnosticAnswers } from "../domain/questions.js";

export const ACTIVE_STATUSES = ["diagnostic", "analyzing", "learning", "mastery", "retry", "error"];

export const STATUS_LABELS = {
  not_started: "Not started",
  diagnostic: "Diagnostic ready",
  analyzing: "Agents analysing",
  learning: "In intervention",
  retry: "Adapted lesson ready",
  mastery: "Mastery check",
  complete_pass: "Recovered",
  complete_support: "Needs support",
  error: "Needs attention",
  abandoned: "Restarted",
};

export function statusFromSession(session) {
  if (!session) return "not_started";
  if (session.status === "complete") {
    const lastAttempt = session.attempts[session.attempts.length - 1];
    return lastAttempt?.mastery?.result?.thresholdMet ? "complete_pass" : "complete_support";
  }
  return session.status;
}

export function progressPercentFor(session) {
  if (!session) return 0;
  if (session.status === "complete") return 100;
  if (["diagnostic"].includes(session.status)) return session.diagnostic?.answers && Object.keys(session.diagnostic.answers).length > 0 ? 18 : 8;
  if (session.status === "analyzing") return 30;
  if (session.status === "learning") {
    const attempt = session.attempts[session.attempts.length - 1];
    const answers = attempt ? Object.keys(attempt.practice?.answers || {}).length : 0;
    return Math.min(64, 42 + answers * 6);
  }
  if (session.status === "retry") return 55;
  if (session.status === "mastery") return 72;
  if (session.status === "error") return 25;
  if (session.status === "abandoned") return 0;
  return 10;
}

export function buildLearnerState(learner, sessions) {
  const ordered = [...sessions]
    .filter((session) => session.status !== "abandoned")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const active = ordered.find((session) => ACTIVE_STATUSES.includes(session.status)) || null;
  const latest = active || ordered[0] || null;
  const statusKey = statusFromSession(latest);
  const lastAttempt = latest?.attempts?.[latest.attempts.length - 1] || null;

  return {
    id: learner.id,
    name: learner.name,
    grade: learner.grade,
    subject: learner.subject,
    topic: learner.topic,
    isDemo: Boolean(learner.isDemo),
    accent: learner.accent || "mint",
    status: statusKey,
    statusLabel: STATUS_LABELS[statusKey] || statusKey,
    progressPercent: progressPercentFor(latest),
    initialScore: latest?.diagnostic?.report?.scorePercent ?? null,
    initialCorrect: latest?.diagnostic?.report?.correctAnswers ?? null,
    latestScore: lastAttempt?.mastery?.result?.scorePercent ?? null,
    gap: latest?.diagnosis?.suspectedGap ?? null,
    gapConfidence: latest?.diagnosis?.confidence ?? null,
    masteryMet: lastAttempt?.mastery?.result?.thresholdMet ?? null,
    attemptsUsed: latest?.attempts?.length ?? 0,
    activeSessionId: active?.id ?? null,
    latestSessionId: latest?.id ?? null,
    completedCycles: ordered.filter((session) => session.status === "complete").length,
    lastActivityAt: latest?.lastActivityAt || latest?.updatedAt || null,
    passedCycle: latest?.status === "complete" ? Boolean(lastAttempt?.mastery?.result?.thresholdMet) : null,
  };
}

export function demoDiagnosticAnswerFor(questionId) {
  return demoDiagnosticAnswers[questionId] || undefined;
}

export function demoMasteryAnswerFor(gapKey, attempt, questionId) {
  return demoMasteryAnswers[gapKey]?.[attempt]?.[questionId] || undefined;
}
