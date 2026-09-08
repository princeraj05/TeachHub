import { useEffect, useState } from "react";
import axios from "axios";
import { FaUserGraduate, FaSchool, FaLayerGroup, FaCheckCircle } from "react-icons/fa";

function AssignStudentClass() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClassName, setSelectedClassName] = useState("");
  const [classId, setClassId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/users/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const uniqueClassNames = Array.from(new Set(classes.map((c) => c.name))).sort((a, b) => {
    const numA = parseInt(String(a).replace(/\D/g, ""), 10) || 0;
    const numB = parseInt(String(b).replace(/\D/g, ""), 10) || 0;
    return numA - numB;
  });

  const matchingClasses = classes.filter((c) => c.name === selectedClassName);

  const handleClassLevelChange = (cName) => {
    setSelectedClassName(cName);
    const matching = classes.filter((c) => c.name === cName);
    if (matching.length === 1) {
      setClassId(matching[0]._id);
    } else {
      setClassId("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!classId) {
      alert("Please select a class and section");
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `${API}/api/admin/assign/assign-student-class`,
        { classId, studentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setSelectedClassName("");
      setClassId("");
      setStudentId("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Assignment failed");
    } finally {
      setLoading(false);
    }
  };

  const selectedClass = classes.find((c) => c._id === classId);
  const selectedStudent = students.find((s) => s._id === studentId);

  return (
    <div className="font-sans">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Assign Student</h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Map a student to a class and section group</p>
      </div>

      <div className="max-w-xl">
        {/* Success banner */}
        {success && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-150 text-emerald-700 rounded-2xl px-5 py-4 mb-6 text-sm font-bold shadow-sm animate-fadeIn">
            <FaCheckCircle className="text-emerald-500 text-lg flex-shrink-0" />
            Student assigned successfully!
          </div>
        )}

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 to-emerald-500" />

          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3.5 mb-7">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <FaUserGraduate className="text-white text-base" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Assign Student to Class</h2>
                <p className="text-xs text-slate-400 font-medium">Select class level, section, and matching student profile</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Step 1: Select Class Level */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  1. Select Class Level
                </label>
                <div className="relative">
                  <FaSchool className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 text-sm pointer-events-none" />
                  <select
                    value={selectedClassName}
                    onChange={(e) => handleClassLevelChange(e.target.value)}
                    required
                    className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white shadow-sm appearance-none cursor-pointer transition-all duration-200"
                  >
                    <option value="">Choose Class</option>
                    {uniqueClassNames.map((cName) => (
                      <option key={cName} value={cName}>
                        Class {cName}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Step 2: Select Section */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  2. Select Section
                </label>
                <div className="relative">
                  <FaLayerGroup className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 text-sm pointer-events-none" />
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    disabled={!selectedClassName}
                    required
                    className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white shadow-sm appearance-none cursor-pointer transition-all duration-200 disabled:opacity-50"
                  >
                    {!selectedClassName ? (
                      <option value="">Select Class Level First</option>
                    ) : matchingClasses.length === 1 && !matchingClasses[0].section ? (
                      <option value={matchingClasses[0]._id}>No section created for this class</option>
                    ) : (
                      <>
                        <option value="">Select Section</option>
                        {matchingClasses.map((cls) => (
                          <option key={cls._id} value={cls._id}>
                            {cls.section ? `Section ${cls.section}` : "No Section"}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Step 3: Select Student */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  3. Student Name
                </label>
                <div className="relative">
                  <FaUserGraduate className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 text-sm pointer-events-none" />
                  <select
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    required
                    className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white shadow-sm appearance-none cursor-pointer transition-all duration-200"
                  >
                    <option value="">Select Student</option>
                    {students.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.email})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Preview pill */}
              {selectedClass && selectedStudent && (
                <div className="flex items-center flex-wrap gap-2.5 bg-teal-50/50 border border-teal-100 rounded-xl p-4 animate-fadeIn">
                  <span className="inline-flex items-center gap-1.5 bg-white border border-teal-150 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm">
                    <FaSchool className="text-xs text-teal-500" />
                    Class {selectedClass.name} {selectedClass.section ? `– Section ${selectedClass.section}` : "(No Section)"}
                  </span>
                  <span className="text-slate-400 text-xs font-bold font-sans">to</span>
                  <span className="inline-flex items-center gap-1.5 bg-white border border-emerald-150 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm">
                    <FaUserGraduate className="text-xs text-emerald-500" />
                    {selectedStudent.name}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 active:scale-[0.98] text-white py-3.5 rounded-xl text-sm font-bold shadow-md shadow-teal-600/10 hover:shadow-teal-500/20 transition-all disabled:opacity-60 mt-4 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Assign Student"
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-[11px] text-slate-400/80 mt-4 text-center font-medium">
          Assigning a student will update their current classroom academic portal configuration.
        </p>
      </div>
    </div>
  );
}

export default AssignStudentClass;
