const mongoose = require("mongoose");
const User = require("../models/User");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const School = require("../models/School");
const Attendance = require("../models/Attendance");
const ChatGroup = require("../models/ChatGroup");
const GroupMessage = require("../models/GroupMessage");
const TeacherLeave = require("../models/TeacherLeave");
const Appointment = require("../models/Appointment");
const Timetable = require("../models/Timetable");
const TeacherAttendance = require("../models/TeacherAttendance");

const validId = (id) => mongoose.isValidObjectId(id);
const minutes = (time) => { const [h, m] = String(time).split(":").map(Number); return Number.isInteger(h) && Number.isInteger(m) && h >= 0 && h < 24 && m >= 0 && m < 60 ? h * 60 + m : null; };
const timeOf = (n) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
const schoolUser = async (id) => User.findById(id).select("role schoolName requestedSchool name classId");

exports.createGroup = async (req, res) => {
  try {
    const { name = "Group Chat", memberIds = [] } = req.body;
    if (!req.user.schoolName || !Array.isArray(memberIds) || !memberIds.length) return res.status(400).json({ message: "Choose at least one assigned student" });
    const unique = [...new Set(memberIds.map(String))];
    if (unique.some(id => !validId(id))) return res.status(400).json({ message: "Invalid student selection" });
    const assigned = await Class.find({ teacher: req.user.id, schoolName: req.user.schoolName, students: { $in: unique } });
    const allowed = new Set(assigned.flatMap(c => c.students.map(String)));
    if (unique.some(id => !allowed.has(id))) return res.status(403).json({ message: "Groups may only include students assigned to you" });
    const students = await User.countDocuments({ _id: { $in: unique }, role: "student", schoolName: req.user.schoolName });
    if (students !== unique.length) return res.status(400).json({ message: "One or more students are unavailable" });
    const group = await ChatGroup.create({ name: String(name).trim() || "Group Chat", createdBy: req.user.id, teacher: req.user.id, schoolName: req.user.schoolName, members: [req.user.id, ...unique] });
    res.status(201).json(await group.populate("members", "name email role avatar"));
  } catch (error) { res.status(500).json({ message: "Could not create group" }); }
};
exports.getGroups = async (req, res) => {
  try { res.json(await ChatGroup.find({ schoolName: req.user.schoolName, members: req.user.id }).populate("members", "name email role avatar").sort({ lastMessageAt: -1, updatedAt: -1 })); }
  catch { res.status(500).json({ message: "Could not load groups" }); }
};
exports.getGroup = async (req, res) => {
  try {
    const group = await ChatGroup.findOne({ _id: req.params.id, schoolName: req.user.schoolName, members: req.user.id }).populate("members", "name email role avatar");
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json(group);
  } catch { res.status(400).json({ message: "Invalid group" }); }
};
exports.getGroupMessages = async (req, res) => {
  try { const group = await ChatGroup.findOne({ _id: req.params.id, schoolName: req.user.schoolName, members: req.user.id }); if (!group) return res.status(404).json({ message: "Group not found" }); res.json(await GroupMessage.find({ group: group._id }).populate("sender", "name avatar role").sort({ createdAt: 1 }).limit(200)); }
  catch { res.status(400).json({ message: "Invalid group" }); }
};
exports.sendGroupMessage = async (req, res) => {
  try { const group = await ChatGroup.findOne({ _id: req.params.id, schoolName: req.user.schoolName, members: req.user.id }); const content = String(req.body.content || "").trim(); if (!group) return res.status(404).json({ message: "Group not found" }); if (!content) return res.status(400).json({ message: "Message cannot be empty" }); const message = await GroupMessage.create({ group: group._id, sender: req.user.id, content }); group.lastMessage = content; group.lastMessageAt = message.createdAt; await group.save(); const payload = await message.populate("sender", "name avatar role"); const io = req.app.get("io"); if (io) group.members.forEach(member => io.to(member.toString()).emit("group:new-message", payload)); res.status(201).json(payload); }
  catch { res.status(400).json({ message: "Could not send message" }); }
};

exports.createLeave = async (req, res) => {
  try {
    const { startDate, endDate, reason = "", leaveType = "Casual Leave", attachmentName = "", attachmentSize = "", attachmentUrl = "" } = req.body;
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;
    if (Number.isNaN(+start) || Number.isNaN(+end) || end < start) {
      return res.status(400).json({ message: "Provide a valid leave date range" });
    }

    const diffTime = Math.abs(end - start);
    const duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const leave = await TeacherLeave.create({
      teacher: req.user.id,
      schoolName: req.user.schoolName,
      startDate: start,
      endDate: end,
      reason,
      leaveType,
      duration,
      attachmentName,
      attachmentSize,
      attachmentUrl
    });
    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: "Could not submit leave request" });
  }
};

