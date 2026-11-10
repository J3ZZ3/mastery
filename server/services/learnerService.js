import { getDb } from "../db/store.js";
import { serializeSession, sessionSummary } from "./serialize.js";
import { ACTIVE_STATUSES, buildLearnerState } from "./learnerState.js";

export async function listLearners() {
  const db = await getDb();
  return db.learners.map((learner) =>
    buildLearnerState(
      learner,
      db.sessions.filter((session) => session.learnerId === learner.id),
    ),
  );
}

export async function getLearnerProgress(learnerId) {
  const db = await getDb();
  const learner = db.learners.find((item) => item.id === learnerId);
  if (!learner) return null;

  const sessions = db.sessions
    .filter((session) => session.learnerId === learnerId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const active = sessions.find((session) => ACTIVE_STATUSES.includes(session.status)) || null;
  const latest = active || sessions[0] || null;

  return {
    learner: buildLearnerState(learner, sessions),
    currentSession: serializeSession(latest),
    activeSession: serializeSession(active),
    sessions: sessions.map(sessionSummary),
  };
}

export async function getLearnerState(learnerId) {
  const db = await getDb();
  const learner = db.learners.find((item) => item.id === learnerId);
  if (!learner) return null;
  return buildLearnerState(
    learner,
    db.sessions.filter((session) => session.learnerId === learnerId),
  );
}
