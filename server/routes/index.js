import { Router } from "express";
import { findSession, resetDb, getDb } from "../db/store.js";
import { AppError } from "../lib/errors.js";
import { requestSchemas } from "../validation/schemas.js";
import { providerStatus } from "../providers/index.js";
import { config } from "../config.js";
import {
  createLearningSession,
  submitDiagnostic,
  checkPractice,
  submitPractice,
  submitMastery,
} from "../orchestration/learningRecoveryOrchestrator.js";
import { subscribeToSession } from "../orchestration/eventBus.js";
import { listLearners, getLearnerProgress, getLearnerState } from "../services/learnerService.js";
import { getTeacherOverview, getTeacherLearners, getTeacherLearner, getActivity } from "../services/teacherService.js";
import { serializeSession } from "../services/serialize.js";

export const apiRouter = Router();

const parseBody = (schema, body, label) => {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new AppError(
      400,
      `Invalid ${label} request.`,
      result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    );
  }
  return result.data;
};

const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

apiRouter.get(
  "/health",
  asyncRoute(async (_req, res) => {
    const db = await getDb();
    res.json({
      status: "ok",
      app: "MASTERY",
      provider: providerStatus(),
      threshold: config.masteryThreshold,
      maxAttempts: config.maxAttempts,
      learners: db.learners.length,
      sessions: db.sessions.length,
      seededAt: db.meta.seededAt,
      time: new Date().toISOString(),
    });
  }),
);

apiRouter.get(
  "/learners",
  asyncRoute(async (_req, res) => {
    res.json({ learners: await listLearners() });
  }),
);

apiRouter.get(
  "/learners/:id/progress",
  asyncRoute(async (req, res) => {
    const progress = await getLearnerProgress(req.params.id);
    if (!progress) throw new AppError(404, "Learner not found.");
    res.json(progress);
  }),
);

apiRouter.post(
  "/learning-sessions",
  asyncRoute(async (req, res) => {
    const body = parseBody(requestSchemas.createSession, req.body, "session");
    const { session, resumed } = await createLearningSession(body);
    res.status(201).json({
      session: serializeSession(session),
      resumed,
      learner: await getLearnerState(session.learnerId),
    });
  }),
);

apiRouter.get(
  "/learning-sessions/:id",
  asyncRoute(async (req, res) => {
    const session = await findSession(req.params.id);
    if (!session) throw new AppError(404, "Learning session not found.");
    res.json({
      session: serializeSession(session),
      learner: await getLearnerState(session.learnerId),
    });
  }),
);

apiRouter.get("/learning-sessions/:id/events", async (req, res, next) => {
  try {
    const session = await findSession(req.params.id);
    if (!session) throw new AppError(404, "Learning session not found.");

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });

    res.write("retry: 3000\n\n");
    res.write(
      `event: snapshot\ndata: ${JSON.stringify({
        sessionId: session.id,
        sessionStatus: session.status,
        events: [...session.events].sort((a, b) => new Date(a.at) - new Date(b.at)),
      })}\n\n`,
    );

    const unsubscribe = subscribeToSession(session.id, (event) => {
      res.write(`event: agent-event\ndata: ${JSON.stringify(event)}\n\n`);
    });

    const keepAlive = setInterval(() => {
      res.write(": keep-alive\n\n");
    }, 15000);

    req.on("close", () => {
      clearInterval(keepAlive);
      unsubscribe();
      res.end();
    });
  } catch (error) {
    next(error);
  }
});

apiRouter.post(
  "/learning-sessions/:id/diagnostic",
  asyncRoute(async (req, res) => {
    const body = parseBody(requestSchemas.diagnostic, req.body, "diagnostic");
    const session = await submitDiagnostic(req.params.id, body.answers);
    res.json({ session: serializeSession(session) });
  }),
);

apiRouter.post(
  "/learning-sessions/:id/practice/check",
  asyncRoute(async (req, res) => {
    const body = parseBody(requestSchemas.practiceCheck, req.body, "practice check");
    const result = await checkPractice(req.params.id, body);
    res.json(result);
  }),
);

apiRouter.post(
  "/learning-sessions/:id/practice",
  asyncRoute(async (req, res) => {
    const body = parseBody(requestSchemas.practice, req.body, "practice");
    const session = await submitPractice(req.params.id, body.answers);
    res.json({ session: serializeSession(session) });
  }),
);

apiRouter.post(
  "/learning-sessions/:id/mastery",
  asyncRoute(async (req, res) => {
    const body = parseBody(requestSchemas.mastery, req.body, "mastery");
    const session = await submitMastery(req.params.id, body.answers);
    res.json({ session: serializeSession(session) });
  }),
);

apiRouter.get(
  "/teacher/overview",
  asyncRoute(async (_req, res) => {
    const overview = await getTeacherOverview();
    res.json({ ...overview, provider: providerStatus(), threshold: config.masteryThreshold });
  }),
);

apiRouter.get(
  "/teacher/learners",
  asyncRoute(async (_req, res) => {
    res.json({ learners: await getTeacherLearners() });
  }),
);

apiRouter.get(
  "/teacher/learners/:id",
  asyncRoute(async (req, res) => {
    const detail = await getTeacherLearner(req.params.id);
    if (!detail) throw new AppError(404, "Learner not found.");
    res.json(detail);
  }),
);

apiRouter.get(
  "/activity",
  asyncRoute(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 80, 200);
    res.json({ events: await getActivity(limit), provider: providerStatus() });
  }),
);

apiRouter.post(
  "/demo/reset",
  asyncRoute(async (_req, res) => {
    const db = await resetDb();
    res.json({
      ok: true,
      seededAt: db.meta.seededAt,
      learners: db.learners,
      sessions: db.sessions.length,
    });
  }),
);
