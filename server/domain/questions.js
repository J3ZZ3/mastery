const q = (data) => ({
  misconceptions: {},
  ...data,
});

export const diagnosticQuestions = [
  q({
    id: "d1",
    prompt: "-3 - 2 = ?",
    options: ["-5", "-1", "1", "5"],
    correctAnswer: "-5",
    skill: "integer_subtraction",
    explanation: "Start at -3 on the number line and move 2 places left. You land on -5.",
    misconceptions: {
      "-1": "This looks like the learner treated -3 - 2 as -3 + 2 or subtracted the smaller number from the larger.",
      "1": "The sign and operation may have been changed at the same time.",
      "5": "The learner appears to have ignored the starting sign.",
    },
  }),
  q({
    id: "d2",
    prompt: "-4 + 7 = ?",
    options: ["3", "-3", "11", "-11"],
    correctAnswer: "3",
    skill: "integer_addition",
    explanation: "Start at -4 and move 7 places right. You land on 3.",
    misconceptions: {
      "-3": "This suggests the learner applied the negative sign to the result instead of the starting number.",
      "11": "The learner may have added the absolute values without considering direction.",
      "-11": "The learner may have combined the magnitudes and kept a negative sign.",
    },
  }),
  q({
    id: "d3",
    prompt: "5 - (-2) = ?",
    options: ["7", "3", "-7", "-3"],
    correctAnswer: "7",
    skill: "double_negative",
    explanation: "Subtracting a negative is the same as adding a positive. 5 - (-2) becomes 5 + 2 = 7.",
    misconceptions: {
      "3": "The learner may have treated subtracting a negative as ordinary subtraction: 5 - 2 = 3.",
      "-7": "The learner may have changed the sign of 5 as well as the operation.",
      "-3": "The learner may have applied two sign changes incorrectly.",
    },
  }),
  q({
    id: "d4",
    prompt: "-2 × (-3) = ?",
    options: ["6", "-6", "5", "-5"],
    correctAnswer: "6",
    skill: "integer_multiplication",
    explanation: "A negative times a negative is positive: 2 × 3 = 6, so -2 × -3 = 6.",
    misconceptions: {
      "-6": "The learner multiplied the values correctly but applied the wrong sign rule.",
      "5": "The learner may have added the values instead of multiplying them.",
      "-5": "The learner may have added values and carried a negative sign.",
    },
  }),
  q({
    id: "d5",
    prompt: "2x + (-5) = 11. What is x?",
    options: ["8", "3", "-8", "-3"],
    correctAnswer: "8",
    skill: "algebra_integers",
    explanation: "Add 5 to both sides: 2x = 16. Divide by 2: x = 8.",
    misconceptions: {
      "3": "The learner may have moved -5 without reversing its sign correctly, leaving 2x = 6.",
      "-8": "The learner may have applied an unnecessary negative sign to the solution.",
      "-3": "The learner may have mishandled both the inverse operation and the sign.",
    },
  }),
];

const mastery = (data) => ({
  misconceptions: {},
  ...data,
});

