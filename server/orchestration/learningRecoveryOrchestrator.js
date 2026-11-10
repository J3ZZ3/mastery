import { config } from "../config.js";
import { getDb, findLearner, findSession, replaceSession } from "../db/store.js";
import { diagnosticQuestions } from "../domain/questions.js";
import { newId, nowIso } from "../lib/id.js";
import { AppError } from "../lib/errors.js";
import { getAiProvider } from "../providers/index.js";
import { runAssessmentAgent } from "../agents/assessmentAgent.js";
import { runDiagnosticAgent } from "../agents/diagnosticAgent.js";
import { runLearningDesignerAgent } from "../agents/learningDesignerAgent.js";
import { runTutorAgent, checkPracticeAnswer } from "../agents/tutorAgent.js";
import { runMasteryQuestionsAgent, runMasteryEvaluationAgent } from "../agents/masteryAgent.js";
import { runTeacherInsightAgent } from "../agents/teacherInsightAgent.js";
import { publishSessionEvent } from "./eventBus.js";
import { ACTIVE_STATUSES, demoDiagnosticAnswerFor, demoMasteryAnswerFor } from "../services/learnerState.js";

const ai = getAiProvider();
const latency = config.demoDelayMs;

async function recordEvent(session, { agent, status, message, summary = "", attempt = session.attempt, durationMs = null, provider = null }) {
  const at = nowIso();
  const event = {
    id: newId("evt"),
    agent,
    status,
    message,
    summary,
    attempt,
    at,
    durationMs,
    provider,
  };

  session.events.push(event);
  session.updatedAt = at;
  session.lastActivityAt = at;

  await replaceSession(session);
  publishSessionEvent(session.id, event);
  return event;
}

async function trackAgent({
  session,
  agent,
  attempt,
  startMessage,
  run,
  onData,
  completedMessage,
  summary,
}) {
  const startedAt = Date.now();
  await recordEvent(session, { agent, status: "started", message: startMessage, attempt });

  try {
    const result = await run();
    onData(result.data);
    const durationMs = Date.now() - startedAt;
    await recordEvent(session, {
      agent,
      status: "completed",
      message: typeof completedMessage === "function" ? completedMessage(result.data) : completedMessage,
      summary: summary(result.data),
      attempt,
      durationMs,
      provider: result.meta?.provider || null,
    });
    return result;
  } catch (error) {
    await recordEvent(session, {
      agent,
      status: "failed",
      message: "Agent could not complete this step.",
      summary: error.message,
      attempt,
      durationMs: Date.now() - startedAt,
    });
    throw error;
  }
}

async function markError(session, error) {
  session.status = "error";
  session.error = error.message;
  session.updatedAt = nowIso();
  await replaceSession(session);
}

const assessmentSummary = (data) =>
  `${data.correctAnswers}/${data.totalQuestions} correct · ${data.identifiedPatterns.length} pattern${
    data.identifiedPatterns.length === 1 ? "" : "s"
  } identified`;
const diagnosisSummary = (data) => `${data.suspectedGap} · ${Math.round(data.confidence * 100)}% confidence`;
const designSummary = (data) =>
  `${data.workedExamples.length} worked examples · ${data.practiceQuestions.length} practice questions${data.adapted ? " · adapted" : ""}`;
const tutorSummary = (data) => `${data.correct}/${data.total} correct · feedback delivered`;
const masteryQuestionsSummary = (data) => `${data.questions.length} new questions · ${data.threshold}% threshold`;
const masteryResultSummary = (data) =>
  `${data.correct}/${data.total} correct · ${data.scorePercent}% · ${data.thresholdMet ? "threshold met" : "threshold not met"}`;
const insightSummary = (data) => data.headline;

function buildAttempt(attemptNumber, intervention) {
  return {
    attempt: attemptNumber,
    intervention,
    createdAt: nowIso(),
    practice: {
      answers: {},
      startedAt: null,
      completedAt: null,
      result: null,
    },
    mastery: null,
    completedAt: null,
  };
}

function validateAllAnswered(questions, answers, label) {
  const missing = questions.filter((question) => !String(answers[question.id] ?? "").trim()).map((question) => question.prompt);
  if (missing.length > 0) {
    throw new AppError(400, `Please answer every ${label} question before submitting.`, { missing });
  }
}

