const SubjectNote = require("../models/SubjectNote");
const Subject = require("../models/Subject");
const fs = require("fs");
const path = require("path");
const cloudinary = require("../config/cloudinary");

// Helper: extract base class name (e.g. "Class 1" from "Class 1 - A")
const extractBaseClassName = (str) => {
  if (!str) return "Class 1";
  const numMatch = String(str).match(/\d+/);
  return numMatch ? `Class ${numMatch[0]}` : String(str).trim();
};

// Helper: extract section (e.g. "A" from "Class 1 - A" or "Section A")
const extractSection = (str, secParam) => {
  if (secParam && secParam !== "All") return String(secParam).trim().toUpperCase();
  if (!str) return "All";
  const parts = String(str).split("-");
  if (parts.length > 1) {
    return parts[1].replace(/Section\s*/i, "").trim().toUpperCase();
  }
  return "All";
};

// 1. Create / Upload Note (Teacher / Admin)
exports.createNote = async (req, res) => {
  try {
    const { title, description, subjectId, className, section } = req.body;
    const teacherId = req.user.id;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Note title is required" });
    }
    if (!subjectId) {
      return res.status(400).json({ message: "Subject ID is required" });
    }

    const subjectObj = await Subject.findById(subjectId).lean();
    if (!subjectObj) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const rawClass = className || req.query.className || "Class 1";
    const targetClassName = extractBaseClassName(rawClass);
    const targetSection = extractSection(rawClass, section || req.query.section);

    let fileUrl = "";
    let fileName = "";
    let fileType = "file";

    if (req.file) {
      fileName = req.file.originalname || req.file.filename;
      const mime = req.file.mimetype || "";

      if (mime.startsWith("image/")) {
        fileType = "image";
      } else if (mime.includes("pdf")) {
        fileType = "pdf";
      } else {
        fileType = "file";
      }

      // Try Cloudinary first
      const hasCloudinary = process.env.CLOUDINARY_URL ||
        ((process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME) && 
         (process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_KEY) && 
         (process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET));

      if (hasCloudinary) {
        try {
          const resourceType = fileType === "image" ? "image" : "raw";
          const uploadRes = await cloudinary.uploader.upload(req.file.path, {
            folder: "teachhub/notes",
            resource_type: resourceType,
            timeout: 15000
          });
          fileUrl = uploadRes.secure_url;
        } catch (cErr) {
          console.error("Cloudinary note upload error, falling back to base64:", cErr.message);
        }
      }

      // Base64 Data URL fallback for 100% serverless / restart reliability
      if (!fileUrl && fs.existsSync(req.file.path)) {
        try {
          const fileBuffer = fs.readFileSync(req.file.path);
          const base64Str = fileBuffer.toString("base64");
          fileUrl = `data:${mime || "application/octet-stream"};base64,${base64Str}`;
        } catch (fErr) {
          console.error("Base64 note conversion error:", fErr);
        }
      }

      // Cleanup local temp file
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (_) {}
    }

    const note = await SubjectNote.create({
      subject: subjectId,
      className: targetClassName,
      section: targetSection,
      teacher: teacherId,
      schoolName: req.user.schoolName || "",
      title: title.trim(),
      description: (description || "").trim(),
      fileUrl,
      fileName,
      fileType
    });

    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. Get Notes for a Subject (Teacher / Student)
exports.getSubjectNotes = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const rawClass = req.query.className;
    const reqSection = req.query.section;

    const query = { subject: subjectId };

    if (rawClass && rawClass !== "All") {
      const baseClass = extractBaseClassName(rawClass);
      const classNum = (String(rawClass).match(/\d+/) || ["1"])[0];
      query.className = { $in: [baseClass, rawClass, classNum, `Class ${classNum}`] };
    }

    if (reqSection && reqSection !== "All") {
      const secUpper = String(reqSection).trim().toUpperCase();
      query.section = { $in: [secUpper, "ALL", ""] };
    }

    const notes = await SubjectNote.find(query).sort({ createdAt: -1 }).lean();
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. Delete Note (Teacher / Admin)
exports.deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const note = await SubjectNote.findById(noteId);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    await SubjectNote.findByIdAndDelete(noteId);
    res.json({ success: true, message: "Note deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
