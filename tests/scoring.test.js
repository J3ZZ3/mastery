import test from "node:test";
import assert from "node:assert/strict";
import { diagnosticQuestions } from "../server/domain/questions.js";
import { buildAssessmentReport, runAssessmentAgent } from "../server/agents/assessmentAgent.js";
import { buildIntervention } from "../server/agents/learningDesignerAgent.js";
import { buildTutorResult, runTutorAgent } from "../server/agents/tutorAgent.js";
import {
  buildMasteryQuestions,
  buildMasteryResult,
  runMasteryQuestionsAgent,
  runMasteryEvaluationAgent,
} from "../server/agents/masteryAgent.js";

const aiWith = (change) => ({
  async generateJSON({ fallback }) {
    return { data: change(structuredClone(fallback)), meta: { provider: "openai" } };
  },
});

test("model output cannot alter diagnostic or practice scores", async () => {
  const answers = { d1: "-1", d2: "3", d3: "3", d4: "6", d5: "3" };
  const expected = buildAssessmentReport({ questions: diagnosticQuestions, answers });
  const assessment = await runAssessmentAgent({
    questions: diagnosticQuestions,
    answers,
    ai: aiWith((data) => ({ ...data, correctAnswers: 5, scorePercent: 100, items: [] })),
  });
  assert.equal(assessment.data.correctAnswers, expected.correctAnswers);
  assert.deepEqual(assessment.data.items, expected.items);

  const intervention = buildIntervention({ gapKey: "negative_operations" });
  const practiceAnswers = Object.fromEntries(intervention.practiceQuestions.map((question) => [question.id, "wrong"]));
  const expectedPractice = buildTutorResult({ intervention, answers: practiceAnswers });
  const tutor = await runTutorAgent({
    intervention,
    answers: practiceAnswers,
    ai: aiWith((data) => ({ ...data, correct: data.total, scorePercent: 100, needsReteach: false, results: [] })),
  });
  assert.equal(tutor.data.correct, expectedPractice.correct);
  assert.deepEqual(tutor.data.results, expectedPractice.results);
  assert.equal(tutor.data.needsReteach, expectedPractice.needsReteach);
});

test("model output cannot change the question bank, mastery threshold or pass decision", async () => {
  const gapKey = "negative_operations";
  const expectedQuestions = buildMasteryQuestions({ gapKey, attempt: 1 });
  const generated = await runMasteryQuestionsAgent({
    gapKey,
    attempt: 1,
    ai: aiWith((data) => ({
      ...data,
      threshold: 1,
      questions: data.questions.map((question) => ({ ...question, correctAnswer: "wrong" })),
    })),
  });
  assert.equal(generated.data.threshold, expectedQuestions.threshold);
  assert.deepEqual(
    generated.data.questions.map(({ id, correctAnswer }) => ({ id, correctAnswer })),
    expectedQuestions.questions.map(({ id, correctAnswer }) => ({ id, correctAnswer })),
  );
  const answers = Object.fromEntries(generated.data.questions.map((question) => [question.id, "wrong"]));
  const expected = buildMasteryResult({ questions: generated.data.questions, answers, attempt: 1, initialScore: 40 });
  const result = await runMasteryEvaluationAgent({
    questions: generated.data.questions,
    answers,
    attempt: 1,
    initialScore: 40,
    ai: aiWith((data) => ({ ...data, correct: data.total, scorePercent: 100, thresholdMet: true })),
  });
  assert.equal(result.data.correct, expected.correct);
  assert.equal(result.data.thresholdMet, false);
  assert.deepEqual(result.data.comparison, expected.comparison);
});
