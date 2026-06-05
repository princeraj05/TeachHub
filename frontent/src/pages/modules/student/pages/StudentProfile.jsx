import { useEffect, useState } from "react";
import axios from "axios";
import { FaUserGraduate, FaEnvelope, FaUserTag, FaIdBadge } from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function StudentProfile() {
  const API = import.meta.env.VITE_API_URL;
  const [student, setStudent] = useState({ name: "", email: "", role: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${API}/api/student/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStudent(res.data))
      .catch((err) => console.log("Profile Error:", err));
  }, [API]);

  const initials = student.name ? student.name.charAt(0).toUpperCase() : "S";

  const fields = [
    {
      icon: <FaUserGraduate />,
      label: "Full Name",
      value: student.name || "—",
      iconBg: "bg-teal-50 border-teal-100/80",
      iconColor: "text-teal-600",
    },
    {
      icon: <FaEnvelope />,
      label: "Email Address",
      value: student.email || "—",
      iconBg: "bg-emerald-50 border-emerald-100/80",
      iconColor: "text-emerald-600",
    },
    {
      icon: <FaUserTag />,
      label: "Account Role",
      value: null,
      badge: student.role,
      iconBg: "bg-indigo-50 border-indigo-100/80",
      iconColor: "text-indigo-600",
    },
  ];

  return (
    <div style={{ fontFamily: SORA }}>
      {/* Page Header */}
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-1">Account</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
          My Profile
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Your personal registration account information details</p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Profile Card Header */}
        <div className="bg-[#0B132B] rounded-2xl overflow-hidden shadow-lg shadow-slate-900/10 mb-6 relative">
          {/* Subtle mesh background grid pattern */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(#e2e8f0 1px,transparent 1px),linear-gradient(90deg,#e2e8f0 1px,transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          {/* Accent glowing blobs */}
          <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-36 h-36 rounded-full bg-emerald-400/5 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center gap-5 px-6 py-8">
            {/* Avatar block */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-extrabold shadow-lg shadow-teal-500/20">
                {initials}
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#0B132B]" />
            </div>

            <div>
              <p className="text-[10px] font-extrabold text-teal-400 tracking-widest uppercase mb-1">
                Student Account
              </p>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                {student.name || "Loading…"}
              </h2>
              <p className="text-slate-400 text-xs mt-1.5 font-medium">{student.email}</p>
            </div>

            {/* Badge right side */}
            <div className="ml-auto hidden sm:flex">
              <span className="flex items-center gap-1.5 bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-bold px-4 py-2 rounded-xl">
                <FaIdBadge className="text-[10px]" />
                {student.role || "Student"}
              </span>
            </div>
          </div>
        </div>

        {/* Info card details */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
              Account Details
            </h3>
          </div>

          <div className="divide-y divide-slate-100/60">
            {fields.map(({ icon, label, value, badge, iconBg, iconColor }, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${iconBg} shadow-inner`}>
                  <span className={`text-sm ${iconColor}`}>{icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
                  {badge ? (
                    <span className="inline-flex items-center px-3 py-0.5 bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold rounded-full capitalize tracking-wide">
                      {badge}
                    </span>
                  ) : (
                    <p className="text-slate-800 font-bold text-xs truncate mt-0.5">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;