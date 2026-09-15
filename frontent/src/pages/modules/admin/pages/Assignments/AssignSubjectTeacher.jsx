import { useEffect, useState } from "react";
import axios from "axios";
import { FaBook, FaChalkboardTeacher, FaCheckCircle } from "react-icons/fa";
import API_URL from "../../../../../config/api";

function AssignSubjectTeacher() {
  const API = API_URL;
  const token = localStorage.getItem("token");

  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => { fetchSubjects(); fetchTeachers(); }, []);

  const fetchSubjects = async () => {
    const res = await axios.get(`${API}/api/admin/subjects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSubjects(res.data);
  };

  const fetchTeachers = async () => {
    const res = await axios.get(`${API}/api/admin/users/teachers`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTeachers(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `${API}/api/admin/assign/assign-subject-teacher`,
        { subjectId, teacherId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setSubjectId("");
      setTeacherId("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Assignment failed");
    } finally {
      setLoading(false);
    }
  };

  const selectedSubject = subjects.find((s) => s._id === subjectId);
  const selectedTeacher = teachers.find((t) => t._id === teacherId);

  return (
    <div className="font-sans">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Assign Subject</h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Assign an academic course subject to a teaching instructor</p>
      </div>

      <div className="max-w-xl">
        {/* Success banner */}
        {success && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-150 text-emerald-700 rounded-2xl px-5 py-4 mb-6 text-sm font-bold shadow-sm animate-fadeIn">
            <FaCheckCircle className="text-emerald-500 text-lg flex-shrink-0" />
            Subject assigned successfully!
          </div>
        )}

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 to-indigo-500" />

          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3.5 mb-7">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <FaBook className="text-white text-base" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Assign Subject to Teacher</h2>
                <p className="text-xs text-slate-400 font-medium">Select a subject level and target teacher profile</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Select Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Course Subject
                </label>
                <div className="relative">
                  <FaBook className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 text-sm pointer-events-none" />
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    required
                    className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white shadow-sm appearance-none cursor-pointer transition-all duration-200"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} {s.class ? `— Class ${s.class.name} (${s.class.section})` : ""}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              {/* Select Teacher */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Teacher Instructor
                </label>
                <div className="relative">
                  <FaChalkboardTeacher className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 text-sm pointer-events-none" />
                  <select
                    value={teacherId}
                    onChange={(e) => setTeacherId(e.target.value)}
                    required
                    className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white shadow-sm appearance-none cursor-pointer transition-all duration-200"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((t) => (
                      <option key={t._id} value={t._id}>{t.name} ({t.email})</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              {/* Live preview */}
              {selectedSubject && selectedTeacher && (
                <div className="flex items-center flex-wrap gap-2.5 bg-teal-50/50 border border-teal-100 rounded-xl p-4 animate-fadeIn">
                  <span className="inline-flex items-center gap-1.5 bg-white border border-teal-150 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm">
                    <FaBook className="text-xs text-teal-500" />
                    {selectedSubject.name}
                  </span>
                  <span className="text-slate-400 text-xs font-bold">to</span>
                  <span className="inline-flex items-center gap-1.5 bg-white border border-emerald-150 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm">
                    <FaChalkboardTeacher className="text-xs text-emerald-500" />
                    {selectedTeacher.name}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 active:scale-[0.98] text-white py-3.5 rounded-xl text-sm font-bold shadow-md shadow-teal-600/10 hover:shadow-teal-500/20 transition-all disabled:opacity-60 mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Assign Subject"
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-[11px] text-slate-400/80 mt-4 text-center font-medium">
          A teacher can be assigned multiple course subjects. Existing teaching mappings are preserved.
        </p>
      </div>
    </div>
  );
}

export default AssignSubjectTeacher;
