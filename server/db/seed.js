import { config } from "../config.js";
import { diagnosticQuestions, getMasterySet } from "../domain/questions.js";
import { newId } from "../lib/id.js";
import { buildAssessmentReport } from "../agents/assessmentAgent.js";
import { buildDiagnosis } from "../agents/diagnosticAgent.js";
import { buildIntervention } from "../agents/learningDesignerAgent.js";
import { buildTutorResult } from "../agents/tutorAgent.js";
import { buildMasteryResult } from "../agents/masteryAgent.js";
import { buildTeacherInsight } from "../agents/teacherInsightAgent.js";

const clone = (value) => JSON.parse(JSON.stringify(value));

const learnerSeeds = [
  {
    id: "lrn_thabo",
    name: "Thabo Mokoena",
    grade: 9,
    subject: "Mathematics",
    topic: "Integers and introductory algebra",
    isDemo: true,
    accent: "mint",
  },
  {
    id: "lrn_sipho",
    name: "Sipho Ndlovu",
    grade: 9,
    subject: "Mathematics",
    topic: "Integers and introductory algebra",
    isDemo: false,
    accent: "sky",
  },
  {
    id: "lrn_lerato",
    name: "Lerato Dlamini",
    grade: 9,
    subject: "Mathematics",
    topic: "Integers and introductory algebra",
    isDemo: false,
    accent: "amber",
  },
];

function makeClock(startMs) {
  let cursor = startMs;
  return {
    now: () => new Date(cursor).toISOString(),
    advance: (ms) => {
      cursor += ms;
      return new Date(cursor).toISOString();
    },
  };
}

function event({ agent, status, message, summary = "", at, attempt = 1, durationMs = null }) {
  return {
    id: newId("evt"),
    agent,
    status,
    message,
    summary,
    attempt,
    at,
    durationMs,
    provider: "demo",
  };
}

