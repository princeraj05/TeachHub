import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaSchool, FaUser, FaClock, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function SchoolDirectory() {
  const navigate = useNavigate();
  const location = useLocation();
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [schools, setSchools] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [requestedRole, setRequestedRole] = useState("student");
  const [submitting, setSubmitting] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentNotes, setAppointmentNotes] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schoolsRes, profileRes, appointmentsRes] = await Promise.all([
        axios.get(`${API}/api/schools`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/api/auth/profile`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/api/appointments`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setSchools(schoolsRes.data || []);
      setUser(profileRes.data);
      setAppointments(appointmentsRes.data || []);
    } catch (err) {
      console.error("Error loading school directory:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedSchoolDetails = schools.find((school) => school.name === selectedSchool);

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (!user) return;

    const hasActiveRequest = ["pending", "scheduled", "exam_completed"].includes(user.requestStatus) || user.requestedSchool;
    if (hasActiveRequest) {
      alert("You already have an active or pending join request.");
      return;
    }

    if (requestedRole === "teacher" && selectedSchoolDetails?.teacherAppointmentBooking && (!appointmentDate || !appointmentTime)) {
      alert("Choose an appointment date and time to continue.");
      return;
    }

    setSubmitting(true);
    const bookingRequest = requestedRole === "teacher" && selectedSchoolDetails?.teacherAppointmentBooking
      ? axios.post(`${API}/api/appointments`, { schoolName: selectedSchool, date: appointmentDate, time: appointmentTime, notes: appointmentNotes }, { headers: { Authorization: `Bearer ${token}` } })
      : Promise.resolve();
    bookingRequest
      .then(() => axios.put(
        `${API}/api/auth/join-request`,
        { schoolName: selectedSchool, role: requestedRole },
        { headers: { Authorization: `Bearer ${token}` } }
      ))
      .then((res) => {
        setUser((prev) => ({
          ...prev,
          requestedSchool: selectedSchool,
          requestedRole: requestedRole,
          requestStatus: "pending"
        }));
        setShowJoinModal(false);
        // Refresh profile state
        fetchData();
      })
      .catch((err) => {
        alert(err.response?.data?.message || "Failed to submit request");
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const handleViewDetails = (schoolName) => {
    const basePath = location.pathname.startsWith("/pending") ? "/pending" : "/student";
    navigate(`${basePath}/schools/${encodeURIComponent(schoolName)}`);
  };

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Syncing school directory...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: SORA }} className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-xl transition-all duration-200">
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED] dark:text-[#38BDF8] mb-1">Directory</p>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Available Schools
        </h2>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Explore centers and submit a request to join</p>
      </div>

      {schools.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {schools.map((school) => {
            const hasActiveRequest = user && (["pending", "scheduled", "exam_completed"].includes(user.requestStatus) || user.requestedSchool);
            const isThisApplied = user && user.requestedSchool === school.name;
            const isApprovedHere = user && user.schoolName === school.name;

            return (
              <div key={school._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/40 dark:border-white/[0.04] rounded-2xl hover:bg-slate-100/50 dark:hover:bg-white/[0.05] transition duration-150 shadow-sm gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-650 dark:text-teal-400 shrink-0 border border-teal-200/40">
                    <FaSchool className="text-xl" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-slate-800 dark:text-white truncate">{school.name}</h4>
                    {school.principalName && (
                      <p className="text-xs text-slate-400 dark:text-slate-550 font-semibold mt-1 flex items-center gap-1.5">
                        <FaUser className="text-[10px]" /> Principal: {school.principalName}
                      </p>
                    )}
                    <span className="inline-block text-[9px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mt-1.5">
                      Active Center
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => handleViewDetails(school.name)}
                    className="text-[10px] font-black uppercase tracking-wider bg-slate-200 hover:bg-slate-300 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl transition duration-150 cursor-pointer"
                  >
                    View Details
                  </button>

                  {isApprovedHere ? (
                    <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 px-3 py-2 rounded-xl">
                      Joined
                    </span>
                  ) : isThisApplied ? (
                    <span className={`text-[9px] font-black uppercase tracking-wider px-3 py-2 rounded-xl border ${
                      user.requestStatus === "scheduled"
                        ? "bg-teal-500/15 text-teal-600 border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-450"
                        : user.requestStatus === "exam_completed"
                          ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-450"
                          : "bg-amber-500/15 text-amber-500 border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-450"
                    }`}>
                      {user.requestStatus === "scheduled" 
                        ? "Exam Scheduled" 
                        : user.requestStatus === "exam_completed" 
                          ? "Exam Completed" 
                          : "Pending Approval"}
                    </span>
                  ) : hasActiveRequest ? (
                    <button
                      disabled
                      className="opacity-40 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 px-4 py-2.5 rounded-xl cursor-not-allowed"
                    >
                      Apply
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedSchool(school.name);
                        setAppointmentDate(""); setAppointmentTime(""); setAppointmentNotes(""); setShowJoinModal(true);
                      }}
                      className="text-[10px] font-black uppercase tracking-wider bg-[#7C3AED] hover:bg-[#6D28D9] dark:bg-[#38BDF8] dark:hover:bg-[#0EA5E9] text-white dark:text-[#090F1C] px-4 py-2.5 rounded-xl shadow-sm transition duration-150 cursor-pointer"
                    >
                      Join School
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50/50 dark:bg-white/[0.01] border border-slate-150 dark:border-white/5 rounded-3xl">
          <FaSchool className="text-slate-300 dark:text-slate-700 text-5xl mx-auto mb-4" />
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold italic">No schools registered in system.</p>
        </div>
      )}

      {appointments.length > 0 && <div className="mt-8 border-t border-slate-200 pt-6"><h3 className="text-sm font-black text-slate-800 dark:text-white">My Teacher Appointments</h3><div className="mt-3 space-y-2">{appointments.map((appointment) => <div className="rounded-xl border bg-slate-50 dark:bg-white/[0.02] p-3 text-xs dark:text-white" key={appointment._id}><b>{appointment.schoolName}</b> · {new Date(appointment.date).toLocaleDateString()} at {appointment.time} · {appointment.mode} <span className="ml-2 font-bold text-violet-700">{appointment.status}</span></div>)}</div></div>}

      {/* Join Request Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowJoinModal(false)} />
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/60 dark:border-white/10 w-full max-w-md p-6 relative z-10 shadow-2xl transition-all duration-200 text-left">
            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#7C3AED]/10 dark:bg-[#38BDF8]/10 flex items-center justify-center text-[#7C3AED] dark:text-[#38BDF8] mb-4">
                <FaSchool className="text-2xl" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Apply to Join</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Submit request to join {selectedSchool}</p>
            </div>

            <form onSubmit={handleJoinSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Select Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRequestedRole("student")}
                    className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition cursor-pointer ${
                      requestedRole === "student"
                        ? "border-[#7C3AED] bg-[#7C3AED]/5 text-[#7C3AED] dark:border-[#38BDF8] dark:bg-[#38BDF8]/5 dark:text-[#38BDF8] font-bold"
                        : "border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <span className="text-xl">🎓</span>
                    <span className="text-xs font-black">Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestedRole("teacher")}
                    className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition cursor-pointer ${
                      requestedRole === "teacher"
                        ? "border-[#7C3AED] bg-[#7C3AED]/5 text-[#7C3AED] dark:border-[#38BDF8] dark:bg-[#38BDF8]/5 dark:text-[#38BDF8] font-bold"
                        : "border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <span className="text-xl">💼</span>
                    <span className="text-xs font-black">Teacher</span>
                  </button>
                </div>
              </div>

              {requestedRole === "teacher" && selectedSchoolDetails?.teacherAppointmentBooking && <div className="space-y-3 rounded-2xl border border-violet-200 bg-violet-50/60 p-4"><div><p className="text-sm font-black text-violet-900">Book Appointment</p><p className="text-xs text-violet-700 mt-1">Mode: {selectedSchoolDetails.appointmentMode || "Offline"}{selectedSchoolDetails.appointmentDetails ? ` · ${selectedSchoolDetails.appointmentDetails}` : ""}</p></div><div className="grid grid-cols-2 gap-3"><input required type="date" min={new Date().toISOString().slice(0, 10)} value={appointmentDate} onChange={(event) => setAppointmentDate(event.target.value)} className="rounded-xl border p-3 text-xs" /><input required type="time" value={appointmentTime} onChange={(event) => setAppointmentTime(event.target.value)} className="rounded-xl border p-3 text-xs" /></div><textarea value={appointmentNotes} onChange={(event) => setAppointmentNotes(event.target.value)} maxLength="1000" placeholder="Notes (optional)" className="w-full rounded-xl border p-3 text-xs" /></div>}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-[#7C3AED] to-[#312E81] hover:opacity-90 active:scale-[0.99] text-white py-3.5 rounded-2xl text-xs font-bold shadow-md shadow-[#7C3AED]/15 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Sending..." : requestedRole === "teacher" && selectedSchoolDetails?.teacherAppointmentBooking ? "Book Appointment & Submit" : "Submit Request"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 px-5 py-3.5 rounded-2xl text-xs font-bold border border-slate-200/60 dark:border-white/10 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SchoolDirectory;
