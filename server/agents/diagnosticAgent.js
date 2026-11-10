import { parseWith, diagnosticSchema } from "../validation/schemas.js";
import { gapLabel, skillLabel } from "../domain/skills.js";

const gapMeta = {
  negative_operations: {
    suspectedGap: "Negative number operations",
    relatedConcept: "Integer subtraction and subtracting a negative",
    reasoning:
      "The errors cluster around direction on the number line and double negatives. This suggests the learner may not yet have a stable rule for integer operations, rather than making one isolated slip.",
  },
  integer_multiplication: {
    suspectedGap: "Integer multiplication signs",
    relatedConcept: "Multiplying positive and negative integers",
    reasoning:
      "Most of the errors involve products with negative factors. This points to an insecure sign rule for multiplication rather than a calculation fact problem.",
  },
  algebra_integers: {
    suspectedGap: "Solving equations with integers",
    relatedConcept: "Inverse operations and negative terms in equations",
    reasoning:
      "The learner can handle some integer arithmetic but struggles when negative terms are moved across an equation. The gap may sit in applying inverse operations to signed numbers.",
  },
  surface_errors: {
    suspectedGap: "Isolated calculation slips",
    relatedConcept: "Checking signs and operations before answering",
    reasoning:
      "Only isolated answers went wrong and the skills involved are otherwise represented. This looks more like a checking or attention issue than a missing concept.",
  },
  secure: {
    suspectedGap: "Secure integer foundations",
    relatedConcept: "Extending integer reasoning into algebra",
    reasoning:
      "Every diagnostic item was answered correctly. The evidence suggests the learner is ready to extend integer reasoning into more demanding algebraic work.",
  },
};

const skillGapMap = {
  integer_addition: "negative_operations",
  integer_subtraction: "negative_operations",
  double_negative: "negative_operations",
  integer_multiplication: "integer_multiplication",
  algebra_integers: "algebra_integers",
};

export function buildDiagnosis({ report }) {
  const wrong = report.items.filter((item) => !item.correct);

  if (wrong.length === 0) {
    return parseWith(
      diagnosticSchema,
      {
        gapKey: "secure",
        ...gapMeta.secure,
        evidence: [
          `All ${report.totalQuestions} diagnostic items were correct, including signed arithmetic and a simple equation.`,
        ],
        confidence: 0.9,
        isSurfaceLevel: false,
        severity: "low",
      },
      "Diagnosis",
    );
  }

  const counts = {};
  for (const item of wrong) {
    counts[item.skill] = (counts[item.skill] || 0) + 1;
  }

  const weighted = {
    negative_operations:
      (counts.integer_subtraction || 0) + (counts.double_negative || 0) * 1.15 + (counts.integer_addition || 0) * 0.55,
    integer_multiplication: (counts.integer_multiplication || 0) * 1.1,
    algebra_integers: (counts.algebra_integers || 0) * 1.05,
  };

  let gapKey = "negative_operations";
  if (weighted.integer_multiplication > weighted[gapKey] && weighted.integer_multiplication >= weighted.algebra_integers) {
    gapKey = "integer_multiplication";
  } else if (weighted.algebra_integers > weighted[gapKey] && weighted.algebra_integers > weighted.integer_multiplication) {
    gapKey = "algebra_integers";
  }

  if (wrong.length === 1 && counts.algebra_integers === 1 && weighted.negative_operations === 0) {
    gapKey = "algebra_integers";
  }

  if (wrong.length === 1) {
    gapKey = skillGapMap[wrong[0].skill] || gapKey;
  }

  const isSurfaceLevel = wrong.length === 1;
  const evidence = wrong.map(
    (item) =>
      `${item.prompt} → answered "${item.learnerAnswer}", expected "${item.correctAnswer}". ${
        item.misconception || `The item tests ${skillLabel(item.skill).toLowerCase()}.`
      }`,
  );

  const dominantCount = Math.max(...Object.values(counts));
  const confidence = Number(
    Math.min(0.95, 0.58 + wrong.length * 0.06 + (dominantCount / wrong.length) * 0.15).toFixed(2),
  );

  const meta = isSurfaceLevel
    ? {
        ...gapMeta.surface_errors,
        suspectedGap: gapMeta[gapKey].suspectedGap,
        relatedConcept: gapMeta[gapKey].relatedConcept,
        reasoning: `Only one item was incorrect, so this is treated as a possible slip in ${gapLabel(
          gapKey,
        ).toLowerCase()} until a follow-up check confirms a pattern. ${gapMeta[gapKey].reasoning}`,
      }
    : gapMeta[gapKey];

  return parseWith(
    diagnosticSchema,
    {
      gapKey,
      suspectedGap: meta.suspectedGap,
      relatedConcept: meta.relatedConcept,
      evidence,
      confidence,
      reasoning: meta.reasoning,
      isSurfaceLevel,
      severity: wrong.length >= 3 ? "high" : wrong.length === 2 ? "moderate" : "low",
    },
    "Diagnosis",
  );
}

export async function runDiagnosticAgent({ report, ai, latencyMs = 0 }) {
  const fallback = buildDiagnosis({ report });

  const { data, meta } = await ai.generateJSON({
    schema: diagnosticSchema,
    fallback,
    latencyMs,
    label: "Diagnostic Agent",
    instructions:
      "Form a hypothesis, not a verdict. Cite specific answers as evidence. Distinguish a surface slip from a concept gap and use cautious language such as 'may' or 'suggests'.",
    payload: { report },
  });

  return { data, meta };
}
