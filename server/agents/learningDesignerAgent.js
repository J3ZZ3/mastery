import { interventionSchema, parseWith } from "../validation/schemas.js";

const lessons = {
  negative_operations: {
    primary: {
      title: "Making sense of negative numbers",
      objective: "Use a number line to add and subtract integers, including subtracting a negative.",
      summary:
        "We will rebuild integer operations around one idea: a sign tells you direction. Then we will connect that to the rule for subtracting a negative.",
      sections: [
        {
          id: "direction",
          title: "A sign tells you direction",
          body: "On a number line, positive numbers move right and negative numbers move left. The sign is not just a label — it tells you which way to move. Start at -3 and move 2 left: you land on -5.",
        },
        {
          id: "double-negative",
          title: "Subtracting a negative changes direction",
          body: "5 - (-2) means start at 5 and move the opposite of left, which is right. So 5 - (-2) = 5 + 2 = 7. Two minus signs next to each other become a plus.",
        },
        {
          id: "multiply",
          title: "Multiplication follows a sign rule",
          body: "Multiply the sizes first, then decide the sign. Same signs give a positive result. Different signs give a negative result. So (-2) x (-3) = +6, but (-2) x 3 = -6.",
        },
      ],
      numberLine: {
        title: "Start at -3 and move 2 places left",
        min: -10,
        max: 10,
        step: 1,
        markers: [
          { value: -3, label: "start -3", tone: "amber" },
          { value: -5, label: "end -5", tone: "mint" },
        ],
        arrows: [{ from: -3, to: -5, label: "-2", tone: "sky" }],
      },
      workedExamples: [
        {
          title: "Subtracting a positive: -3 - 2",
          steps: [
            "Find -3 on the number line.",
            "Subtracting 2 means moving 2 places to the left.",
            "You finish at -5.",
          ],
          answer: "-5",
        },
        {
          title: "Subtracting a negative: 5 - (-2)",
          steps: [
            "Write the expression: 5 - (-2).",
            "Subtracting a negative reverses direction, so it becomes 5 + 2.",
            "5 + 2 = 7.",
          ],
          answer: "7",
        },
        {
          title: "Multiplying two negatives: -2 x (-3)",
          steps: [
            "Multiply the sizes: 2 x 3 = 6.",
            "A negative times a negative gives a positive.",
            "So -2 x (-3) = 6.",
          ],
          answer: "6",
        },
      ],
      practiceQuestions: [
        {
          id: "p1a1",
          prompt: "-5 + 3 = ?",
          options: ["-2", "2", "-8", "8"],
          hint: "Start at -5. Adding 3 means moving 3 places to the right.",
          skill: "integer_addition",
          correctAnswer: "-2",
          explanation: "Start at -5 and move 3 places right. You land on -2.",
        },
        {
          id: "p1a2",
          prompt: "4 - (-6) = ?",
          options: ["10", "-2", "2", "-10"],
          hint: "Subtracting a negative is the same as adding: rewrite 4 - (-6) as 4 + 6.",
          skill: "double_negative",
          correctAnswer: "10",
          explanation: "4 - (-6) becomes 4 + 6 = 10.",
        },
        {
          id: "p1a3",
          prompt: "-3 x (-4) = ?",
          options: ["12", "-12", "7", "-7"],
          hint: "Multiply 3 x 4 first. Then apply the rule for two negative factors.",
          skill: "integer_multiplication",
          correctAnswer: "12",
          explanation: "A negative times a negative is positive, so -3 x (-4) = 12.",
        },
      ],
      recap:
        "Move left for negatives and right for positives. Subtracting a negative becomes adding a positive. Multiply the sizes, then use the sign rule.",
    },
    adapted: {
      title: "Negative numbers: a slower second pass",
      summary:
        "This version separates the two moves that caused difficulty: changing direction for a double negative, and keeping the correct sign when multiplying.",
      sections: [
        {
          id: "direction-2",
          title: "Step 1: decide the direction",
          body: "Before calculating, name the starting number and the movement. For -8 + 5, start at -8 and move 5 right. For -6 - 2, start at -6 and move 2 left. Say the movement out loud or write it down.",
        },
        {
          id: "double-negative-2",
          title: "Step 2: two minus signs become a plus",
          body: "When you see a minus followed by a negative number, rewrite it before doing anything else. -6 - (-2) becomes -6 + 2. 2 - (-7) becomes 2 + 7. Do this rewrite as its own step.",
        },
        {
          id: "multiply-2",
          title: "Step 3: multiply, then fix the sign",
          body: "Multiply without looking at the signs: 5 x 2 = 10. Then count negative factors. Two negatives make a positive; one negative makes a negative. So -5 x (-2) = 10.",
        },
        {
          id: "check-2",
          title: "Step 4: check with a quick estimate",
          body: "Use the number line to sanity-check the size and direction. If the result moved the wrong way, revisit the rewrite step before changing your answer.",
        },
      ],
      numberLine: {
        title: "Start at -6 and add 2 (because subtracting -2 is adding 2)",
        min: -10,
        max: 10,
        step: 1,
        markers: [
          { value: -6, label: "start -6", tone: "amber" },
          { value: -4, label: "end -4", tone: "mint" },
        ],
        arrows: [{ from: -6, to: -4, label: "+2", tone: "mint" }],
      },
      workedExamples: [
        {
          title: "Rewrite first: -6 - (-2)",
          steps: [
            "Circle the double negative: -(-2).",
            "Rewrite it as +2: the expression becomes -6 + 2.",
            "Start at -6 and move 2 right to reach -4.",
          ],
          answer: "-4",
        },
        {
          title: "Then calculate: 2 - (-7)",
          steps: [
            "Rewrite 2 - (-7) as 2 + 7.",
            "Both numbers are now positive, so add them.",
            "2 + 7 = 9.",
          ],
          answer: "9",
        },
        {
          title: "Sign rule: -5 x (-2)",
          steps: [
            "Multiply the sizes: 5 x 2 = 10.",
            "There are two negative factors, so the result is positive.",
            "So -5 x (-2) = 10.",
          ],
          answer: "10",
        },
      ],
      practiceQuestions: [
        {
          id: "p1b1",
          prompt: "-8 + 5 = ?",
          options: ["-3", "3", "-13", "13"],
          hint: "Start at -8. Adding 5 means moving 5 places right.",
          skill: "integer_addition",
          correctAnswer: "-3",
          explanation: "Start at -8 and move 5 right to reach -3.",
        },
        {
          id: "p1b2",
          prompt: "2 - (-7) = ?",
          options: ["9", "-5", "5", "-9"],
          hint: "Rewrite the double negative first: 2 - (-7) becomes 2 + 7.",
          skill: "double_negative",
          correctAnswer: "9",
          explanation: "2 - (-7) becomes 2 + 7 = 9.",
        },
        {
          id: "p1b3",
          prompt: "-5 x (-2) = ?",
          options: ["10", "-10", "7", "-7"],
          hint: "Multiply 5 x 2. Two negative factors make the answer positive.",
          skill: "integer_multiplication",
          correctAnswer: "10",
          explanation: "A negative times a negative is positive, so -5 x (-2) = 10.",
        },
      ],
      recap:
        "Rewrite double negatives as addition, decide the direction before calculating, and count negative factors only after multiplying the sizes.",
    },
  },

  integer_multiplication: {
    primary: {
      title: "Integer multiplication: size first, sign second",
      objective: "Apply the sign rules for multiplying positive and negative integers.",
      summary: "Separate multiplication into two jobs: multiply the sizes, then choose the sign from the number of negative factors.",
      sections: [
        {
          id: "two-jobs",
          title: "Two separate jobs",
          body: "First multiply the sizes, ignoring signs. Then decide whether the answer is positive or negative. Example: -6 x 4. Sizes: 6 x 4 = 24. One negative factor means the answer is -24.",
        },
        {
          id: "count",
          title: "Count the negative factors",
          body: "An even number of negative factors gives a positive result. An odd number gives a negative result. This also explains why (-2) x (-3) = 6.",
        },
        {
          id: "powers",
          title: "Powers are repeated multiplication",
          body: "(-2)^3 means (-2) x (-2) x (-2). There are three negative factors, so the result is negative: -8. (-3)^2 has two negative factors, so it is +9.",
        },
      ],
      numberLine: null,
      workedExamples: [
        {
          title: "-3 x 4",
          steps: ["Multiply the sizes: 3 x 4 = 12.", "There is one negative factor, so the sign is negative.", "Answer: -12."],
          answer: "-12",
        },
        {
          title: "-5 x (-2)",
          steps: ["Multiply the sizes: 5 x 2 = 10.", "There are two negative factors, so the sign is positive.", "Answer: 10."],
          answer: "10",
        },
        {
          title: "(-2)^3",
          steps: ["Write the repeated product: (-2) x (-2) x (-2).", "There are three negative factors, so the result is negative.", "Answer: -8."],
          answer: "-8",
        },
      ],
      practiceQuestions: [
        {
          id: "p2a1",
          prompt: "6 x (-3) = ?",
          options: ["-18", "18", "-9", "9"],
          hint: "Multiply 6 x 3, then decide the sign from the single negative factor.",
          skill: "integer_multiplication",
          correctAnswer: "-18",
          explanation: "One negative factor makes the result negative: 6 x 3 = 18, so the answer is -18.",
        },
        {
          id: "p2a2",
          prompt: "-4 x (-5) = ?",
          options: ["20", "-20", "9", "-9"],
          hint: "Two negative factors means a positive result.",
          skill: "integer_multiplication",
          correctAnswer: "20",
          explanation: "A negative times a negative is positive: 4 x 5 = 20.",
        },
        {
          id: "p2a3",
          prompt: "(-2) x 3 x (-1) = ?",
          options: ["6", "-6", "5", "-5"],
          hint: "Work left to right: -2 x 3 = -6, then multiply by -1.",
          skill: "integer_multiplication",
          correctAnswer: "6",
          explanation: "-2 x 3 = -6, then -6 x (-1) = 6.",
        },
      ],
      recap: "Multiply the sizes, count negative factors, then apply the sign rule. An even number of negatives gives a positive result.",
    },
    adapted: {
      title: "Multiplication signs: a guided second pass",
      summary: "We will slow the sign decision down and check it separately from the multiplication fact.",
      sections: [
        {
          id: "rewrite-2",
          title: "Write the sign decision as a sentence",
          body: "After multiplying, write a short sentence: 'There is one negative factor, so the answer is negative.' This stops the sign from becoming an afterthought.",
        },
        {
          id: "even-odd-2",
          title: "Even and odd counts",
          body: "Two negatives: positive. Three negatives: negative. Four negatives: positive. The pattern depends only on the count of negative factors, not their order.",
        },
      ],
      workedExamples: [
        {
          title: "7 x (-2)",
          steps: ["7 x 2 = 14.", "One negative factor, so the result is negative.", "Answer: -14."],
          answer: "-14",
        },
        {
          title: "(-6) x (-3)",
          steps: ["6 x 3 = 18.", "Two negative factors, so the result is positive.", "Answer: 18."],
          answer: "18",
        },
      ],
      practiceQuestions: [
        {
          id: "p2b1",
          prompt: "-7 x 2 = ?",
          options: ["-14", "14", "-5", "5"],
          hint: "Multiply 7 x 2, then count the negative factor.",
          skill: "integer_multiplication",
          correctAnswer: "-14",
          explanation: "One negative factor makes -14.",
        },
        {
          id: "p2b2",
          prompt: "(-6) x (-3) = ?",
          options: ["18", "-18", "9", "-9"],
          hint: "Two negative factors give a positive product.",
          skill: "integer_multiplication",
          correctAnswer: "18",
          explanation: "6 x 3 = 18 with two negative factors, so the answer is +18.",
        },
        {
          id: "p2b3",
          prompt: "(-3)^2 = ?",
          options: ["9", "-9", "6", "-6"],
          hint: "Write it out as (-3) x (-3). How many negative factors are there?",
          skill: "integer_multiplication",
          correctAnswer: "9",
          explanation: "(-3) x (-3) = 9.",
        },
      ],
      recap: "State the sign rule in words before writing the answer.",
    },
  },

  algebra_integers: {
    primary: {
      title: "Solving equations with signed numbers",
      objective: "Use inverse operations to solve equations that contain negative terms.",
      summary: "Treat an equation as a balance. Undo operations in reverse order and apply inverse operations to negative terms carefully.",
      sections: [
        {
          id: "balance",
          title: "An equation is a balance",
          body: "Whatever you do to one side, do to the other. To undo adding -5, add 5 to both sides. To undo subtracting 7, add 7.",
        },
        {
          id: "inverse",
          title: "Undo operations in reverse order",
          body: "For 2x + (-5) = 11, first undo the -5 by adding 5. Then divide both sides by 2. Work backwards through the operations applied to x.",
        },
        {
          id: "negative-terms",
          title: "Watch the negative terms",
          body: "2x + (-5) is the same as 2x - 5. Rewriting it can make the inverse operation clearer. Do not change the sign of the term on the other side unless you perform the same operation there too.",
        },
      ],
      numberLine: null,
      workedExamples: [
        {
          title: "2x + (-5) = 11",
          steps: ["Rewrite 2x + (-5) as 2x - 5.", "Add 5 to both sides: 2x = 16.", "Divide by 2: x = 8."],
          answer: "x = 8",
        },
        {
          title: "3x - 7 = -1",
          steps: ["Add 7 to both sides: 3x = 6.", "Divide by 3: x = 2.", "Check by substitution: 3(2) - 7 = -1."],
          answer: "x = 2",
        },
        {
          title: "-2x + 5 = 11",
          steps: ["Subtract 5 from both sides: -2x = 6.", "Divide by -2: x = -3.", "Check: -2(-3) + 5 = 6 + 5 = 11."],
          answer: "x = -3",
        },
      ],
      practiceQuestions: [
        {
          id: "p3a1",
          prompt: "x + (-4) = 9. What is x?",
          options: ["13", "5", "-13", "-5"],
          hint: "Undo adding -4 by adding 4 to both sides.",
          skill: "algebra_integers",
          correctAnswer: "13",
          explanation: "x - 4 = 9, so x = 9 + 4 = 13.",
        },
        {
          id: "p3a2",
          prompt: "2x + (-3) = 7. What is x?",
          options: ["5", "-5", "2", "-2"],
          hint: "First undo the -3, then divide both sides by 2.",
          skill: "algebra_integers",
          correctAnswer: "5",
          explanation: "2x - 3 = 7, so 2x = 10 and x = 5.",
        },
        {
          id: "p3a3",
          prompt: "-3x = 12. What is x?",
          options: ["-4", "4", "-9", "9"],
          hint: "Divide both sides by -3.",
          skill: "algebra_integers",
          correctAnswer: "-4",
          explanation: "x = 12 / (-3) = -4.",
        },
      ],
      recap: "Undo operations in reverse order, keep the equation balanced, and substitute your answer to check.",
    },
    adapted: {
      title: "Signed equations: a second guided pass",
      summary: "We will write each inverse operation as a separate line so a sign cannot be dropped between steps.",
      sections: [
        {
          id: "line-by-line",
          title: "One change per line",
          body: "Never combine two inverse operations in your head. Write the equation, perform one change on both sides, then write a new line.",
        },
        {
          id: "check-2",
          title: "Substitute every time",
          body: "Substitute your value back into the original equation. If both sides match, the sign handling is probably correct. If not, the check shows you where to look.",
        },
      ],
      workedExamples: [
        {
          title: "x + (-7) = 2",
          steps: ["Rewrite as x - 7 = 2.", "Add 7 to both sides: x = 9.", "Check: 9 - 7 = 2."],
          answer: "x = 9",
        },
        {
          title: "-2x + 5 = 11",
          steps: ["Subtract 5: -2x = 6.", "Divide by -2: x = -3.", "Check: -2(-3) + 5 = 11."],
          answer: "x = -3",
        },
      ],
      practiceQuestions: [
        {
          id: "p3b1",
          prompt: "x + (-7) = 2. What is x?",
          options: ["9", "-9", "5", "-5"],
          hint: "Rewrite as x - 7 = 2, then add 7 to both sides.",
          skill: "algebra_integers",
          correctAnswer: "9",
          explanation: "x = 2 + 7 = 9.",
        },
        {
          id: "p3b2",
          prompt: "3x - 4 = -13. What is x?",
          options: ["-3", "3", "-17", "17"],
          hint: "Add 4 first, then divide by 3.",
          skill: "algebra_integers",
          correctAnswer: "-3",
          explanation: "3x = -9, so x = -3.",
        },
        {
          id: "p3b3",
          prompt: "-2x + 5 = 11. What is x?",
          options: ["-3", "3", "-8", "8"],
          hint: "Subtract 5, then divide by -2.",
          skill: "algebra_integers",
          correctAnswer: "-3",
          explanation: "-2x = 6, so x = -3.",
        },
      ],
      recap: "Write one change per line and always substitute to check.",
    },
  },

  surface_errors: {
    primary: {
      title: "Slow down and check the sign",
      objective: "Reduce isolated calculation slips by checking the operation and sign separately.",
      summary: "The concepts are mostly in place. This short intervention focuses on a reliable checking routine.",
      sections: [
        {
          id: "two-decisions",
          title: "Separate the two decisions",
          body: "Before answering, ask two questions: which operation is this, and what happens to the sign? Saying them separately prevents one from overwriting the other.",
        },
        {
          id: "substitute",
          title: "Use a quick estimate or substitution",
          body: "For equations, substitute your answer. For arithmetic, estimate the size and direction on a number line. A check takes seconds and catches most slips.",
        },
        {
          id: "one-line",
          title: "Write one line at a time",
          body: "Avoid doing several sign changes mentally. Write the expression, rewrite any double negative, then calculate.",
        },
      ],
      numberLine: null,
      workedExamples: [
        {
          title: "-2 + 5",
          steps: ["Start at -2.", "Adding 5 moves right.", "Land on 3."],
          answer: "3",
        },
        {
          title: "-5 - 1",
          steps: ["Start at -5.", "Subtracting 1 moves left.", "Land on -6."],
          answer: "-6",
        },
        {
          title: "4 - (-3)",
          steps: ["Rewrite the double negative: 4 + 3.", "Add: 7.", "Check that the result moved right from 4."],
          answer: "7",
        },
      ],
      practiceQuestions: [
        {
          id: "p4a1",
          prompt: "-2 + 5 = ?",
          options: ["3", "-3", "7", "-7"],
          hint: "Start at -2 on the number line and move 5 places right.",
          skill: "integer_addition",
          correctAnswer: "3",
          explanation: "Start at -2 and move 5 right to reach 3.",
        },
        {
          id: "p4a2",
          prompt: "-5 - 1 = ?",
          options: ["-6", "-4", "6", "4"],
          hint: "Start at -5. Subtracting 1 moves one place left.",
          skill: "integer_subtraction",
          correctAnswer: "-6",
          explanation: "-5 - 1 = -6.",
        },
        {
          id: "p4a3",
          prompt: "4 - (-3) = ?",
          options: ["7", "1", "-7", "-1"],
          hint: "Rewrite the double negative before calculating.",
          skill: "double_negative",
          correctAnswer: "7",
          explanation: "4 - (-3) becomes 4 + 3 = 7.",
        },
      ],
      recap: "Name the operation, rewrite double negatives, then check size and direction.",
    },
    adapted: {
      title: "Checking routine: a second pass",
      summary: "A short repeat of the checking routine with fresh numbers.",
      sections: [
        {
          id: "routine",
          title: "Use the same three-step routine",
          body: "1) Rewrite double negatives. 2) Decide direction. 3) Check with a quick estimate.",
        },
      ],
      workedExamples: [
        {
          title: "-6 + 2",
          steps: ["Start at -6.", "Move 2 right.", "Land on -4."],
          answer: "-4",
        },
        {
          title: "2 - (-5)",
          steps: ["Rewrite as 2 + 5.", "Add: 7."],
          answer: "7",
        },
      ],
      practiceQuestions: [
        {
          id: "p4b1",
          prompt: "-6 + 2 = ?",
          options: ["-4", "4", "-8", "8"],
          hint: "Start at -6 and move 2 places right.",
          skill: "integer_addition",
          correctAnswer: "-4",
          explanation: "-6 + 2 = -4.",
        },
        {
          id: "p4b2",
          prompt: "-4 - 3 = ?",
          options: ["-7", "-1", "7", "1"],
          hint: "Start at -4 and move 3 places left.",
          skill: "integer_subtraction",
          correctAnswer: "-7",
          explanation: "-4 - 3 = -7.",
        },
        {
          id: "p4b3",
          prompt: "2 - (-5) = ?",
          options: ["7", "-3", "3", "-7"],
          hint: "Rewrite the double negative first.",
          skill: "double_negative",
          correctAnswer: "7",
          explanation: "2 + 5 = 7.",
        },
      ],
      recap: "The routine matters more than speed.",
    },
  },

  secure: {
    primary: {
      title: "Extending secure integer reasoning",
      objective: "Apply integer rules inside multi-step expressions and introductory algebra.",
      summary: "Your integer foundations look secure. This extension uses signed numbers inside distribution, equations and substitution.",
      sections: [
        {
          id: "distribute",
          title: "Distribute the sign carefully",
          body: "-2(x - 3) means multiply both terms inside the bracket by -2. -2 x x = -2x and -2 x (-3) = +6. The result is -2x + 6.",
        },
        {
          id: "verify",
          title: "Substitute to verify",
          body: "For an equation, substitute the value back into the original expression. For an identity, test a simple value such as x = 1.",
        },
        {
          id: "multi-step",
          title: "Track signs across steps",
          body: "Keep each line equivalent to the one above it. A sign error early in the line changes everything after it.",
        },
      ],
      numberLine: null,
      workedExamples: [
        {
          title: "Expand -2(x - 3)",
          steps: ["Multiply -2 by x: -2x.", "Multiply -2 by -3: +6.", "Result: -2x + 6."],
          answer: "-2x + 6",
        },
        {
          title: "Solve 3x + (-7) = 8",
          steps: ["Add 7: 3x = 15.", "Divide by 3: x = 5.", "Check: 3(5) - 7 = 8."],
          answer: "x = 5",
        },
        {
          title: "Evaluate 5 - 2x when x = -2",
          steps: ["Substitute: 5 - 2(-2).", "Multiply: 2(-2) = -4.", "5 - (-4) = 5 + 4 = 9."],
          answer: "9",
        },
      ],
      practiceQuestions: [
        {
          id: "p5a1",
          prompt: "Which expression is equivalent to -2(x - 3)?",
          options: ["-2x + 6", "-2x - 6", "2x + 6", "2x - 6"],
          hint: "Multiply both terms inside the brackets by -2.",
          skill: "algebra_integers",
          correctAnswer: "-2x + 6",
          explanation: "-2 x x = -2x and -2 x (-3) = +6, giving -2x + 6.",
        },
        {
          id: "p5a2",
          prompt: "3x + (-7) = 8. What is x?",
          options: ["5", "-5", "1", "-1"],
          hint: "Rewrite as 3x - 7 = 8, then add 7.",
          skill: "algebra_integers",
          correctAnswer: "5",
          explanation: "3x = 15, so x = 5.",
        },
        {
          id: "p5a3",
          prompt: "If x = -2, what is 5 - 2x?",
          options: ["9", "1", "-9", "-1"],
          hint: "Substitute -2 for x, then evaluate 2 x (-2) before subtracting.",
          skill: "algebra_integers",
          correctAnswer: "9",
          explanation: "5 - 2(-2) = 5 + 4 = 9.",
        },
      ],
      recap: "Distribute signs to every term, keep equivalent lines, and verify by substitution.",
    },
    adapted: {
      title: "Integer reasoning: extension round two",
      summary: "A second extension round with distribution, substitution and signed equations.",
      sections: [
        {
          id: "extension",
          title: "Same rules, more steps",
          body: "The sign rules have not changed. Apply them to each term and keep a written trail so you can check your work.",
        },
      ],
      workedExamples: [
        {
          title: "-3(x + 2)",
          steps: ["Multiply -3 by x: -3x.", "Multiply -3 by 2: -6.", "Result: -3x - 6."],
          answer: "-3x - 6",
        },
      ],
      practiceQuestions: [
        {
          id: "p5b1",
          prompt: "Which expression is equivalent to -3(x + 2)?",
          options: ["-3x - 6", "-3x + 6", "3x - 6", "3x + 6"],
          hint: "Distribute -3 to both terms.",
          skill: "algebra_integers",
          correctAnswer: "-3x - 6",
          explanation: "-3x - 6.",
        },
        {
          id: "p5b2",
          prompt: "4x - (-5) = 13. What is x?",
          options: ["2", "-2", "4.5", "-4.5"],
          hint: "Rewrite 4x - (-5) as 4x + 5.",
          skill: "algebra_integers",
          correctAnswer: "2",
          explanation: "4x + 5 = 13, so 4x = 8 and x = 2.",
        },
        {
          id: "p5b3",
          prompt: "If x = -3, what is -2x + 1?",
          options: ["7", "-5", "5", "-7"],
          hint: "Substitute -3 for x, then apply the sign rules.",
          skill: "algebra_integers",
          correctAnswer: "7",
          explanation: "-2(-3) + 1 = 6 + 1 = 7.",
        },
      ],
      recap: "Keep the same sign rules and write each equivalent line.",
    },
  },
};

