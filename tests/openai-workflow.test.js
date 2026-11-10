import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const calls = [];
const model = createServer(async (req, res) => {
  let body = "";
  for await (const chunk of req) body += chunk;
  const request = JSON.parse(body);
  calls.push(request.messages[0].content);
  const marker = "Required JSON shape example:\n";
  const content = request.messages[1].content;
  const example = JSON.parse(content.slice(content.lastIndexOf(marker) + marker.length));
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ choices: [{ message: { content: JSON.stringify(example) } }] }));
});
await new Promise((resolve) => model.listen(0, "127.0.0.1", resolve));
const dataDir = await mkdtemp(path.join(tmpdir(), "mastery-openai-test-"));
process.env.MASTERY_DATA_DIR = dataDir;
process.env.AI_PROVIDER = "openai";
process.env.OPENAI_API_KEY = "local-test-key";
process.env.OPENAI_BASE_URL = `http://127.0.0.1:${model.address().port}/v1`;
process.env.OPENAI_MODEL = "local-test-model";
process.env.OPENAI_TIMEOUT_MS = "2000";
process.env.DEMO_DELAY_MS = "0";
process.env.MASTERY_THRESHOLD = "80";
const { createApp } = await import("../server/app.js");
const apiServer = createApp().listen(0);
const base = `http://127.0.0.1:${apiServer.address().port}/api`;
const request = async (route, body) => {
  const response = await fetch(`${base}${route}`, body === undefined ? {} : {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  assert.ok(response.ok, `${route}: ${JSON.stringify(result)}`);
  return result;
};

test.after(async () => {
  await new Promise((resolve) => apiServer.close(resolve));
  model.closeAllConnections();
  await new Promise((resolve) => model.close(resolve));
  await rm(dataDir, { recursive: true, force: true });
});

test("the complete Thabo workflow invokes all six agents through the configured provider", async () => {
  assert.equal((await request("/health")).provider.active, "openai");
  const created = await request("/learning-sessions", { learnerId: "lrn_thabo" });
  const id = created.session.id;
  const diagnostic = await request(`/learning-sessions/${id}/diagnostic`, {
    answers: { d1: "-1", d2: "3", d3: "3", d4: "6", d5: "3" },
  });
  assert.equal(diagnostic.session.diagnostic.report.correctAnswers, 2);
  const practiceQuestions = diagnostic.session.attempts[0].intervention.practiceQuestions;
  const answers = Object.fromEntries(practiceQuestions.map((question) => [question.id, question.demoAnswer]));
  const practice = await request(`/learning-sessions/${id}/practice`, { answers });
  const masteryQuestions = practice.session.attempts[0].mastery.questions;
  const masteryAnswers = Object.fromEntries(masteryQuestions.map((question) => [question.id, question.demoAnswer]));
  const completed = await request(`/learning-sessions/${id}/mastery`, { answers: masteryAnswers });
  assert.equal(completed.session.status, "complete");
  assert.equal(completed.session.attempts[0].mastery.result.scorePercent, 80);
  assert.equal(calls.length, 7);
  const completedEvents = completed.session.events.filter((event) => event.status === "completed");
  for (const agent of ["assessment", "diagnostic", "designer", "tutor", "mastery", "insight"]) {
    assert.ok(completedEvents.some((event) => event.agent === agent && event.provider === "openai"), agent);
  }
});
