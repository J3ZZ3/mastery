import { parseWith, teacherInsightSchema } from "../validation/schemas.js";

const firstName = (name) => (name || "The learner").split(" ")[0];

export function buildTeacherInsight({ learner, session }) {
  const report = session.diagnostic.report;
  const diagnosis = session.diagnosis;
  const attempt = session.attempts[session.attempts.length - 1];
  const mastery = attempt?.mastery?.result;
  const practice = attempt?.practice?.result;
  const passed = Boolean(mastery?.thresholdMet);
  const attemptsUsed = session.attempts.length;
  const name = firstName(learner?.name);

  const headline = passed
    ? `${name} recovered understanding of ${diagnosis.suspectedGap.toLowerCase()}`
    : `${name} needs a teacher-led review of ${diagnosis.suspectedGap.toLowerCase()}`;

  const summary = [
    `${name} scored ${report.correctAnswers}/${report.totalQuestions} on the initial diagnostic.`,
    `The Diagnostic Agent raised a possible gap in ${diagnosis.suspectedGap.toLowerCase()}.`,
    `The Learning Designer produced ${
      attemptsUsed > 1
        ? `${attemptsUsed} intervention attempts, including an adapted retry`
        : "a personalised intervention"
    }, and the Tutor recorded ${practice?.correct ?? 0}/${practice?.total ?? 0} on the final practice set.`,
    passed
      ? `The learner reached ${mastery.scorePercent}% on the follow-up mastery check, meeting the ${session.threshold ?? 80}% threshold (${mastery.comparison.delta >= 0 ? "+" : ""}${mastery.comparison.delta} percentage points).`
      : `The latest mastery check reached ${mastery?.scorePercent ?? 0}%, below the ${session.threshold ?? 80}% threshold after ${attemptsUsed} attempt${attemptsUsed === 1 ? "" : "s"}.`,
  ].join(" ");

  const evidence = [
    `Initial diagnostic: ${report.correctAnswers}/${report.totalQuestions} correct (${report.scorePercent}%).`,
    diagnosis.evidence[0],
    `Final practice: ${practice?.correct ?? 0}/${practice?.total ?? 0} correct.`,
    `Follow-up mastery: ${mastery?.correct ?? 0}/${mastery?.total ?? 0} correct (${mastery?.scorePercent ?? 0}%).`,
  ];

  const recommendation = passed
    ? "Continue with basic algebra involving integers, and include a short spaced review of sign rules in the next two lessons."
    : "Use a short concrete-to-abstract reteach with the number line, then re-check the same skill in class before moving on.";

  const nextStep = passed
    ? `Next lesson: extend to expressions such as -2(x - 3) and keep one retrieval question on subtracting a negative.`
    : `Next step: 10-minute teacher-led review of ${diagnosis.relatedConcept.toLowerCase()}, followed by a short paper check.`;

  return parseWith(
    teacherInsightSchema,
    {
      headline,
      summary,
      evidence,
      recommendation,
      nextStep,
      confidence: Math.min(
        0.95,
        Number((0.6 + report.confidence * 0.2 + (mastery?.thresholdMet ? 0.1 : 0.04)).toFixed(2)),
      ),
    },
    "Teacher insight",
  );
}

export async function runTeacherInsightAgent({ learner, session, ai, latencyMs = 0 }) {
  const fallback = buildTeacherInsight({ learner, session });

  const { data, meta } = await ai.generateJSON({
    schema: teacherInsightSchema,
    fallback,
    latencyMs,
    label: "Teacher Insight Agent",
    instructions:
      "Write a concise teacher-facing summary from the recorded cycle. It must cite real scores, celebrate improvement where present, recommend a next step, and avoid labelling the learner. The teacher retains the decision.",
    payload: { learner, session },
  });

  return { data, meta };
}
