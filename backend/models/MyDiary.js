const mongoose = require("mongoose");

const myDiarySchema = new mongoose.Schema(
  {
    schoolName: {
      type: String,
      required: true,
      index: true
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      index: true
    },
    className: {
      type: String,
      default: ""
    },
    section: {
      type: String,
      default: "A"
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject"
    },
    subjectName: {
      type: String,
      required: true
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    teacherName: {
      type: String,
      default: ""
    },
    homeworkDate: {
      type: String, // "YYYY-MM-DD" e.g., "2026-09-05"
      required: true,
      index: true
    },
    dueDate: {
      type: String, // "YYYY-MM-DD"
      default: ""
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    types: [
      {
        type: String // e.g. "Question / Exercise", "Writing", "Reading", "Learn / Memorize", "Project", "Practice", "Worksheet", "Other"
      }
    ],
    studentCompletions: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          index: true
        },
        status: {
          type: String,
          enum: ["Pending", "Completed", "Submitted", "Reviewed"],
          default: "Pending"
        },
        completedAt: {
          type: Date
        },
        submittedAt: {
          type: Date
        },
        attachment: {
          url: { type: String, default: "" },
          filename: { type: String, default: "" },
          fileType: { type: String, default: "" }
        },
        reviewNote: {
          type: String,
          default: ""
        }
      }
    ]
  },
  { timestamps: true }
);

myDiarySchema.index({ schoolName: 1, homeworkDate: 1 });
myDiarySchema.index({ classId: 1, homeworkDate: 1 });

module.exports = mongoose.model("MyDiary", myDiarySchema);
