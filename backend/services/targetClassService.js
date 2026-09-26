// backend/services/targetClassService.js
/**
 * Target Class Resolver & Progression Map Service
 * Maps student class levels to next-year canonical target classes or graduation state.
 */

const KINDERGARTEN_PROGRESSION = {
  "Nursery": "LKG",
  "LKG": "UKG",
  "UKG": "Class 1"
};

/**
 * Normalizes class name inputs to standard string format
 * e.g., "1", "Class 1", "class 1" -> "Class 1"
 */
const normalizeClassName = (rawClassName) => {
  if (!rawClassName) return "";
  const trimmed = String(rawClassName).trim();
  
  if (KINDERGARTEN_PROGRESSION[trimmed]) {
    return trimmed;
  }

  // Extract number if formatted as "Class X", "Xth", "Grade X", "X"
  const match = trimmed.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    return `Class ${num}`;
  }

  return trimmed;
};

/**
 * Calculates the next class name in sequence or GRADUATED for senior level
 */
const getNextClassName = (currentClassName) => {
  const normalized = normalizeClassName(currentClassName);
  
  if (KINDERGARTEN_PROGRESSION[normalized]) {
    return KINDERGARTEN_PROGRESSION[normalized];
  }

  const match = normalized.match(/\d+/);
  if (match) {
    const currentLevel = parseInt(match[0], 10);
    if (currentLevel >= 12) {
      return "GRADUATED";
    }
    return `Class ${currentLevel + 1}`;
  }

  return `${normalized} (Advanced)`;
};

/**
 * Resolves target class details considering promotion vs retention status
 */
const resolveTargetClass = ({ currentClassName, isRetained = false }) => {
  const normalizedCurrent = normalizeClassName(currentClassName);

  if (isRetained) {
    return {
      targetClassName: normalizedCurrent,
      isGraduation: false,
      status: "RETAINED"
    };
  }

  const targetClassName = getNextClassName(normalizedCurrent);
  const isGraduation = targetClassName === "GRADUATED";

  return {
    targetClassName,
    isGraduation,
    status: isGraduation ? "GRADUATED" : "PROMOTED"
  };
};

module.exports = {
  normalizeClassName,
  getNextClassName,
  resolveTargetClass
};
