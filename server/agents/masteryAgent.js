import { config } from "../config.js";
import { getMasterySet } from "../domain/questions.js";
import { skillLabel } from "../domain/skills.js";
import { masteryQuestionsSchema, masteryResultSchema, parseWith } from "../validation/schemas.js";

export function buildMasteryQuestions({ gapKey, attempt }) {
  const set = getMasterySet(gapKey, attempt);
  return parseWith(
    masteryQuestionsSchema,
    {
      questions: set.map((question) => ({
        id: question.id,
        prompt: question.prompt,
        options: question.options,
        hint: "Use the rule you practised: identify the operation, handle the signs, then check the size.",
        skill: question.skill,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      })),
      threshold: config.masteryThreshold,
    },
    "Mastery assessment",
  );
}

export async function runMasteryQuestionsAgent({ gapKey, attempt, ai, latencyMs = 0 }) {
  const fallback = buildMasteryQuestions({ gapKey, attempt });

  const { data, meta } = await ai.generateJSON({
    schema: masteryQuestionsSchema,
    fallback,
    latencyMs,
    label: "Mastery Agent",
    instructions:
      "Prepare a short follow-up assessment on the same underlying skill, using fresh questions rather than repeating the diagnostic. Include the mastery threshold.",
    payload: { gapKey, attempt, threshold: config.masteryThreshold },
  });

  const generatedById = new Map(data.questions.map((question) => [question.id, question]));
  return {
    data: {
      threshold: fallback.threshold,
      questions: fallback.questions.map((question) => ({
        ...question,
        hint: generatedById.get(question.id)?.hint || question.hint,
      })),
    },
    meta,
  };
}

export function buildMasteryResult({ questions, answers, attempt, initialScore }) {
  const evaluated = questions.map((question) => ({
    question,
    answer: String(answers[question.id] ?? "").trim(),
    correct: String(answers[question.id] ?? "").trim() === String(question.correctAnswer),
  }));

  const correct = evaluated.filter((item) => item.correct).length;
  const total = evaluated.length;
  const scorePercent = total ? Math.round((correct / total) * 100) : 0;
  const thresholdMet = scorePercent >= config.masteryThreshold;
  const wrongSkills = [...new Set(evaluated.filter((item) => !item.correct).map((item) => item.question.skill))];
  const delta = scorePercent - initialScore;

  const remainingDifficulty = thresholdMet
    ? "No persistent difficulty was evident on this follow-up set."
    : wrongSkills.length > 0
      ? `The follow-up still shows errors in ${wrongSkills.map((skill) => skillLabel(skill).toLowerCase()).join(" and ")}.`
      : "The follow-up did not reach the mastery threshold, but no single skill dominated the errors.";

  const recommendation = thresholdMet
    ? "Move on to the next topic, but keep one spaced review of signed arithmetic in the next lesson."
    : attempt >= config.maxAttempts
      ? "Pause independent retries and arrange a short teacher-led review of the remaining sign rules."
      : "Run one adapted intervention that isolates the remaining sign rule before another mastery check.";

  return parseWith(
    masteryResultSchema,
    {
      attempt,
      correct,
      total,
      scorePercent,
      thresholdMet,
      comparison: {
        initialScore,
        latestScore: scorePercent,
        delta,
      },
      remainingDifficulty,
      recommendation,
    },
    "Mastery result",
  );
}

export async function runMasteryEvaluationAgent({ questions, answers, attempt, initialScore, ai, latencyMs = 0 }) {
  const fallback = buildMasteryResult({ questions, answers, attempt, initialScore });

  const { data, meta } = await ai.generateJSON({
    schema: masteryResultSchema,
    fallback,
    latencyMs,
    label: "Mastery Agent",
    instructions:
      "Evaluate the follow-up assessment against the explicit threshold. Compare with the initial score. A failed attempt should identify what remains difficult, not describe the learner as failing.",
    payload: { questions, answers, attempt, initialScore, threshold: config.masteryThreshold },
  });

  return {
    data: {
      ...data,
      attempt: fallback.attempt,
      correct: fallback.correct,
      total: fallback.total,
      scorePercent: fallback.scorePercent,
      thresholdMet: fallback.thresholdMet,
      comparison: fallback.comparison,
    },
    meta,
  };
}
