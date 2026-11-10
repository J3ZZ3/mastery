import { assessmentReportSchema, parseWith } from "../validation/schemas.js";
import { skillLabel } from "../domain/skills.js";

const patternForSkill = {
  integer_addition: "Adding integers with different signs is inconsistent.",
  integer_subtraction: "Sign errors appear when moving left from a negative number.",
  double_negative: "Subtracting a negative is being treated as ordinary subtraction.",
  integer_multiplication: "The sign rule for multiplying integers is not yet consistent.",
  algebra_integers: "Inverse operations with negative terms are not yet secure.",
};

export function buildAssessmentReport({ questions, answers }) {
  const items = questions.map((question) => {
    const learnerAnswer = String(answers[question.id] ?? "").trim();
    const correct = learnerAnswer === String(question.correctAnswer);
    const misconception = correct
      ? null
      : question.misconceptions?.[learnerAnswer] ||
        `The learner's answer does not match the expected result for ${skillLabel(question.skill).toLowerCase()}.`;

    return {
      questionId: question.id,
      prompt: question.prompt,
      learnerAnswer: learnerAnswer || "(no answer)",
      correctAnswer: String(question.correctAnswer),
      correct,
      skill: question.skill,
      explanation: question.explanation,
      misconception,
    };
  });

  const incorrect = items.filter((item) => !item.correct);
  const correctAnswers = items.length - incorrect.length;
  const wrongSkills = [...new Set(incorrect.map((item) => item.skill))];

  const identifiedPatterns = wrongSkills.map((skill) => patternForSkill[skill] || `Errors cluster around ${skillLabel(skill)}.`);

  if (incorrect.length >= 3 && wrongSkills.length >= 2) {
    identifiedPatterns.push("Errors recur across several integer operations rather than in one isolated calculation.");
  }

  const confidence = Number(
    Math.min(0.95, 0.55 + incorrect.length * 0.07 + (wrongSkills.length === 1 && incorrect.length > 1 ? 0.08 : 0)).toFixed(2),
  );

  return parseWith(
    assessmentReportSchema,
    {
      totalQuestions: items.length,
      correctAnswers,
      incorrectAnswers: incorrect.length,
      scorePercent: items.length ? Math.round((correctAnswers / items.length) * 100) : 0,
      identifiedPatterns,
      confidence,
      items,
    },
    "Assessment report",
  );
}

export async function runAssessmentAgent({ questions, answers, ai, latencyMs = 0 }) {
  const fallback = buildAssessmentReport({ questions, answers });

  const { data, meta } = await ai.generateJSON({
    schema: assessmentReportSchema,
    fallback,
    latencyMs,
    label: "Assessment Agent",
    instructions:
      "Evaluate every answer. A pattern must be grounded in the submitted answers. Confidence is about the evidence, not about the learner.",
    payload: { questions, answers },
  });

  return {
    data: {
      ...data,
      totalQuestions: fallback.totalQuestions,
      correctAnswers: fallback.correctAnswers,
      incorrectAnswers: fallback.incorrectAnswers,
      scorePercent: fallback.scorePercent,
      items: fallback.items,
    },
    meta,
  };
}
