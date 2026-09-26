// backend/executeStudentMarkMigration.js - Controlled StudentMark Migration & Verification
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

async function executeStudentMarkMigration() {
  const startTime = new Date();
  console.log("==================================================");
  console.log("   PHASE 2C — STUDENTMARK MIGRATION EXECUTION     ");
  console.log("==================================================\n");

  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/teachhub";
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB database:", mongoose.connection.name);

  try {
    // 1. Pre-Migration Collection Counts Baseline Check
    const preUsers = await User.countDocuments();
    const preExams = await Exam.countDocuments();
    const preMarks = await StudentMark.countDocuments();
    const preResults = await StudentResult.countDocuments();
    const preEnrollments = await StudentEnrollment.countDocuments();

    console.log("\n--- PRE-MIGRATION COLLECTION COUNTS ---");
    console.log(`Users Total: ${preUsers}`);
    console.log(`Exams Total: ${preExams}`);
    console.log(`StudentMarks Total: ${preMarks}`);
    console.log(`StudentResults Total: ${preResults}`);
    console.log(`StudentEnrollments Total: ${preEnrollments}`);

    if (preUsers !== 34 || preExams !== 16 || preMarks !== 40 || preResults !== 5 || preEnrollments !== 9) {
      console.error("❌ FAILED: Pre-migration counts do not match expected production baseline!");
      process.exit(1);
    }

    // 2. Fetch all required documents
    const allMarks = await StudentMark.find().lean();
    const allExams = await Exam.find().lean();
    const allEnrollments = await StudentEnrollment.find().lean();
    const allClasses = await Class.find().lean();
    const allSubjects = await Subject.find().lean();

    const classMap = new Map(allClasses.map(c => [c._id.toString(), c]));
    const subjectMap = new Map(allSubjects.map(s => [s._id.toString(), s]));

    console.log(`\nFound ${allMarks.length} StudentMark documents to migrate.`);

    // 3. Pre-Migration Mapping & Pre-Validation
    const migrationInstructions = [];
    let preValidationFailed = false;

    for (const mark of allMarks) {
      const markIdStr = mark._id.toString();
      const studentIdStr = mark.student.toString();
      const classIdStr = mark.class ? mark.class.toString() : null;
      const subjectIdStr = mark.subject ? mark.subject.toString() : null;

      if (!classIdStr || !subjectIdStr || !classMap.has(classIdStr) || !subjectMap.has(subjectIdStr)) {
        console.error(`❌ Pre-validation failed: StudentMark ${markIdStr} has invalid class or subject ObjectId!`);
        preValidationFailed = true;
        continue;
      }

      const targetClassDoc = classMap.get(classIdStr);
      const sameLevelClassIds = allClasses
        .filter(c => c.schoolName === mark.schoolName && c.name === targetClassDoc.name)
        .map(c => c._id.toString());

      // Resolve candidate Exam
      const candidateExams = allExams.filter(e =>
        e.schoolName === mark.schoolName &&
        sameLevelClassIds.includes(e.class ? e.class.toString() : "") &&
        (e.subject ? e.subject.toString() : "") === subjectIdStr &&
        e.examTerm === mark.examTerm &&
        e.academicYear === mark.academicYear
      );

      if (candidateExams.length !== 1) {
        console.error(`❌ Pre-validation failed: StudentMark ${markIdStr} matched ${candidateExams.length} Exams (expected exactly 1)!`);
        preValidationFailed = true;
        continue;
      }

      // Resolve candidate StudentEnrollment
      const candidateEnrollments = allEnrollments.filter(e =>
        e.student.toString() === studentIdStr &&
        e.schoolName === mark.schoolName &&
        e.academicYear === mark.academicYear
      );

      if (candidateEnrollments.length !== 1) {
        console.error(`❌ Pre-validation failed: StudentMark ${markIdStr} matched ${candidateEnrollments.length} Enrollments (expected exactly 1)!`);
        preValidationFailed = true;
        continue;
      }

      migrationInstructions.push({
        mark,
        targetExamId: candidateExams[0]._id,
        targetEnrollmentId: candidateEnrollments[0]._id
      });
    }

    if (preValidationFailed || migrationInstructions.length !== 40) {
      console.error(`❌ CRITICAL STOP CONDITION: Pre-migration mapping failed! Instructions count: ${migrationInstructions.length}/40. Aborting write operations.`);
      process.exit(1);
    }
    console.log("✓ Pre-validation PASSED: 40/40 StudentMarks resolved to exactly 1 Exam and 1 Enrollment.");

    // 4. Controlled Atomic Migration Execution (Per-Record Targeted Update)
    let updatedCount = 0;
    let alreadyCorrectCount = 0;
    let failedCount = 0;

    for (const item of migrationInstructions) {
      const markId = item.mark._id;
      const currentMark = await StudentMark.findById(markId);

      if (!currentMark) {
        console.error(`❌ FAILED: StudentMark ${markId} missing during update!`);
        failedCount++;
        continue;
      }

      const examAlreadySet = currentMark.exam && currentMark.exam.toString() === item.targetExamId.toString();
      const enrollmentAlreadySet = currentMark.enrollment && currentMark.enrollment.toString() === item.targetEnrollmentId.toString();

      if (examAlreadySet && enrollmentAlreadySet) {
        alreadyCorrectCount++;
        continue;
      }

      // Perform targeted update
      currentMark.exam = item.targetExamId;
      currentMark.enrollment = item.targetEnrollmentId;

      await currentMark.save();
      updatedCount++;
    }

    const endTime = new Date();
    console.log(`\nMigration completed in ${(endTime - startTime)} ms.`);
    console.log(`  - StudentMarks Examined: ${allMarks.length}`);
    console.log(`  - StudentMarks Updated:  ${updatedCount}`);
    console.log(`  - Already Correct:       ${alreadyCorrectCount}`);
    console.log(`  - Failed Updates:        ${failedCount}`);

    if (failedCount > 0) {
      console.error(`❌ CRITICAL STOP CONDITION: ${failedCount} record updates failed!`);
      process.exit(1);
    }

    // 5. Post-Migration Field Integrity Check (Before vs After comparison)
    const postMarks = await StudentMark.find().lean();
    let unexpectedMutations = 0;

    for (const orig of allMarks) {
      const post = postMarks.find(m => m._id.toString() === orig._id.toString());
      if (!post) {
        console.error(`❌ Field integrity error: StudentMark ${orig._id} missing post-migration!`);
        unexpectedMutations++;
        continue;
      }

      // Verify business fields remain 100% untouched
      if (
        post.student.toString() !== orig.student.toString() ||
        post.class.toString() !== orig.class.toString() ||
        post.subject.toString() !== orig.subject.toString() ||
        post.section !== orig.section ||
        post.examTerm !== orig.examTerm ||
        post.academicYear !== orig.academicYear ||
        post.marksObtained !== orig.marksObtained ||
        post.maxMarks !== orig.maxMarks ||
        post.isAbsent !== orig.isAbsent ||
        post.grade !== orig.grade ||
        post.schoolName !== orig.schoolName
      ) {
        console.error(`❌ Unexpected field mutation detected on StudentMark ${orig._id}!`);
        unexpectedMutations++;
      }
    }

    console.log(`\n[Integrity Check] Unexpected Field Mutations: ${unexpectedMutations}`);
    if (unexpectedMutations > 0) {
      console.error("❌ FAILED: Unexpected field mutations detected post-migration!");
      process.exit(1);
    } else {
      console.log("✓ PASSED: 0 unexpected field mutations. Only 'exam' and 'enrollment' fields populated.");
    }

    // 6. Post-Migration Mapping & Reference Verification
    const populatedExamCount = await StudentMark.countDocuments({ exam: { $ne: null } });
    const populatedEnrollmentCount = await StudentMark.countDocuments({ enrollment: { $ne: null } });
    const legacyTermPreservedCount = await StudentMark.countDocuments({ examTerm: "Half-Yearly" });

    console.log(`\n[Reference Verification] StudentMarks with exam populated: ${populatedExamCount} / 40`);
    console.log(`[Reference Verification] StudentMarks with enrollment populated: ${populatedEnrollmentCount} / 40`);
    console.log(`[Term Preservation] StudentMarks with legacy term 'Half-Yearly': ${legacyTermPreservedCount} / 40`);

    if (populatedExamCount !== 40 || populatedEnrollmentCount !== 40) {
      console.error("❌ FAILED: Not all StudentMark records have exam and enrollment populated!");
      process.exit(1);
    }
    if (legacyTermPreservedCount !== 40) {
      console.error("❌ FAILED: Legacy examTerm values were mutated during migration!");
      process.exit(1);
    }

    // 7. Post-Migration Duplicate Check for candidate { exam, student }
    const examStudentGroups = new Map();
    postMarks.forEach(m => {
      const key = `${m.exam.toString()}_${m.student.toString()}`;
      if (!examStudentGroups.has(key)) examStudentGroups.set(key, []);
      examStudentGroups.get(key).push(m);
    });

    let duplicateGroupsCount = 0;
    examStudentGroups.forEach((group, key) => {
      if (group.length > 1) duplicateGroupsCount++;
    });

    console.log(`\n[Duplicate Check] Candidate { exam, student } duplicate groups: ${duplicateGroupsCount}`);
    if (duplicateGroupsCount > 0) {
      console.error("❌ FAILED: Candidate duplicate { exam, student } groups detected!");
      process.exit(1);
    } else {
      console.log("✓ PASSED: 0 duplicate { exam, student } groups exist in migrated records.");
    }

    // 8. Collection Counts & Index Inventory Verification
    const postUsersCount = await User.countDocuments();
    const postExamsCount = await Exam.countDocuments();
    const postMarksCount = await StudentMark.countDocuments();
    const postResultsCount = await StudentResult.countDocuments();
    const postEnrollmentsCount = await StudentEnrollment.countDocuments();

    console.log("\n==================================================");
    console.log("   POST-MIGRATION COLLECTION COUNTS              ");
    console.log("==================================================");
    console.log(`Users Total: ${postUsersCount} (Expected: 34)`);
    console.log(`Exams Total: ${postExamsCount} (Expected: 16)`);
    console.log(`StudentMarks Total: ${postMarksCount} (Expected: 40)`);
    console.log(`StudentResults Total: ${postResultsCount} (Expected: 5)`);
    console.log(`StudentEnrollments Total: ${postEnrollmentsCount} (Expected: 9)`);

    if (
      postUsersCount !== 34 ||
      postExamsCount !== 16 ||
      postMarksCount !== 40 ||
      postResultsCount !== 5 ||
      postEnrollmentsCount !== 9
    ) {
      console.error("❌ FAILED: Collection counts mutated unexpectedly!");
      process.exit(1);
    }
    console.log("✓ All collection counts match baseline production state.");

    // Verify Legacy Unique Indexes
    const markIdx = await StudentMark.collection.indexes();
    const resultIdx = await StudentResult.collection.indexes();

    const hasMarkLegacyIndex = markIdx.some(idx =>
      idx.key.student === 1 && idx.key.subject === 1 && idx.key.examTerm === 1 && idx.key.academicYear === 1 && idx.unique === true
    );
    const hasResultLegacyIndex = resultIdx.some(idx =>
      idx.key.student === 1 && idx.key.examTerm === 1 && idx.key.academicYear === 1 && idx.unique === true
    );

    console.log(`\n[Index Verification] StudentMark legacy unique index active: ${hasMarkLegacyIndex ? "YES ✓" : "NO ❌"}`);
    console.log(`[Index Verification] StudentResult legacy unique index active: ${hasResultLegacyIndex ? "YES ✓" : "NO ❌"}`);

    if (!hasMarkLegacyIndex || !hasResultLegacyIndex) {
      console.error("❌ FAILED: Legacy unique indexes altered or missing!");
      process.exit(1);
    }

    console.log("\n==================================================");
    console.log("   PHASE 2C STUDENTMARK MIGRATION: PASS ✅         ");
    console.log("==================================================\n");

  } catch (err) {
    console.error("❌ Error during StudentMark migration execution:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

executeStudentMarkMigration();
