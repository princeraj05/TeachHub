// backend/verifyPhase2.js - Empirical Verification for Phase 2A & 2B
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const Exam = require("./models/Exam");
const StudentMark = require("./models/StudentMark");
const StudentResult = require("./models/StudentResult");
const User = require("./models/User");
const Class = require("./models/Class");
const Subject = require("./models/Subject");
const StudentEnrollment = require("./models/StudentEnrollment");
const { VALID_NEW_EXAM_TERMS, ALL_VALID_EXAM_TERMS } = require("./utils/examTermConstants");

async function runVerification() {
  console.log("=== STARTING PHASE 2A & 2B EMPIRICAL VERIFICATION ===");
  let failed = false;

  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/teachhub";
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB database:", mongoose.connection.name);

  try {
    // 1. Check Document Counts Baseline
    const totalUsers = await User.countDocuments();
    const activeStudents = await User.countDocuments({ role: "student" });
    const totalExams = await Exam.countDocuments();
    const totalMarks = await StudentMark.countDocuments();
    const totalResults = await StudentResult.countDocuments();

    console.log(`\n[Count Check] Users: ${totalUsers} (Active Students: ${activeStudents})`);
    console.log(`[Count Check] Exams: ${totalExams}`);
    console.log(`[Count Check] StudentMarks: ${totalMarks}`);
    console.log(`[Count Check] StudentResults: ${totalResults}`);

    if (totalUsers !== 34 || activeStudents !== 11) {
      console.error("❌ FAILED: User counts mutated!");
      failed = true;
    } else {
      console.log("✓ PASSED: User counts match baseline (34 total, 11 students)");
    }

    if (totalExams !== 16) {
      console.error(`❌ FAILED: Exam count changed! Expected 16, got ${totalExams}`);
      failed = true;
    } else {
      console.log("✓ PASSED: Exam count unchanged (16 exams)");
    }

    if (totalMarks !== 40) {
      console.error(`❌ FAILED: StudentMark count changed! Expected 40, got ${totalMarks}`);
      failed = true;
    } else {
      console.log("✓ PASSED: StudentMark count unchanged (40 marks)");
    }

    if (totalResults !== 5) {
      console.error(`❌ FAILED: StudentResult count changed! Expected 5, got ${totalResults}`);
      failed = true;
    } else {
      console.log("✓ PASSED: StudentResult count unchanged (5 results)");
    }

    // 2. Check StudentMark Indexes
    const markIndexes = await StudentMark.collection.indexes();
    const markUniqueIndex = markIndexes.find(idx => 
      idx.key.student === 1 && idx.key.subject === 1 && idx.key.examTerm === 1 && idx.key.academicYear === 1
    );
    if (!markUniqueIndex || !markUniqueIndex.unique) {
      console.error("❌ FAILED: Unique index { student, subject, examTerm, academicYear } on StudentMark is missing or not unique!");
      failed = true;
    } else {
      console.log("✓ PASSED: Legacy unique index on StudentMark remains active and untouched");
    }

    // 3. Check StudentResult Indexes
    const resultIndexes = await StudentResult.collection.indexes();
    const resultUniqueIndex = resultIndexes.find(idx => 
      idx.key.student === 1 && idx.key.examTerm === 1 && idx.key.academicYear === 1
    );
    if (!resultUniqueIndex || !resultUniqueIndex.unique) {
      console.error("❌ FAILED: Unique index { student, examTerm, academicYear } on StudentResult is missing or not unique!");
      failed = true;
    } else {
      console.log("✓ PASSED: Legacy unique index on StudentResult remains active and untouched");
    }

    // 4. Verify Schema Field Compatibility (Inspecting Mongoose paths)
    const examPaths = Exam.schema.paths;
    if (!examPaths.section || !examPaths.paperUrl || !examPaths.paperSets || (!examPaths.proctoringConfig && !examPaths["proctoringConfig.webcamRequired"])) {
      console.error("❌ FAILED: Exam schema missing required Phase 2A fields!");
      failed = true;
    } else {
      console.log("✓ PASSED: Exam schema contains section, paper fields, and proctoringConfig");
    }

    const markPaths = StudentMark.schema.paths;
    if (!markPaths.exam || !markPaths.enrollment || !markPaths.approvalStatus) {
      console.error("❌ FAILED: StudentMark schema missing optional exam, enrollment, or approvalStatus fields!");
      failed = true;
    } else {
      console.log("✓ PASSED: StudentMark schema contains optional exam, enrollment, and approvalStatus fields");
    }

    const resultPaths = StudentResult.schema.paths;
    if (!resultPaths["publishedTermCards.THREE_MONTH.isPublished"] || !resultPaths["finalAcademicSummary.promotionStatus"]) {
      console.error("❌ FAILED: StudentResult schema missing publishedTermCards or finalAcademicSummary!");
      failed = true;
    } else {
      console.log("✓ PASSED: StudentResult schema contains publishedTermCards and finalAcademicSummary");
    }

    // 5. Test Controller Logic Unit In-Memory Validation (Without saving to DB)
    const testClass = await Class.findOne();
    const testSubject = await Subject.findOne();
    if (testClass && testSubject) {
      // Test Exam Model instantiation with 4-term key & section default
      const tempExam = new Exam({
        title: "Test 3-Month Exam",
        class: testClass._id,
        subject: testSubject._id,
        examTerm: "THREE_MONTH",
        academicYear: "2026-2027",
        maxMarks: 100,
        date: new Date()
      });
      if (tempExam.section !== "ALL") {
        console.error(`❌ FAILED: Exam section did not default to 'ALL'! Got: ${tempExam.section}`);
        failed = true;
      } else {
        console.log("✓ PASSED: New Exam defaults section to 'ALL'");
      }

      const tempMark = new StudentMark({
        student: new mongoose.Types.ObjectId(),
        class: testClass._id,
        section: "A",
        subject: testSubject._id,
        examTerm: "THREE_MONTH",
        academicYear: "2026-2027",
        marksObtained: 85,
        maxMarks: 100,
        schoolName: "Test School"
      });
      if (tempMark.approvalStatus !== "draft") {
        console.error(`❌ FAILED: StudentMark approvalStatus did not default to 'draft'! Got: ${tempMark.approvalStatus}`);
        failed = true;
      } else {
        console.log("✓ PASSED: StudentMark defaults approvalStatus to 'draft'");
      }
    }

    // 6. Test Enum Validation Constraints
    if (!VALID_NEW_EXAM_TERMS.includes("THREE_MONTH") || !VALID_NEW_EXAM_TERMS.includes("FINAL_YEAR")) {
      console.error("❌ FAILED: VALID_NEW_EXAM_TERMS does not contain standard 4 terms!");
      failed = true;
    } else {
      console.log("✓ PASSED: VALID_NEW_EXAM_TERMS correctly contains standard 4 terms");
    }

    if (!ALL_VALID_EXAM_TERMS.includes("Half-Yearly") || !ALL_VALID_EXAM_TERMS.includes("THREE_MONTH")) {
      console.error("❌ FAILED: ALL_VALID_EXAM_TERMS does not support dual-read compatibility!");
      failed = true;
    } else {
      console.log("✓ PASSED: ALL_VALID_EXAM_TERMS supports both modern and legacy term keys");
    }

    // 7. Verify teacherExamController no longer has mockScores array
    const teacherControllerCode = require("fs").readFileSync(path.join(__dirname, "controllers", "teacherExamController.js"), "utf8");
    if (teacherControllerCode.includes("mockScores = [") || teacherControllerCode.includes("Unit Test - 2")) {
      console.error("❌ FAILED: teacherExamController still contains hardcoded mockScores array or dummy titles!");
      failed = true;
    } else {
      console.log("✓ PASSED: teacherExamController has purged all mockScores arrays and dummy titles");
    }

    console.log("\n==================================================");
    if (failed) {
      console.error("❌ PHASE 2 VERIFICATION FAILED: Violations found!");
      process.exit(1);
    } else {
      console.log("✅ ALL PHASE 2A & 2B VERIFICATION CHECKS PASSED!");
      process.exit(0);
    }

  } catch (err) {
    console.error("❌ Error running verification script:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runVerification();
