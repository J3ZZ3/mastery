import { getDb } from "../db/store.js";
import { serializeSession, sessionSummary } from "./serialize.js";
import { ACTIVE_STATUSES, buildLearnerState } from "./learnerState.js";

export async function buildActivityFeed(limit = 60) {
  const db = await getDb();
  const learnerById = new Map(db.learners.map((learner) => [learner.id, learner]));
  const items = [];

  for (const session of db.sessions) {
    const learner = learnerById.get(session.learnerId);
    for (const event of session.events) {
      items.push({
        ...event,
        sessionId: session.id,
        sessionStatus: session.status,
        learnerId: session.learnerId,
        learnerName: learner?.name || "Unknown learner",
        isDemo: Boolean(learner?.isDemo),
      });
    }
  }

  return items
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, limit);
}

export async function getTeacherOverview() {
  const db = await getDb();
  const rows = db.learners.map((learner) =>
    buildLearnerState(
      learner,
      db.sessions.filter((session) => session.learnerId === learner.id),
    ),
  );

  const completed = db.sessions.filter((session) => session.status === "complete");
  const completedPassed = completed.filter((session) => {
    const lastAttempt = session.attempts[session.attempts.length - 1];
    return Boolean(lastAttempt?.mastery?.result?.thresholdMet);
  });

  return {
    stats: {
      totalLearners: rows.length,
      requiringSupport: rows.filter((row) => ["complete_support", "retry", "error"].includes(row.status)).length,
      improving: rows.filter((row) => row.status === "complete_pass").length,
      completedCycles: completed.length,
      activeCycles: db.sessions.filter((session) => ACTIVE_STATUSES.includes(session.status)).length,
      masteryRecovery: completed.length ? Math.round((completedPassed.length / completed.length) * 100) : 0,
    },
    learners: rows,
    recentEvents: await buildActivityFeed(14),
  };
}

export async function getTeacherLearners() {
  const overview = await getTeacherOverview();
  return overview.learners;
}

export async function getTeacherLearner(learnerId) {
  const db = await getDb();
  const learner = db.learners.find((item) => item.id === learnerId);
  if (!learner) return null;

  const sessions = db.sessions
    .filter((session) => session.learnerId === learnerId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const state = buildLearnerState(learner, sessions);
  const latest = sessions[0] || null;

  return {
    learner: state,
    latestSessionId: state.latestSessionId,
    sessions: sessions.map((session) => ({
      summary: sessionSummary(session),
      session: serializeSession(session),
    })),
    currentSession: latest ? serializeSession(latest) : null,
  };
}

export async function getActivity(limit = 80) {
  return buildActivityFeed(limit);
}