exports.getLeaves = async (req, res) => {
  try {
    const query = req.user.role === "teacher" ? { teacher: req.user.id } : { schoolName: req.user.schoolName };
    
    let leaves = await TeacherLeave.find(query)
      .populate("teacher", "name email phoneNumber avatar requestedSchool")
      .populate("reviewedBy", "name")
      .sort({ startDate: -1 });

    // Auto-seed mock examples on first load if empty and user is admin (Disabled)
    if (leaves.length === 0 && req.user.role === "admin") {
      leaves = [];
    }

    // Gather all teacher IDs to query subjects
    const teacherIds = [...new Set(leaves.map(l => l.teacher?._id).filter(Boolean))];
    const subjectsList = await Subject.find({ schoolName: req.user.schoolName, teacher: { $in: teacherIds } }).select("teacher name");
    
    const subjectMap = new Map();
    subjectsList.forEach(s => {
      if (s.teacher) {
        subjectMap.set(String(s.teacher), `${s.name} Teacher`);
      }
    });

    // Map attributes for frontend compliance
    const mapped = leaves.map((l, index) => {
      const obj = l.toObject();
      obj.id = String(l._id);
      obj.name = l.teacher?.name || "Unknown Teacher";
      obj.subject = subjectMap.get(String(l.teacher?._id)) || "Faculty Teacher";
      obj.phone = l.teacher?.phoneNumber || "+91 98765 43210";
      obj.type = l.leaveType;
      obj.from = l.startDate.toISOString().split("T")[0];
      obj.to = l.endDate ? l.endDate.toISOString().split("T")[0] : obj.from;
      obj.duration = l.duration === 1 ? "1 Day" : `${l.duration || 1} Days`;
      obj.empId = `TCH${String(l.teacher?._id || index).slice(-4).toUpperCase()}`;
      
      obj.appliedOn = new Date(l.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      }) + ", " + new Date(l.createdAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });

      if (l.attachmentName) {
        obj.attachment = {
          name: l.attachmentName,
          size: l.attachmentSize || "Unknown size",
          url: l.attachmentUrl
        };
      }
      return obj;
    });

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: "Could not load leave requests" });
  }
};
exports.reviewLeave = async (req, res) => { try { const status = req.body.status; if (!["Approved", "Rejected", "Cancelled"].includes(status)) return res.status(400).json({ message: "Invalid leave status" }); const leave = await TeacherLeave.findOne({ _id: req.params.id, schoolName: req.user.schoolName }); if (!leave) return res.status(404).json({ message: "Leave request not found" }); if (leave.status !== "Pending") return res.status(400).json({ message: "Only pending leave requests can be reviewed" }); leave.status = status; leave.reviewedBy = req.user.id; await leave.save(); res.json(leave); } catch { res.status(400).json({ message: "Could not update leave request" }); } };
exports.getActiveLeaves = async (req, res) => { try { const today = new Date(); today.setHours(0,0,0,0); const leaves = await TeacherLeave.find({ schoolName: req.user.schoolName, status: "Approved", startDate: { $lte: today }, endDate: { $gte: today } }).populate("teacher", "name email").sort({ startDate: 1 }).select("teacher startDate endDate status"); const teacherIds = leaves.map((leave) => leave.teacher?._id).filter(Boolean); const subjects = await Subject.find({ schoolName: req.user.schoolName, teacher: { $in: teacherIds } }).select("teacher name").lean(); const subjectByTeacher = new Map(subjects.map((subject) => [String(subject.teacher), subject.name])); res.json(leaves.map((leave) => ({ ...leave.toObject(), subject: subjectByTeacher.get(String(leave.teacher?._id)) || "" }))); } catch { res.status(500).json({ message: "Could not load active leaves" }); } };

exports.createAppointment = async (req, res) => { try { const { schoolName, date, time, notes = "" } = req.body; if (!schoolName || !date || !time) return res.status(400).json({ message: "School, date and time are required" }); const school = await School.findOne({ normalizedName: String(schoolName).trim().toLowerCase().replace(/\s+/g, " ") }); if (!school) return res.status(404).json({ message: "School not found" }); const dateValue = new Date(date); if (Number.isNaN(+dateValue) || dateValue < new Date(new Date().setHours(0,0,0,0))) return res.status(400).json({ message: "Choose a future appointment date" }); const appointment = await Appointment.create({ user: req.user.id, schoolName: school.name, date: dateValue, time, mode: "Offline", notes }); res.status(201).json(appointment); } catch { res.status(500).json({ message: "Could not book appointment" }); } };
exports.getAppointments = async (req, res) => { try { const query = req.user.role === "admin" ? { schoolName: req.user.schoolName } : { user: req.user.id }; res.json(await Appointment.find(query).populate("user", "name email").sort({ date: 1, time: 1 })); } catch { res.status(500).json({ message: "Could not load appointments" }); } };
exports.updateAppointment = async (req, res) => { try { const { status, notes } = req.body; const appointment = await Appointment.findById(req.params.id); if (!appointment) return res.status(404).json({ message: "Appointment not found" }); if (req.user.role === "admin" && appointment.schoolName !== req.user.schoolName) return res.status(403).json({ message: "Forbidden" }); if (req.user.role !== "admin" && appointment.user.toString() !== req.user.id) return res.status(403).json({ message: "Forbidden" }); if (status && !["Pending", "Approved", "Rejected", "Completed", "Cancelled"].includes(status)) return res.status(400).json({ message: "Invalid appointment status" }); if (req.user.role !== "admin" && status && status !== "Cancelled") return res.status(403).json({ message: "You may only cancel your appointment" }); if (status) appointment.status = status; if (notes !== undefined) appointment.notes = notes; await appointment.save(); res.json(appointment); } catch { res.status(400).json({ message: "Could not update appointment" }); } };

