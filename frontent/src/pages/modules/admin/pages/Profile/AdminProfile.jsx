import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUserCircle,
  FaEnvelope,
  FaUserShield,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";

function AdminProfile() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [admin, setAdmin] = useState({ name: "", email: "", role: "" });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    axios
      .get(`${API}/api/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.success) setAdmin(res.data.admin);
      })
      .catch(console.log);
  };

  const handleChange = (e) =>
    setAdmin({ ...admin, [e.target.name]: e.target.value });

  const handleSave = () => {
    axios
      .put(
        `${API}/api/admin/profile/update`,
        { name: admin.name, email: admin.email },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setEditMode(false);
        fetchProfile();
      })
      .catch(console.log);
  };

  const initials = admin.name
    ? admin.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "A";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 sm:p-6">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');

        .profile-card { font-family: 'Sora', sans-serif; }

        .glass {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .avatar-ring {
          background: conic-gradient(from 0deg, #6366f1, #a855f7, #ec4899, #6366f1);
          animation: spin 4s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .field-box {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          transition: border-color 0.2s, background 0.2s;
        }
        .field-box:hover { border-color: rgba(99,102,241,0.4); }

        .modern-input {
          background: rgba(255,255,255,0.07);
          border: 1.5px solid rgba(99,102,241,0.5);
          color: white;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .modern-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }
        .modern-input::placeholder { color: rgba(255,255,255,0.3); }

        .btn-save {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(99,102,241,0.35);
        }
        .btn-save:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(99,102,241,0.5); }
        .btn-save:active { transform: translateY(0); }

        .btn-edit {
          background: transparent;
          border: 1.5px solid rgba(99,102,241,0.6);
          color: #a5b4fc;
          transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.15s;
        }
        .btn-edit:hover {
          background: rgba(99,102,241,0.15);
          border-color: #6366f1;
          color: white;
          transform: translateY(-1px);
        }

        .btn-cancel {
          background: transparent;
          border: 1.5px solid rgba(239,68,68,0.4);
          color: #fca5a5;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
        }
        .btn-cancel:hover {
          background: rgba(239,68,68,0.1);
          border-color: #ef4444;
          color: white;
        }

        .badge {
          background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2));
          border: 1px solid rgba(168,85,247,0.3);
        }

        .dot-pattern {
          background-image: radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>

      <div className="profile-card w-full max-w-sm sm:max-w-md">

        {/* Header label */}
        <div className="flex items-center gap-2 mb-5">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
          <span className="text-xs font-semibold tracking-widest text-indigo-400 uppercase">
            Admin Console
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
        </div>

        {/* Main card */}
        <div className="glass rounded-2xl overflow-hidden dot-pattern">

          {/* Top gradient bar */}
          <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          <div className="p-6 sm:p-8">

            {/* Avatar section */}
            <div className="flex flex-col items-center mb-8">

              {/* Spinning ring + avatar */}
              <div className="relative mb-4">
                <div className="avatar-ring w-24 h-24 rounded-full flex items-center justify-center">
                  <div className="w-[88px] h-[88px] rounded-full bg-slate-900 flex items-center justify-center text-2xl font-bold text-white z-10">
                    {initials}
                  </div>
                </div>
                {/* Online dot */}
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-900 shadow-lg" />
              </div>

              <h2 className="text-white font-semibold text-lg sm:text-xl tracking-tight">
                {admin.name || "Admin"}
              </h2>

              <span className="badge mt-2 px-3 py-0.5 rounded-full text-xs font-medium text-purple-300 tracking-wide">
                {admin.role || "Administrator"}
              </span>

            </div>

            {/* Fields */}
            <div className="space-y-3 mb-6">

              {/* Name */}
              <div className="field-box rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <FaUserCircle className="text-indigo-400 text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 mb-0.5 font-medium tracking-wide uppercase">
                    Full Name
                  </p>
                  {editMode ? (
                    <input
                      type="text"
                      name="name"
                      value={admin.name}
                      onChange={handleChange}
                      placeholder="Enter name"
                      className="modern-input w-full rounded-lg px-3 py-1.5 text-sm"
                    />
                  ) : (
                    <p className="text-white text-sm font-medium truncate">
                      {admin.name || "—"}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="field-box rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <FaEnvelope className="text-emerald-400 text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 mb-0.5 font-medium tracking-wide uppercase">
                    Email Address
                  </p>
                  {editMode ? (
                    <input
                      type="email"
                      name="email"
                      value={admin.email}
                      onChange={handleChange}
                      placeholder="Enter email"
                      className="modern-input w-full rounded-lg px-3 py-1.5 text-sm"
                    />
                  ) : (
                    <p className="text-white text-sm font-medium truncate">
                      {admin.email || "—"}
                    </p>
                  )}
                </div>
              </div>

              {/* Role (read-only) */}
              <div className="field-box rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <FaUserShield className="text-purple-400 text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 mb-0.5 font-medium tracking-wide uppercase">
                    Role
                  </p>
                  <p className="text-white text-sm font-medium truncate">
                    {admin.role || "—"}
                  </p>
                </div>
                <span className="text-xs text-slate-600 flex-shrink-0 italic">
                  read‑only
                </span>
              </div>

            </div>

            {/* Action buttons */}
            {editMode ? (
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="btn-save flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <FaSave className="text-xs" />
                  Save Changes
                </button>
                <button
                  onClick={() => { setEditMode(false); fetchProfile(); }}
                  className="btn-cancel px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <FaTimes className="text-xs" />
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="btn-edit w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              >
                <FaEdit className="text-xs" />
                Edit Profile
              </button>
            )}

          </div>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-slate-600 mt-4">
          Changes are saved to your account instantly
        </p>

      </div>
    </div>
  );
}

export default AdminProfile;