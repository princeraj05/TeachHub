import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FaCheckCircle, FaInfoCircle, FaCalendarAlt } from "react-icons/fa";

// Import sub-navigation tab components
import CreateTimetableTab from "./Timetable/CreateTimetableTab";
import TimetableManagementTab from "./Timetable/TimetableManagementTab";

const SORA = "'Sora', sans-serif";

const TABS = [
  { id: "basic", label: "Create Timetable", breadcrumb: "Create Timetable" },
  { id: "management", label: "Timetable Management", breadcrumb: "Timetable Management" }
];

const belongsToClass = (subject, classId) => {
  return (subject.classes || []).some(item => String(item?._id || item) === String(classId)) || 
         (Array.isArray(subject.class) ? subject.class : [subject.class]).filter(Boolean).some(item => String(item?._id || item) === String(classId));
};

export default function CreateTimetable() {
  const API = import.meta.env.VITE_API_URL || "https://myschool-admin-panel.onrender.com";

  // Navigation tab state
  const [activeTab, setActiveTab] = useState("basic");

  // General loaded data
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [entries, setEntries] = useState([]);

  // Loading/Messages
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // School break settings for smart break-skipping
  const [breakSettings, setBreakSettings] = useState({
    shortBreakStartTime: "11:00 AM",
    shortBreakDuration: 30,
    lunchBreakStartTime: "12:00 PM",
    lunchBreakDuration: 60
  });

  // Form states
  const [form, setForm] = useState({
    classId: "",
    subjectId: "",
    teacherId: "",
    day: "Monday",
    repeatDays: ["Monday"], // weekly repetitions list
    startTime: "09:00",
    durationMinutes: 45,
    room: "",
    classType: "Regular Class",
    notes: ""
  });

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const clean = String(timeStr).trim().toUpperCase();
    const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
    if (!match) return 0;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3];
    if (ampm) {
      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
    }
    return hours * 60 + minutes;
  };

  // Helper to calculate next start time after submitting a slot, automatically skipping configured school breaks
  const getNextStartTime = (currentStartTime, durationMins, breaks) => {
    if (!currentStartTime) return "10:00";
    let [h, m] = currentStartTime.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return "10:00";

    let totalMins = h * 60 + m + Number(durationMins || 60);

    if (breaks) {
      const lunchStart = parseTimeToMinutes(breaks.lunchBreakStartTime);
      const lunchDuration = Number(breaks.lunchBreakDuration || 0);
      const lunchEnd = lunchStart + lunchDuration;

      const shortStart = parseTimeToMinutes(breaks.shortBreakStartTime);
      const shortDuration = Number(breaks.shortBreakDuration || 0);
      const shortEnd = shortStart + shortDuration;

      // Repeat check up to 2 times in case breaks are consecutive
      for (let i = 0; i < 2; i++) {
        if (lunchDuration > 0 && totalMins >= lunchStart && totalMins < lunchEnd) {
          totalMins = lunchEnd;
        }
        if (shortDuration > 0 && totalMins >= shortStart && totalMins < shortEnd) {
          totalMins = shortEnd;
        }
      }
    }

    let nextH = Math.floor(totalMins / 60) % 24;
    let nextM = totalMins % 60;

    return `${String(nextH).padStart(2, "0")}:${String(nextM).padStart(2, "0")}`;
  };

  const load = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const reqHeaders = getHeaders();
      const config = { headers: reqHeaders, timeout: 10000 };
      const [classRes, subjectRes, teacherRes, entryRes, schoolRes] = await Promise.allSettled([
        axios.get(`${API}/api/admin/classes`, config),
        axios.get(`${API}/api/admin/subjects`, config),
        axios.get(`${API}/api/admin/users/teachers`, config),
        axios.get(`${API}/api/timetable`, config),
        axios.get(`${API}/api/schools/my-school`, config)
      ]);

      if (classRes.status === "fulfilled" && Array.isArray(classRes.value.data)) {
        setClasses(classRes.value.data);
      } else {
        setClasses([]);
      }

      if (subjectRes.status === "fulfilled" && Array.isArray(subjectRes.value.data)) {
        setSubjects(subjectRes.value.data);
      } else {
        setSubjects([]);
      }

      if (teacherRes.status === "fulfilled" && Array.isArray(teacherRes.value.data)) {
        setTeachers(teacherRes.value.data);
      } else {
        setTeachers([]);
      }

      if (entryRes.status === "fulfilled" && Array.isArray(entryRes.value.data)) {
        setEntries(entryRes.value.data);
      } else {
        setEntries([]);
      }

      if (schoolRes.status === "fulfilled" && schoolRes.value.data) {
        const sData = schoolRes.value.data;
        setBreakSettings({
          shortBreakStartTime: sData.shortBreakStartTime || "11:00 AM",
          shortBreakDuration: sData.shortBreakDuration !== undefined ? sData.shortBreakDuration : 30,
          lunchBreakStartTime: sData.lunchBreakStartTime || "12:00 PM",
          lunchBreakDuration: sData.lunchBreakDuration !== undefined ? sData.lunchBreakDuration : 60
        });
      }
    } catch (e) {
      console.error("Error loading timetable setup data:", e);
      setErrorMsg("Could not load timetable setup data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Form Reset
  const resetForm = () => {
    setForm({
      classId: "",
      subjectId: "",
      teacherId: "",
      day: "Monday",
      repeatDays: ["Monday"],
      startTime: "09:00",
      durationMinutes: 45,
      room: "",
      classType: "Regular Class",
      notes: ""
    });
  };

  // Silent background refresh for timetable entries
  const fetchEntriesOnly = async () => {
    try {
      const reqHeaders = getHeaders();
      const res = await axios.get(`${API}/api/timetable`, { headers: reqHeaders });
      if (Array.isArray(res.data)) {
        setEntries(res.data);
      }
    } catch (e) {
      console.error("Error refreshing entries:", e);
    }
  };

  // Submit new period slot
  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    setErrorMsg("");

    try {
      await axios.post(
        `${API}/api/timetable`,
        {
          classId: form.classId,
          subjectId: form.subjectId,
          teacherId: form.teacherId,
          day: form.day,
          days: form.repeatDays, // sends array of days
          startTime: form.startTime,
          durationMinutes: Number(form.durationMinutes),
          room: form.room,
          classType: form.classType,
          notes: form.notes
        },
        { headers: getHeaders() }
      );
      
      const nextStartTime = getNextStartTime(form.startTime, form.durationMinutes, breakSettings);
      
      const [nh, nm] = nextStartTime.split(":").map(Number);
      const ampm = nh >= 12 ? "PM" : "AM";
      const displayH = nh % 12 || 12;
      const displayTime12h = `${String(displayH).padStart(2, "0")}:${String(nm).padStart(2, "0")} ${ampm}`;

      setMessage(`Timetable entry created successfully. Next start time auto-set to ${displayTime12h}!`);
      
      // Auto-increment start time for next entry, reset subject/teacher/notes while preserving class & repeat days
      setForm((prev) => ({
        ...prev,
        subjectId: "",
        teacherId: "",
        startTime: nextStartTime,
        notes: ""
      }));

      // Update entries in background instantly without blanking the screen
      fetchEntriesOnly();
      
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Could not create timetable entry.");
    }
  };

  // Delete timetable entry
  const remove = async (id) => {
    setMessage("");
    setErrorMsg("");
    try {
      await axios.delete(`${API}/api/timetable/${id}`, { headers: getHeaders() });
      setMessage("Timetable entry deleted.");
      fetchEntriesOnly();
    } catch (e) {
      setErrorMsg("Could not delete timetable entry.");
    }
  };

  const currentTabObj = TABS.find(t => t.id === activeTab) || TABS[0];

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 p-6 -m-4 md:-m-6 transition-colors duration-200" style={{ fontFamily: SORA }}>
      
      {/* ── HEADER & BREADCRUMBS ── */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mb-1">
            <span>Timetable</span>
            <span>&gt;</span>
            <span className="text-purple-500">{currentTabObj.breadcrumb}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {currentTabObj.breadcrumb}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 animate-fadeIn">
            Select class, subject, teacher, day and time to create or organize class schedules.
          </p>
        </div>
      </div>

      {/* ── TABS NAVIGATION BAR ── */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-800/80 pb-3 select-none">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMessage("");
                setErrorMsg("");
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer select-none ${
                isActive
                  ? "bg-[#7C3AED]/10 text-purple-400 border border-[#7C3AED]/30"
                  : "text-slate-455 hover:bg-slate-850 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── MESSAGES ── */}
      {message && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm mb-6 animate-fadeIn">
          <FaCheckCircle className="text-emerald-500 text-lg shrink-0" />
          {message}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-455 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm mb-6 animate-fadeIn">
          <FaInfoCircle className="text-rose-500 text-lg shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* ── LOADING SPINNER ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-450 py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-sm font-semibold tracking-wide">Syncing Timetable Setup...</p>
        </div>
      )}

      {/* ── TAB VIEW PANEL ── */}
      {!loading && (
        <div className="mb-6">
          {activeTab === "basic" && (
            <CreateTimetableTab
              classes={classes}
              teachers={teachers}
              subjects={subjects}
              entries={entries}
              loading={loading}
              form={form}
              setForm={setForm}
              submit={submit}
              resetForm={resetForm}
              belongsToClass={belongsToClass}
            />
          )}

          {activeTab === "management" && (
            <TimetableManagementTab
              classes={classes}
              teachers={teachers}
              subjects={subjects}
              entries={entries}
              remove={remove}
              setActiveTab={setActiveTab}
            />
          )}
        </div>
      )}

    </div>
  );
}
