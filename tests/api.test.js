import test from "node:test";
import assert from "node:assert/strict";

process.env.DEMO_DELAY_MS = "0";
process.env.MASTERY_THRESHOLD = "80";

const { createApp } = await import("../server/app.js");

const app = createApp();
const server = app.listen(0);
const { port } = server.address();
const base = `http://127.0.0.1:${port}/api`;

const api = async (path, options = {}) => {
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: options.body ? { "Content-Type": "application/json", ...(options.headers || {}) } : options.headers,
  });
  const body = await response.json();
  return { status: response.status, body };
};

const post = (path, body) => api(path, { method: "POST", body: JSON.stringify(body) });

test.after(async () => {
  await post("/demo/reset", {});
  await new Promise((resolve) => server.close(resolve));
});

test("health and reset expose a working seeded demo", async () => {
  const health = await api("/health");
  assert.equal(health.status, 200);
  assert.equal(health.body.status, "ok");
  assert.equal(health.body.threshold, 80);

  const reset = await post("/demo/reset", {});
  assert.equal(reset.status, 200);
  assert.equal(reset.body.learners.length, 3);
  assert.equal(reset.body.sessions, 2);

  const learners = await api("/learners");
  assert.equal(learners.body.learners.length, 3);
  const thabo = learners.body.learners.find((learner) => learner.id === "lrn_thabo");
  assert.equal(thabo.status, "not_started");
});

test("Thabo completes the full six-agent recovery cycle", async () => {
  const created = await post("/learning-sessions", { learnerId: "lrn_thabo" });
  assert.equal(created.status, 201);
  assert.equal(created.body.session.status, "diagnostic");
  assert.equal(created.body.session.diagnostic.questions.length, 5);
  assert.ok(created.body.session.diagnostic.questions[0].demoAnswer);

  const sessionId = created.body.session.id;

  const diagnostic = await post(`/learning-sessions/${sessionId}/diagnostic`, {
    answers: { d1: "-1", d2: "3", d3: "3", d4: "6", d5: "3" },
  });
  assert.equal(diagnostic.status, 200);
  assert.equal(diagnostic.body.session.diagnostic.report.correctAnswers, 2);
  assert.equal(diagnostic.body.session.diagnostic.report.incorrectAnswers, 3);
  assert.equal(diagnostic.body.session.diagnosis.gapKey, "negative_operations");
  assert.equal(diagnostic.body.session.status, "learning");

  const intervention = diagnostic.body.session.attempts[0].intervention;
  assert.ok(intervention.workedExamples.length >= 2);
  assert.equal(intervention.practiceQuestions.length, 3);
  assert.ok(intervention.numberLine);

  const practiceAnswers = {};
  for (const question of intervention.practiceQuestions) {
    assert.ok(question.demoAnswer);
    const check = await post(`/learning-sessions/${sessionId}/practice/check`, {
      questionId: question.id,
      answer: question.demoAnswer,
    });
    assert.equal(check.status, 200);
    assert.equal(check.body.check.correct, true);
    practiceAnswers[question.id] = question.demoAnswer;
  }

  const practiced = await post(`/learning-sessions/${sessionId}/practice`, { answers: practiceAnswers });
  assert.equal(practiced.status, 200);
  assert.equal(practiced.body.session.status, "mastery");
  assert.equal(practiced.body.session.attempts[0].practice.result.scorePercent, 100);
  assert.equal(practiced.body.session.attempts[0].mastery.questions.length, 5);

  const masteryAnswers = {};
  for (const question of practiced.body.session.attempts[0].mastery.questions) {
    assert.ok(question.demoAnswer);
    masteryAnswers[question.id] = question.demoAnswer;
  }

  const mastered = await post(`/learning-sessions/${sessionId}/mastery`, { answers: masteryAnswers });
  assert.equal(mastered.status, 200);
  assert.equal(mastered.body.session.status, "complete");
  assert.equal(mastered.body.session.attempts[0].mastery.result.correct, 4);
  assert.equal(mastered.body.session.attempts[0].mastery.result.thresholdMet, true);
  assert.equal(mastered.body.session.attempts[0].mastery.result.comparison.delta, 40);
  assert.ok(mastered.body.session.teacherInsight.summary.includes("2/5"));

  const agents = new Set(mastered.body.session.events.map((event) => event.agent));
  for (const agent of ["assessment", "diagnostic", "designer", "tutor", "mastery", "insight"]) {
    assert.ok(agents.has(agent), `missing ${agent} events`);
  }

  const teacherDetail = await api("/teacher/learners/lrn_thabo");
  assert.equal(teacherDetail.status, 200);
  assert.equal(teacherDetail.body.learner.status, "complete_pass");
  assert.equal(teacherDetail.body.learner.latestScore, 80);

  const feed = await api("/activity?limit=100");
  assert.ok(feed.body.events.some((event) => event.agent === "insight" && event.learnerId === "lrn_thabo"));
});