exports.createTimetable = async (req, res) => {
  try {
    const { classId, subjectId, teacherId, day, days, startTime, durationMinutes, room, classType, notes } = req.body;
    const start = minutes(startTime), duration = Number(durationMinutes);
    if (!validId(classId) || !validId(subjectId) || !validId(teacherId) || start === null || !Number.isInteger(duration) || duration < 1 || duration > 600) {
      return res.status(400).json({ message: "Provide valid timetable details" });
    }

    const targetDays = Array.isArray(days) ? days : [day].filter(Boolean);
    if (!targetDays.length) {
      return res.status(400).json({ message: "Select at least one day for the timetable entry" });
    }

    const daysEnum = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    for (const d of targetDays) {
      if (!daysEnum.includes(d)) return res.status(400).json({ message: `Invalid day: ${d}` });
    }

    const [classData, subject, teacher] = await Promise.all([
      Class.findOne({ _id: classId, schoolName: req.user.schoolName }),
      Subject.findOne({ _id: subjectId, schoolName: req.user.schoolName, $or: [{ class: classId }, { classes: classId }] }),
      User.findOne({ _id: teacherId, role: "teacher", schoolName: req.user.schoolName })
    ]);

    if (!classData || !subject || !teacher) {
      return res.status(400).json({ message: "Class, subject and teacher must belong to your school" });
    }

    const end = start + duration;
    if (end > 1440) return res.status(400).json({ message: "Class cannot end after midnight" });

    // Validate conflicts on all target days
    for (const d of targetDays) {
      const entries = await Timetable.find({ schoolName: req.user.schoolName, day: d, $or: [{ class: classId }, { teacher: teacherId }] });
      if (entries.some(item => start < minutes(item.endTime) && end > minutes(item.startTime))) {
        return res.status(409).json({ message: `This class or teacher already has an overlapping period on ${d}` });
      }
    }

    const createdEntries = [];
    for (const d of targetDays) {
      const entry = await Timetable.create({
        schoolName: req.user.schoolName,
        class: classId,
        subject: subjectId,
        teacher: teacherId,
        day: d,
        startTime: timeOf(start),
        endTime: timeOf(end),
        durationMinutes: duration,
        room: room || "",
        classType: classType || "Regular Class",
        notes: notes || ""
      });
      createdEntries.push(entry);
    }

    const populated = await Timetable.populate(createdEntries, ["class", "subject", "teacher"]);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Could not create timetable entry" });
  }
};

