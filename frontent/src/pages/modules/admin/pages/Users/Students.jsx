import { useEffect, useState } from "react";
import axiosInstance from "axios";
import { FaUserGraduate, FaEnvelope, FaSearch, FaUsers, FaTrash, FaUserPlus, FaHashtag } from "react-icons/fa";

function Students() {
  const API = import.meta.env.VITE_API_URL;
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState("");
  const [newStudent, setNewStudent] = useState({ name: "", email: "", phoneNumber: "", classId: "", rollNo: "" });
  const [adding, setAdding] = useState(false);
  const [addMessage, setAddMessage] = useState("");

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.get(`${API}/api/admin/users/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.get(`${API}/api/admin/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, [API]);

  // Helper to calculate next available roll number for a class
  const getNextAvailableRollNo = (targetClassId) => {
    if (!targetClassId) return 1;
    const classStudents = students.filter(
      (s) => (s.classId?._id || s.classId) === targetClassId
    );
    const takenRolls = classStudents.map((s) => s.rollNo).filter(Boolean);
    let next = 1;
    while (takenRolls.includes(next)) {
      next++;
    }
    return next;
  };

  // When class changes in Add Student form, pre-suggest next available roll number
  const handleClassChange = (selectedClassId) => {
    const autoRoll = selectedClassId ? getNextAvailableRollNo(selectedClassId) : "";
    setNewStudent((prev) => ({
      ...prev,
      classId: selectedClassId,
      rollNo: autoRoll ? String(autoRoll) : ""
    }));
  };

  const handleAssignClass = async (studentId, classId) => {
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.post(
        `${API}/api/admin/assign/assign-student-class`,
        { studentId, classId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchStudents();
      alert("Class assigned successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign class");
    }
  };

  const handleUpdateRollNo = async (studentId, rollNo) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.put(
        `${API}/api/admin/users/students/${studentId}/rollno`,
        { rollNo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudents((current) =>
        current.map((s) => (s._id === studentId ? res.data.student : s))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update Roll Number");
      fetchStudents(); // Refresh to revert invalid input
    }
  };

  const handleAddStudent = async (event) => {
    event.preventDefault();
    setAdding(true);
    setAddMessage("");
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.post(`${API}/api/admin/users/students`, newStudent, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents((current) => {
        const withoutExisting = current.filter((student) => student._id !== response.data.student._id);
        return [response.data.student, ...withoutExisting];
      });
      setNewStudent({ name: "", email: "", phoneNumber: "", classId: "", rollNo: "" });
      setAddMessage(response.data.message || "Student added successfully.");
    } catch (error) {
      setAddMessage(error.response?.data?.message || "Could not add student.");
    } finally {
      setAdding(false);
    }
  };

  const filtered = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      String(s.rollNo || "").includes(search)
  );

  const handleDeleteStudent = (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete student ${name}? This will remove all their records from the database.`)) {
      const token = localStorage.getItem("token");
      axiosInstance
        .delete(`${API}/api/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(() => {
          alert(`${name} has been successfully deleted.`);
          setStudents(prev => prev.filter(s => s._id !== id));
        })
        .catch((err) => {
          alert(err.response?.data?.message || "Failed to delete student");
        });
    }
  };

  const avatarColors = [
    "from-cyan-500 to-teal-500",
    "from-teal-500 to-emerald-500",
    "from-emerald-500 to-emerald-600",
    "from-sky-500 to-cyan-500",
    "from-indigo-500 to-blue-500",
    "from-violet-500 to-indigo-500",
  ];

  return (
    <div className="font-sans">
      {/* ── Page Header ── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Students</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">View and manage all registered students and roll numbers inside TeachHub</p>
        </div>
        <div className="flex items-center gap-2 bg-teal-50/50 border border-teal-100 rounded-2xl px-4 py-2.5 w-fit shadow-sm">
          <FaUsers className="text-teal-600" />
          <span className="text-xs font-bold text-teal-700">{students.length} Registered Students</span>
        </div>
      </div>

      {/* ── Add Student Form ── */}
      <form onSubmit={handleAddStudent} className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-teal-100 bg-teal-50/40 p-4 sm:grid-cols-2 lg:grid-cols-6 items-start">
        <input required value={newStudent.name} onChange={(event) => setNewStudent({ ...newStudent, name: event.target.value })} placeholder="Student name" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" />
        <input required type="email" value={newStudent.email} onChange={(event) => setNewStudent({ ...newStudent, email: event.target.value })} placeholder="Email address" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" />
        <input value={newStudent.phoneNumber} onChange={(event) => setNewStudent({ ...newStudent, phoneNumber: event.target.value })} placeholder="Mobile number (optional)" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" />
        
        <select value={newStudent.classId} onChange={(event) => handleClassChange(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
          <option value="">Assign class later</option>
          {classes.map((classItem) => <option key={classItem._id} value={classItem._id}>{classItem.name} {classItem.section}</option>)}
        </select>

        <div>
          <input
            type="number"
            min="1"
            value={newStudent.rollNo}
            onChange={(event) => setNewStudent({ ...newStudent, rollNo: event.target.value })}
            placeholder={newStudent.classId ? `Roll No (e.g. ${getNextAvailableRollNo(newStudent.classId)})` : "Roll No"}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold"
          />
          {newStudent.classId && (
            <span className="text-[10px] text-teal-700 font-extrabold mt-1 block">
              💡 Suggested Roll No: {getNextAvailableRollNo(newStudent.classId)}
            </span>
          )}
        </div>

        <button disabled={adding} className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60 cursor-pointer"><FaUserPlus />{adding ? "Adding…" : "Add Student"}</button>
        
        {addMessage && <p className="sm:col-span-2 lg:col-span-6 text-xs font-extrabold text-teal-700 bg-teal-100/50 p-2.5 rounded-xl border border-teal-200">{addMessage}</p>}
      </form>

      {/* ── Search Toolbar ── */}
      <div className="relative mb-6 max-w-md">
        <FaSearch className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 text-sm pointer-events-none" />
        <input
          type="text"
          placeholder="Search by name, email, or roll no…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/80 rounded-2xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-sm transition-all duration-200"
        />
      </div>

      {/* ── Mobile Cards ── */}
      <div className="sm:hidden space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/60 py-16 text-center shadow-sm">
            <FaUserGraduate className="text-slate-200 text-5xl mx-auto mb-4" />
            <p className="text-slate-500 font-bold text-sm">No students found</p>
            <p className="text-slate-400 text-xs mt-1">Try a different query or register a new user.</p>
          </div>
        ) : (
          filtered.map((s, i) => (
            <div
              key={s._id}
              className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 flex flex-col gap-3 hover-lift relative overflow-hidden"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-[#0b132b] font-black text-base shadow-md flex-shrink-0`}>
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-slate-800 text-sm truncate">{s.name}</p>
                    <span className="bg-purple-100 text-purple-700 font-black text-[10px] px-2 py-0.5 rounded-md border border-purple-200">
                      Roll #{s.rollNo || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <FaEnvelope className="text-slate-400 text-xs flex-shrink-0" />
                    <p className="text-xs text-slate-500 truncate font-medium">{s.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteStudent(s._id, s.name)}
                  className="text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 p-1.5 rounded-lg transition shrink-0 cursor-pointer"
                  title="Delete Student"
                >
                  <FaTrash className="text-xs" />
                </button>
              </div>

              {/* Class & Roll No Editable bar */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400">Roll:</span>
                <input
                  type="number"
                  min="1"
                  defaultValue={s.rollNo || ""}
                  onBlur={(e) => {
                    if (e.target.value !== String(s.rollNo || "")) {
                      handleUpdateRollNo(s._id, e.target.value);
                    }
                  }}
                  className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-extrabold text-purple-700 text-center"
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Desktop: Table ── */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {/* Table header bar */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">All Students</h2>
          <span className="text-xs font-bold bg-teal-50 border border-teal-100 text-teal-600 px-3 py-1.5 rounded-full">
            Showing {filtered.length} of {students.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 select-none">
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider w-12">#</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider w-24">Roll No</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email Address</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Parent Contacts</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Class & Section</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider w-32">System Role</th>
                <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-20 text-center">
                    <FaUserGraduate className="text-slate-200 text-5xl mx-auto mb-4" />
                    <p className="text-slate-500 text-sm font-bold">No students found</p>
                    <p className="text-slate-400 text-xs mt-1">Try searching for a different user.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((s, i) => (
                  <tr key={s._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4.5 text-xs text-slate-400 font-bold">{i + 1}</td>
                    
                    {/* Editable Roll No */}
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-black text-slate-400">#</span>
                        <input
                          type="number"
                          min="1"
                          defaultValue={s.rollNo || ""}
                          onBlur={(e) => {
                            if (e.target.value !== String(s.rollNo || "")) {
                              handleUpdateRollNo(s._id, e.target.value);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.target.blur();
                            }
                          }}
                          placeholder="Ex: 1"
                          className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-center"
                          title="Click to change roll number"
                        />
                      </div>
                    </td>

                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-[#0b132b] font-black text-sm shadow-md group-hover:scale-105 transition-all duration-200 flex-shrink-0`}>
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-teal-600 transition-colors duration-150">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <FaEnvelope className="text-slate-400 text-xs flex-shrink-0" />
                        <span className="text-sm">{s.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 text-xs text-slate-500">
                      <div>Father: {s.fatherMobileNumber || "—"}</div>
                      <div>Mother: {s.motherMobileNumber || "—"}</div>
                    </td>
                    <td className="px-6 py-4.5">
                      <select
                        value={s.classId?._id || ""}
                        onChange={(e) => handleAssignClass(s._id, e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer transition-all duration-150"
                      >
                        <option value="">Select Class & Section</option>
                        {classes.map((cls) => (
                          <option key={cls._id} value={cls._id}>
                            Class {cls.name} — Section {cls.section}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-full border border-teal-100">
                        <FaUserGraduate className="text-xs" />
                        Student
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-center">
                      <button
                        onClick={() => handleDeleteStudent(s._id, s.name)}
                        className="bg-rose-50 hover:bg-rose-600 hover:text-white p-2 rounded-xl text-rose-600 transition duration-150 inline-flex items-center justify-center cursor-pointer"
                        title="Delete Student"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Students;
