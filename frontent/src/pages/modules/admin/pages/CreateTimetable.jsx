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
  const api = import.meta.env.VITE_API_URL;
  const headers = { Authorization: "Bearer " + localStorage.getItem("token") };

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

  const load = async () => {
    setLoading(true);
    try {
      const [classResult, subjectResult, teacherResult, entryResult] = await Promise.all([
        axios.get(api + "/api/admin/classes", { headers }),
        axios.get(api + "/api/admin/subjects", { headers }),
        axios.get(api + "/api/admin/users/teachers", { headers }),
        axios.get(api + "/api/timetable", { headers })
      ]);
      setClasses(classResult.data);
      setSubjects(subjectResult.data);
      setTeachers(teacherResult.data);
      setEntries(entryResult.data);
    } catch (e) {
      setErrorMsg("Could not load timetable setup data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [api]);

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

  // Submit new period slot
  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    setErrorMsg("");

    try {
      await axios.post(
        api + "/api/timetable",
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
        { headers }
      );
      
      setMessage("Timetable entry created successfully.");
      resetForm();
      await load();
      
      // Auto toggle to weekly management view so they see the result!
      setTimeout(() => {
        setActiveTab("management");
      }, 1000);
      
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Could not create timetable entry.");
    }
  };

  // Delete timetable entry
  const remove = async (id) => {
    setMessage("");
    setErrorMsg("");
    try {
      await axios.delete(api + "/api/timetable/" + id, { headers });
      setMessage("Timetable entry deleted.");
      await load();
    } catch (e) {
      setErrorMsg("Could not delete timetable entry.");
    }
  };

  const currentTabObj = TABS.find(t => t.id === activeTab) || TABS[0];

  return (
    <div className="bg-[#080D1A] min-h-screen text-slate-100 p-6 -m-4 md:-m-6" style={{ fontFamily: SORA }}>
      
      {/* ── HEADER & BREADCRUMBS ── */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mb-1">
            <span>Timetable</span>
            <span>&gt;</span>
            <span className="text-purple-500">{currentTabObj.breadcrumb}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {currentTabObj.breadcrumb}
          </h1>
          <p className="text-xs text-slate-450 font-medium mt-0.5 animate-fadeIn">
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
