export const SKILL_LABELS = {
  integer_addition: "Adding integers",
  integer_subtraction: "Subtracting integers",
  double_negative: "Subtracting a negative",
  integer_multiplication: "Multiplying integers",
  algebra_integers: "Equations with integers",
};

export const GAP_LABELS = {
  negative_operations: "Negative number operations",
  integer_multiplication: "Integer multiplication signs",
  algebra_integers: "Solving equations with integers",
  surface_errors: "Isolated calculation slips",
  secure: "Secure integer foundations",
};

export const skillLabel = (skill) => SKILL_LABELS[skill] || skill;

export const gapLabel = (gapKey) => GAP_LABELS[gapKey] || gapKey;
