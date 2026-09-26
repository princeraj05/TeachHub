// backend/utils/examTermConstants.js

const EXAM_TERMS = {
  THREE_MONTH: {
    key: "THREE_MONTH",
    label: "3-Month Examination",
    shortLabel: "3-Month",
    order: 1
  },
  SIX_MONTH: {
    key: "SIX_MONTH",
    label: "6-Month Examination (Mid-Term)",
    shortLabel: "6-Month",
    order: 2
  },
  NINE_MONTH: {
    key: "NINE_MONTH",
    label: "9-Month Examination",
    shortLabel: "9-Month",
    order: 3
  },
  FINAL_YEAR: {
    key: "FINAL_YEAR",
    label: "Final Year Examination (Annual)",
    shortLabel: "Final Year",
    order: 4
  }
};

const DEFAULT_TERM_WEIGHTAGES = [
  { termKey: "THREE_MONTH", displayName: "3-Month Examination", weightagePercentage: 10 },
  { termKey: "SIX_MONTH", displayName: "6-Month Examination (Mid-Term)", weightagePercentage: 30 },
  { termKey: "NINE_MONTH", displayName: "9-Month Examination", weightagePercentage: 20 },
  { termKey: "FINAL_YEAR", displayName: "Final Year Examination (Annual)", weightagePercentage: 40 }
];

const MISSING_TERM_POLICIES = {
  PROPORTIONAL_REDISTRIBUTION: "PROPORTIONAL_REDISTRIBUTION",
  EXEMPT_WITHOUT_PENALTY: "EXEMPT_WITHOUT_PENALTY",
  ZERO_SCORE: "ZERO_SCORE"
};

const VALID_NEW_EXAM_TERMS = ["THREE_MONTH", "SIX_MONTH", "NINE_MONTH", "FINAL_YEAR"];
const ALL_VALID_EXAM_TERMS = ["THREE_MONTH", "SIX_MONTH", "NINE_MONTH", "FINAL_YEAR", "Half-Yearly", "Annual"];

module.exports = {
  EXAM_TERMS,
  DEFAULT_TERM_WEIGHTAGES,
  MISSING_TERM_POLICIES,
  VALID_NEW_EXAM_TERMS,
  ALL_VALID_EXAM_TERMS
};

