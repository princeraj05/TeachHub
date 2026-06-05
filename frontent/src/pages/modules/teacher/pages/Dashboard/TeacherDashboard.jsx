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

import {
  FaUserGraduate,
  FaBook,
  FaSchool,
  FaClipboardCheck,
  FaCalendarAlt,
} from "react-icons/fa";

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

function TeacherDashboard() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [data, setData] = useState({
    students: 0,
    subjects: 0,
    classes: 0,
    attendanceToday: 0,
    recentStudents: [],
  });

  useEffect(() => {
    axios
      .get(`${API}/api/teacher/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setData({
          students: res.data?.students || 0,
          subjects: res.data?.subjects || 0,
          classes: res.data?.classes || 0,
          attendanceToday: res.data?.attendanceToday || 0,
          recentStudents: res.data?.recentStudents || [],
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [API, token]);

  const chartData = [
    { name: "Students", value: data.students },
    { name: "Subjects", value: data.subjects },
    { name: "Classes", value: data.classes },
    { name: "Attendance", value: data.attendanceToday },
  ];

  const BAR_COLORS = ["#7C3AED", "#312E81", "#38BDF8", "#818CF8"];

  const stats = [
    {
      label: "My Students",
      value: data.students,
      icon: <FaUserGraduate className="text-base" />,
      grad: "from-[#7C3AED] to-purple-500",
      shadow: "shadow-purple-500/10",
      text: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "My Subjects",
      value: data.subjects,
      icon: <FaBook className="text-base" />,
      grad: "from-[#312E81] to-indigo-700",
      shadow: "shadow-indigo-500/10",
      text: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "My Classes",
      value: data.classes,
      icon: <FaSchool className="text-base" />,
      grad: "from-[#38BDF8] to-cyan-500",
      shadow: "shadow-cyan-500/10",
      text: "text-cyan-600",
      bg: "bg-cyan-50",
    },
    {
      label: "Today's Attendance",
      value: data.attendanceToday,
      icon: <FaClipboardCheck className="text-base" />,
      grad: "from-[#7C3AED]/80 to-[#38BDF8]",
      shadow: "shadow-[#7C3AED]/10",
      text: "text-purple-700",
      bg: "bg-purple-50",
    },
  ];

  const infoRows = [
    { emoji: "👨‍🎓", label: "My Students Assigned", value: data.students },
    { emoji: "📚", label: "My Subjects Catalog", value: data.subjects },
    { emoji: "🏫", label: "Classes Under Teaching", value: data.classes },
    { emoji: "📅", label: "Current Academic Year", value: "2026" },
  ];

  return (
    <div style={{ fontFamily: SORA }}>
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED] mb-1">Overview</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Teacher Dashboard
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Welcome back! Monitor student records and submit attendance sheets.
          </p>
        </div>
        <div className="flex items-center gap-2.5 bg-slate-100 border border-slate-200/60 rounded-2xl px-4 py-2.5 w-fit text-xs font-bold text-slate-500 select-none shadow-sm">
          <FaCalendarAlt className="text-slate-400" />
          Academic Year 2026
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((s, i) => (
          <div
            key={i}
            className="group relative bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
          >
            <div className={`h-1.5 w-full bg-gradient-to-r ${s.grad}`} />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center text-white shadow-lg ${s.shadow} group-hover:scale-105 transition-all duration-300`}>
                  {s.icon}
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full select-none">
                  Active
                </span>
              </div>
              <p className="text-3xl font-extrabold text-slate-800 tracking-tight mb-1">{s.value}</p>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Quick Info Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-800">Class Metrics Overview</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Distribution counts by academic entities</p>
            </div>
            <span className="text-[10px] font-extrabold bg-purple-50 border border-purple-100 text-[#7C3AED] px-3 py-1 rounded-full select-none">
              Live
            </span>
          </div>
          <div className="w-full h-[260px]">
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

        {/* Quick Info */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-800">Quick Metrics</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Summary of academic parameters</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <FaCalendarAlt className="text-[#7C3AED] text-xs" />
            </div>
          </div>
          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {infoRows.map((row, i) => (
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
                <span className="text-xs font-extrabold text-slate-800">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">My Recent Students</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Quick lookup of recently enrolled students in your courses</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase tracking-widest text-[9px] font-bold border-b border-slate-100">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {data.recentStudents.length === 0 ? (
                <tr>
                  <td colSpan="2" className="text-center py-16 text-slate-400">
                    <p className="text-xs font-semibold">No recent students found</p>
                  </td>
                </tr>
              ) : (
                data.recentStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 text-xs">{student.name}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium text-xs break-all">{student.email}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
            Student listings are refreshed automatically with class schedules
          </p>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;