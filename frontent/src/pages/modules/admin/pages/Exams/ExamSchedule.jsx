import { useEffect, useState } from "react";
import axios from "axios";
import { FaCalendarAlt, FaBook, FaSchool, FaTrash, FaPlus, FaCalendarCheck } from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function ExamSchedule() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({ classId: "", subjectId: "", date: "" });

  useEffect(() => {
    fetchExams();
    fetchClasses();
    fetchSubjects();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await axios.get(`${API}/api/exams`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExams(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    const res = await axios.get(`${API}/api/admin/classes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setClasses(res.data);
  };

  const fetchSubjects = async () => {
    const res = await axios.get(`${API}/api/admin/subjects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSubjects(res.data);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API}/api/exams`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ classId: "", subjectId: "", date: "" });
      fetchExams();
    } catch (err) {
      console.log(err);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteExam = async (id) => {
    await axios.delete(`${API}/api/exams/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setExams(exams.filter((e) => e._id !== id));
  };

  const upcomingCount = exams.filter(
    (e) => new Date(e.date) >= new Date()
  ).length;

  const stats = [
    {
      label: "Total Scheduled",
      value: exams.length,
      desc: "all exams",
      grad: "from-indigo-500 to-blue-500",
      shadow: "shadow-indigo-500/10",
      text: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Upcoming",
      value: upcomingCount,
      desc: "scheduled forward",
      grad: "from-teal-500 to-emerald-500",
      shadow: "shadow-teal-500/10",
      text: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      label: "Completed",
      value: exams.length - upcomingCount,
      desc: "already held",
      grad: "from-slate-500 to-slate-600",
      shadow: "shadow-slate-500/10",
      text: "text-slate-600",
      bg: "bg-slate-50",
    },
  ];

  return (
    <div style={{ fontFamily: SORA }}>
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-1">Academics</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Exam Schedule
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage and organize system wide exam timelines</p>
        </div>
        <div className="flex items-center gap-2.5 bg-slate-100 border border-slate-200/60 rounded-2xl px-4 py-2.5 w-fit text-xs font-bold text-slate-500 select-none shadow-sm">
          <FaCalendarAlt className="text-slate-400" />
          Academic Year 2026
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {stats.map((s, i) => (
          <div
            key={i}
            className="group relative bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
          >
            <div className={`h-1.5 w-full bg-gradient-to-r ${s.grad}`} />
            <div className="p-5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{s.label}</span>
              <p className="text-3xl font-extrabold text-slate-800 tracking-tight my-1">{s.value}</p>
              <p className="text-xs text-slate-400 font-medium">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Create Exam Panel (Left 2 cols) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden sticky top-6">
            <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 to-indigo-500" />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 shadow-sm">
                  <FaPlus className="text-sm" />
                </div>
                <div>
                  <h2 className="text-slate-800 font-bold text-base">Schedule New Exam</h2>
                  <p className="text-slate-400 text-xs mt-0.5">Fill academic details below</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Class select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Class</label>
                  <div className="relative">
                    <FaSchool className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                    <select
                      name="classId"
                      value={form.classId}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl pl-10 pr-3 py-3 text-xs text-slate-700 font-bold outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
                    >
                      <option value="" disabled>Select Class</option>
                      {classes.map((cls) => (
                        <option key={cls._id} value={cls._id}>
                          {cls.name} ({cls.section})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Subject select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Subject</label>
                  <div className="relative">
                    <FaBook className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                    <select
                      name="subjectId"
                      value={form.subjectId}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl pl-10 pr-3 py-3 text-xs text-slate-700 font-bold outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
                    >
                      <option value="" disabled>Select Subject</option>
                      {subjects.map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Exam Date</label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl pl-10 pr-3 py-3 text-xs text-slate-700 font-bold outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 bg-gradient-to-r from-teal-500 to-indigo-600 hover:opacity-90 active:scale-[0.99] text-white py-3 rounded-xl text-xs font-bold shadow-md shadow-teal-500/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <FaPlus className="text-[10px]" />
                      Add Exam
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Exams Table Panel (Right 3 cols) */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-800">All Scheduled Exams</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {exams.length} exam{exams.length !== 1 ? "s" : ""} total in history
                </p>
              </div>
              <span className="text-[10px] font-extrabold bg-teal-50 border border-teal-100 text-teal-600 px-3 py-1 rounded-full select-none">
                Academic Year 2026
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
                <p className="text-slate-400 text-xs font-medium">Loading scheduled exams...</p>
              </div>
            ) : exams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 text-lg shadow-sm">
                  <FaCalendarCheck />
                </div>
                <div>
                  <p className="text-slate-800 font-bold text-sm">No Exams Scheduled</p>
                  <p className="text-slate-400 text-xs font-medium mt-0.5">Use the scheduling panel to add new exams.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-sm text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 uppercase tracking-widest text-[9px] font-bold border-b border-slate-100">
                      <th className="px-5 py-4">Class</th>
                      <th className="px-5 py-4">Subject</th>
                      <th className="px-5 py-4">Date</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60">
                    {exams.map((e) => {
                      const isUpcoming = new Date(e.date) >= new Date();
                      return (
                        <tr key={e._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center bg-indigo-50 text-indigo-700 font-bold text-[10px] px-2.5 py-1 rounded-md border border-indigo-100">
                              {e.class?.name} {e.class?.section ? `(${e.class.section})` : ""}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-xs font-semibold text-slate-800">{e.subject?.name || "—"}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-slate-500 text-xs font-medium whitespace-nowrap">
                              {new Date(e.date).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              isUpcoming 
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                : "bg-slate-100 text-slate-400 border-slate-200/60"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isUpcoming ? "bg-emerald-500" : "bg-slate-400"}`} />
                              {isUpcoming ? "Upcoming" : "Past"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <button
                              onClick={() => deleteExam(e._id)}
                              className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              <FaTrash className="text-[9px]" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="px-6 py-4 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
                Upcoming exams remain active · Completed logs are preserved
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ExamSchedule;