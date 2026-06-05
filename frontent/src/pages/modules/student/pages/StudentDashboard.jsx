import { useEffect, useState } from "react";
import axios from "axios";
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
        <p className="text-teal-400 text-sm font-extrabold">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

function StudentDashboard() {
  const API = import.meta.env.VITE_API_URL;
  const [data, setData] = useState({ subjects: 0, attendance: 0, exams: 0 });

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${API}/api/student/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setData(res.data))
      .catch((err) => console.log("Student Dashboard Error:", err));
  }, [API]);

  const chartData = [
    { name: "Subjects", value: data.subjects },
    { name: "Attendance", value: data.attendance },
    { name: "Exams", value: data.exams },
  ];

  const BAR_COLORS = ["#6366F1", "#14B8A6", "#F59E0B"];

  const cards = [
    {
      label: "Enrolled Subjects",
      value: data.subjects,
      icon: <FaBook className="text-base" />,
      grad: "from-indigo-500 to-blue-500",
      shadow: "shadow-indigo-500/10",
      suffix: "",
    },
    {
      label: "Attendance Rate",
      value: data.attendance,
      icon: <FaClipboardCheck className="text-base" />,
      grad: "from-teal-500 to-emerald-500",
      shadow: "shadow-teal-500/10",
      suffix: "%",
    },
    {
      label: "Upcoming Exams",
      value: data.exams,
      icon: <FaFileAlt className="text-base" />,
      grad: "from-amber-500 to-orange-500",
      shadow: "shadow-amber-500/10",
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
          <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-1">Overview</p>
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
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{c.label}</p>
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
            <span className="text-[10px] font-extrabold bg-teal-50 border border-teal-100 text-teal-600 px-3 py-1 rounded-full select-none">
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
                    allowDecimals={true}
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
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                <FaCalendarAlt className="text-teal-500 text-xs" />
              </div>
            </div>
            
            <div className="p-6 space-y-3">
              {quickInfo.map((row, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-slate-50 hover:bg-slate-100/60 transition-colors rounded-xl px-4 py-3 border border-slate-100/80"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm bg-white w-8 h-8 rounded-lg shadow-sm border border-slate-200/40 flex items-center justify-center select-none">
                      {row.emoji}
                    </span>
                    <span className="text-xs font-bold text-slate-600">{row.label}</span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-800">{row.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance progress display */}
          <div className="px-6 pb-6 pt-1">
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4">
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                <span>Attendance Progress</span>
                <span className="text-teal-600">{data.attendance}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(data.attendance, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-2 flex items-center gap-1.5">
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