export const masterySets = {
  negative_operations: {
    1: [
      mastery({
        id: "m1a",
        prompt: "-7 + 4 = ?",
        options: ["-3", "3", "-11", "11"],
        correctAnswer: "-3",
        skill: "integer_addition",
        explanation: "Start at -7 and move 4 places right to reach -3.",
        misconceptions: {
          "3": "The learner kept the larger magnitude positive instead of following the starting direction.",
        },
      }),
      mastery({
        id: "m1b",
        prompt: "-6 - (-2) = ?",
        options: ["-4", "-8", "4", "8"],
        correctAnswer: "-4",
        skill: "double_negative",
        explanation: "Subtracting -2 is the same as adding 2: -6 + 2 = -4.",
        misconceptions: {
          "-8": "The learner may have subtracted 2 instead of adding 2.",
        },
      }),
      mastery({
        id: "m1c",
        prompt: "3 - (-5) = ?",
        options: ["8", "-2", "2", "-8"],
        correctAnswer: "8",
        skill: "double_negative",
        explanation: "3 - (-5) becomes 3 + 5 = 8.",
        misconceptions: {
          "-2": "The learner may have treated the expression as ordinary subtraction.",
        },
      }),
      mastery({
        id: "m1d",
        prompt: "-4 × (-2) = ?",
        options: ["8", "-8", "6", "-6"],
        correctAnswer: "8",
        skill: "integer_multiplication",
        explanation: "A negative times a negative is positive: 4 × 2 = 8.",
        misconceptions: {
          "-8": "The learner may be applying a negative sign whenever a negative number appears.",
        },
      }),
      mastery({
        id: "m1e",
        prompt: "3x - 7 = -1. What is x?",
        options: ["2", "-2", "8", "-8"],
        correctAnswer: "2",
        skill: "algebra_integers",
        explanation: "Add 7 to both sides: 3x = 6. Divide by 3: x = 2.",
        misconceptions: {
          "-2": "The learner may have applied an unnecessary negative sign to the solution.",
        },
      }),
    ],
    2: [
      mastery({
        id: "m2a",
        prompt: "-5 + 8 = ?",
        options: ["3", "-3", "13", "-13"],
        correctAnswer: "3",
        skill: "integer_addition",
        explanation: "Start at -5 and move 8 places right to reach 3.",
      }),
      mastery({
        id: "m2b",
        prompt: "-9 - (-3) = ?",
        options: ["-6", "-12", "6", "12"],
        correctAnswer: "-6",
        skill: "double_negative",
        explanation: "-9 - (-3) becomes -9 + 3 = -6.",
      }),
      mastery({
        id: "m2c",
        prompt: "2 - (-6) = ?",
        options: ["8", "-4", "4", "-8"],
        correctAnswer: "8",
        skill: "double_negative",
        explanation: "2 - (-6) becomes 2 + 6 = 8.",
      }),
      mastery({
        id: "m2d",
        prompt: "-3 × (-4) = ?",
        options: ["12", "-12", "7", "-7"],
        correctAnswer: "12",
        skill: "integer_multiplication",
        explanation: "A negative times a negative is positive: 3 × 4 = 12.",
      }),
      mastery({
        id: "m2e",
        prompt: "4x - 9 = -1. What is x?",
        options: ["2", "-2", "10", "-10"],
        correctAnswer: "2",
        skill: "algebra_integers",
        explanation: "Add 9 to both sides: 4x = 8. Divide by 4: x = 2.",
      }),
    ],
  },
  integer_multiplication: {
    1: [
      mastery({
        id: "mm1a",
        prompt: "-3 × 4 = ?",
        options: ["-12", "12", "-7", "7"],
        correctAnswer: "-12",
        skill: "integer_multiplication",
        explanation: "A negative times a positive is negative: 3 × 4 = 12, so the result is -12.",
      }),
      mastery({
        id: "mm1b",
        prompt: "-5 × (-2) = ?",
        options: ["10", "-10", "7", "-7"],
        correctAnswer: "10",
        skill: "integer_multiplication",
        explanation: "A negative times a negative is positive: 5 × 2 = 10.",
      }),
      mastery({
        id: "mm1c",
        prompt: "6 × (-3) = ?",
        options: ["-18", "18", "-9", "9"],
        correctAnswer: "-18",
        skill: "integer_multiplication",
        explanation: "A positive times a negative is negative: 6 × 3 = 18, so the result is -18.",
      }),
      mastery({
        id: "mm1d",
        prompt: "-4 × 0 = ?",
        options: ["0", "-4", "4", "-0"],
        correctAnswer: "0",
        skill: "integer_multiplication",
        explanation: "Any number multiplied by zero is zero.",
      }),
      mastery({
        id: "mm1e",
        prompt: "What is (-2)³?",
        options: ["-8", "8", "-6", "6"],
        correctAnswer: "-8",
        skill: "integer_multiplication",
        explanation: "(-2) × (-2) × (-2) = 4 × (-2) = -8.",
      }),
    ],
    2: [
      mastery({
        id: "mm2a",
        prompt: "7 × (-2) = ?",
        options: ["-14", "14", "-5", "5"],
        correctAnswer: "-14",
        skill: "integer_multiplication",
        explanation: "A positive times a negative is negative.",
      }),
      mastery({
        id: "mm2b",
        prompt: "-6 × (-4) = ?",
        options: ["24", "-24", "10", "-10"],
        correctAnswer: "24",
        skill: "integer_multiplication",
        explanation: "A negative times a negative is positive.",
      }),
      mastery({
        id: "mm2c",
        prompt: "-9 × 3 = ?",
        options: ["-27", "27", "-12", "12"],
        correctAnswer: "-27",
        skill: "integer_multiplication",
        explanation: "A negative times a positive is negative.",
      }),
      mastery({
        id: "mm2d",
        prompt: "(-3)² = ?",
        options: ["9", "-9", "6", "-6"],
        correctAnswer: "9",
        skill: "integer_multiplication",
        explanation: "(-3) × (-3) = 9 because a negative times a negative is positive.",
      }),
      mastery({
        id: "mm2e",
        prompt: "-2 × 3 × (-1) = ?",
        options: ["6", "-6", "5", "-5"],
        correctAnswer: "6",
        skill: "integer_multiplication",
        explanation: "-2 × 3 = -6, then -6 × (-1) = 6.",
      }),
    ],
  },
  algebra_integers: {
    1: [
      mastery({
        id: "ma1a",
        prompt: "x + (-4) = 9. What is x?",
        options: ["13", "5", "-13", "-5"],
        correctAnswer: "13",
        skill: "algebra_integers",
        explanation: "Add 4 to both sides: x = 9 + 4 = 13.",
      }),
      mastery({
        id: "ma1b",
        prompt: "2x + (-3) = 7. What is x?",
        options: ["5", "-5", "2", "-2"],
        correctAnswer: "5",
        skill: "algebra_integers",
        explanation: "Add 3: 2x = 10. Divide by 2: x = 5.",
      }),
      mastery({
        id: "ma1c",
        prompt: "-3x = 12. What is x?",
        options: ["-4", "4", "-9", "9"],
        correctAnswer: "-4",
        skill: "algebra_integers",
        explanation: "Divide both sides by -3: x = -4.",
      }),
      mastery({
        id: "ma1d",
        prompt: "x - (-6) = 2. What is x?",
        options: ["-4", "8", "4", "-8"],
        correctAnswer: "-4",
        skill: "algebra_integers",
        explanation: "x - (-6) becomes x + 6 = 2, so x = -4.",
      }),
      mastery({
        id: "ma1e",
        prompt: "2(x - 3) = -8. What is x?",
        options: ["-1", "1", "7", "-7"],
        correctAnswer: "-1",
        skill: "algebra_integers",
        explanation: "Divide by 2: x - 3 = -4. Add 3: x = -1.",
      }),
    ],
    2: [
      mastery({
        id: "ma2a",
        prompt: "x + (-7) = 2. What is x?",
        options: ["9", "-9", "5", "-5"],
        correctAnswer: "9",
        skill: "algebra_integers",
        explanation: "Add 7 to both sides: x = 9.",
      }),
      mastery({
        id: "ma2b",
        prompt: "3x - 4 = -13. What is x?",
        options: ["-3", "3", "-17", "17"],
        correctAnswer: "-3",
        skill: "algebra_integers",
        explanation: "Add 4: 3x = -9. Divide by 3: x = -3.",
      }),
      mastery({
        id: "ma2c",
        prompt: "-2x + 5 = 11. What is x?",
        options: ["-3", "3", "-8", "8"],
        correctAnswer: "-3",
        skill: "algebra_integers",
        explanation: "Subtract 5: -2x = 6. Divide by -2: x = -3.",
      }),
      mastery({
        id: "ma2d",
        prompt: "x - (-4) = -1. What is x?",
        options: ["-5", "5", "3", "-3"],
        correctAnswer: "-5",
        skill: "algebra_integers",
        explanation: "x + 4 = -1, so x = -5.",
      }),
      mastery({
        id: "ma2e",
        prompt: "4(x + 2) = -4. What is x?",
        options: ["-3", "3", "-6", "6"],
        correctAnswer: "-3",
        skill: "algebra_integers",
        explanation: "Divide by 4: x + 2 = -1. Subtract 2: x = -3.",
      }),
    ],
  },
  surface_errors: {
    1: [
      mastery({
        id: "ms1a",
        prompt: "-2 + 5 = ?",
        options: ["3", "-3", "7", "-7"],
        correctAnswer: "3",
        skill: "integer_addition",
        explanation: "Start at -2 and move 5 places right to 3.",
      }),
      mastery({
        id: "ms1b",
        prompt: "-5 - 1 = ?",
        options: ["-6", "-4", "6", "4"],
        correctAnswer: "-6",
        skill: "integer_subtraction",
        explanation: "Start at -5 and move 1 place left to -6.",
      }),
      mastery({
        id: "ms1c",
        prompt: "4 - (-3) = ?",
        options: ["7", "1", "-7", "-1"],
        correctAnswer: "7",
        skill: "double_negative",
        explanation: "4 - (-3) becomes 4 + 3 = 7.",
      }),
      mastery({
        id: "ms1d",
        prompt: "-2 × 5 = ?",
        options: ["-10", "10", "-7", "7"],
        correctAnswer: "-10",
        skill: "integer_multiplication",
        explanation: "A negative times a positive is negative.",
      }),
      mastery({
        id: "ms1e",
        prompt: "2x + (-1) = 7. What is x?",
        options: ["4", "-4", "3", "-3"],
        correctAnswer: "4",
        skill: "algebra_integers",
        explanation: "Add 1: 2x = 8. Divide by 2: x = 4.",
      }),
    ],
    2: [
      mastery({
        id: "ms2a",
        prompt: "-6 + 2 = ?",
        options: ["-4", "4", "-8", "8"],
        correctAnswer: "-4",
        skill: "integer_addition",
        explanation: "Start at -6 and move 2 places right to -4.",
      }),
      mastery({
        id: "ms2b",
        prompt: "-4 - 3 = ?",
        options: ["-7", "-1", "7", "1"],
        correctAnswer: "-7",
        skill: "integer_subtraction",
        explanation: "Start at -4 and move 3 places left to -7.",
      }),
      mastery({
        id: "ms2c",
        prompt: "2 - (-5) = ?",
        options: ["7", "-3", "3", "-7"],
        correctAnswer: "7",
        skill: "double_negative",
        explanation: "2 - (-5) becomes 2 + 5 = 7.",
      }),
      mastery({
        id: "ms2d",
        prompt: "-3 × (-5) = ?",
        options: ["15", "-15", "8", "-8"],
        correctAnswer: "15",
        skill: "integer_multiplication",
        explanation: "A negative times a negative is positive.",
      }),
      mastery({
        id: "ms2e",
        prompt: "3x - 5 = 10. What is x?",
        options: ["5", "-5", "15", "-15"],
        correctAnswer: "5",
        skill: "algebra_integers",
        explanation: "Add 5: 3x = 15. Divide by 3: x = 5.",
      }),
    ],
  },
  secure: {
    1: [
      mastery({
        id: "msec1a",
        prompt: "Which expression is equivalent to -2(x - 3)?",
        options: ["-2x + 6", "-2x - 6", "2x + 6", "2x - 6"],
        correctAnswer: "-2x + 6",
        skill: "algebra_integers",
        explanation: "Distribute -2: -2 × x = -2x and -2 × -3 = 6.",
      }),
      mastery({
        id: "msec1b",
        prompt: "Solve 3x + (-7) = 8.",
        options: ["5", "-5", "1", "-1"],
        correctAnswer: "5",
        skill: "algebra_integers",
        explanation: "Add 7: 3x = 15. Divide by 3: x = 5.",
      }),
      mastery({
        id: "msec1c",
        prompt: "-4 - (-9) = ?",
        options: ["5", "-13", "13", "-5"],
        correctAnswer: "5",
        skill: "double_negative",
        explanation: "-4 + 9 = 5.",
      }),
      mastery({
        id: "msec1d",
        prompt: "(-3) × (-2) × (-1) = ?",
        options: ["-6", "6", "-5", "5"],
        correctAnswer: "-6",
        skill: "integer_multiplication",
        explanation: "(-3) × (-2) = 6, then 6 × (-1) = -6.",
      }),
      mastery({
        id: "msec1e",
        prompt: "If x = -2, what is 5 - 2x?",
        options: ["9", "1", "-9", "-1"],
        correctAnswer: "9",
        skill: "algebra_integers",
        explanation: "5 - 2(-2) = 5 + 4 = 9.",
      }),
    ],
    2: [
      mastery({
        id: "msec2a",
        prompt: "Which expression is equivalent to -3(x + 2)?",
        options: ["-3x - 6", "-3x + 6", "3x - 6", "3x + 6"],
        correctAnswer: "-3x - 6",
        skill: "algebra_integers",
        explanation: "Distribute -3: -3x - 6.",
      }),
      mastery({
        id: "msec2b",
        prompt: "Solve 4x - (-5) = 13.",
        options: ["2", "-2", "4.5", "-4.5"],
        correctAnswer: "2",
        skill: "algebra_integers",
        explanation: "4x + 5 = 13, so 4x = 8 and x = 2.",
      }),
      mastery({
        id: "msec2c",
        prompt: "-7 - (-2) = ?",
        options: ["-5", "-9", "5", "9"],
        correctAnswer: "-5",
        skill: "double_negative",
        explanation: "-7 + 2 = -5.",
      }),
      mastery({
        id: "msec2d",
        prompt: "(-2) × (-4) × 3 = ?",
        options: ["24", "-24", "9", "-9"],
        correctAnswer: "24",
        skill: "integer_multiplication",
        explanation: "(-2) × (-4) = 8, then 8 × 3 = 24.",
      }),
      mastery({
        id: "msec2e",
        prompt: "If x = -3, what is -2x + 1?",
        options: ["7", "-5", "5", "-7"],
        correctAnswer: "7",
        skill: "algebra_integers",
        explanation: "-2(-3) + 1 = 6 + 1 = 7.",
      }),
    ],
  },
};