export function buildIntervention({ gapKey, attempt = 1 }) {
  const lesson = lessons[gapKey] || lessons.negative_operations;
  const adapted = attempt > 1;
  const content = adapted ? { ...lesson.primary, ...lesson.adapted } : lesson.primary;
  const key = lessons[gapKey] ? gapKey : "negative_operations";

  return parseWith(
    interventionSchema,
    {
      gapKey: key,
      title: content.title,
      objective: content.objective,
      summary: content.summary,
      sections: content.sections,
      numberLine: content.numberLine,
      workedExamples: content.workedExamples,
      practiceQuestions: content.practiceQuestions,
      recap: content.recap,
      adapted,
      adaptationNote: adapted
        ? "Adapted after the first mastery check. This version reduces the cognitive load, separates the sign decision from the calculation, and uses fresh practice questions."
        : null,
    },
    "Intervention",
  );
}

export async function runLearningDesignerAgent({ diagnosis, attempt, ai, latencyMs = 0, remainingDifficulty = "" }) {
  const fallback = buildIntervention({ gapKey: diagnosis.gapKey, attempt });

  const { data, meta } = await ai.generateJSON({
    schema: interventionSchema,
    fallback,
    latencyMs,
    label: "Learning Designer Agent",
    instructions:
      "Design a short, concrete intervention for the diagnosed gap. Break it into manageable sections, include worked examples, and provide practice questions with hints that do not reveal the answer. If this is a retry, adapt the approach using the remaining difficulty.",
    payload: { diagnosis, attempt, remainingDifficulty, threshold: 80 },
  });

  return { data, meta };
}
