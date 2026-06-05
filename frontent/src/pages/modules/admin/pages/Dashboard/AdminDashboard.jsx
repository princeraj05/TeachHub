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
  FaChalkboardTeacher,
  FaBook,
  FaSchool,
  FaCalendarAlt,
  FaArrowUp,
} from "react-icons/fa";

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

function AdminDashboard() {
  const API = import.meta.env.VITE_API_URL;

  const [data, setData] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    subjects: 0,
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.log("Dashboard error:", err);
      }
    };
    fetchDashboard();
  }, [API]);

  const chartData = [
    { name: "Students", value: data.students },
    { name: "Teachers", value: data.teachers },
    { name: "Classes",  value: data.classes  },
    { name: "Subjects", value: data.subjects },
  ];

  const BAR_COLORS = ["#14B8A6", "#06B6D4", "#6366F1", "#F59E0B"];

  const stats = [
    {
      label: "Total Students",
      value: data.students,
      icon: <FaUserGraduate />,
      grad: "from-teal-500 to-emerald-500",
      shadow: "shadow-teal-500/10",
      text: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      label: "Total Teachers",
      value: data.teachers,
      icon: <FaChalkboardTeacher />,
      grad: "from-cyan-500 to-teal-500",
      shadow: "shadow-cyan-500/10",
      text: "text-cyan-600",
      bg: "bg-cyan-50",
    },
    {
      label: "Total Classes",
      value: data.classes,
      icon: <FaSchool />,
      grad: "from-indigo-500 to-blue-500",
      shadow: "shadow-indigo-500/10",
      text: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Total Subjects",
      value: data.subjects,
      icon: <FaBook />,
      grad: "from-amber-500 to-orange-500",
      shadow: "shadow-amber-500/10",
      text: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  const infoRows = [
    { icon: <FaSchool className="text-teal-500" />,         label: "Total Classes",        value: data.classes  },
    { icon: <FaUserGraduate className="text-cyan-500" />,   label: "Students Registered",  value: data.students },
    { icon: <FaChalkboardTeacher className="text-indigo-500" />, label: "Teachers Registered", value: data.teachers },
    { icon: <FaCalendarAlt className="text-amber-500" />,   label: "Academic Year",        value: "2026"        },
  ];

  return (
    <div style={{ fontFamily: SORA }}>
      {/* ── Page Header ── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-1">Overview</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Welcome back! Here is a visual overview of TeachHub.</p>
        </div>
        <div className="flex items-center gap-2.5 bg-slate-100 border border-slate-200/60 rounded-2xl px-4 py-2.5 w-fit text-xs font-bold text-slate-500 select-none shadow-sm">
          <FaCalendarAlt className="text-slate-400" />
          Academic Year 2026
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((s, i) => (
          <div
            key={i}
            className="group relative bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
          >
            {/* Hover bar */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${s.grad}`} />

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center text-white text-base shadow-lg ${s.shadow} group-hover:scale-105 transition-all duration-300`}>
                  {s.icon}
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full select-none">
                  <FaArrowUp className="text-[9px]" />
                  Active
                </span>
              </div>
              <p className="text-3xl font-extrabold text-slate-800 tracking-tight mb-1">{s.value}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Bar Chart Panel */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800" style={{ fontFamily: SORA }}>System Metrics</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Distribution count by entity category</p>
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

        {/* Info snapshot Panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800" style={{ fontFamily: SORA }}>System Summary</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Quick data snapshots</p>
            </div>
            <div className="p-6 space-y-3">
              {infoRows.map((row, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-slate-50 hover:bg-slate-100/60 transition-colors rounded-xl px-4 py-3.5 border border-slate-100/80"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base bg-white w-8 h-8 rounded-lg shadow-sm border border-slate-200/40 flex items-center justify-center">{row.icon}</span>
                    <span className="text-xs font-bold text-slate-600">{row.label}</span>
                  </div>
                  <span className="text-sm font-extrabold text-slate-800">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Legend badge footer */}
          <div className="px-6 pb-6 pt-1">
            <div className="bg-gradient-to-r from-teal-500/5 to-emerald-500/5 border border-teal-500/10 rounded-xl px-4 py-3 text-xs text-teal-800 font-bold flex items-center gap-2">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              TeachHub services are online and active.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;