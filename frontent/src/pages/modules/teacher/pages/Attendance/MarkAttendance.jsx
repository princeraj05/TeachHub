import { useEffect, useState } from "react";
import axios from "axios";
import { FaClipboardList, FaUserGraduate, FaCalendarAlt, FaSave, FaCheck, FaTimes } from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function MarkAttendance() {
  const API = import.meta.env.VITE_API_URL;

  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyMarked, setAlreadyMarked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Fetch students
        const studentsRes = await axios.get(`${API}/api/teacher/my-students`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const unique = [];
        const seen = new Set();
        for (const s of studentsRes.data) {
          if (!seen.has(s._id)) {
            seen.add(s._id);
            unique.push(s);
          }
        }
        setStudents(unique);

        // Fetch today's attendance records
        const todayRes = await axios.get(`${API}/api/attendance/today`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (todayRes.data && todayRes.data.length > 0) {
          const initialAttendance = {};
          todayRes.data.forEach((record) => {
            initialAttendance[record.student] = record.status;
          });
          setAttendance(initialAttendance);
          setAlreadyMarked(true);
        }

        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [API]);

  const handleChange = (studentId, status) => {
    if (alreadyMarked) return;
    setAttendance({
      ...attendance,
      [studentId]: status,
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      for (const studentId in attendance) {
        const student = students.find((s) => s._id === studentId);
        await axios.post(
          `${API}/api/attendance/mark`,
          {
            student: studentId,
            classId: student.class,
            status: attendance[studentId],
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      alert("Attendance saved successfully");
      setAlreadyMarked(true);
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Error saving attendance");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ fontFamily: SORA }}>
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-1">Attendance</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Mark Session Attendance
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Evaluate and register daily course presence checksheets</p>
        </div>
        <div className="flex items-center gap-2.5 bg-slate-100 border border-slate-200/60 rounded-2xl px-4 py-2.5 w-fit text-xs font-bold text-slate-500 select-none shadow-sm">
          <FaCalendarAlt className="text-slate-400" />
          Academic Year 2026
        </div>
      </div>

      {/* Main Form Area */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between mb-6">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Attendance Sheet</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {students.length} student{students.length !== 1 ? "s" : ""} on roster list
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 px-3.5 py-1.5 rounded-xl">
            <FaClipboardList className="text-[10px]" />
            Active
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
            <p className="text-slate-400 text-xs font-medium">Loading roster list...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 text-lg shadow-sm mx-auto">
              <FaUserGraduate />
            </div>
            <div>
              <p className="text-slate-800 font-bold text-sm">No Roster Students Assigned</p>
              <p className="text-slate-400 text-xs font-medium mt-0.5">Contact the school administration to assign classes.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 uppercase tracking-widest text-[9px] font-bold border-b border-slate-100">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4 text-center">Set Present</th>
                  <th className="px-6 py-4 text-center">Set Absent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {students.map((s) => {
                  const initials = s.name
                    ? s.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "S";
                  return (
                    <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shadow-md shadow-indigo-500/10 shrink-0 select-none">
                            {initials}
                          </div>
                          <span className="font-bold text-slate-800 text-xs">{s.name}</span>
                        </div>
                      </td>
                      
                      {/* Present Selector Pill */}
                      <td className="px-6 py-4 text-center">
                        <label className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                          alreadyMarked ? "cursor-not-allowed opacity-75" : "cursor-pointer"
                        } ${
                          attendance[s._id] === "Present"
                            ? "bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm shadow-emerald-500/10"
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200/60 text-slate-400 hover:text-slate-500"
                        }`}>
                          <input
                            type="radio"
                            name={s._id}
                            checked={attendance[s._id] === "Present"}
                            onChange={() => handleChange(s._id, "Present")}
                            disabled={alreadyMarked}
                            className="sr-only"
                          />
                          <FaCheck className="text-[9px]" />
                          Present
                        </label>
                      </td>
                      
                      {/* Absent Selector Pill */}
                      <td className="px-6 py-4 text-center">
                        <label className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                          alreadyMarked ? "cursor-not-allowed opacity-75" : "cursor-pointer"
                        } ${
                          attendance[s._id] === "Absent"
                            ? "bg-rose-50 border-rose-500 text-rose-600 shadow-sm shadow-rose-500/10"
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200/60 text-slate-400 hover:text-slate-500"
                        }`}>
                          <input
                            type="radio"
                            name={s._id}
                            checked={attendance[s._id] === "Absent"}
                            onChange={() => handleChange(s._id, "Absent")}
                            disabled={alreadyMarked}
                            className="sr-only"
                          />
                          <FaTimes className="text-[9px]" />
                          Absent
                        </label>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-4 border-t border-slate-100 text-center">
          {alreadyMarked ? (
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wide">
              Attendance has been successfully locked for today
            </p>
          ) : (
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
              Ensure all records are correct prior to committing ledger changes
            </p>
          )}
        </div>
      </div>

      {/* Save Button */}
      {students.length > 0 && (
        <button
          onClick={handleSubmit}
          disabled={submitting || alreadyMarked}
          className="bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white px-5 py-3 rounded-xl text-xs font-bold shadow-md shadow-slate-900/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Saving...
            </>
          ) : alreadyMarked ? (
            <>
              <FaCheck className="text-xs" />
              Attendance Already Submitted Today
            </>
          ) : (
            <>
              <FaSave className="text-xs" />
              Save Attendance Ledger
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default MarkAttendance;