export async function createLearningSession({ learnerId, restart = false }) {
  const learner = await findLearner(learnerId);
  if (!learner) {
    throw new AppError(404, "Learner not found.");
  }

  const db = await getDb();
  const sessions = db.sessions.filter((session) => session.learnerId === learnerId);
  const active = sessions.find((session) => ACTIVE_STATUSES.includes(session.status));

  if (active && !restart) {
    return { session: active, learner, resumed: true };
  }

  if (active && restart) {
    active.status = "abandoned";
    active.updatedAt = nowIso();
    await replaceSession(active);
  }

  const demoMode = Boolean(learner.isDemo);
  const questions = diagnosticQuestions.map((question) => ({
    ...question,
    ...(demoMode ? { demoAnswer: demoDiagnosticAnswerFor(question.id) } : {}),
  }));

  const now = nowIso();
  const session = {
    id: newId("ses"),
    learnerId,
    status: "diagnostic",
    attempt: 0,
    threshold: config.masteryThreshold,
    demoMode,
    createdAt: now,
    updatedAt: now,
    lastActivityAt: now,
    completedAt: null,
    diagnostic: {
      questions,
      answers: {},
      submittedAt: null,
      report: null,
    },
    diagnosis: null,
    attempts: [],
    teacherInsight: null,
    events: [],
    error: null,
  };

  await replaceSession(session);
  return { session, learner, resumed: false };
}

export async function submitDiagnostic(sessionId, answers) {
  const session = await findSession(sessionId);
  if (!session) throw new AppError(404, "Learning session not found.");
  if (session.diagnostic.report) return session;
  if (session.status !== "diagnostic") {
    throw new AppError(409, "This diagnostic has already been submitted.");
  }

  validateAllAnswered(session.diagnostic.questions, answers, "diagnostic");

  session.diagnostic.answers = answers;
  session.diagnostic.submittedAt = nowIso();
  session.status = "analyzing";
  session.updatedAt = nowIso();
  await replaceSession(session);

  try {
    await trackAgent({
      session,
      agent: "assessment",
      attempt: 1,
      startMessage: "Analysing the submitted diagnostic answers.",
      run: () =>
        runAssessmentAgent({
          questions: session.diagnostic.questions,
          answers,
          ai,
          latencyMs: latency,
        }),
      onData: (data) => {
        session.diagnostic.report = data;
      },
      completedMessage: "Assessment analysed.",
      summary: assessmentSummary,
    });

    await trackAgent({
      session,
      agent: "diagnostic",
      attempt: 1,
      startMessage: "Looking for a prerequisite gap behind the errors.",
      run: () =>
        runDiagnosticAgent({
          report: session.diagnostic.report,
          ai,
          latencyMs: latency,
        }),
      onData: (data) => {
        session.diagnosis = data;
      },
      completedMessage: "Diagnostic hypothesis formed.",
      summary: diagnosisSummary,
    });

    await trackAgent({
      session,
      agent: "designer",
      attempt: 1,
      startMessage: "Designing a personalised intervention.",
      run: () =>
        runLearningDesignerAgent({
          diagnosis: session.diagnosis,
          attempt: 1,
          ai,
          latencyMs: latency,
        }),
      onData: (data) => {
        session.attempts = [buildAttempt(1, data)];
        session.attempt = 1;
      },
      completedMessage: "Intervention ready.",
      summary: designSummary,
    });

    session.status = "learning";
    session.updatedAt = nowIso();
    await replaceSession(session);
    return session;
  } catch (error) {
    await markError(session, error);
    throw error;
  }
}

export async function checkPractice(sessionId, { questionId, answer }) {
  const session = await findSession(sessionId);
  if (!session) throw new AppError(404, "Learning session not found.");
  if (!["learning", "retry"].includes(session.status)) {
    throw new AppError(409, "Practice is not open for this session.");
  }

  const attempt = session.attempts[session.attempts.length - 1];
  if (!attempt) throw new AppError(409, "No active attempt found.");

  const question = attempt.intervention.practiceQuestions.find((item) => item.id === questionId);
  if (!question) throw new AppError(404, "Practice question not found.");
  if (attempt.practice.result) throw new AppError(409, "This practice set has already been submitted.");

  if (!attempt.practice.startedAt) {
    attempt.practice.startedAt = nowIso();
    await recordEvent(session, {
      agent: "tutor",
      status: "started",
      message: "Guiding the learner through the lesson and practice.",
      attempt: attempt.attempt,
    });
  }

  attempt.practice.answers[questionId] = answer;
  const check = checkPracticeAnswer({ question, answer });

  await recordEvent(session, {
    agent: "tutor",
    status: "progress",
    message: `Checked practice item ${question.id.toUpperCase()}.`,
    summary: check.correct ? "Correct · feedback delivered" : "Incorrect · hint offered",
    attempt: attempt.attempt,
  });

  return {
    check,
    answeredCount: Object.keys(attempt.practice.answers).length,
    total: attempt.intervention.practiceQuestions.length,
  };
}

