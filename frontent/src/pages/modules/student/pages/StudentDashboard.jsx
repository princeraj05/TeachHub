import { useEffect, useState } from "react";
import axiosInstance from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";
import { FaBook, FaClipboardCheck, FaFileAlt, FaCalendarAlt } from "react-icons/fa";

const SORA = "'Sora', sans-serif";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xl border border-white/10">
        <p className="text-slate-400 mb-0.5 font-medium">{label}</p>
        <p className="text-[#38BDF8] text-sm font-extrabold">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

function StudentDashboard() {
  const API = import.meta.env.VITE_API_URL;
  const [data, setData] = useState({ subjects: 0, attendance: 0, exams: 0 });
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axiosInstance
      .get(`${API}/api/student/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setData(res.data))
      .catch((err) => console.log("Student Dashboard Error:", err));

    axiosInstance
      .get(`${API}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProfile(res.data))
      .catch((err) => console.log("Student Profile Error:", err));
  }, [API]);

  const chartData = [
    { name: "Subjects", value: data.subjects },
    { name: "Attendance", value: data.attendance },
    { name: "Exams", value: data.exams },
  ];

  const BAR_COLORS = ["#7C3AED", "#38BDF8", "#312E81"];

  const cards = [
    {
      label: "Enrolled Subjects",
      value: data.subjects,
      icon: <FaBook className="text-base" />,
      grad: "from-[#312E81] to-indigo-700",
      shadow: "shadow-indigo-500/10",
      suffix: "",
    },
    {
      label: "Attendance Rate",
      value: data.attendance,
      icon: <FaClipboardCheck className="text-base" />,
      grad: "from-[#7C3AED] to-purple-500",
      shadow: "shadow-purple-500/10",
      suffix: "%",
    },
    {
      label: "Upcoming Exams",
      value: data.exams,
      icon: <FaFileAlt className="text-base" />,
      grad: "from-[#38BDF8] to-cyan-500",
      shadow: "shadow-cyan-500/10",
      suffix: "",
    },
  ];

  const quickInfo = [
    { emoji: "📚", label: "Subjects Enrolled", val: data.subjects },
    { emoji: "📊", label: "Attendance Progress", val: `${data.attendance}%` },
    { emoji: "📝", label: "Upcoming Exams", val: data.exams },
    { emoji: "📅", label: "Academic Year", val: "2026" },
  ];

  return (
    <div style={{ fontFamily: SORA }}>
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED] mb-1">Overview</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Student Dashboard
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Welcome back! Stay updated on your academic metrics.
          </p>
        </div>
        <div className="flex items-center gap-2.5 bg-slate-100 border border-slate-200/60 rounded-2xl px-4 py-2.5 w-fit text-xs font-bold text-slate-500 select-none shadow-sm">
          <FaCalendarAlt className="text-slate-400" />
          Academic Year 2026
        </div>
      </div>

      {/* Admission Exam Scheduling Alert */}
      {profile && profile.admissionExamDate && (
        <div className="mb-8 p-5 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 dark:from-teal-500/15 dark:to-emerald-500/15 border border-teal-200/50 dark:border-teal-500/20 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden transition-all duration-200">
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
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed max-w-xl">
                Congratulations on being accepted to <strong className="font-bold text-slate-850 dark:text-white">{profile.schoolName}</strong>! Your admission test will take place on:
                <br />
                <span className="inline-flex items-center gap-1.5 font-bold text-[#7C3AED] dark:text-[#38BDF8] mt-1 bg-[#7C3AED]/10 dark:bg-[#38BDF8]/10 px-2 py-0.5 rounded text-[11px]">
                  <FaCalendarAlt /> {new Date(profile.admissionExamDate).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="inline-flex items-center gap-1.5 font-bold text-teal-600 dark:text-teal-400 ml-2 mt-1 bg-teal-500/10 px-2 py-0.5 rounded text-[11px]">
                  Mode: {profile.admissionExamMode}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {cards.map((c, i) => (
          <div
            key={i}
            className="group relative bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
          >
            {/* Hover bar */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${c.grad}`} />

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.grad} flex items-center justify-center text-white shadow-lg ${c.shadow} group-hover:scale-105 transition-all duration-300`}>
                  {c.icon}
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full select-none">
                  Active
                </span>
              </div>
              <p className="text-3xl font-extrabold text-slate-800 tracking-tight mb-1">
                {c.value}
                {c.suffix && <span className="text-lg font-bold text-slate-400 ml-0.5">{c.suffix}</span>}
              </p>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Snapshot Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Bar Chart Panel */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">Academic Overview</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Academic details breakdown</p>
            </div>
            <span className="text-[10px] font-extrabold bg-purple-50 border border-purple-100 text-[#7C3AED] px-3 py-1 rounded-full select-none">
              Live
            </span>
          </div>
          <div className="p-6">
            <div className="w-full h-[240px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={32} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontFamily: SORA, fill: "#94a3b8", fontWeight: 700 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontFamily: SORA, fill: "#cbd5e1", fontWeight: 500 }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(15, 23, 42, 0.02)", radius: 8 }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((_, idx) => (
                      <Cell key={idx} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Info & Attendance Progress */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-800">Quick Info</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Personal metrics lookup</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <FaCalendarAlt className="text-[#7C3AED] text-xs" />
              </div>
            </div>
            
            <div className="p-6 space-y-3">
              {quickInfo.map((row, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-slate-50 hover:bg-slate-100/60 transition-colors rounded-xl px-4 py-3.5 border border-slate-100/80"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base bg-white w-8 h-8 rounded-lg shadow-sm border border-slate-200/40 flex items-center justify-center select-none">
                      {row.emoji}
                    </span>
                    <span className="text-xs font-bold text-slate-655">{row.label}</span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-800">{row.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance progress display */}
          <div className="px-6 pb-6 pt-1">
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4">
              <div className="flex justify-between text-xs font-bold text-slate-505 mb-2">
                <span>Attendance Progress</span>
                <span className="text-[#7C3AED]">{data.attendance}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#7C3AED] to-[#38BDF8] rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(data.attendance, 100)}%` }}
                />
              </div>
              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider mt-2.5 flex items-center gap-1.5">
                {data.attendance >= 75 ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Status: Excellent (Above Threshold)
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    Status: Warning (Below 75% Threshold)
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;