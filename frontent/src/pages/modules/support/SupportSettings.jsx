import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaCog, FaBell, FaVolumeUp, FaMoon, FaShieldAlt, FaSpinner, FaCheck, FaExclamationCircle } from "react-icons/fa";
import API_URL from "../../../config/api";

export default function SupportSettings() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [dndMode, setDndMode] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchSettings = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) {
        setEmailAlerts(res.data.emailNotifications !== false);
        setSmsAlerts(!!res.data.smsNotifications);
        setPushAlerts(res.data.pushNotifications !== false);
        setDndMode(!!res.data.dndMode);
      }
    } catch (err) {
      console.error("Error loading support settings:", err.message);
      setError(err.response?.data?.message || "Failed to load support settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setSaving(true);
      setError("");
      setSuccessMsg("");

      await axios.put(`${API_URL}/api/auth/profile`, {
        emailNotifications: emailAlerts,
        smsNotifications: smsAlerts,
        pushNotifications: pushAlerts,
        dndMode: dndMode
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccessMsg("Support settings saved successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save support settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
          Support Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure real-time notification alerts, push settings, and Do Not Disturb preferences.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 max-w-2xl">
          <FaExclamationCircle className="text-sm shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 max-w-2xl">
          <FaCheck className="text-sm shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-3xl p-12 text-center text-slate-400 font-bold text-xs flex flex-col items-center justify-center gap-3 max-w-2xl">
          <FaSpinner className="text-2xl animate-spin text-purple-500" />
          <span>Loading support settings...</span>
        </div>
      ) : (
        <form onSubmit={handleSaveSettings} className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-6 max-w-2xl">
          
          {/* Toggles */}
          <div className="space-y-4 text-xs">
            
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#121B2E] rounded-2xl border border-slate-200 dark:border-white/5">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white">Email Notifications</h4>
                <p className="text-[11px] text-slate-400">Receive email alerts when a new ticket is assigned or updated.</p>
              </div>
              <input 
                type="checkbox" 
                checked={emailAlerts} 
                onChange={(e) => setEmailAlerts(e.target.checked)} 
                className="w-5 h-5 rounded text-purple-600 focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#121B2E] rounded-2xl border border-slate-200 dark:border-white/5">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white">Push & In-App Desktop Alerts</h4>
                <p className="text-[11px] text-slate-400">Receive real-time desktop popups when incoming chat messages or call requests arrive.</p>
              </div>
              <input 
                type="checkbox" 
                checked={pushAlerts} 
                onChange={(e) => setPushAlerts(e.target.checked)} 
                className="w-5 h-5 rounded text-purple-600 focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#121B2E] rounded-2xl border border-slate-200 dark:border-white/5">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white">SMS Critical Alerts</h4>
                <p className="text-[11px] text-slate-400">Send urgent SMS alerts for high-priority escalated tickets.</p>
              </div>
              <input 
                type="checkbox" 
                checked={smsAlerts} 
                onChange={(e) => setSmsAlerts(e.target.checked)} 
                className="w-5 h-5 rounded text-purple-600 focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#121B2E] rounded-2xl border border-slate-200 dark:border-white/5">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white">Do Not Disturb (DND Mode)</h4>
                <p className="text-[11px] text-slate-400">Pause non-urgent sound and popup notifications during off-duty hours.</p>
              </div>
              <input 
                type="checkbox" 
                checked={dndMode} 
                onChange={(e) => setDndMode(e.target.checked)} 
                className="w-5 h-5 rounded text-purple-600 focus:ring-0 cursor-pointer"
              />
            </div>

          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-white/5">
            <button 
              type="submit"
              disabled={saving}
              className="py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer transition flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <FaSpinner className="animate-spin" /> : "Save Settings"}
            </button>
          </div>

        </form>
      )}
    </div>
  );
}
