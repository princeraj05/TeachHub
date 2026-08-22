import { useEffect, useState } from "react";
import axios from "axios";
import { FaLaptopCode, FaInfoCircle, FaSave, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function SuperAdminAboutApp() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [aboutDeveloper, setAboutDeveloper] = useState("");
  const [aboutApp, setAboutApp] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAboutInfo();
  }, []);

  const fetchAboutInfo = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API}/api/about-app`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) {
        setAboutDeveloper(res.data.aboutDeveloper || "");
        setAboutApp(res.data.aboutApp || "");
      }
    } catch (err) {
      console.error("Error loading about app details:", err);
      setError("Failed to fetch About App details from server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    setError("");

    try {
      await axios.put(
        `${API}/api/about-app`,
        { aboutDeveloper, aboutApp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Global system metadata updated successfully!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.error("Error saving about app details:", err);
      setError(err.response?.data?.message || "Failed to update configuration.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Loading config editor...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: SORA }} className="w-full max-w-2xl mx-auto space-y-6 text-left">
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED] dark:text-[#38BDF8] mb-1">Global Config</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          Configure TeachHub Metadata
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5 font-sans">
          Update the global About App and Developer profiles shown across student and user portals.
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-150 text-emerald-700 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm animate-fadeIn">
          <FaCheckCircle className="text-emerald-500 text-lg shrink-0" />
          {success}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-150 text-rose-700 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm animate-fadeIn">
          <FaExclamationTriangle className="text-rose-500 text-lg shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#7C3AED]/5 blur-[60px] pointer-events-none" />
        
        {/* About App Input */}
        <div className="space-y-2">
          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest flex items-center gap-1.5">
            <FaInfoCircle /> About TeachHub Application
          </label>
          <textarea
            rows="4"
            placeholder="Introduce the application console modules, target audience, utility..."
            value={aboutApp}
            onChange={(e) => setAboutApp(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-white placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED] leading-relaxed font-semibold"
          />
        </div>

        {/* Developer Info Input */}
        <div className="space-y-2 border-t border-slate-100 dark:border-white/5 pt-6">
          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest flex items-center gap-1.5">
            <FaLaptopCode /> About Developer
          </label>
          <input
            type="text"
            placeholder="Enter developer contact info, GitHub username, or name..."
            value={aboutDeveloper}
            onChange={(e) => setAboutDeveloper(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-white placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED] font-semibold"
          />
        </div>

        {/* Control Button */}
        <div className="border-t border-slate-100 dark:border-white/5 pt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-[#7C3AED] to-[#312E81] hover:opacity-90 active:scale-[0.99] text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-md shadow-[#7C3AED]/15 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 font-extrabold uppercase"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FaSave /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SuperAdminAboutApp;
