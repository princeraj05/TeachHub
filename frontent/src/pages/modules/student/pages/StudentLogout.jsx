import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FaSignOutAlt, 
  FaShieldAlt, 
  FaClock, 
  FaListUl, 
  FaTimes, 
  FaArrowLeft 
} from "react-icons/fa";
import { useTheme } from "../../../../context/ThemeContext";
import { performLogout } from "../../../../utils/logout";
import API_URL from "../../../../config/api";

const SORA = "'Sora', sans-serif";

function StudentLogout() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const API = API_URL;
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);

  const handleConfirmLogout = async () => {
    setLoading(true);
    try {
      await performLogout(navigate);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: SORA }} className="space-y-6 max-w-xl mx-auto">
      
      {/* Top Header Row */}
      <div className="flex items-center gap-3 select-none">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 rounded-full bg-white dark:bg-[#0B132A] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-350 hover:border-slate-355 dark:hover:border-white/15 flex items-center justify-center transition-all cursor-pointer"
        >
          <FaArrowLeft className="text-xs" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Logout
          </h1>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7C3AED] dark:text-[#38BDF8] mt-0.5">
            TeachHub
          </p>
        </div>
      </div>

      {/* Main Illustration & Text Segment */}
      <div className="flex flex-col items-center text-center select-none py-4">
        
        {/* Large violet logout icon bubble */}
        <div className="w-24 h-24 rounded-full bg-violet-600/10 text-violet-500 flex items-center justify-center shadow-lg shadow-violet-600/5 relative mb-6">
          <FaSignOutAlt className="text-4xl text-[#7C3AED] dark:text-[#A78BFA]" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Logout from TeachHub?
        </h2>
        <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold max-w-sm mt-2 leading-relaxed">
          You will be logged out from your account and need to login again to access your dashboard.
        </p>
      </div>

      {/* Info Card block */}
      <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/[0.08] rounded-3xl p-6 space-y-4 shadow-sm select-none">
        <h3 className="text-xs font-black text-[#7C3AED] dark:text-[#A78BFA] uppercase tracking-wider">
          What happens when you logout?
        </h3>

        <div className="space-y-4 pt-1">
          {/* Bullet 1 */}
          <div className="flex gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center shrink-0">
              <FaShieldAlt className="text-sm" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-805 dark:text-white leading-snug">Your account will be secure</h4>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold mt-0.5">Your data and privacy will remain protected.</p>
            </div>
          </div>

          {/* Bullet 2 */}
          <div className="flex gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center shrink-0">
              <FaClock className="text-sm" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-805 dark:text-white leading-snug">You can login anytime</h4>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold mt-0.5">Login again with your credentials to continue.</p>
            </div>
          </div>

          {/* Bullet 3 */}
          <div className="flex gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center shrink-0">
              <FaListUl className="text-sm" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-805 dark:text-white leading-snug">Your app data will be saved</h4>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold mt-0.5">All your data will be available after login.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Decision CTAs */}
      <div className="space-y-3 pt-2">
        <button
          onClick={handleConfirmLogout}
          disabled={loading}
          className="w-full bg-[#EF4444] hover:bg-[#DC2626] text-white py-3.5 rounded-2xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-red-500/10"
        >
          <FaSignOutAlt />
          {loading ? "Logging out..." : "Yes, Logout"}
        </button>

        <button
          onClick={() => navigate(-1)}
          disabled={loading}
          className="w-full bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 py-3.5 rounded-2xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2"
        >
          <FaTimes className="text-xs" />
          Cancel
        </button>
      </div>

    </div>
  );
}

export default StudentLogout;