export async function submitPractice(sessionId, answers) {
  const session = await findSession(sessionId);
  if (!session) throw new AppError(404, "Learning session not found.");
  if (!["learning", "retry"].includes(session.status)) {
    throw new AppError(409, "Practice is not open for this session.");
  }

  const attempt = session.attempts[session.attempts.length - 1];
  if (!attempt) throw new AppError(409, "No active attempt found.");
  if (attempt.practice.result) return session;

  validateAllAnswered(attempt.intervention.practiceQuestions, answers, "practice");
  attempt.practice.answers = { ...attempt.practice.answers, ...answers };

  if (!attempt.practice.startedAt) {
    attempt.practice.startedAt = nowIso();
    await recordEvent(session, {
      agent: "tutor",
      status: "started",
      message: "Guiding the learner through the lesson and practice.",
      attempt: attempt.attempt,
    });
  }

  try {
    await trackAgent({
      session,
      agent: "tutor",
      attempt: attempt.attempt,
      startMessage: "Reviewing the completed practice set.",
      run: () =>
        runTutorAgent({
          intervention: attempt.intervention,
          answers: attempt.practice.answers,
          ai,
          latencyMs: latency,
        }),
      onData: (data) => {
        attempt.practice.result = data;
        attempt.practice.completedAt = nowIso();
      },
      completedMessage: "Practice session complete.",
      summary: tutorSummary,
    });

    await trackAgent({
      session,
      agent: "mastery",
      attempt: attempt.attempt,
      startMessage: "Preparing a fresh follow-up assessment.",
      run: () =>
        runMasteryQuestionsAgent({
          gapKey: session.diagnosis.gapKey,
          attempt: attempt.attempt,
          ai,
          latencyMs: latency,
        }),
      onData: (data) => {
        attempt.mastery = {
          questions: data.questions.map((question) => ({
            ...question,
            ...(session.demoMode
              ? { demoAnswer: demoMasteryAnswerFor(session.diagnosis.gapKey, attempt.attempt, question.id) }
              : {}),
          })),
          generatedAt: nowIso(),
          submittedAt: null,
          answers: {},
          result: null,
        };
        session.threshold = data.threshold;
      },
      completedMessage: "Follow-up assessment prepared.",
      summary: masteryQuestionsSummary,
    });

    session.status = "mastery";
    session.updatedAt = nowIso();
    await replaceSession(session);
    return session;
  } catch (error) {
    await markError(session, error);
    throw error;
  }
}

export async function submitMastery(sessionId, answers) {
  const session = await findSession(sessionId);
  if (!session) throw new AppError(404, "Learning session not found.");
  if (session.status !== "mastery") {
    throw new AppError(409, "The mastery assessment is not open for this session.");
  }

  const attempt = session.attempts[session.attempts.length - 1];
  if (!attempt?.mastery) throw new AppError(409, "No mastery assessment has been prepared.");
  if (attempt.mastery.result) return session;

  validateAllAnswered(attempt.mastery.questions, answers, "mastery");

  attempt.mastery.answers = answers;
  attempt.mastery.submittedAt = nowIso();

  try {
    let masteryResult;
    await trackAgent({
      session,
      agent: "mastery",
      attempt: attempt.attempt,
      startMessage: "Evaluating the follow-up answers against the threshold.",
      run: () =>
        runMasteryEvaluationAgent({
          questions: attempt.mastery.questions,
          answers,
          attempt: attempt.attempt,
          initialScore: session.diagnostic.report.scorePercent,
          ai,
          latencyMs: latency,
        }),
      onData: (data) => {
        masteryResult = data;
        attempt.mastery.result = data;
        attempt.completedAt = nowIso();
      },
      completedMessage: (data) => (data.thresholdMet ? "Mastery demonstrated." : "Mastery threshold not yet met."),
      summary: masteryResultSummary,
    });

    const learner = await findLearner(session.learnerId);
    const passed = Boolean(masteryResult?.thresholdMet);
    const exhausted = attempt.attempt >= config.maxAttempts;

    if (passed || exhausted) {
      await trackAgent({
        session,
        agent: "insight",
        attempt: attempt.attempt,
        startMessage: "Converting the completed cycle into a teacher summary.",
        run: () =>
          runTeacherInsightAgent({
            learner: learner || { name: "The learner" },
            session,
            ai,
            latencyMs: latency,
          }),
        onData: (data) => {
          session.teacherInsight = data;
        },
        completedMessage: passed ? "Teacher insight ready." : "Teacher review recommended.",
        summary: insightSummary,
      });

      session.status = "complete";
      session.completedAt = nowIso();
    } else {
      const nextAttempt = attempt.attempt + 1;
      await trackAgent({
        session,
        agent: "designer",
        attempt: nextAttempt,
        startMessage: "Adapting the intervention from the remaining difficulty.",
        run: () =>
          runLearningDesignerAgent({
            diagnosis: session.diagnosis,
            attempt: nextAttempt,
            ai,
            latencyMs: latency,
            remainingDifficulty: masteryResult.remainingDifficulty,
          }),
        onData: (data) => {
          const newAttempt = buildAttempt(nextAttempt, data);
          session.attempts.push(newAttempt);
          session.attempt = nextAttempt;
        },
        completedMessage: "Adapted intervention ready.",
        summary: designSummary,
      });

      session.status = "retry";
    }

    session.updatedAt = nowIso();
    session.lastActivityAt = nowIso();
    await replaceSession(session);
    return session;
  } catch (error) {
    await markError(session, error);
    throw error;
  }
}

export function getActiveAttempt(session) {
  return session.attempts[session.attempts.length - 1] || null;
}
