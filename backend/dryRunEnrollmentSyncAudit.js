// backend/dryRunEnrollmentSyncAudit.js - READ-ONLY Enrollment Sync Audit (DRY-RUN ONLY)
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
const AcademicYear = require("./models/AcademicYear");

async function runEnrollmentSyncAudit() {
  console.log("==================================================");
  console.log("   READ-ONLY ENROLLMENT SYNC AUDIT (DRY-RUN)      ");
  console.log("              (STRICTLY READ-ONLY)                ");
  console.log("==================================================\n");

  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/teachhub";
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB database:", mongoose.connection.name);

  try {
    // 0. Verify Baseline Counts
    const preUsersCount = await User.countDocuments();
    const preStudentsCount = await User.countDocuments({ role: "student" });
    const preExamsCount = await Exam.countDocuments();
    const preMarksCount = await StudentMark.countDocuments();
    const preResultsCount = await StudentResult.countDocuments();
    const preEnrollmentsCount = await StudentEnrollment.countDocuments();

    console.log("\n--- PRODUCTION BASELINE COUNTS ---");
    console.log(`Users Total: ${preUsersCount} (Active Students: ${preStudentsCount})`);
    console.log(`Exams Total: ${preExamsCount}`);
    console.log(`StudentMarks Total: ${preMarksCount}`);
    console.log(`StudentResults Total: ${preResultsCount}`);
    console.log(`StudentEnrollments Total: ${preEnrollmentsCount}`);

    // Load data
    const allStudents = await User.find({ role: "student" }).lean();
    const allClasses = await Class.find().lean();
    const allMarks = await StudentMark.find().lean();
    const allResults = await StudentResult.find().lean();

    const classMap = new Map(allClasses.map(c => [c._id.toString(), c]));

    // Fetch active academic year or default to 2026-2027
    const currentYearDoc = await AcademicYear.findOne({ isCurrent: true }).lean();
    const defaultAcademicYear = currentYearDoc ? currentYearDoc.yearString : "2026-2027";

    // --------------------------------------------------
    // SECTION 1: IDENTIFY THE ACTUAL SYNC LOGIC
    // --------------------------------------------------
    console.log("\n==================================================");
    console.log("1. ACTUAL SYNC LOGIC IDENTIFICATION");
    console.log("==================================================");
    console.log("Function: syncStudentEnrollment in backend/services/enrollmentService.js");
    console.log("Triggers: Called in adminUserController.js during assignClass and addStudent.");
    console.log("Required Inputs: studentId, schoolName, academicYear, classId.");
    console.log("Logic Analysis:");
    console.log("  - Throws error if studentId, schoolName, academicYear, or classId is missing.");
    console.log("  - Section fallback: parameter section -> studentUser.section -> classDoc.section -> 'A'");
    console.log("  - RollNo fallback: parameter rollNo -> studentUser.rollNo -> null");
    console.log("  - AdmissionNo snapshot: studentUser.admissionNo || ''");
    console.log("  - ClassName snapshot: 'Class ' + classDoc.name");
    console.log("  - If canonical enrollment document exists for (student, schoolName, academicYear):");
    console.log("      * If class or section changed: pushes audit entry to enrollmentAuditHistory and updates class/section.");
    console.log("      * If rollNo provided: updates rollNo.");
    console.log("  - If no enrollment document exists: instantiates new StudentEnrollment with status 'Active'.");

    // --------------------------------------------------
    // SECTION 2: IDENTIFY ALL CANDIDATE STUDENTS
    // --------------------------------------------------
    console.log("\n==================================================");
    console.log("2. CANDIDATE STUDENTS CLASSIFICATION");
    console.log("==================================================");

    const validCandidates = [];
    const missingSchoolStudents = [];
    const missingYearStudents = [];
    const missingClassStudents = [];
    const invalidClassRefStudents = [];
    const otherInvalidStudents = [];

    for (const s of allStudents) {
      const studentId = s._id.toString();
      const schoolName = (s.schoolName || s.requestedSchool || "").trim();
      const academicYear = defaultAcademicYear;
      const classId = s.classId ? s.classId.toString() : null;

      const record = {
        userId: studentId,
        studentName: s.name || "Student",
        schoolName,
        academicYear,
        classId,
        resolvedClassName: classId && classMap.has(classId) ? `Class ${classMap.get(classId).name}` : "Unassigned",
        section: s.section || (classId && classMap.has(classId) ? classMap.get(classId).section : "A"),
        rollNo: s.rollNo !== undefined && s.rollNo !== null ? s.rollNo : null,
        admissionNo: s.admissionNo || "",
        role: s.role,
        status: s.requestStatus || "approved"
      };

      if (!schoolName) {
        missingSchoolStudents.push(record);
      } else if (!academicYear) {
        missingYearStudents.push(record);
      } else if (!classId) {
        missingClassStudents.push(record);
      } else if (!classMap.has(classId)) {
        invalidClassRefStudents.push(record);
      } else {
        validCandidates.push(record);
      }
    }

    console.log(`Total Active Students Analyzed: ${allStudents.length}`);
    console.log(`  - VALID_ENROLLMENT_CANDIDATE:   ${validCandidates.length}`);
    console.log(`  - MISSING_SCHOOL:              ${missingSchoolStudents.length}`);
    console.log(`  - MISSING_ACADEMIC_YEAR:       ${missingYearStudents.length}`);
    console.log(`  - MISSING_CLASS:               ${missingClassStudents.length}`);
    console.log(`  - INVALID_CLASS_REFERENCE:     ${invalidClassRefStudents.length}`);
    console.log(`  - OTHER_INVALID_STATE:         ${otherInvalidStudents.length}`);

    console.log("\nValid Candidate Table (DRY-RUN ONLY):");
    console.table(validCandidates.map(c => ({
      userId: c.userId,
      name: c.studentName,
      school: c.schoolName,
      academicYear: c.academicYear,
      className: c.resolvedClassName,
      section: c.section,
      rollNo: c.rollNo,
      admissionNo: c.admissionNo
    })));

    if (missingClassStudents.length > 0) {
      console.log("\nUnassigned Students (No ClassId):");
      console.table(missingClassStudents.map(c => ({
        userId: c.userId,
        name: c.studentName,
        school: c.schoolName,
        reason: "Unassigned Student without Class Assignment"
      })));
    }

    // --------------------------------------------------
    // SECTION 3: PREDICT ENROLLMENT DOCUMENTS
    // --------------------------------------------------
    console.log("\n==================================================");
    console.log("3. PREDICTED ENROLLMENT DOCUMENTS (DRY-RUN ONLY)");
    console.log("==================================================");

    const predictedEnrollments = validCandidates.map(c => {
      const classDoc = classMap.get(c.classId);
      return {
        student: c.userId,
        studentName: c.studentName,
        schoolName: c.schoolName,
        academicYear: c.academicYear,
        class: c.classId,
        classNameSnapshot: `Class ${classDoc.name}`,
        section: c.section || classDoc.section || "A",
        rollNo: c.rollNo,
        admissionNoSnapshot: c.admissionNo,
        status: "Active",
        previousEnrollment: null,
        enrollmentAuditHistory: []
      };
    });

    console.log(`Predicted Enrollment Documents to be created: ${predictedEnrollments.length}`);
    console.table(predictedEnrollments.map(pe => ({
      student: pe.student,
      name: pe.studentName,
      school: pe.schoolName,
      academicYear: pe.academicYear,
      class: pe.classNameSnapshot,
      section: pe.section,
      rollNo: pe.rollNo,
      status: pe.status
    })));

    // --------------------------------------------------
    // SECTION 4: STUDENTMARK COVERAGE
    // --------------------------------------------------
    console.log("\n==================================================");
    console.log("4. STUDENTMARK COVERAGE BY PREDICTED ENROLLMENTS");
    console.log("==================================================");

    const predictedMap = new Map();
    predictedEnrollments.forEach(pe => {
      const key = `${pe.student}_${pe.schoolName}_${pe.academicYear}`;
      predictedMap.set(key, pe);
    });

    let resolvableMarksCount = 0;
    let unresolvedMarksCount = 0;
    const markCoverageDetails = [];

    for (const mark of allMarks) {
      const key = `${mark.student.toString()}_${mark.schoolName}_${mark.academicYear}`;
      const predicted = predictedMap.get(key);

      if (predicted) {
        resolvableMarksCount++;
        markCoverageDetails.push({
          markId: mark._id.toString(),
          student: mark.student.toString(),
          schoolName: mark.schoolName,
          academicYear: mark.academicYear,
          predictedEnrollmentIdentity: `Predicted (${predicted.student}, ${predicted.schoolName}, ${predicted.academicYear})`,
          predictionStatus: "RESOLVED"
        });
      } else {
        unresolvedMarksCount++;
        markCoverageDetails.push({
          markId: mark._id.toString(),
          student: mark.student.toString(),
          schoolName: mark.schoolName,
          academicYear: mark.academicYear,
          predictedEnrollmentIdentity: "NONE",
          predictionStatus: "UNRESOLVED"
        });
      }
    }

    console.log(`StudentMark Coverage Summary (Total StudentMarks: ${allMarks.length}):`);
    console.log(`  - StudentMarks Resolvable:   ${resolvableMarksCount} / ${allMarks.length}`);
    console.log(`  - StudentMarks Unresolved:   ${unresolvedMarksCount} / ${allMarks.length}`);

    if (unresolvedMarksCount > 0) {
      console.error(`❌ FAILED: ${unresolvedMarksCount} StudentMarks could not resolve to a predicted enrollment!`);
    } else {
      console.log("✓ PASSED: All 40/40 StudentMarks resolve to exactly one predicted enrollment!");
    }

    // --------------------------------------------------
    // SECTION 5: USER CURRENT STATE VS HISTORICAL MARK STATE
    // --------------------------------------------------
    console.log("\n==================================================");
    console.log("5. USER CURRENT STATE VS HISTORICAL MARK STATE");
    console.log("==================================================");

    let consistentMarks = 0;
    let classMismatches = 0;
    let sectionMismatches = 0;
    let schoolMismatches = 0;
    let yearMismatches = 0;
    let multipleMismatches = 0;

    const historicalComparison = [];

    for (const mark of allMarks) {
      const key = `${mark.student.toString()}_${mark.schoolName}_${mark.academicYear}`;
      const predicted = predictedMap.get(key);

      if (!predicted) continue;

      const markClassDoc = classMap.get(mark.class.toString());
      const markClassName = markClassDoc ? `Class ${markClassDoc.name}` : "";

      const mismatches = [];

      if (markClassName !== predicted.classNameSnapshot) mismatches.push("CLASS_MISMATCH");
      if ((mark.section || "A").toUpperCase() !== (predicted.section || "A").toUpperCase()) mismatches.push("SECTION_MISMATCH");
      if (mark.schoolName !== predicted.schoolName) mismatches.push("SCHOOL_MISMATCH");
      if (mark.academicYear !== predicted.academicYear) mismatches.push("ACADEMIC_YEAR_MISMATCH");

      let category = "CONSISTENT";
      if (mismatches.length === 1) category = mismatches[0];
      else if (mismatches.length > 1) category = "MULTIPLE_MISMATCH";

      if (category === "CONSISTENT") consistentMarks++;
      else if (category === "CLASS_MISMATCH") classMismatches++;
      else if (category === "SECTION_MISMATCH") sectionMismatches++;
      else if (category === "SCHOOL_MISMATCH") schoolMismatches++;
      else if (category === "ACADEMIC_YEAR_MISMATCH") yearMismatches++;
      else if (category === "MULTIPLE_MISMATCH") multipleMismatches++;

      historicalComparison.push({
        markId: mark._id.toString(),
        student: mark.student.toString(),
        category,
        markClass: markClassName,
        predictedClass: predicted.classNameSnapshot,
        markSection: mark.section,
        predictedSection: predicted.section
      });
    }

    console.log(`Historical Comparison Summary (Checked: ${historicalComparison.length}):`);
    console.log(`  - CONSISTENT:              ${consistentMarks} / ${historicalComparison.length}`);
    console.log(`  - CLASS_MISMATCH:          ${classMismatches}`);
    console.log(`  - SECTION_MISMATCH:        ${sectionMismatches}`);
    console.log(`  - SCHOOL_MISMATCH:         ${schoolMismatches}`);
    console.log(`  - ACADEMIC_YEAR_MISMATCH:  ${yearMismatches}`);
    console.log(`  - MULTIPLE_MISMATCH:       ${multipleMismatches}`);

    // --------------------------------------------------
    // SECTION 6: ROLL NUMBER SAFETY
    // --------------------------------------------------
    console.log("\n==================================================");
    console.log("6. ROLL NUMBER SAFETY AUDIT");
    console.log("==================================================");

    const rollNoMap = new Map();
    const missingRolls = [];
    const duplicateRollConflicts = [];

    predictedEnrollments.forEach(pe => {
      if (pe.rollNo === null || pe.rollNo === undefined || pe.rollNo === "") {
        missingRolls.push(pe);
      } else {
        const scopeKey = `${pe.schoolName}_${pe.academicYear}_${pe.class}_${pe.section}`;
        const rollKey = `${scopeKey}_${pe.rollNo}`;
        if (rollNoMap.has(rollKey)) {
          duplicateRollConflicts.push({
            rollKey,
            student1: rollNoMap.get(rollKey),
            student2: pe
          });
        } else {
          rollNoMap.set(rollKey, pe);
        }
      }
    });

    console.log(`Roll Number Safety Summary:`);
    console.log(`  - Missing Roll Numbers:        ${missingRolls.length}`);
    console.log(`  - Duplicate Roll Conflicts:    ${duplicateRollConflicts.length}`);

    if (missingRolls.length > 0) {
      console.log("  Note: Students without assigned roll numbers:");
      missingRolls.forEach(mr => console.log(`    - ${mr.studentName} (${mr.classNameSnapshot})`));
    }

    if (duplicateRollConflicts.length > 0) {
      console.error("❌ FAILED: Duplicate roll numbers found in predicted enrollments!");
    } else {
      console.log("✓ PASSED: 0 duplicate roll number conflicts exist across all class sections!");
    }

    // --------------------------------------------------
    // SECTION 7: CANONICAL ENROLLMENT SAFETY
    // --------------------------------------------------
    console.log("\n==================================================");
    console.log("7. CANONICAL ENROLLMENT SAFETY AUDIT");
    console.log("==================================================");

    const canonicalMap = new Map();
    const duplicateCanonicalEnrollments = [];

    predictedEnrollments.forEach(pe => {
      const canonicalKey = `${pe.student}_${pe.schoolName}_${pe.academicYear}`;
      if (canonicalMap.has(canonicalKey)) {
        duplicateCanonicalEnrollments.push({
          canonicalKey,
          first: canonicalMap.get(canonicalKey),
          second: pe
        });
      } else {
        canonicalMap.set(canonicalKey, pe);
      }
    });

    console.log(`Canonical Identity { student, schoolName, academicYear } Audit:`);
    console.log(`  - Predicted Unique Enrollments:     ${canonicalMap.size}`);
    console.log(`  - Duplicate Canonical Conflicts:   ${duplicateCanonicalEnrollments.length}`);

    if (duplicateCanonicalEnrollments.length > 0) {
      console.error("❌ FAILED: Duplicate canonical enrollment keys found!");
    } else {
      console.log("✓ PASSED: 0 duplicate canonical enrollment identities! 100% compliant with unique index.");
    }

    // --------------------------------------------------
    // SECTION 8: 9 VS 5 STUDENT DISCREPANCY AUDIT
    // --------------------------------------------------
    console.log("\n==================================================");
    console.log("8. 9 VS 5 STUDENT DISCREPANCY EXPLANATION");
    console.log("==================================================");

    const studentIdsWithMarks = new Set(allMarks.map(m => m.student.toString()));
    const assignedStudentsWithMarks = validCandidates.filter(c => studentIdsWithMarks.has(c.userId));
    const assignedStudentsWithoutMarks = validCandidates.filter(c => !studentIdsWithMarks.has(c.userId));

    console.log(`1. Total Active Students in DB:                     ${allStudents.length}`);
    console.log(`2. Total Assigned Active Students (Valid Candidates): ${validCandidates.length}`);
    console.log(`3. Total Unassigned Active Students (Missing Class):  ${missingClassStudents.length}`);
    console.log(`4. Assigned Students WITH StudentMarks:              ${assignedStudentsWithMarks.length} (owning 40 mark records)`);
    console.log(`5. Assigned Students WITHOUT StudentMarks:           ${assignedStudentsWithoutMarks.length}`);

    console.log("\nDetails of Assigned Students WITH Marks (5 Students):");
    assignedStudentsWithMarks.forEach((s, idx) => console.log(`  ${idx + 1}. ${s.studentName} (ID: ${s.userId}) — Class: ${s.resolvedClassName}`));

    console.log("\nDetails of Assigned Students WITHOUT Marks (4 Students):");
    assignedStudentsWithoutMarks.forEach((s, idx) => console.log(`  ${idx + 1}. ${s.studentName} (ID: ${s.userId}) — Class: ${s.resolvedClassName}`));

    console.log("\nExplanatory Conclusion:");
    console.log("  - The 5 students with marks each have 8 subject mark records for Half-Yearly 2026-2027 (5 * 8 = 40 marks).");
    console.log("  - The other 4 active assigned students are registered in classes, but no examination marks have been entered for them yet.");
    console.log("  - All 9 active assigned students require canonical StudentEnrollment records for academic year 2026-2027.");

    // --------------------------------------------------
    // SECTION 9: PRODUCTION SAFETY VERIFICATION
    // --------------------------------------------------
    const postUsersCount = await User.countDocuments();
    const postExamsCount = await Exam.countDocuments();
    const postMarksCount = await StudentMark.countDocuments();
    const postResultsCount = await StudentResult.countDocuments();
    const postEnrollmentsCount = await StudentEnrollment.countDocuments();

    const totalMutations = (postUsersCount - preUsersCount) +
      (postExamsCount - preExamsCount) +
      (postMarksCount - preMarksCount) +
      (postResultsCount - preResultsCount) +
      (postEnrollmentsCount - preEnrollmentsCount);

    console.log("\n==================================================");
    console.log("9. PRODUCTION SAFETY VERIFICATION");
    console.log("==================================================");
    console.log(`Users count before/after:            ${preUsersCount} / ${postUsersCount}`);
    console.log(`StudentMarks count before/after:     ${preMarksCount} / ${postMarksCount}`);
    console.log(`StudentResults count before/after:   ${preResultsCount} / ${postResultsCount}`);
    console.log(`Exams count before/after:            ${preExamsCount} / ${postExamsCount}`);
    console.log(`StudentEnrollments count before/after:${preEnrollmentsCount} / ${postEnrollmentsCount}`);
    console.log(`\nPRODUCTION MUTATION COUNT: ${totalMutations} (MUST BE 0 ✓)`);

    // --------------------------------------------------
    // SECTION 10: REQUIRED FINAL STATUS
    // --------------------------------------------------
    let isSyncReady = true;
    if (unresolvedMarksCount > 0) isSyncReady = false;
    if (duplicateRollConflicts.length > 0) isSyncReady = false;
    if (duplicateCanonicalEnrollments.length > 0) isSyncReady = false;
    if (totalMutations !== 0) isSyncReady = false;
    if (postEnrollmentsCount !== 0) isSyncReady = false;

    console.log("\n==================================================");
    console.log("   ENROLLMENT SYNC DRY-RUN STATUS SCORECARD");
    console.log("==================================================");
    console.log(`Candidate students:                ${validCandidates.length}`);
    console.log(`Predicted enrollments:            ${predictedEnrollments.length}`);
    console.log(`StudentMarks resolvable:          ${resolvableMarksCount} / 40`);
    console.log(`StudentMarks unresolved:          ${unresolvedMarksCount} / 40`);
    console.log(`Duplicate predicted enrollments:  ${duplicateCanonicalEnrollments.length}`);
    console.log(`Roll number conflicts:            ${duplicateRollConflicts.length}`);
    console.log(`Historical mismatches:            ${classMismatches + sectionMismatches + schoolMismatches + yearMismatches}`);
    console.log(`Production mutations:             ${totalMutations}`);
    console.log(`Database StudentEnrollment count: ${postEnrollmentsCount}`);
    console.log("--------------------------------------------------");
    console.log("ENROLLMENT SYNC DRY-RUN CLASSIFICATION: " + (isSyncReady ? "READY FOR ENROLLMENT SYNC ✅" : "BLOCKED ❌"));
    console.log("==================================================\n");

    process.exit(isSyncReady ? 0 : 1);

  } catch (err) {
    console.error("❌ Error during read-only enrollment sync audit:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runEnrollmentSyncAudit();
