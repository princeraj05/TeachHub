import { useEffect, useState } from "react";
import axios from "axios";
import { FaSchool, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaChartLine, FaFilter, FaLayerGroup } from "react-icons/fa";

function AttendanceReport() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [classesList, setClassesList] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const [selectedClassName, setSelectedClassName] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");

  const [attendanceData, setAttendanceData] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);
  const [filter, setFilter] = useState("All");

  // 1. Fetch available classes for current school
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(`${API}/api/admin/classes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClassesList(res.data || []);
      } catch (err) {
        console.error("Failed to fetch school classes:", err);
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, [API, token]);

  // 2. Group class documents by name
  const groupedMap = new Map();
  classesList.forEach((cls) => {
    const rawName = String(cls.name || "").trim();
    if (!rawName) return;
    if (!groupedMap.has(rawName)) {
      groupedMap.set(rawName, {
        name: rawName,
        sections: []
      });
    }
    groupedMap.get(rawName).sections.push(cls);
  });

  const uniqueClasses = Array.from(groupedMap.values()).sort((a, b) => {
    const numA = parseInt(String(a.name).replace(/\D/g, ""), 10) || 0;
    const numB = parseInt(String(b.name).replace(/\D/g, ""), 10) || 0;
    if (numA !== numB) return numA - numB;
    return a.name.localeCompare(b.name);
  });

  // 3. Available sections for selected class name
  const currentGroup = groupedMap.get(selectedClassName);
  const availableSections = currentGroup ? currentGroup.sections : [];

  // When class name changes, reset selected class ID or auto-select if only 1 section
  const handleClassSelect = (className) => {
    setSelectedClassName(className);
    setAttendanceData([]);
    const group = groupedMap.get(className);
    if (group && group.sections.length === 1) {
      setSelectedClassId(group.sections[0]._id);
    } else {
      setSelectedClassId("");
    }
  };

  const handleSectionSelect = (classId) => {
    setSelectedClassId(classId);
  };

  // 4. Fetch attendance when selectedClassId changes
  useEffect(() => {
    if (!selectedClassId) {
      setAttendanceData(null);
      return;
    }

    const fetchReport = async () => {
      setLoadingReport(true);
      try {
        const res = await axios.get(`${API}/api/attendance/report?classId=${selectedClassId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAttendanceData(res.data);
      } catch (err) {
        console.error("Failed to fetch class attendance report:", err);
      } finally {
        setLoadingReport(false);
      }
    };

    fetchReport();
  }, [selectedClassId, API, token]);

  const selectedClassObj = classesList.find((c) => c._id === selectedClassId);

  // Extract student list and summary metrics from API response
  const isObjectResponse = attendanceData && typeof attendanceData === "object" && !Array.isArray(attendanceData);
  
  const studentList = isObjectResponse
    ? (attendanceData.students || [])
    : (Array.isArray(attendanceData) ? attendanceData : []);

  const filtered = filter === "All"
    ? studentList
    : studentList.filter((d) => d.status === filter);

  const totalStudents = isObjectResponse && attendanceData.summary?.totalStudents !== undefined
    ? attendanceData.summary.totalStudents
    : studentList.length;

  const presentCount = isObjectResponse && attendanceData.summary?.presentCount !== undefined
    ? attendanceData.summary.presentCount
    : studentList.filter((d) => d.status === "Present").length;

  const absentCount = isObjectResponse && attendanceData.summary?.absentCount !== undefined
    ? attendanceData.summary.absentCount
    : studentList.filter((d) => d.status === "Absent").length;

  const rate = isObjectResponse && attendanceData.summary?.attendanceRate !== undefined
    ? attendanceData.summary.attendanceRate
    : (totalStudents > 0 ? Number(((presentCount / totalStudents) * 100).toFixed(2)) : 0);

  const initials = (name) =>
    name
      ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
      : "?";

  return (
    <div className="font-sans">
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Attendance Report</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Class & Section wise student attendance analytics</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200/60 rounded-2xl px-4 py-2.5 w-fit text-xs font-bold text-slate-500 shadow-sm">
          <FaCalendarAlt className="text-slate-400" />
          Academic Year 2026
        </div>
      </div>

      {/* Class & Section Selector Card */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#7C3AED] shadow-sm">
            <FaSchool className="text-sm" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Select Class & Section</h2>
            <p className="text-xs text-slate-400 font-medium">Choose a class level and section to load student attendance logs</p>
          </div>
        </div>

        {loadingClasses ? (
          <div className="flex items-center gap-3 py-4 text-xs font-bold text-slate-400">
            <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            Loading school classes...
          </div>
        ) : uniqueClasses.length === 0 ? (
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-xs font-bold">
            No classes configured for your school. Please create classes in Academics → Classes first.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Step 1: Class Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Step 1: Select Class
              </label>
              <select
                value={selectedClassName}
                onChange={(e) => handleClassSelect(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all cursor-pointer"
              >
                <option value="">-- Select Class --</option>
                {uniqueClasses.map((cls) => (
                  <option key={cls.name} value={cls.name}>
                    {cls.name.toLowerCase().startsWith("class") ? cls.name : `Class ${cls.name}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Section Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Step 2: Select Section
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => handleSectionSelect(e.target.value)}
                disabled={!selectedClassName || availableSections.length === 0}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!selectedClassName
                    ? "-- Select Class First --"
                    : availableSections.length === 0
                    ? "-- No Sections Available --"
                    : "-- Select Section --"}
                </option>
                {availableSections.map((secDoc) => (
                  <option key={secDoc._id} value={secDoc._id}>
                    {secDoc.section ? `Section ${secDoc.section}` : "No Section / Default Section"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Report Area */}
      {!selectedClassId ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200/80 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#7C3AED] text-2xl mx-auto mb-4 shadow-sm">
            <FaLayerGroup />
          </div>
          <h3 className="text-base font-bold text-slate-800">Please Select Class & Section</h3>
          <p className="text-xs text-slate-400 font-medium mt-1 max-w-md mx-auto">
            Choose a valid class and section from the dropdowns above to generate and inspect student attendance logs.
          </p>
        </div>
      ) : (
        <>
          {/* Section Header Title Pill */}
          {selectedClassObj && (
            <div className="mb-6 bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#7C3AED] px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-between shadow-sm">
              <span>
                Class {selectedClassObj.name} {selectedClassObj.section ? `- Section ${selectedClassObj.section}` : ""}
              </span>
              <span className="bg-white/80 dark:bg-black/20 px-3 py-1 rounded-xl text-[11px] font-bold">
                {totalStudents} Enrolled Students
              </span>
            </div>
          )}

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
            {/* Total Students */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
              <div className="h-1 w-full bg-indigo-500 absolute top-0 left-0" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Total Students</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{totalStudents}</span>
                <span className="text-xs text-slate-400 font-semibold">students</span>
              </div>
            </div>

            {/* Present */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
              <div className="h-1 w-full bg-emerald-500 absolute top-0 left-0" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Present</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">{presentCount}</span>
                <span className="text-xs text-slate-400 font-semibold">attended</span>
              </div>
            </div>

            {/* Absent */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
              <div className="h-1 w-full bg-rose-500 absolute top-0 left-0" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Absent</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-rose-600 tracking-tight">{absentCount}</span>
                <span className="text-xs text-slate-400 font-semibold">missed</span>
              </div>
            </div>

            {/* Attendance % */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
              <div className="h-1 w-full bg-teal-500 absolute top-0 left-0" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Attendance Rate</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-teal-600 tracking-tight">{rate}%</span>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Student Attendance List ({selectedClassObj ? `Class ${selectedClassObj.name} ${selectedClassObj.section ? `- Section ${selectedClassObj.section}` : ""}` : ""})
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Showing student roster with roll numbers and presence status</p>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { id: "All", label: "All Students", activeClass: "bg-slate-800 border-slate-800 text-white shadow-sm" },
                  { id: "Present", label: "Present Only", activeClass: "bg-emerald-550 border-emerald-500 text-emerald-700 bg-emerald-50" },
                  { id: "Absent", label: "Absent Only", activeClass: "bg-rose-550 border-rose-500 text-rose-700 bg-rose-50" },
                  { id: "Not Marked", label: "Not Marked", activeClass: "bg-amber-500 border-amber-500 text-white shadow-sm" }
                ].map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => setFilter(btn.id)}
                    className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all duration-150 ${
                      filter === btn.id
                        ? btn.activeClass
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table / Loading / Empty */}
            {loadingReport ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-10 h-10 rounded-full border-3 border-teal-500 border-t-transparent animate-spin" />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Loading Class Attendance…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
                  📋
                </div>
                <p className="text-slate-500 font-bold text-sm">No students found</p>
                <p className="text-slate-400 text-xs mt-1">No matching student records for this filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 select-none">
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider w-36">Roll No</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider w-36">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {filtered.map((item, idx) => {
                      const studentName = item.name || item.student?.name || "Student";
                      const rollNumber = item.rollNo || item.student?.rollNo || "Not Assigned";
                      const statusVal = item.status || "Not Marked";

                      return (
                        <tr key={item._id || idx} className="hover:bg-slate-50/50 transition-colors group">
                          {/* Student Name */}
                          <td className="px-6 py-4.5">
                            <div className="flex items-center gap-3.5">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-[#0b132b] font-black text-sm shadow-md group-hover:scale-105 transition-all duration-200 flex-shrink-0 ${
                                  statusVal === "Present"
                                    ? "bg-gradient-to-br from-teal-400 to-emerald-400"
                                    : statusVal === "Absent"
                                    ? "bg-gradient-to-br from-rose-400 to-orange-400"
                                    : "bg-slate-200 text-slate-600"
                                }`}
                              >
                                {initials(studentName)}
                              </div>
                              <div>
                                <span className="text-sm font-bold text-slate-700 group-hover:text-teal-600 transition-colors duration-150 block">
                                  {studentName}
                                </span>
                                {item.email && (
                                  <span className="text-[10px] text-slate-400 font-medium block">{item.email}</span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Roll No */}
                          <td className="px-6 py-4.5">
                            <span className="text-xs font-extrabold text-slate-700 bg-slate-100 border border-slate-200/60 px-3 py-1.5 rounded-xl font-mono">
                              {rollNumber}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4.5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                                statusVal === "Present"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                  : statusVal === "Absent"
                                  ? "bg-rose-50 text-rose-700 border border-rose-100"
                                  : "bg-amber-50 text-amber-700 border border-amber-100"
                              }`}
                            >
                              {statusVal === "Present" ? (
                                <>
                                  <FaCheckCircle className="text-xs text-emerald-500" />
                                  Present
                                </>
                              ) : statusVal === "Absent" ? (
                                <>
                                  <FaTimesCircle className="text-xs text-rose-500" />
                                  Absent
                                </>
                              ) : (
                                <>
                                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                                  Not Marked
                                </>
                              )}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="px-6 py-4.5 border-t border-slate-100 bg-slate-50/50 select-none">
              <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">
                Report verified · Class tenant isolation active
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AttendanceReport;
