// backend/executeEnrollmentSync.js - Execute Canonical StudentEnrollment Sync & Post-Sync Verification
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const Exam = require("./models/Exam");
const StudentMark = require("./models/StudentMark");
const StudentResult = require("./models/StudentResult");
const User = require("./models/User");
const Class = require("./models/Class");
const StudentEnrollment = require("./models/StudentEnrollment");
const AcademicYear = require("./models/AcademicYear");
const { syncStudentEnrollment } = require("./services/enrollmentService");

async function executeSync() {
  console.log("==================================================");
  console.log("   CANONICAL STUDENT ENROLLMENT SYNC EXECUTION   ");
  console.log("==================================================\n");

  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/teachhub";
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB database:", mongoose.connection.name);

  try {
    // 1. Verify Pre-Sync Baseline Counts
    const preUsers = await User.countDocuments();
    const preStudents = await User.countDocuments({ role: "student" });
    const preExams = await Exam.countDocuments();
    const preMarks = await StudentMark.countDocuments();
    const preResults = await StudentResult.countDocuments();
    const preEnrollments = await StudentEnrollment.countDocuments();

    console.log("\n--- PRE-SYNC BASELINE COUNTS ---");
    console.log(`Users Total: ${preUsers} (Active Students: ${preStudents})`);
    console.log(`Exams Total: ${preExams}`);
    console.log(`StudentMarks Total: ${preMarks}`);
    console.log(`StudentResults Total: ${preResults}`);
    console.log(`StudentEnrollments Total: ${preEnrollments}`);

    if (preUsers !== 34 || preExams !== 16 || preMarks !== 40 || preResults !== 5 || preEnrollments !== 0) {
      console.error("❌ FAILED: Pre-sync baseline counts do not match expected production state!");
      process.exit(1);
    }
    console.log("✓ Pre-sync baseline counts verified matching expected production baseline.");

    // 2. Fetch Active Year and Candidate Students
    const currentYearDoc = await AcademicYear.findOne({ isCurrent: true }).lean();
    const activeAcademicYear = currentYearDoc ? currentYearDoc.yearString : "2026-2027";

    const candidateStudents = await User.find({
      role: "student",
      classId: { $ne: null }
    }).sort({ name: 1 }).lean();

    console.log(`\nFound ${candidateStudents.length} candidate students eligible for canonical enrollment creation (Academic Year: ${activeAcademicYear}).`);

    if (candidateStudents.length !== 9) {
      console.error(`❌ FAILED: Expected exactly 9 assigned candidate students, found ${candidateStudents.length}`);
      process.exit(1);
    }

    // 3. Execute Canonical Enrollment Creation (One by One with Atomic Validation)
    const createdEnrollments = [];

    for (const student of candidateStudents) {
      const schoolName = (student.schoolName || student.requestedSchool || "").trim();
      if (!schoolName || !student.classId) {
        console.error(`❌ FAILED: Student ${student.name} (${student._id}) missing schoolName or classId!`);
        process.exit(1);
      }

      // Check idempotency
      const existing = await StudentEnrollment.findOne({
        student: student._id,
        schoolName,
        academicYear: activeAcademicYear
      });

      if (existing) {
        console.log(`Notice: Enrollment for ${student.name} already exists (ID: ${existing._id}). Skipping creation.`);
        createdEnrollments.push(existing);
        continue;
      }

      const classDoc = await Class.findById(student.classId).lean();
      if (!classDoc) {
        console.error(`❌ FAILED: Class ${student.classId} not found for student ${student.name}`);
        process.exit(1);
      }

      console.log(`Creating enrollment for: ${student.name} | Class: Class ${classDoc.name} | Section: ${student.section || classDoc.section || "A"} | Roll: ${student.rollNo ?? "null"}`);

      const enrollment = await syncStudentEnrollment({
        studentId: student._id,
        schoolName,
        academicYear: activeAcademicYear,
        classId: student.classId,
        section: student.section,
        rollNo: student.rollNo,
        reason: "Initial Canonical Enrollment Sync"
      });

      if (!enrollment || !enrollment._id) {
        console.error(`❌ FAILED: Enrollment creation returned null for student ${student.name}`);
        process.exit(1);
      }

      createdEnrollments.push(enrollment);
    }

    console.log(`\nSuccessfully created ${createdEnrollments.length} canonical StudentEnrollment documents.`);

    // 4. Post-Sync Database Verification
    const postUsers = await User.countDocuments();
    const postExams = await Exam.countDocuments();
    const postMarks = await StudentMark.countDocuments();
    const postResults = await StudentResult.countDocuments();
    const postEnrollments = await StudentEnrollment.countDocuments();

    console.log("\n==================================================");
    console.log("   POST-SYNC DATABASE VERIFICATION COUNTS        ");
    console.log("==================================================");
    console.log(`Users Total: ${postUsers} (Expected: 34)`);
    console.log(`Exams Total: ${postExams} (Expected: 16)`);
    console.log(`StudentMarks Total: ${postMarks} (Expected: 40)`);
    console.log(`StudentResults Total: ${postResults} (Expected: 5)`);
    console.log(`StudentEnrollments Total: ${postEnrollments} (Expected: 9)`);

    let syncFailed = false;

    if (postUsers !== 34) {
      console.error("❌ FAILED: Users count mutated!");
      syncFailed = true;
    }
    if (postExams !== 16) {
      console.error("❌ FAILED: Exams count mutated!");
      syncFailed = true;
    }
    if (postMarks !== 40) {
      console.error("❌ FAILED: StudentMarks count mutated!");
      syncFailed = true;
    }
    if (postResults !== 5) {
      console.error("❌ FAILED: StudentResults count mutated!");
      syncFailed = true;
    }
    if (postEnrollments !== 9) {
      console.error(`❌ FAILED: StudentEnrollments count is ${postEnrollments}, expected 9!`);
      syncFailed = true;
    }

    if (syncFailed) {
      console.error("❌ CRITICAL STOP CONDITION TRIGGERED: Post-sync verification failed!");
      process.exit(1);
    }

    // 5. Verify Uniqueness & Safety Constraints
    const enrollmentsList = await StudentEnrollment.find().populate("student", "name").populate("class", "name").lean();
    const canonicalSet = new Set();
    let duplicateCanonical = false;

    enrollmentsList.forEach(e => {
      const key = `${e.student._id.toString()}_${e.schoolName}_${e.academicYear}`;
      if (canonicalSet.has(key)) {
        duplicateCanonical = true;
      }
      canonicalSet.add(key);
    });

    if (duplicateCanonical || canonicalSet.size !== 9) {
      console.error("❌ FAILED: Duplicate canonical enrollment identities found!");
      process.exit(1);
    } else {
      console.log("✓ PASSED: 9 unique canonical StudentEnrollment identities verified (0 duplicates).");
    }

    // Verify roll number uniqueness across (schoolName, academicYear, class, section)
    const rollSet = new Set();
    let rollConflict = false;
    enrollmentsList.forEach(e => {
      if (e.rollNo !== null && e.rollNo !== undefined) {
        const rKey = `${e.schoolName}_${e.academicYear}_${e.class._id.toString()}_${e.section}_${e.rollNo}`;
        if (rollSet.has(rKey)) rollConflict = true;
        rollSet.add(rKey);
      }
    });

    if (rollConflict) {
      console.error("❌ FAILED: Roll number conflict detected in created enrollments!");
      process.exit(1);
    } else {
      console.log("✓ PASSED: 0 roll number conflicts across created StudentEnrollments.");
    }

    // Verify StudentMark.exam and StudentMark.enrollment remain unpopulated
    const unpopulatedExamCount = await StudentMark.countDocuments({ exam: null });
    const unpopulatedEnrollmentCount = await StudentMark.countDocuments({ enrollment: null });

    console.log(`\n[Sanity Check] StudentMarks with exam: null -> ${unpopulatedExamCount} / 40`);
    console.log(`[Sanity Check] StudentMarks with enrollment: null -> ${unpopulatedEnrollmentCount} / 40`);

    if (unpopulatedExamCount !== 40 || unpopulatedEnrollmentCount !== 40) {
      console.error("❌ FAILED: StudentMark.exam or StudentMark.enrollment was populated prematurely!");
      process.exit(1);
    } else {
      console.log("✓ PASSED: StudentMark.exam and StudentMark.enrollment remain 100% unpopulated (0 records mutated).");
    }

    console.log("\n==================================================");
    console.log("   CANONICAL ENROLLMENT SYNC COMPLETED SUCCESSFULLY ");
    console.log("==================================================\n");

  } catch (err) {
    console.error("❌ Error during canonical enrollment sync:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

executeSync();
