import { useNavigate } from "react-router-dom";
import { FaGraduationCap, FaClock, FaSignOutAlt } from "react-icons/fa";

const SORA = "'Sora', sans-serif";

function PendingApproval() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#090F1C] p-6 font-sans" style={{ fontFamily: SORA }}>
      <div className="max-w-md w-full bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-xl p-8 text-center relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#7C3AED]/10 blur-[50px] pointer-events-none" />
        
        {/* Logo */}
        <div className="inline-flex items-center gap-2.5 mb-8 bg-slate-100 border border-slate-200/50 px-4 py-2 rounded-xl shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#38BDF8] flex items-center justify-center shadow-md">
            <FaGraduationCap className="text-white text-base" />
          </div>
          <span className="text-base font-black text-slate-800 tracking-tight">
            TeachHub
          </span>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 mx-auto mb-6 shadow-sm">
          <FaClock className="text-3xl animate-pulse" />
        </div>

        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
          Wait Kro, School Assign Ho Raha Hai
        </h2>
        
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          Your login was successful! Please wait until the Super Admin assigns your school and system role. You will be able to access your dashboard as soon as the assignment is completed.
        </p>

        <button
          onClick={handleLogout}
          className="w-full py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-[0.98] text-rose-500 font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <FaSignOutAlt className="text-sm" />
          Logout from Account
        </button>
      </div>
    </div>
  );
}

export default PendingApproval;
