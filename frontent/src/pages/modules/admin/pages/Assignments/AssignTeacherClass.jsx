import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaSchool, FaChalkboardTeacher, FaBook, FaCheckCircle, FaEdit, FaTrashAlt, FaSearch, FaUserTie } from "react-icons/fa";
import API_URL from "../../../../../config/api";

function AssignTeacherClass() {
  const API = API_URL;
  const token = localStorage.getItem("token");

  const formRef = useRef(null);

  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignmentsList, setAssignmentsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedClassIds, setSelectedClassIds] = useState([]);
  const [teacherId, setTeacherId] = useState("");
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
    fetchSubjects();
    fetchAssignments();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(res.data);
    } catch (e) {}
  };

  const fetchTeachers = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/users/teachers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(res.data);
    } catch (e) {}
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/subjects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubjects(res.data);
    } catch (e) {}
  };

  const fetchAssignments = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/assign/teacher-assignments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignmentsList(res.data);
    } catch (e) {}
  };

  const toggleClass = (cId) => {
    if (selectedClassIds.includes(cId)) {
      setSelectedClassIds(selectedClassIds.filter(id => id !== cId));
    } else {
      setSelectedClassIds([...selectedClassIds, cId]);
    }
  };

  const selectAllClasses = () => {
    setSelectedClassIds(classes.map(c => c._id));
  };

  const clearAllClasses = () => {
    setSelectedClassIds([]);
  };

  const toggleSubject = (sId) => {
    if (selectedSubjectIds.includes(sId)) {
      setSelectedSubjectIds(selectedSubjectIds.filter(id => id !== sId));
    } else {
      setSelectedSubjectIds([...selectedSubjectIds, sId]);
    }
  };

  const selectAllSubjects = () => {
    setSelectedSubjectIds(availableSubjects.map(s => s._id));
  };

  const clearAllSubjects = () => {
    setSelectedSubjectIds([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedClassIds.length === 0) {
      alert("Please select at least one Class Room");
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `${API}/api/admin/assign/assign-teacher-class`,
        { classIds: selectedClassIds, teacherId, subjectIds: selectedSubjectIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setSelectedClassIds([]);
      setTeacherId("");
      setSelectedSubjectIds([]);
      fetchAssignments();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      alert(err.response?.data?.message || "Assignment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAssignment = (item) => {
    setTeacherId(item._id);
    setSelectedClassIds((item.classes || []).map(c => c._id));
    setSelectedSubjectIds((item.subjects || []).map(s => s._id));
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleClearTeacherAssignments = async (tId, tName) => {
    if (!window.confirm(`Are you sure you want to clear all class & subject assignments for ${tName}?`)) return;
    try {
      await axios.post(
        `${API}/api/admin/assign/unassign-teacher`,
        { teacherId: tId, clearAll: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAssignments();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to clear assignments");
    }
  };

  const selectedTeacher = teachers.find((t) => t._id === teacherId);

  // Filter available subjects for selected classes if applicable
  const availableSubjects = selectedClassIds.length > 0 ? subjects.filter(s => {
    if (!s.class && !s.classes) return true;
    const classList = Array.isArray(s.classes) ? s.classes : [s.class];
    return classList.some(item => selectedClassIds.includes(String(item?._id || item)));
  }) : subjects;

  const filteredAssignments = assignmentsList.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="font-sans space-y-10">
      {/* Page header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          Unified Teacher, Multiple Classes & Subjects Assignment
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          Assign teacher to multiple classes and multiple course subjects together, view saved details, and edit assignments
        </p>
      </div>

      <div ref={formRef} className="max-w-xl">
        {/* Success banner */}
        {success && (
          <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-2xl px-5 py-4 mb-6 text-sm font-bold shadow-sm animate-fadeIn">
            <FaCheckCircle className="text-emerald-500 text-lg flex-shrink-0" />
            Teacher, Selected Class(es) & Subject(s) assigned successfully!
          </div>
        )}

        {/* Form card */}
        <div className="bg-white dark:bg-[#0D1326] rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-500" />

          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3.5 mb-7">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <FaChalkboardTeacher className="text-white text-base" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-white">Assign / Edit Teacher Classes & Subjects</h2>
                <p className="text-xs text-slate-400 font-medium">Select teacher profile, classroom levels and course subjects</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Select Teacher */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                  Teacher Profile *
                </label>
                <div className="relative">
                  <FaChalkboardTeacher className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 text-sm pointer-events-none" />
                  <select
                    value={teacherId}
                    onChange={(e) => setTeacherId(e.target.value)}
                    required
                    className="w-full pl-11 pr-10 py-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-sm appearance-none cursor-pointer transition-all duration-200 font-bold"
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

              {/* Select Classes (Multiple) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Class Rooms (Select Multiple) *
                  </label>
                  {classes.length > 0 && (
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={selectAllClasses}
                        className="text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-slate-300 dark:text-slate-700">|</span>
                      <button
                        type="button"
                        onClick={clearAllClasses}
                        className="text-slate-400 hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {classes.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800">
                    No classes found for this school.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl">
                    {classes.map((cls) => {
                      const isSelected = selectedClassIds.includes(cls._id);
                      return (
                        <button
                          key={cls._id}
                          type="button"
                          onClick={() => toggleClass(cls._id)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all border text-left cursor-pointer ${
                            isSelected
                              ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-teal-400"
                          }`}
                        >
                          <span className="truncate pr-1">Class {cls.name}{cls.section ? ` - Sec ${cls.section}` : ""}</span>
                          {isSelected && <FaCheckCircle className="text-white text-xs flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Select Subjects (Multiple) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Course Subjects (Select Multiple)
                  </label>
                  {availableSubjects.length > 0 && (
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={selectAllSubjects}
                        className="text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-slate-300 dark:text-slate-700">|</span>
                      <button
                        type="button"
                        onClick={clearAllSubjects}
                        className="text-slate-400 hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {availableSubjects.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800">
                    No subjects found for this school/class.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl">
                    {availableSubjects.map((s) => {
                      const isSelected = selectedSubjectIds.includes(s._id);
                      return (
                        <button
                          key={s._id}
                          type="button"
                          onClick={() => toggleSubject(s._id)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all border text-left cursor-pointer ${
                            isSelected
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400"
                          }`}
                        >
                          <span className="truncate pr-1">{s.name}</span>
                          {isSelected && <FaCheckCircle className="text-white text-xs flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Live preview */}
              {(selectedClassIds.length > 0 || selectedTeacher || selectedSubjectIds.length > 0) && (
                <div className="flex flex-col gap-2 bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 rounded-xl p-4 animate-fadeIn">
                  {selectedTeacher && (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm">
                        <FaChalkboardTeacher className="text-xs text-emerald-500" />
                        {selectedTeacher.name}
                      </span>
                    </div>
                  )}

                  {selectedClassIds.length > 0 && (
                    <div className="flex items-center flex-wrap gap-1.5 pt-1">
                      <span className="text-slate-400 text-xs font-bold mr-1">➡️ Classes:</span>
                      {selectedClassIds.map(id => {
                        const cls = classes.find(c => c._id === id);
                        return cls ? (
                          <span key={id} className="inline-flex items-center gap-1 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-[11px] font-bold px-2.5 py-1 rounded-lg">
                            <FaSchool className="text-[10px] text-teal-500" />
                            Class {cls.name}{cls.section ? `-${cls.section}` : ""}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}

                  {selectedSubjectIds.length > 0 && (
                    <div className="flex items-center flex-wrap gap-1.5 pt-1">
                      <span className="text-slate-400 text-xs font-bold mr-1">➡️ Subjects:</span>
                      {selectedSubjectIds.map(id => {
                        const sub = subjects.find(s => s._id === id);
                        return sub ? (
                          <span key={id} className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold px-2.5 py-1 rounded-lg">
                            <FaBook className="text-[10px] text-indigo-500" />
                            {sub.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 active:scale-[0.98] text-white py-3.5 rounded-xl text-sm font-bold shadow-md shadow-teal-600/10 hover:shadow-teal-500/20 transition-all disabled:opacity-60 mt-4 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Save & Update Teacher Assignments"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Saved Assignments List & Management Section */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">
              Current Teacher Assignments ({assignmentsList.length})
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Overview of saved teacher assignments with quick edit & unassign controls
            </p>
          </div>

          {/* Search filter */}
          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search teacher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#0D1326] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
        </div>

        {filteredAssignments.length === 0 ? (
          <div className="bg-white dark:bg-[#0D1326] p-8 text-center rounded-2xl border border-slate-200/60 dark:border-slate-800 text-slate-400 text-xs font-semibold">
            No teacher assignments found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssignments.map((item) => (
              <div
                key={item._id}
                className="bg-white dark:bg-[#0D1326] rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Teacher header */}
                  <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white text-sm font-black shadow-sm">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-800 dark:text-white leading-tight">
                          {item.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium">{item.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditAssignment(item)}
                        title="Edit Assignment"
                        className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <FaEdit className="text-xs" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      <button
                        onClick={() => handleClearTeacherAssignments(item._id, item.name)}
                        title="Clear Assignments"
                        className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <FaTrashAlt className="text-xs" />
                        <span className="hidden sm:inline">Clear</span>
                      </button>
                    </div>
                  </div>

                  {/* Assigned Classes */}
                  <div className="mb-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1.5">
                      Assigned Classes ({item.classes?.length || 0})
                    </span>
                    {item.classes && item.classes.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {item.classes.map((cls) => (
                          <span
                            key={cls._id}
                            className="inline-flex items-center gap-1 bg-teal-50 dark:bg-teal-950/40 border border-teal-150 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-[11px] font-bold px-2.5 py-1 rounded-lg"
                          >
                            <FaSchool className="text-[10px] text-teal-500" />
                            Class {cls.name}{cls.section ? `-${cls.section}` : ""}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No classes assigned</span>
                    )}
                  </div>

                  {/* Assigned Subjects */}
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1.5">
                      Assigned Subjects ({item.subjects?.length || 0})
                    </span>
                    {item.subjects && item.subjects.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {item.subjects.map((sub) => (
                          <span
                            key={sub._id}
                            className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-150 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold px-2.5 py-1 rounded-lg"
                          >
                            <FaBook className="text-[10px] text-indigo-500" />
                            {sub.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No subjects assigned</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AssignTeacherClass;
