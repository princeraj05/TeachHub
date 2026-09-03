import { useEffect, useState, useMemo } from "react";
import axiosInstance from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBookOpen,
  FaClipboardCheck,
  FaFileAlt,
  FaTrophy,
  FaChevronRight,
  FaCalendarAlt,
  FaClock,
  FaSchool,
  FaVolumeUp,
  FaExclamationTriangle
} from "react-icons/fa";
import { useTheme } from "../../../../context/ThemeContext";
import TodayTimetableWidget from "../../../../components/TodayTimetableWidget";

const SORA = "'Sora', sans-serif";

const DUMMY_CLASSES = [];

function StudentDashboard() {
  const API = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [data, setData] = useState(() => {
    try {
      const cached = localStorage.getItem("teachhub_cache_student_dashboard");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.data) return parsed.data;
      }
    } catch (e) {}
    return { subjects: 4, attendance: 92, exams: 2, achievements: 5 };
  });

  const [profile, setProfile] = useState(() => {
    try {
      const cached = localStorage.getItem("teachhub_cache_student_profile");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.data) return parsed.data;
      }
    } catch (e) {}
    return { name: "Student User" };
  });

  const [timetableEntries, setTimetableEntries] = useState([]);
  const [allWeeklyEntries, setAllWeeklyEntries] = useState([]);
  const [loadingTimetable, setLoadingTimetable] = useState(false);

  // Generate week days list (Monday to Sunday) centered around current week
  const weekDays = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday=0, Monday=1, ...
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diff);

    const weekdaysShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weekdaysFull = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      
      const isToday = date.toDateString() === new Date().toDateString();
      const dayNum = date.getDate();
      const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
      const monthName = date.toLocaleDateString("en-US", { month: "short" });
      
      days.push({
        short: weekdaysShort[i],
        full: weekdaysFull[i],
        label: `${dayNum} ${monthName}`,
        isToday,
        dateStr: date.toISOString().split("T")[0]
      });
    }
    return days;
  }, []);

  const todayDay = weekDays.find(d => d.isToday) || weekDays[0];
  const [selectedDay, setSelectedDay] = useState(todayDay);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axiosInstance
      .get(`${API}/api/student/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data) {
          setData(res.data);
          localStorage.setItem("teachhub_cache_student_dashboard", JSON.stringify({ timestamp: Date.now(), data: res.data }));
        }
      })
      .catch((err) => console.log("Student Dashboard Error:", err));

    axiosInstance
      .get(`${API}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data) {
          setProfile(res.data);
          localStorage.setItem("teachhub_cache_student_profile", JSON.stringify({ timestamp: Date.now(), data: res.data }));
        }
      })
      .catch((err) => console.log("Student Profile Error:", err));

    // Load overall weekly timetable for dynamic day counts
    axiosInstance
      .get(`${API}/api/timetable`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setAllWeeklyEntries(res.data);
        }
      })
      .catch((err) => console.log("Weekly Timetable Error:", err));
  }, [API]);

  // Fetch timetable entries when selected day changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoadingTimetable(true);
    axiosInstance
      .get(`${API}/api/timetable?day=${selectedDay.full}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setTimetableEntries(res.data);
        } else {
          setTimetableEntries([]);
        }
      })
      .catch((err) => {
        console.log("Error loading day timetable:", err);
        setTimetableEntries([]);
      })
      .finally(() => setLoadingTimetable(false));
  }, [API, selectedDay]);

  const studentName = profile?.name ? profile.name.split(" ")[0] : "Learner";
  const userInitials = profile?.name
    ? profile.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  // Helper to parse time strings like "09:00 AM" into minutes since midnight
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const clean = timeStr.trim().toUpperCase();
    const match = clean.match(/^(\d+):(\d+)\s*(AM|PM)?$/);
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

  // Helper to determine status based on current time
  const getClassStatus = (startTime, endTime) => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const start = parseTimeToMinutes(startTime);
    const end = parseTimeToMinutes(endTime);

    if (currentMinutes < start) return "Upcoming";
    if (currentMinutes < end) return "Ongoing";
    return "Completed";
  };

  // Dynamic class count calculation for each day
  const getDayClassesCount = (day) => {
    if (day.full === "Saturday" || day.full === "Sunday") {
      return "Holiday";
    }
    const dayCount = allWeeklyEntries.filter(
      (e) => e.day?.toLowerCase() === day.full.toLowerCase()
    ).length;

    if (dayCount === 0) return "No Classes";
    return `${dayCount} ${dayCount === 1 ? "Class" : "Classes"}`;
  };

  const activeClasses = useMemo(() => {
    if (selectedDay.full === "Saturday" || selectedDay.full === "Sunday") {
      return [];
    }
    return timetableEntries;
  }, [selectedDay, timetableEntries]);

  return (
    <div style={{ fontFamily: SORA }} className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 text-left select-none pb-8">
      
      {/* Top Header Row */}
      <div className="mb-2 sm:mb-4">
        <h1 className="text-lg sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Student Dashboard
        </h1>
      </div>

      {/* Admission Exam Scheduling Alert */}
      {profile && profile.admissionExamDate && (
        <div className="p-5 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 dark:from-teal-500/15 dark:to-emerald-500/15 border border-teal-200/50 dark:border-teal-500/20 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden transition-all duration-200">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-lg shrink-0 text-xl font-bold">
              📝
            </div>
            <div>
              <p className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-0.5">Admissions Update</p>
              <h3 className="text-sm font-black text-slate-800 dark:text-white tracking-tight">
                Your School Admission Test has been Scheduled!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">
                Congratulations on being accepted to <strong className="font-bold text-slate-850 dark:text-white">{profile.schoolName}</strong>! Your admission test will take place on:
                <br />
                <span className="inline-flex items-center gap-1.5 font-bold text-[#7C3AED] dark:text-[#38BDF8] mt-2 bg-[#7C3AED]/10 dark:bg-[#38BDF8]/10 px-2 py-0.5 rounded text-[11px]">
                  <FaCalendarAlt /> {new Date(profile.admissionExamDate).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="inline-flex items-center gap-1.5 font-bold text-teal-600 dark:text-teal-400 ml-2 mt-2 bg-teal-500/10 px-2 py-0.5 rounded text-[11px]">
                  Mode: {profile.admissionExamMode}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Today's Timetable Widget */}
      <TodayTimetableWidget />

      {/* Today's Overview grid layout (2 COLUMNS ON MOBILE) */}
      <div>
        <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight mb-4 px-1">Today's Overview</h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          
          {/* Card 1: Subjects Enrolled */}
          <div className="bg-white dark:bg-[#0B132A]/80 border border-slate-200/60 dark:border-white/[0.08] rounded-2.5xl sm:rounded-3xl p-3.5 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-500/10 text-[#7C3AED] border border-[#7C3AED]/25 flex items-center justify-center mb-3 sm:mb-4">
              <FaBookOpen className="text-xs sm:text-sm" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-0.5">
              {data.subjects}
            </p>
            <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide truncate">
              Subjects Enrolled
            </p>
          </div>

          {/* Card 2: Attendance Rate */}
          <div className="bg-white dark:bg-[#0B132A]/80 border border-slate-200/60 dark:border-white/[0.08] rounded-2.5xl sm:rounded-3xl p-3.5 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 flex items-center justify-center mb-3 sm:mb-4">
              <FaClipboardCheck className="text-xs sm:text-sm" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-0.5">
              {data.attendance}%
            </p>
            <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide truncate">
              Attendance Rate
            </p>
          </div>

          {/* Card 3: Upcoming Exams */}
          <div className="bg-white dark:bg-[#0B132A]/80 border border-slate-200/60 dark:border-white/[0.08] rounded-2.5xl sm:rounded-3xl p-3.5 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/25 flex items-center justify-center mb-3 sm:mb-4">
              <FaFileAlt className="text-xs sm:text-sm" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-0.5">
              {data.exams}
            </p>
            <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide truncate">
              Upcoming Exams
            </p>
          </div>

          {/* Card 4: Achievements Earned */}
          <div className="bg-white dark:bg-[#0B132A]/80 border border-slate-200/60 dark:border-white/[0.08] rounded-2.5xl sm:rounded-3xl p-3.5 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 text-amber-555 border border-amber-500/25 flex items-center justify-center mb-3 sm:mb-4">
              <FaTrophy className="text-xs sm:text-sm" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-0.5">
              {data.achievements}
            </p>
            <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide truncate">
              Achievements Earned
            </p>
          </div>

        </div>
      </div>

      {/* Megaphone banner banner at bottom */}
      <div 
        onClick={() => navigate("/student/exams")}
        className="flex items-center justify-between bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/10 rounded-2.5xl p-4.5 text-xs select-none transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3 text-slate-655 dark:text-slate-400">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-[#38BDF8] flex items-center justify-center shrink-0 text-base">
            <FaVolumeUp className="text-sm shrink-0" />
          </div>
          <div className="text-left">
            <h4 className="text-xs font-black text-slate-900 dark:text-white">Stay Updated</h4>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold mt-0.5">Check your timetable, attendance and exam schedule regularly.</p>
          </div>
        </div>
        <FaChevronRight className="text-slate-400 text-xs shrink-0" />
      </div>

    </div>
  );
}

export default StudentDashboard;