function seedSession({
  id,
  learner,
  daysAgo,
  diagnosticAnswers,
  practiceAnswersByAttempt,
  masteryAnswersByAttempt,
}) {
  const clock = makeClock(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  const events = [];

  const questions = clone(diagnosticQuestions);
  const report = buildAssessmentReport({ questions, answers: diagnosticAnswers });
  const createdAt = clock.now();

  events.push(
    event({
      agent: "assessment",
      status: "started",
      message: "Analysing the submitted diagnostic answers.",
      at: createdAt,
    }),
  );
  const assessmentDone = clock.advance(1100);
  events.push(
    event({
      agent: "assessment",
      status: "completed",
      message: "Assessment analysed.",
      summary: `${report.correctAnswers}/${report.totalQuestions} correct · ${report.identifiedPatterns.length} pattern${
        report.identifiedPatterns.length === 1 ? "" : "s"
      } identified`,
      at: assessmentDone,
      durationMs: 1100,
    }),
  );

  const diagnosis = buildDiagnosis({ report });
  events.push(
    event({
      agent: "diagnostic",
      status: "started",
      message: "Looking for a prerequisite gap behind the errors.",
      at: clock.advance(120),
    }),
  );
  events.push(
    event({
      agent: "diagnostic",
      status: "completed",
      message: "Diagnostic hypothesis formed.",
      summary: `${diagnosis.suspectedGap} · ${Math.round(diagnosis.confidence * 100)}% confidence`,
      at: clock.advance(1000),
      durationMs: 1000,
    }),
  );

  events.push(
    event({
      agent: "designer",
      status: "started",
      message: "Designing a personalised intervention.",
      at: clock.advance(120),
    }),
  );
  const firstIntervention = buildIntervention({ gapKey: diagnosis.gapKey, attempt: 1 });
  events.push(
    event({
      agent: "designer",
      status: "completed",
      message: "Intervention ready.",
      summary: `${firstIntervention.workedExamples.length} worked examples · ${firstIntervention.practiceQuestions.length} practice questions`,
      at: clock.advance(1500),
      durationMs: 1500,
    }),
  );

  const attempts = [];

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const practiceAnswers = practiceAnswersByAttempt[attempt];
    const masteryAnswers = masteryAnswersByAttempt[attempt];
    if (!practiceAnswers || !masteryAnswers) break;

    events.push(
      event({
        agent: "tutor",
        status: "started",
        message:
          attempt === 1
            ? "Guiding the learner through the lesson and practice."
            : "Guiding practice with the adapted explanation.",
        at: clock.advance(120),
        attempt,
      }),
    );
    const intervention = buildIntervention({ gapKey: diagnosis.gapKey, attempt });
    const practiceStartedAt = clock.advance(200);
    clock.advance(22000);
    const practiceCompletedAt = clock.now();
    const practiceResult = buildTutorResult({ intervention, answers: practiceAnswers });
    events.push(
      event({
        agent: "tutor",
        status: "completed",
        message: "Practice session complete.",
        summary: `${practiceResult.correct}/${practiceResult.total} correct · feedback delivered`,
        at: practiceCompletedAt,
        attempt,
        durationMs: 22000,
      }),
    );

    events.push(
      event({
        agent: "mastery",
        status: "started",
        message: "Preparing a fresh follow-up assessment.",
        at: clock.advance(120),
        attempt,
      }),
    );
    const masteryQuestions = getMasterySet(diagnosis.gapKey, attempt).map((question) => ({
      ...question,
      hint: "Use the rule you practised: identify the operation, handle the signs, then check the size.",
    }));
    const masteryGeneratedAt = clock.advance(900);
    events.push(
      event({
        agent: "mastery",
        status: "completed",
        message: "Follow-up assessment prepared.",
        summary: `${masteryQuestions.length} new questions · ${config.masteryThreshold}% threshold`,
        at: masteryGeneratedAt,
        attempt,
        durationMs: 900,
      }),
    );

    events.push(
      event({
        agent: "mastery",
        status: "started",
        message: "Evaluating the follow-up answers against the threshold.",
        at: clock.advance(60000),
        attempt,
      }),
    );
    const masteryResult = buildMasteryResult({
      questions: masteryQuestions,
      answers: masteryAnswers,
      attempt,
      initialScore: report.scorePercent,
    });
    const masterySubmittedAt = clock.advance(1100);
    events.push(
      event({
        agent: "mastery",
        status: "completed",
        message: masteryResult.thresholdMet ? "Mastery demonstrated." : "Mastery threshold not yet met.",
        summary: `${masteryResult.correct}/${masteryResult.total} correct · ${masteryResult.scorePercent}%`,
        at: masterySubmittedAt,
        attempt,
        durationMs: 1100,
      }),
    );

    attempts.push({
      attempt,
      intervention,
      createdAt: practiceStartedAt,
      practice: {
        answers: practiceAnswers,
        startedAt: practiceStartedAt,
        completedAt: practiceCompletedAt,
        result: practiceResult,
      },
      mastery: {
        questions: masteryQuestions,
        generatedAt: masteryGeneratedAt,
        submittedAt: masterySubmittedAt,
        answers: masteryAnswers,
        result: masteryResult,
      },
      completedAt: masterySubmittedAt,
    });

    if (masteryResult.thresholdMet) break;

    const hasNextAttempt = Boolean(practiceAnswersByAttempt[attempt + 1]);
    if (!hasNextAttempt) break;

    events.push(
      event({
        agent: "designer",
        status: "started",
        message: "Adapting the intervention from the remaining difficulty.",
        at: clock.advance(120),
        attempt: attempt + 1,
      }),
    );
    const adapted = buildIntervention({ gapKey: diagnosis.gapKey, attempt: attempt + 1 });
    events.push(
      event({
        agent: "designer",
        status: "completed",
        message: "Adapted intervention ready.",
        summary: `${adapted.practiceQuestions.length} fresh practice questions · reduced steps`,
        at: clock.advance(1400),
        attempt: attempt + 1,
        durationMs: 1400,
      }),
    );
  }

  const session = {
    id,
    learnerId: learner.id,
    status: "complete",
    attempt: attempts.length,
    threshold: config.masteryThreshold,
    createdAt,
    updatedAt: clock.now(),
    lastActivityAt: clock.now(),
    diagnostic: {
      questions,
      answers: diagnosticAnswers,
      submittedAt: createdAt,
      report,
    },
    diagnosis,
    attempts,
    teacherInsight: null,
    events,
    error: null,
  };

  const passed = attempts[attempts.length - 1].mastery.result.thresholdMet;

  events.push(
    event({
      agent: "insight",
      status: "started",
      message: "Converting the completed cycle into a teacher summary.",
      at: clock.advance(120),
      attempt: attempts.length,
    }),
  );
  const insight = buildTeacherInsight({ learner, session });
  session.teacherInsight = insight;
  session.completedAt = clock.advance(900);
  session.updatedAt = session.completedAt;
  session.lastActivityAt = session.completedAt;
  events.push(
    event({
      agent: "insight",
      status: "completed",
      message: passed ? "Teacher insight ready." : "Teacher review recommended.",
      summary: insight.headline,
      at: session.completedAt,
      attempt: attempts.length,
      durationMs: 900,
    }),
  );

  return session;
}

export function buildSeedData() {
  const now = new Date().toISOString();
  const learners = learnerSeeds.map((learner) => ({ ...learner, createdAt: now }));

  const sipho = learners.find((learner) => learner.id === "lrn_sipho");
  const lerato = learners.find((learner) => learner.id === "lrn_lerato");

  const siphoSession = seedSession({
    id: "ses_sipho_demo",
    learner: sipho,
    daysAgo: 4,
    diagnosticAnswers: { d1: "-5", d2: "-3", d3: "3", d4: "6", d5: "3" },
    practiceAnswersByAttempt: {
      1: { p1a1: "-2", p1a2: "10", p1a3: "12" },
    },
    masteryAnswersByAttempt: {
      1: { m1a: "-3", m1b: "-4", m1c: "8", m1d: "8", m1e: "2" },
    },
  });

  const leratoSession = seedSession({
    id: "ses_lerato_demo",
    learner: lerato,
    daysAgo: 2,
    diagnosticAnswers: { d1: "-1", d2: "-3", d3: "3", d4: "-6", d5: "3" },
    practiceAnswersByAttempt: {
      1: { p1a1: "-2", p1a2: "-2", p1a3: "12" },
      2: { p1b1: "-3", p1b2: "-5", p1b3: "10" },
    },
    masteryAnswersByAttempt: {
      1: { m1a: "-3", m1b: "-8", m1c: "8", m1d: "8", m1e: "-2" },
      2: { m2a: "3", m2b: "-6", m2c: "8", m2d: "-12", m2e: "-2" },
    },
  });

  return {
    meta: {
      version: 1,
      seededAt: now,
      updatedAt: now,
      resetCount: 0,
      app: "MASTERY",
    },
    learners,
    sessions: [siphoSession, leratoSession],
  };
}