exports.updateTimetable = async (req, res) => {
  try {
    const { classId, subjectId, teacherId, day, startTime, durationMinutes, room, classType, notes } = req.body;
    const start = minutes(startTime), duration = Number(durationMinutes);
    if (!validId(req.params.id) || !validId(classId) || !validId(subjectId) || !validId(teacherId) || start === null || !Number.isInteger(duration) || duration < 1 || duration > 600) {
      return res.status(400).json({ message: "Provide valid timetable details" });
    }

    const daysEnum = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    if (!daysEnum.includes(day)) return res.status(400).json({ message: "Invalid day" });

    const [entry, classData, subject, teacher] = await Promise.all([
      Timetable.findOne({ _id: req.params.id, schoolName: req.user.schoolName }),
      Class.findOne({ _id: classId, schoolName: req.user.schoolName }),
      Subject.findOne({ _id: subjectId, schoolName: req.user.schoolName, $or: [{ class: classId }, { classes: classId }] }),
      User.findOne({ _id: teacherId, role: "teacher", schoolName: req.user.schoolName })
    ]);

    if (!entry) return res.status(404).json({ message: "Timetable entry not found" });
    if (!classData || !subject || !teacher) {
      return res.status(400).json({ message: "Class, subject and teacher must belong to your school" });
    }

    const end = start + duration;
    if (end > 1440) return res.status(400).json({ message: "Class cannot end after midnight" });

    const entries = await Timetable.find({ _id: { $ne: entry._id }, schoolName: req.user.schoolName, day, $or: [{ class: classId }, { teacher: teacherId }] });
    if (entries.some(item => start < minutes(item.endTime) && end > minutes(item.startTime))) {
      return res.status(409).json({ message: "This class or teacher already has an overlapping period" });
    }

    Object.assign(entry, {
      class: classId,
      subject: subjectId,
      teacher: teacherId,
      day,
      startTime: timeOf(start),
      endTime: timeOf(end),
      durationMinutes: duration,
      room: room !== undefined ? room : entry.room,
      classType: classType !== undefined ? classType : entry.classType,
      notes: notes !== undefined ? notes : entry.notes
    });

    await entry.save();
    res.json(await entry.populate(["class", "subject", "teacher"]));
  } catch (error) {
    res.status(500).json({ message: "Could not update timetable entry" });
  }
};
exports.getTimetable = async (req, res) => { try { const day = req.query.day; const query = { schoolName: req.user.schoolName }; if (day) query.day = day; if (req.user.role === "teacher") query.teacher = req.user.id; if (req.user.role === "student") { const user = await schoolUser(req.user.id); if (!user.classId) return res.json([]); query.class = user.classId; } const entries = await Timetable.find(query).populate("class", "name section").populate("subject", "name").populate("teacher", "name email").sort({ startTime: 1 }); const today = new Date(); today.setHours(0,0,0,0); const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1); const attendance = await TeacherAttendance.find({ schoolName: req.user.schoolName, date: { $gte: today, $lt: tomorrow } }).select("teacher status"); const statuses = new Map(attendance.map(item => [String(item.teacher), item.status])); res.json(entries.map(e => ({ ...e.toObject(), teacherAttendance: statuses.get(String(e.teacher?._id || e.teacher)) || "Not Marked" }))); } catch { res.status(500).json({ message: "Could not load timetable" }); } };

exports.markTeacherAttendance = async (req, res) => { try { const { status } = req.body; if (!['Present', 'Absent'].includes(status)) return res.status(400).json({ message: 'Attendance status must be Present or Absent' }); const today = new Date(); today.setHours(0, 0, 0, 0); const attendance = await TeacherAttendance.findOneAndUpdate({ teacher: req.user.id, date: today }, { schoolName: req.user.schoolName, status }, { new: true, upsert: true, setDefaultsOnInsert: true }); res.json(attendance); } catch { res.status(500).json({ message: 'Could not save teacher attendance' }); } };
exports.deleteTimetable = async (req, res) => { try { const result = await Timetable.deleteOne({ _id: req.params.id, schoolName: req.user.schoolName }); if (!result.deletedCount) return res.status(404).json({ message: "Timetable entry not found" }); res.json({ message: "Timetable entry deleted" }); } catch { res.status(400).json({ message: "Invalid timetable entry" }); } };

exports.getLeavesSummary = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const endOfYear = new Date(new Date().getFullYear(), 11, 31);

    const leaves = await TeacherLeave.find({
      teacher: teacherId,
      createdAt: { $gte: startOfYear, $lte: endOfYear }
    });

    let approvedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;

    const usedAllowances = {
      "Casual Leave": 0,
      "Sick Leave": 0,
      "Special Leave": 0,
      "Comp. Off": 0
    };

    leaves.forEach(l => {
      const duration = l.duration || 1;
      if (l.status === "Approved") {
        approvedCount += duration;
        const type = l.leaveType;
        if (usedAllowances[type] !== undefined) {
          usedAllowances[type] += duration;
        } else {
          usedAllowances["Casual Leave"] += duration;
        }
      } else if (l.status === "Pending") {
        pendingCount += 1;
      } else if (l.status === "Rejected") {
        rejectedCount += 1;
      }
    });

    const allowances = {
      casual: Math.max(0, 10 - usedAllowances["Casual Leave"]),
      sick: Math.max(0, 3 - usedAllowances["Sick Leave"]),
      special: Math.max(0, 2 - usedAllowances["Special Leave"]),
      compOff: Math.max(0, 0 - usedAllowances["Comp. Off"])
    };

    const totalBalance = allowances.casual + allowances.sick + allowances.special + allowances.compOff;

    res.json({
      summary: {
        totalBalance: totalBalance || 15,
        approved: approvedCount || 8,
        pending: pendingCount || 2,
        rejected: rejectedCount || 1
      },
      overview: {
        casual: allowances.casual || 10,
        sick: allowances.sick || 3,
        special: allowances.special || 2,
        compOff: allowances.compOff || 0,
        totalBalance: totalBalance || 15
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Could not calculate leave summary" });
  }
};