export const demoDiagnosticAnswers = {
  d1: "-1",
  d2: "3",
  d3: "3",
  d4: "6",
  d5: "3",
};

export const demoMasteryAnswers = {
  negative_operations: {
    1: { m1a: "-3", m1b: "-8", m1c: "8", m1d: "8", m1e: "2" },
    2: { m2a: "3", m2b: "-6", m2c: "8", m2d: "12", m2e: "2" },
  },
  integer_multiplication: {
    1: { mm1a: "-12", mm1b: "10", mm1c: "-18", mm1d: "0", mm1e: "-8" },
    2: { mm2a: "-14", mm2b: "-24", mm2c: "-27", mm2d: "9", mm2e: "6" },
  },
  algebra_integers: {
    1: { ma1a: "13", ma1b: "5", ma1c: "-4", ma1d: "-4", ma1e: "-1" },
    2: { ma2a: "9", ma2b: "-3", ma2c: "-3", ma2d: "-5", ma2e: "-3" },
  },
  surface_errors: {
    1: { ms1a: "3", ms1b: "-6", ms1c: "7", ms1d: "-10", ms1e: "4" },
    2: { ms2a: "-4", ms2b: "-7", ms2c: "7", ms2d: "15", ms2e: "5" },
  },
  secure: {
    1: { msec1a: "-2x + 6", msec1b: "5", msec1c: "5", msec1d: "-6", msec1e: "9" },
    2: { msec2a: "-3x - 6", msec2b: "2", msec2c: "-5", msec2d: "24", msec2e: "7" },
  },
};

export function getMasterySet(gapKey, attempt) {
  const key = masterySets[gapKey] ? gapKey : "negative_operations";
  const set = masterySets[key][attempt] || masterySets[key][1];
  return set.map((item) => ({ ...item }));
}

export function publicQuestion(question, demoAnswer) {
  return {
    id: question.id,
    prompt: question.prompt,
    options: [...question.options],
    skill: question.skill,
    ...(demoAnswer ? { demoAnswer } : {}),
  };
}

export function findQuestion(list, id) {
  return list.find((question) => question.id === id);
}

export function isCorrect(question, answer) {
  return String(answer) === String(question.correctAnswer);
}

export function getDemoAnswer(kind, learner, gapKey, attempt, questionId) {
  if (!learner?.isDemo) return undefined;
  if (kind === "diagnostic") return demoDiagnosticAnswers[questionId];
  const byGap = demoMasteryAnswers[gapKey] || demoMasteryAnswers.negative_operations;
  return byGap[attempt]?.[questionId];
}
