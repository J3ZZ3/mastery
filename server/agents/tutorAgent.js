import { parseWith, tutorResultSchema } from "../validation/schemas.js";
import { skillLabel } from "../domain/skills.js";

export function evaluatePractice(intervention, answers) {
  return intervention.practiceQuestions.map((question) => {
    const learnerAnswer = String(answers[question.id] ?? "").trim();
    const correct = learnerAnswer === String(question.correctAnswer);
    const feedback = correct
      ? `Correct. ${question.explanation}`
      : `Not quite. ${question.hint} Once you have retried, check the worked example that uses the same move.`;

    return {
      questionId: question.id,
      prompt: question.prompt,
      learnerAnswer: learnerAnswer || "(no answer)",
      correctAnswer: String(question.correctAnswer),
      correct,
      feedback,
      explanation: question.explanation,
      skill: question.skill,
    };
  });
}

export function buildTutorResult({ intervention, answers }) {
  const evaluated = evaluatePractice(intervention, answers);
  const correct = evaluated.filter((item) => item.correct).length;
  const total = evaluated.length;
  const scorePercent = total ? Math.round((correct / total) * 100) : 0;
  const needsReteach = scorePercent < 67;
  const wrongSkills = [...new Set(evaluated.filter((item) => !item.correct).map((item) => item.skill))];

  const feedbackSummary = needsReteach
    ? `You answered ${correct} of ${total} practice questions correctly. The lesson needs one more pass before the mastery check, focusing on ${wrongSkills
        .map((skill) => skillLabel(skill).toLowerCase())
        .join(" and ")}.`
    : correct === total
      ? `You answered all ${total} practice questions correctly. Your explanations are consistent across the examples, so you are ready for the mastery check.`
      : `You answered ${correct} of ${total} practice questions correctly. The remaining slip is small, so review the feedback before the mastery check.`;

  const nextFocus =
    wrongSkills.length > 0
      ? `Review ${wrongSkills.map((skill) => skillLabel(skill).toLowerCase()).join(" and ")} before the mastery check.`
      : "You are ready for a fresh mastery check with new questions.";

  return parseWith(
    tutorResultSchema,
    {
      total,
      correct,
      scorePercent,
      results: evaluated.map(({ skill, ...item }) => item),
      feedbackSummary,
      needsReteach,
      nextFocus,
    },
    "Tutor result",
  );
}

export async function runTutorAgent({ intervention, answers, ai, latencyMs = 0 }) {
  const fallback = buildTutorResult({ intervention, answers });

  const { data, meta } = await ai.generateJSON({
    schema: tutorResultSchema,
    fallback,
    latencyMs,
    label: "Tutor Agent",
    instructions:
      "Evaluate the practice answers. Feedback must be supportive, specific and must not reward an incorrect answer. Do not label the learner. Use the supplied explanations rather than inventing new mathematics.",
    payload: { intervention, answers, threshold: 67 },
  });

  return { data, meta };
}

export function checkPracticeAnswer({ question, answer }) {
  const correct = String(answer) === String(question.correctAnswer);

  if (correct) {
    return {
      correct: true,
      feedback: `Correct. ${question.explanation}`,
      hint: null,
    };
  }

  return {
    correct: false,
    feedback: "Not quite yet. Use the hint, then try this item once more before moving on.",
    hint: question.hint,
  };
}
