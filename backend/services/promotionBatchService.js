// backend/services/promotionBatchService.js
const PromotionBatch = require("../models/PromotionBatch");

/**
 * Promotion Batch Service
 * Manages lifecycle of PromotionBatch documents (DRAFT, APPROVED, EXECUTED, ROLLED_BACK)
 */

/**
 * Creates a DRAFT PromotionBatch record for audit and review
 */
const createDraftBatch = async ({
  schoolName,
  sourceAcademicYear,
  targetAcademicYear,
  students = [],
  executedBy
}) => {
  const existingBatch = await PromotionBatch.findOne({
    schoolName,
    sourceAcademicYear,
    targetAcademicYear,
    status: { $in: ["DRAFT", "APPROVED"] }
  });

  if (existingBatch) {
    existingBatch.students = students;
    existingBatch.totalStudentsEvaluated = students.length;
    existingBatch.totalPromoted = students.filter(s => s.status === "PROMOTED").length;
    existingBatch.totalRetained = students.filter(s => s.status === "RETAINED").length;
    existingBatch.totalGraduated = students.filter(s => s.status === "GRADUATED").length;
    await existingBatch.save();
    return existingBatch;
  }

  const batch = new PromotionBatch({
    schoolName,
    sourceAcademicYear,
    targetAcademicYear,
    status: "DRAFT",
    students,
    totalStudentsEvaluated: students.length,
    totalPromoted: students.filter(s => s.status === "PROMOTED").length,
    totalRetained: students.filter(s => s.status === "RETAINED").length,
    totalGraduated: students.filter(s => s.status === "GRADUATED").length,
    executedBy,
    auditHistory: [
      {
        status: "DRAFT",
        changedBy: executedBy,
        timestamp: new Date(),
        notes: "Promotion batch draft initialized"
      }
    ]
  });

  await batch.save();
  return batch;
};

/**
 * Fetches PromotionBatch by ID or query parameters
 */
const getPromotionBatch = async (batchId) => {
  return await PromotionBatch.findById(batchId)
    .populate("students.student", "name rollNo admissionNo")
    .populate("executedBy", "name email")
    .lean();
};

/**
 * Updates status of a PromotionBatch (e.g. DRAFT -> APPROVED)
 */
const updateBatchStatus = async ({ batchId, status, notes = "", changedBy }) => {
  const batch = await PromotionBatch.findById(batchId);
  if (!batch) {
    throw new Error(`PromotionBatch ${batchId} not found`);
  }

  batch.status = status;
  batch.auditHistory.push({
    status,
    changedBy,
    timestamp: new Date(),
    notes
  });

  await batch.save();
  return batch;
};

module.exports = {
  createDraftBatch,
  getPromotionBatch,
  updateBatchStatus
};
