import { z } from "zod";

export const GAP_KEYS = [
  "negative_operations",
  "integer_multiplication",
  "algebra_integers",
  "surface_errors",
  "secure",
];

const idSchema = z.string().min(1);
const optionSchema = z.array(z.string().min(1)).min(2);

export const requestSchemas = {
  createSession: z.object({
    learnerId: idSchema,
    restart: z.boolean().optional().default(false),
  }),
  diagnostic: z.object({
    answers: z.record(z.string().min(1)),
  }),
  practiceCheck: z.object({
    questionId: idSchema,
    answer: z.string().min(1),
  }),
  practice: z.object({
    answers: z.record(z.string().min(1)),
  }),
  mastery: z.object({
    answers: z.record(z.string().min(1)),
  }),
};

export const assessmentReportSchema = z.object({
  totalQuestions: z.number().int().nonnegative(),
  correctAnswers: z.number().int().nonnegative(),
  incorrectAnswers: z.number().int().nonnegative(),
  scorePercent: z.number().min(0).max(100),
  identifiedPatterns: z.array(z.string().min(1)),
  confidence: z.number().min(0).max(1),
  items: z.array(
    z.object({
      questionId: z.string().min(1),
      prompt: z.string().min(1),
      learnerAnswer: z.string().min(1),
      correctAnswer: z.string().min(1),
      correct: z.boolean(),
      skill: z.string().min(1),
      explanation: z.string().min(1),
      misconception: z.string().nullable(),
    }),
  ),
});

export const diagnosticSchema = z.object({
  gapKey: z.enum(GAP_KEYS),
  suspectedGap: z.string().min(1),
  relatedConcept: z.string().min(1),
  evidence: z.array(z.string().min(1)).min(1),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().min(1),
  isSurfaceLevel: z.boolean(),
  severity: z.enum(["low", "moderate", "high"]),
});

const numberLineSchema = z.object({
  title: z.string().min(1),
  min: z.number(),
  max: z.number(),
  step: z.number().positive(),
  markers: z.array(
    z.object({
      value: z.number(),
      label: z.string().min(1),
      tone: z.enum(["neutral", "mint", "amber", "sky"]).optional().default("neutral"),
    }),
  ),
  arrows: z.array(
    z.object({
      from: z.number(),
      to: z.number(),
      label: z.string().min(1),
      tone: z.enum(["mint", "amber", "sky"]).optional().default("sky"),
    }),
  ),
});

const practiceQuestionSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1),
  options: optionSchema,
  hint: z.string().min(1),
  skill: z.string().min(1),
  correctAnswer: z.string().min(1),
  explanation: z.string().min(1),
});

export const interventionSchema = z.object({
  gapKey: z.enum(GAP_KEYS),
  title: z.string().min(1),
  objective: z.string().min(1),
  summary: z.string().min(1),
  sections: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      body: z.string().min(1),
    }),
  ),
  numberLine: numberLineSchema.nullable(),
  workedExamples: z.array(
    z.object({
      title: z.string().min(1),
      steps: z.array(z.string().min(1)).min(1),
      answer: z.string().min(1),
    }),
  ),
  practiceQuestions: z.array(practiceQuestionSchema).min(1),
  recap: z.string().min(1),
  adapted: z.boolean(),
  adaptationNote: z.string().nullable(),
});

export const tutorResultSchema = z.object({
  total: z.number().int().nonnegative(),
  correct: z.number().int().nonnegative(),
  scorePercent: z.number().min(0).max(100),
  results: z.array(
    z.object({
      questionId: z.string().min(1),
      prompt: z.string().min(1),
      learnerAnswer: z.string().min(1),
      correctAnswer: z.string().min(1),
      correct: z.boolean(),
      feedback: z.string().min(1),
      explanation: z.string().min(1),
    }),
  ),
  feedbackSummary: z.string().min(1),
  needsReteach: z.boolean(),
  nextFocus: z.string().min(1),
});

export const masteryQuestionsSchema = z.object({
  questions: z.array(practiceQuestionSchema).min(1),
  threshold: z.number().min(0).max(100),
});

export const masteryResultSchema = z.object({
  attempt: z.number().int().positive(),
  correct: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  scorePercent: z.number().min(0).max(100),
  thresholdMet: z.boolean(),
  comparison: z.object({
    initialScore: z.number().min(0).max(100),
    latestScore: z.number().min(0).max(100),
    delta: z.number(),
  }),
  remainingDifficulty: z.string().min(1),
  recommendation: z.string().min(1),
});

export const teacherInsightSchema = z.object({
  headline: z.string().min(1),
  summary: z.string().min(1),
  evidence: z.array(z.string().min(1)).min(1),
  recommendation: z.string().min(1),
  nextStep: z.string().min(1),
  confidence: z.number().min(0).max(1),
});

export function parseWith(schema, value, label) {
  const result = schema.safeParse(value);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".") || "value"}: ${issue.message}`)
      .join("; ");
    throw new Error(`${label} validation failed: ${details}`);
  }
  return result.data;
}
