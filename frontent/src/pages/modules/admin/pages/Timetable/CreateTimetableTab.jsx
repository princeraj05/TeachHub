import React, { useMemo } from "react";
import {
  FaCalendarAlt,
  FaBook,
  FaSchool,
  FaChalkboardTeacher,
  FaClock,
  FaMapMarkerAlt,
  FaRegListAlt,
  FaFileAlt,
  FaInfoCircle
} from "react-icons/fa";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAYS_ABBR = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun"
};

function CreateTimetableTab({
  classes,
  teachers,
  subjects,
  entries,
  loading,
  form,
  setForm,
  submit,
  resetForm,
  belongsToClass
}) {

  // 1. Bi-directional filtering for Teachers based on selected Subject
  const availableTeachers = useMemo(() => {
    if (!form.subjectId) return teachers;
    const targetSubject = subjects.find(s => s._id === form.subjectId);
    if (!targetSubject) return teachers;

    const targetName = (targetSubject.name || "").toLowerCase().trim();

    const matchingTeachers = teachers.filter(t => {
      // Direct subject teacher check
      if (targetSubject.teacher) {
        const teacherObjId = typeof targetSubject.teacher === 'object' ? targetSubject.teacher._id : targetSubject.teacher;
        if (String(teacherObjId) === String(t._id)) return true;
      }
      // Teacher's assigned subjects array check
      if (Array.isArray(t.subjects)) {
        const hasSub = t.subjects.some(s =>
          String(s._id || s) === String(targetSubject._id) ||
          (s.name && s.name.toLowerCase().trim() === targetName)
        );
        if (hasSub) return true;
      }
      // Timetable entries check
      const hasTimetableEntry = (entries || []).some(entry => {
        const entryTeacherId = typeof entry.teacher === 'object' ? entry.teacher?._id : entry.teacher;
        const entrySubjectId = typeof entry.subject === 'object' ? entry.subject?._id : entry.subject;
        const entrySubjectName = typeof entry.subject === 'object' ? entry.subject?.name : null;

        return String(entryTeacherId) === String(t._id) && (
          String(entrySubjectId) === String(targetSubject._id) ||
          (entrySubjectName && entrySubjectName.toLowerCase().trim() === targetName)
        );
      });
      if (hasTimetableEntry) return true;

      return false;
    });

    return matchingTeachers.length > 0 ? matchingTeachers : teachers;
  }, [teachers, subjects, entries, form.subjectId]);

  // 2. Bi-directional filtering for Subjects based on selected Class & Teacher
  const availableSubjects = useMemo(() => {
    let list = subjects;

    // Filter by selected Class first if selected
    if (form.classId) {
      list = list.filter(sub => belongsToClass(sub, form.classId));
    }

    // Filter by selected Teacher
    if (form.teacherId) {
      const selectedTeacherObj = teachers.find(t => t._id === form.teacherId);

      const filteredByTeacher = list.filter(sub => {
        const subName = (sub.name || "").toLowerCase().trim();

        // Direct subject teacher check
        if (sub.teacher) {
          const teacherObjId = typeof sub.teacher === 'object' ? sub.teacher._id : sub.teacher;
          if (String(teacherObjId) === String(form.teacherId)) return true;
        }

        // Teacher's assigned subjects array check
        if (selectedTeacherObj && Array.isArray(selectedTeacherObj.subjects)) {
          const isAssigned = selectedTeacherObj.subjects.some(s =>
            String(s._id || s) === String(sub._id) ||
            (s.name && s.name.toLowerCase().trim() === subName)
          );
          if (isAssigned) return true;
        }

        // Timetable entries check
        const hasTimetableEntry = (entries || []).some(entry => {
          const entryTeacherId = typeof entry.teacher === 'object' ? entry.teacher?._id : entry.teacher;
          const entrySubjectId = typeof entry.subject === 'object' ? entry.subject?._id : entry.subject;
          const entrySubjectName = typeof entry.subject === 'object' ? entry.subject?.name : null;

          return String(entryTeacherId) === String(form.teacherId) && (
            String(entrySubjectId) === String(sub._id) ||
            (entrySubjectName && entrySubjectName.toLowerCase().trim() === subName)
          );
        });
        if (hasTimetableEntry) return true;

        return false;
      });

      if (filteredByTeacher.length > 0) {
        list = filteredByTeacher;
      }
    }

    return list;
  }, [subjects, teachers, entries, form.classId, form.teacherId, belongsToClass]);

  const selectedClass = classes.find(c => c._id === form.classId);
  const selectedSubject = subjects.find(s => s._id === form.subjectId);
  const selectedTeacher = teachers.find(t => t._id === form.teacherId);

  // Repeat days toggle
  const handleDayCheckbox = (day) => {
    let updatedDays = [...form.repeatDays];
    if (updatedDays.includes(day)) {
      updatedDays = updatedDays.filter(d => d !== day);
    } else {
      updatedDays.push(day);
    }
    setForm({ ...form, repeatDays: updatedDays });
  };

  // Helper to parse any time string into minutes since midnight
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const clean = String(timeStr).trim().toUpperCase();
    const match = clean.match(/^(\d+):(\d+)\s*(AM|PM)?$/);
    if (!match) {
      const parts = clean.split(":");
      let h = Number(parts[0]) || 0;
      const m = Number(parts[1]) || 0;
      if (h >= 1 && h <= 6) h += 12; // 01:00 -> 13:00 (1 PM) in school context
      return h * 60 + m;
    }
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3];
    if (ampm) {
      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
    } else {
      if (hours >= 1 && hours <= 6) hours += 12; // 01:00 -> 13:00 (1 PM) in school context
    }
    return hours * 60 + minutes;
  };

  // Convert "HH:MM" or 12-hour format string to 12-hour format string (e.g. "09:00 AM")
  const formatTime12h = (timeStr) => {
    if (!timeStr) return "00:00 AM";
    const clean = String(timeStr).trim().toUpperCase();
    if (clean.includes("AM") || clean.includes("PM")) return clean;
    const [hStr, mStr] = clean.split(":");
    let h = Number(hStr);
    const m = Number(mStr);
    if (isNaN(h) || isNaN(m)) return timeStr;
    if (h >= 1 && h <= 6) h += 12; // school context 01:00 -> 13:00 (1 PM)
    const ampm = h >= 12 ? "PM" : "AM";
    const hours = h % 12 || 12;
    const minutes = String(m).padStart(2, "0");
    return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
  };

  // Calculate End Time based on Start Time + Duration
  const calculatedEndTime = useMemo(() => {
    if (!form.startTime) return "00:00 AM";
    const startMins = parseTimeToMinutes(form.startTime);
    const endMins = startMins + Number(form.durationMinutes);
    const endHours = Math.floor(endMins / 60) % 24;
    const endMinsOnly = endMins % 60;
    
    const ampm = endHours >= 12 ? "PM" : "AM";
    const displayHours = endHours % 12 || 12;
    return `${String(displayHours).padStart(2, "0")}:${String(endMinsOnly).padStart(2, "0")} ${ampm}`;
  }, [form.startTime, form.durationMinutes]);

  // Construct a list of days text for repeat summary
  const repeatDaysText = form.repeatDays.length > 0 
    ? form.repeatDays.map(d => d.slice(0, 3)).join(", ") 
    : form.day;

  // Grid Preview slots (from 08:00 AM to 04:00 PM)
  const PREVIEW_HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
  const PREVIEW_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Helper to find entry matching a day and hour range
  const getCellPeriod = (day, hourStr) => {
    const targetHour = parseInt(hourStr.split(":")[0]);
    
    // Find entry for the selected class that overlaps with this hour slot
    return entries.find(e => {
      if (e.class?._id !== form.classId && e.class !== form.classId) return false;
      if (e.day !== day) return false;
      
      const startMins = parseTimeToMinutes(e.startTime);
      const startHour = Math.floor(startMins / 60);
      return startHour === targetHour;
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn text-left">
      
      {/* LEFT: TIMETABLE ENTRY FORM (7 Cols) */}
      <div className="lg:col-span-7 bg-white dark:bg-[#0D1326] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800/60 pb-3">
          <FaCalendarAlt className="text-purple-500 text-sm" />
          <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider">Timetable Entry Details</h3>
        </div>

        <form onSubmit={submit} className="space-y-4">
          
          {/* Row 1: Class, Subject, Teacher */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Class Select */}
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Class *</label>
              <select
                name="classId"
                required
                value={form.classId}
                onChange={(e) => setForm({ ...form, classId: e.target.value, subjectId: "" })}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 font-bold cursor-pointer"
              >
                <option value="">Select Class</option>
                {classes.map(c => (
                  <option key={c._id} value={c._id}>Class {c.name} - Section {c.section}</option>
                ))}
              </select>
            </div>

            {/* Subject Select */}
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Subject *</label>
              <select
                name="subjectId"
                required
                disabled={!form.classId && !form.teacherId}
                value={form.subjectId}
                onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <option value="">
                  {!form.classId && !form.teacherId
                    ? "Select Class or Teacher First"
                    : availableSubjects.length
                    ? form.teacherId && availableSubjects.length < subjects.length
                      ? `Select Subject (Assigned to ${selectedTeacher?.name || "Teacher"})`
                      : "Select Subject"
                    : "No Subject found"}
                </option>
                {availableSubjects.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Teacher Select */}
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Teacher *</label>
              <select
                name="teacherId"
                required
                value={form.teacherId}
                onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 font-bold cursor-pointer"
              >
                <option value="">
                  {form.subjectId && availableTeachers.length < teachers.length
                    ? `Select Teacher (Teaches ${selectedSubject?.name || "Subject"})`
                    : "Select Teacher"}
                </option>
                {availableTeachers.map(t => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Row 2: Day, Start Time, End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Primary Day */}
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Day *</label>
              <select
                name="day"
                value={form.day}
                onChange={(e) => {
                  const selectedDay = e.target.value;
                  setForm({
                    ...form,
                    day: selectedDay,
                    repeatDays: [selectedDay]
                  });
                }}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 font-bold cursor-pointer"
              >
                {DAYS_OF_WEEK.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Start Time *</label>
              <input
                type="time"
                name="startTime"
                required
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 font-bold cursor-pointer"
              />
            </div>

            {/* End Time (Calculated) */}
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">End Time</label>
              <input
                type="text"
                disabled
                value={calculatedEndTime}
                className="w-full px-3 py-2.5 bg-slate-100 dark:bg-[#0F172A]/40 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-500 dark:text-slate-400 font-bold cursor-not-allowed"
              />
            </div>

          </div>

          {/* Row 3: Duration, Room, Class Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Duration minutes */}
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Duration</label>
              <select
                name="durationMinutes"
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 font-bold cursor-pointer"
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
                <option value={90}>90 Minutes</option>
                <option value={120}>120 Minutes</option>
              </select>
            </div>

            {/* Room */}
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Room / Location</label>
              <input
                type="text"
                name="room"
                placeholder="e.g. Room 101"
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 font-semibold"
              />
            </div>

            {/* Class Type */}
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Class Type</label>
              <select
                name="classType"
                value={form.classType}
                onChange={(e) => setForm({ ...form, classType: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 font-bold cursor-pointer"
              >
                <option>Regular Class</option>
                <option>Practical / Lab</option>
                <option>Seminar / Workshop</option>
                <option>Guest Lecture</option>
              </select>
            </div>

          </div>

          {/* Repeat Weekly Day selection */}
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Repeat Weekly *</label>
            <div className="flex flex-wrap gap-2.5">
              {DAYS_OF_WEEK.map(d => {
                const isChecked = form.repeatDays.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleDayCheckbox(d)}
                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition select-none cursor-pointer ${
                      isChecked
                        ? "border-purple-600 bg-purple-600/10 text-purple-700 dark:text-white font-black"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0F172A] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {DAYS_ABBR[d]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Notes (Optional)</label>
            <textarea
              name="notes"
              rows="3"
              maxLength="200"
              placeholder="Add any notes for this class..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 font-medium"
            />
            <div className="flex justify-between text-[8px] text-slate-500 mt-1 select-none">
              <span>Maximum 200 characters</span>
              <span>{form.notes.length}/200</span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0F172A] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer select-none"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading || !form.classId || !form.subjectId || !form.teacherId}
              className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white text-xs font-bold py-2.5 rounded-xl transition cursor-pointer select-none"
            >
              Create Timetable Entry +
            </button>
          </div>

        </form>
      </div>

      {/* RIGHT COLUMN: ENTRY SUMMARY & WEEKLY PREVIEW (5 Cols) */}
      <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
        
        {/* Entry Summary */}
        <div className="bg-white dark:bg-[#0D1326] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800/60 pb-3 mb-4">
            <FaRegListAlt className="text-purple-500 text-sm" />
            <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider">Entry Summary</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-900">
              <span className="text-slate-500 dark:text-slate-400 font-bold">Class</span>
              <span className="text-slate-800 dark:text-white font-extrabold">{selectedClass ? `Class ${selectedClass.name} - Section ${selectedClass.section}` : "—"}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-900">
              <span className="text-slate-500 dark:text-slate-400 font-bold">Subject</span>
              <span className="text-slate-800 dark:text-white font-extrabold">{selectedSubject ? selectedSubject.name : "—"}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-900">
              <span className="text-slate-500 dark:text-slate-400 font-bold">Teacher</span>
              <span className="text-slate-800 dark:text-white font-extrabold">{selectedTeacher ? selectedTeacher.name : "—"}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-900">
              <span className="text-slate-500 dark:text-slate-400 font-bold">Day</span>
              <span className="text-slate-800 dark:text-white font-extrabold">{repeatDaysText || "—"}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-900">
              <span className="text-slate-500 dark:text-slate-400 font-bold">Time</span>
              <span className="text-slate-800 dark:text-white font-extrabold">
                {form.startTime ? `${formatTime12h(form.startTime)} - ${calculatedEndTime}` : "—"}
              </span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-900">
              <span className="text-slate-500 dark:text-slate-400 font-bold">Duration</span>
              <span className="text-slate-800 dark:text-white font-extrabold">{form.durationMinutes} Minutes</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-900">
              <span className="text-slate-500 dark:text-slate-400 font-bold">Room</span>
              <span className="text-slate-800 dark:text-white font-extrabold">{form.room || "—"}</span>
            </div>
            <div className="flex justify-between text-xs py-1">
              <span className="text-slate-500 dark:text-slate-400 font-bold">Type</span>
              <span className="text-slate-800 dark:text-white font-extrabold">{form.classType}</span>
            </div>
          </div>
        </div>

        {/* Weekly Preview */}
        <div className="bg-white dark:bg-[#0D1326] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800/60 pb-3 mb-4">
            <FaCalendarAlt className="text-purple-500 text-sm" />
            <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider">Weekly Preview</h3>
          </div>

          {/* Grid Preview Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/40 p-2">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-850">
                  <th className="text-[8px] font-black text-slate-500 uppercase tracking-widest py-1">Time</th>
                  {PREVIEW_DAYS.map(d => (
                    <th key={d} className="text-[8px] font-black text-slate-500 uppercase tracking-widest py-1 px-1">
                      {DAYS_ABBR[d]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PREVIEW_HOURS.map(hourStr => {
                  if (hourStr === "12:00") {
                    return (
                      <tr key={hourStr} className="border-b border-slate-200 dark:border-slate-850/60 bg-amber-500/10">
                        <td className="text-[8px] font-bold text-amber-600 dark:text-amber-400 py-2">
                          12:00
                        </td>
                        <td colSpan={7} className="py-2 text-[8px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest text-center">
                          🍴 Lunch Break (12:00 PM - 01:00 PM) 🍴
                        </td>
                      </tr>
                    );
                  }
                  return (
                    <tr key={hourStr} className="border-b border-slate-200 dark:border-slate-850/60 last:border-b-0">
                      <td className="text-[8px] font-bold text-slate-600 dark:text-slate-400 py-2.5">
                        {hourStr}
                      </td>
                      {PREVIEW_DAYS.map(day => {
                        const period = getCellPeriod(day, hourStr);
                        return (
                          <td key={day} className="py-2.5 px-0.5 min-w-[40px]">
                            {period ? (
                              <div className="bg-[#6366F1]/10 border border-[#6366F1]/30 rounded p-1 text-center flex flex-col items-center">
                                <span className="text-[7px] font-black text-[#6366F1] dark:text-[#818CF8] truncate max-w-[35px] leading-tight">
                                  {period.subject?.name?.slice(0, 5) || "Maths"}
                                </span>
                                <span className="text-[5px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[35px]">
                                  {period.room || "101"}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-700 text-[8px] font-bold">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Preview Legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-[7px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
              <span>Confirmed</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600" />
              <span>Break</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Other Class</span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer information warning banner */}
      <div className="lg:col-span-12 bg-white dark:bg-[#0D1326] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 flex items-center gap-3 text-purple-600 dark:text-blue-400 shadow-xl select-none mt-2">
        <FaInfoCircle className="text-lg shrink-0" />
        <div className="text-xs text-slate-700 dark:text-slate-350 space-y-0.5">
          <p className="font-bold">Important Notes</p>
          <ul className="list-disc list-inside text-[10px] text-slate-600 dark:text-slate-400 font-medium space-y-0.5 mt-1">
            <li>Timetable entries will be visible to students and parents.</li>
            <li>You can edit or delete entries from the Timetable page.</li>
            <li>Ensure there are no time conflicts before creating.</li>
          </ul>
        </div>
      </div>

    </div>
  );
}

export default CreateTimetableTab;
