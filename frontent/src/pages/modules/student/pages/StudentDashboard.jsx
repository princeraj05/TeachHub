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

const SORA = "'Sora', sans-serif";

const DUMMY_CLASSES = [
  {
    _id: "dummy-class-1",
    startTime: "09:00 AM",
    endTime: "10:00 AM",
    subject: { name: "Mathematics" },
    room: "Room 101",
    teacher: { name: "Lovely Coder" }
  },
  {
    _id: "dummy-class-2",
    startTime: "10:00 AM",
    endTime: "11:00 AM",
    subject: { name: "Science" },
    room: "Room 102",
    teacher: { name: "Lovely Coder" }
  },
  {
    _id: "dummy-class-3",
    startTime: "11:00 AM",
    endTime: "12:00 PM",
    subject: { name: "Social Science" },
    room: "Room 103",
    teacher: { name: "Lovely Coder" }
  }
];

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

  const [timetableEntries, setTimetableEntries] = useState(() => DUMMY_CLASSES);
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
  }, [API]);

  // Fetch timetable entries when selected day changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    axiosInstance
      .get(`${API}/api/timetable?day=${selectedDay.full}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setTimetableEntries(res.data);
        }
      })
      .catch((err) => {
        console.log("Error loading day timetable:", err);
      });
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

  // Resolve how many classes a day has (Mon-Fri default, Sat-Sun holiday)
  const getDayClassesCount = (day) => {
    if (day.full === "Saturday" || day.full === "Sunday") {
      return "Holiday";
    }
    if (day.full === "Friday") {
      return "2 Classes";
    }
    return "3 Classes";
  };

  // Switch display elements: either live db entries, or fallback to dummy list
  const activeClasses = useMemo(() => {
    if (selectedDay.full === "Saturday" || selectedDay.full === "Sunday") {
      return [];
    }
    if (timetableEntries.length > 0) {
      return timetableEntries;
    }
    // Fallback: Return dummy classes if database has none
    if (selectedDay.full === "Friday") {
      return DUMMY_CLASSES.slice(0, 2);
    }
    return DUMMY_CLASSES;
  }, [selectedDay, timetableEntries]);

  return (
    <div style={{ fontFamily: SORA }} className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 text-left select-none pb-8">
      
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3 mb-2 sm:mb-4">
        <div>
          <h1 className="text-lg sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Student Dashboard
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-505 dark:text-slate-400 font-medium mt-0.5">
            Welcome back, {studentName}! 👋
          </p>
        </div>
        
        {/* Right Buttons Container */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={toggleTheme}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/[0.08] text-slate-505 dark:text-amber-400 hover:border-slate-350 dark:hover:border-white/15 flex items-center justify-center transition-all cursor-pointer text-xs sm:text-base"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-800 text-white flex items-center justify-center font-black text-xs sm:text-sm shadow-md border-2 border-white dark:border-[#0B132A]">
            {userInitials}
          </div>
        </div>
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

      {/* Weekly Timetable Panel Wrapper */}
      <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Weekly Timetable</h2>
            <p className="text-[11px] text-slate-450 dark:text-slate-500 font-semibold mt-1">Your class schedule for the week</p>
          </div>
          
          <Link
            to="/student/showtimetable"
            className="rounded-xl border border-slate-200 dark:border-white/[0.08] hover:border-slate-350 dark:hover:border-white/15 px-3 py-2 text-xs font-black text-[#7C3AED] dark:text-[#A78BFA] flex items-center gap-1.5 bg-slate-50 dark:bg-white/[0.01] transition-all"
          >
            <FaCalendarAlt className="text-xs" />
            View Full Timetable
          </Link>
        </div>

        {/* Horizontal scrollable row of weekdays */}
        <div className="flex gap-3 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {weekDays.map((day) => {
            const isSelected = selectedDay.full === day.full;
            const countLabel = getDayClassesCount(day);
            const isHoliday = countLabel === "Holiday";
            
            return (
              <div
                key={day.full}
                onClick={() => setSelectedDay(day)}
                className={`flex-1 min-w-[85px] p-3.5 rounded-2.5xl flex flex-col items-center justify-center cursor-pointer transition-all border ${
                  isSelected
                    ? "bg-[#7C3AED]/10 border-[#7C3AED] text-[#7C3AED] dark:text-[#A78BFA] shadow-md shadow-[#7C3AED]/5"
                    : "bg-slate-50 dark:bg-[#0B132A]/40 border-slate-200/60 dark:border-white/[0.04] text-slate-505 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/[0.08]"
                }`}
              >
                {day.isToday && (
                  <span className="text-[8px] font-black uppercase bg-[#7C3AED] text-white px-2 py-0.5 rounded-full mb-1.5 shadow-sm">
                    Today
                  </span>
                )}
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{day.short}</span>
                <span className="text-xs font-black mt-1.5 text-slate-800 dark:text-white">{day.label}</span>
                
                {/* Visual Icon */}
                <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center mt-3 shadow-sm ${
                  isHoliday 
                    ? day.full === "Saturday" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                    : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                }`}>
                  <FaCalendarAlt className="text-xs" />
                </div>
                
                <span className={`text-[9px] font-extrabold mt-2.5 ${
                  isHoliday 
                    ? "text-slate-400" 
                    : isSelected ? "text-[#7C3AED] dark:text-[#A78BFA]" : "text-emerald-500"
                }`}>
                  • {countLabel}
                </span>
              </div>
            );
          })}
        </div>

        {/* Selected day timeline details card */}
        <div className="bg-slate-50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/[0.04] p-5 rounded-3xl relative overflow-hidden">
          <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-150 dark:border-white/5">
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
              {selectedDay.full}, {selectedDay.label}
            </h3>
            
            <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${
              activeClasses.length === 0
                ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                : "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400"
            }`}>
              {activeClasses.length === 0 ? "Holiday" : `${activeClasses.length} Classes`}
            </span>
          </div>

          {loadingTimetable ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-3 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-450 dark:text-slate-500 font-bold">Syncing class timeline...</p>
            </div>
          ) : activeClasses.length === 0 ? (
            <div className="text-center py-10 text-slate-450 dark:text-slate-500 font-bold">
              🏖️ No classes scheduled. Enjoy your weekend holiday!
            </div>
          ) : (
            <div className="relative border-l border-slate-200 dark:border-white/5 pl-7 ml-3.5 space-y-6 my-2">
              {activeClasses.map((cls, cIdx) => {
                const status = getClassStatus(cls.startTime, cls.endTime);
                return (
                  <div key={cls._id || cIdx} className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 select-none">
                    
                    {/* Circle axis indicator */}
                    <span className={`absolute -left-[34px] w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#0B132A] ${
                      status === "Ongoing" ? "bg-emerald-500" : status === "Completed" ? "bg-slate-500" : "bg-[#7C3AED]"
                    }`} />
                    
                    <div className="flex items-start gap-4">
                      <span className="text-[10px] text-slate-505 dark:text-slate-400 font-black shrink-0 w-28 flex items-center gap-1.5">
                        <FaClock className="text-slate-400 text-[11px]" />
                        {cls.startTime} - {cls.endTime}
                      </span>
                      
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white">
                          {cls.subject?.name || "Class Lecture"}
                        </h4>
                        <p className="text-[10px] text-slate-450 dark:text-slate-550 font-bold mt-1">
                          {profile?.classId?.name || "1"} - {profile?.classId?.section || "A"}  •  {cls.room || "Room"}  •  {cls.teacher?.name || "Lovely Coder"}
                        </p>
                      </div>
                    </div>

                    <span className={`shrink-0 self-start sm:self-center text-[9px] font-black px-2.5 py-0.5 rounded-full border ${
                      status === "Ongoing" ? "bg-emerald-500/10 text-emerald-555 border-emerald-500/20 animate-pulse" :
                      status === "Completed" ? "bg-slate-500/10 text-slate-500 border-slate-500/20" :
                      "bg-purple-500/10 text-[#7C3AED] dark:text-[#A78BFA] border-[#7C3AED]/20"
                    }`}>
                      {status}
                    </span>

                  </div>
                );
              })}
            </div>
          )}

          {/* Button: View Full Day Timetable */}
          <button
            onClick={() => navigate("/student/showtimetable")}
            className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3.5 rounded-2xl text-xs font-black text-center transition-all mt-6 flex items-center justify-center gap-1.5 shadow-md shadow-[#7C3AED]/15 cursor-pointer"
          >
            View Full Day Timetable <FaChevronRight className="text-[9px]" />
          </button>
        </div>
      </div>

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
