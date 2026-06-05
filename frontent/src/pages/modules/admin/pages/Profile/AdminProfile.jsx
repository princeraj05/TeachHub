import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUserCircle,
  FaEnvelope,
  FaUserShield,
  FaEdit,
  FaSave,
  FaTimes,
  FaUserCog,
} from "react-icons/fa";

const SORA = "'Sora', sans-serif";

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
    <div style={{ fontFamily: SORA }}>
      {/* Page Header */}
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-1">Account</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
          Admin Profile
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Manage your personal information and preferences</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
          {/* Top gradient bar */}
          <div className="h-2 w-full bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-500" />
          
          <div className="p-6 sm:p-8">
            {/* Avatar section */}
            <div className="flex flex-col items-center mb-8 text-center">
              <div className="relative mb-4">
                {/* Clean premium avatar ring */}
                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-teal-500/10">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-2xl font-extrabold text-white">
                    {initials}
                  </div>
                </div>
                {/* Active Indicator dot */}
                <span className="absolute bottom-1.5 right-1.5 w-4.5 h-4.5 bg-emerald-400 rounded-full border-4 border-white shadow-md" />
              </div>

              <h2 className="text-slate-800 font-extrabold text-lg sm:text-xl tracking-tight">
                {admin.name || "Administrator"}
              </h2>
              <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold rounded-full uppercase tracking-wider">
                <FaUserShield className="text-[10px]" />
                {admin.role || "Admin"}
              </span>
            </div>

            {/* Profile fields */}
            <div className="space-y-4 mb-8">
              {/* Full Name */}
              <div className="bg-slate-50 border border-slate-200/40 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                  <FaUserCircle className="text-base" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Full Name</p>
                  {editMode ? (
                    <input
                      type="text"
                      name="name"
                      value={admin.name}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      className="mt-1 w-full bg-white border border-slate-200 focus:border-teal-500 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-teal-500/10 transition-all"
                    />
                  ) : (
                    <p className="text-slate-800 font-bold text-sm truncate mt-0.5">{admin.name || "—"}</p>
                  )}
                </div>
              </div>

              {/* Email Address */}
              <div className="bg-slate-50 border border-slate-200/40 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 shrink-0">
                  <FaEnvelope className="text-base" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Email Address</p>
                  {editMode ? (
                    <input
                      type="email"
                      name="email"
                      value={admin.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      className="mt-1 w-full bg-white border border-slate-200 focus:border-teal-500 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-teal-500/10 transition-all"
                    />
                  ) : (
                    <p className="text-slate-800 font-bold text-sm truncate mt-0.5">{admin.email || "—"}</p>
                  )}
                </div>
              </div>

              {/* Account Role */}
              <div className="bg-slate-50 border border-slate-200/40 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <FaUserShield className="text-base" />
                </div>
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Account Role</p>
                    <p className="text-slate-800 font-bold text-sm truncate mt-0.5">{admin.role || "—"}</p>
                  </div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide bg-slate-200/50 px-2 py-0.5 rounded border border-slate-200">
                    read-only
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {editMode ? (
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-indigo-600 hover:opacity-90 active:scale-[0.99] text-white py-3 rounded-xl text-xs font-bold shadow-md shadow-teal-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <FaSave className="text-xs" />
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    fetchProfile();
                  }}
                  className="bg-slate-100 hover:bg-slate-200/80 text-slate-500 px-5 py-3 rounded-xl text-xs font-bold border border-slate-200/60 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <FaTimes className="text-xs" />
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white py-3 rounded-xl text-xs font-bold shadow-md shadow-slate-900/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <FaEdit className="text-xs" />
                Edit Account Profile
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-4">
          All modifications are saved securely to your account profile
        </p>
      </div>
    </div>
  );
}

export default AdminProfile;