test("a learner below the threshold gets an adapted retry and a teacher review", async () => {
  const created = await post("/learning-sessions", { learnerId: "lrn_lerato" });
  assert.equal(created.status, 201);
  const sessionId = created.body.session.id;

  await post(`/learning-sessions/${sessionId}/diagnostic`, {
    answers: { d1: "-1", d2: "-3", d3: "3", d4: "-6", d5: "3" },
  });

  const session = (await api(`/learning-sessions/${sessionId}`)).body.session;
  const questions = session.attempts[0].intervention.practiceQuestions;
  const wrongPractice = {
    [questions[0].id]: "2",
    [questions[1].id]: "-2",
    [questions[2].id]: "-12",
  };

  const practiced = await post(`/learning-sessions/${sessionId}/practice`, { answers: wrongPractice });
  assert.equal(practiced.body.session.attempts[0].practice.result.correct, 0);

  const masteryQuestions = practiced.body.session.attempts[0].mastery.questions;
  assert.equal(masteryQuestions.length, 5);
  const wrongMastery = {
    m1a: "3",
    m1b: "-8",
    m1c: "-2",
    m1d: "-8",
    m1e: "-2",
  };

  const failed = await post(`/learning-sessions/${sessionId}/mastery`, { answers: wrongMastery });
  assert.equal(failed.body.session.status, "retry");
  assert.equal(failed.body.session.attempts.length, 2);
  assert.equal(failed.body.session.attempts[1].intervention.adapted, true);
  assert.ok(failed.body.session.events.some((event) => event.agent === "designer" && event.attempt === 2));

  const retryQuestions = failed.body.session.attempts[1].intervention.practiceQuestions;
  const retryPractice = {
    [retryQuestions[0].id]: "3",
    [retryQuestions[1].id]: "-5",
    [retryQuestions[2].id]: "-10",
  };
  const retryPracticed = await post(`/learning-sessions/${sessionId}/practice`, { answers: retryPractice });
  assert.equal(retryPracticed.body.session.status, "mastery");

  const retryMasteryQuestions = retryPracticed.body.session.attempts[1].mastery.questions;
  assert.equal(retryMasteryQuestions.length, 5);
  const retryWrong = {
    m2a: "-3",
    m2b: "-12",
    m2c: "-4",
    m2d: "-12",
    m2e: "-2",
  };

  const exhausted = await post(`/learning-sessions/${sessionId}/mastery`, { answers: retryWrong });
  assert.equal(exhausted.body.session.status, "complete");
  assert.equal(exhausted.body.session.attempts.length, 2);
  assert.equal(exhausted.body.session.attempts[1].mastery.result.thresholdMet, false);
  assert.ok(exhausted.body.session.teacherInsight);
  assert.match(exhausted.body.session.teacherInsight.headline, /teacher-led review/i);

  const teacher = await api("/teacher/learners/lrn_lerato");
  assert.equal(teacher.body.learner.status, "complete_support");
});

test("invalid requests fail cleanly", async () => {
  const badLearner = await post("/learning-sessions", { learnerId: "lrn_missing" });
  assert.equal(badLearner.status, 404);

  const created = await post("/learning-sessions", { learnerId: "lrn_thabo" });
  const missing = await post(`/learning-sessions/${created.body.session.id}/diagnostic`, {
    answers: { d1: "-1" },
  });
  assert.equal(missing.status, 400);
  assert.ok(Array.isArray(missing.body.details.missing));
  assert.equal(missing.body.details.missing.length, 4);
});
