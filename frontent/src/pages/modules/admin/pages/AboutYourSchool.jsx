import { useEffect, useState } from "react";
import axios from "axios";
import { FaSchool, FaSave, FaCheckCircle, FaUser, FaInfoCircle, FaCog } from "react-icons/fa";

const SORA = "'Sora', sans-serif";

const AVAILABLE_TYPES = ["Play School", "Primary", "Secondary", "Higher Secondary", "Other"];

function AboutYourSchool() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Form states
  const [principalName, setPrincipalName] = useState("");
  const [totalTeachers, setTotalTeachers] = useState("");
  const [totalStudents, setTotalStudents] = useState("");
  const [totalClasses, setTotalClasses] = useState("");
  const [availableClasses, setAvailableClasses] = useState("");
  const [schoolTypes, setSchoolTypes] = useState([]);
  const [admissionExam, setAdmissionExam] = useState("null"); // "true" | "false" | "null"
  const [directAdmission, setDirectAdmission] = useState("null"); // "true" | "false" | "null"
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchMySchool();
  }, []);

  const fetchMySchool = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API}/api/schools/my-school`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;
      if (data) {
        setSchool(data);
        setPrincipalName(data.principalName || "");
        setTotalTeachers(data.totalTeachers !== null ? data.totalTeachers.toString() : "");
        setTotalStudents(data.totalStudents !== null ? data.totalStudents.toString() : "");
        setTotalClasses(data.totalClasses !== null ? data.totalClasses.toString() : "");
        setAvailableClasses(data.availableClasses || "");
        setSchoolTypes(data.schoolTypes || []);
        
        if (data.admissionExam === true) setAdmissionExam("true");
        else if (data.admissionExam === false) setAdmissionExam("false");
        else setAdmissionExam("null");

        if (data.directAdmission === true) setDirectAdmission("true");
        else if (data.directAdmission === false) setDirectAdmission("false");
        else setDirectAdmission("null");

        setDescription(data.description || "");
      }
    } catch (err) {
      console.error("Error loading my school info:", err);
      setError(err.response?.data?.message || "Failed to load assigned school information.");
    } finally {
      setLoading(false);
    }
  };

  const handleTypeCheckbox = (type) => {
    if (schoolTypes.includes(type)) {
      setSchoolTypes(schoolTypes.filter((t) => t !== type));
    } else {
      setSchoolTypes([...schoolTypes, type]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!school) return;

    setSaving(true);
    setSuccess("");
    setError("");

    try {
      const payload = {
        principalName,
        totalTeachers: totalTeachers !== "" ? parseInt(totalTeachers, 10) : null,
        totalStudents: totalStudents !== "" ? parseInt(totalStudents, 10) : null,
        totalClasses: totalClasses !== "" ? parseInt(totalClasses, 10) : null,
        availableClasses,
        schoolTypes,
        admissionExam: admissionExam === "true" ? true : admissionExam === "false" ? false : null,
        directAdmission: directAdmission === "true" ? true : directAdmission === "false" ? false : null,
        description
      };

      await axios.put(`${API}/api/schools/my-school`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess("School details saved successfully!");
      setTimeout(() => setSuccess(""), 4000);
      fetchMySchool();
    } catch (err) {
      console.error("Error saving school details:", err);
      setError(err.response?.data?.message || "Failed to save school details.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Loading your school workspace...</p>
      </div>
    );
  }

  if (error && !school) {
    return (
      <div className="max-w-md mx-auto py-12 px-6 bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 rounded-3xl text-center shadow-xl">
        <FaSchool className="text-5xl text-rose-500 mx-auto mb-4" />
        <h3 className="text-lg font-black text-slate-800 dark:text-white">Workspace Loading Failed</h3>
        <p className="text-xs text-rose-500 mt-2 font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: SORA }} className="w-full max-w-4xl mx-auto space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#7C3AED] dark:text-[#38BDF8] mb-1">Workspace Settings</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            About Your School
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Manage public details, statistics, and class availability for {school?.name || "your school"}.
          </p>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-150 text-emerald-700 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm animate-fadeIn">
          <FaCheckCircle className="text-emerald-500 text-lg shrink-0" />
          {success}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-150 text-rose-700 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm animate-fadeIn">
          <FaInfoCircle className="text-rose-500 text-lg shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 rounded-3xl p-6 shadow-md space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
            <FaSchool className="text-[#7C3AED] dark:text-[#38BDF8] text-sm" />
            <h3 className="text-xs font-black uppercase text-slate-455 tracking-wider">Basic Information</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                School Name
              </label>
              <input
                type="text"
                disabled
                value={school?.name || ""}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 rounded-xl text-xs text-slate-500 dark:text-slate-400 font-bold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                Principal Name
              </label>
              <input
                type="text"
                placeholder="Enter Principal's Name (e.g. Banny Thapar)"
                value={principalName}
                onChange={(e) => setPrincipalName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-white placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED] transition-all font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 rounded-3xl p-6 shadow-md space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
            <FaCog className="text-[#7C3AED] dark:text-[#38BDF8] text-sm" />
            <h3 className="text-xs font-black uppercase text-slate-455 tracking-wider">School Statistics</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                Total Teachers
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 50"
                value={totalTeachers}
                onChange={(e) => setTotalTeachers(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-white placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                Total Students
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 1000"
                value={totalStudents}
                onChange={(e) => setTotalStudents(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-white placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                Total Classes
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 30"
                value={totalClasses}
                onChange={(e) => setTotalClasses(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-white placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                Available Classes
              </label>
              <input
                type="text"
                placeholder="e.g. Class 1 to Class 12"
                value={availableClasses}
                onChange={(e) => setAvailableClasses(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-white placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED] font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Categories Checklist */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 rounded-3xl p-6 shadow-md space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
            <FaSchool className="text-[#7C3AED] dark:text-[#38BDF8] text-sm" />
            <h3 className="text-xs font-black uppercase text-slate-455 tracking-wider">School Types / Categories</h3>
          </div>

          <div>
            <span className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
              Select all categories that apply to this center
            </span>
            <div className="flex flex-wrap gap-4">
              {AVAILABLE_TYPES.map((type) => {
                const isChecked = schoolTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeCheckbox(type)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                      isChecked
                        ? "border-[#7C3AED] bg-[#7C3AED]/5 text-[#7C3AED] dark:border-[#38BDF8] dark:bg-[#38BDF8]/5 dark:text-[#38BDF8] font-bold"
                        : "border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] text-slate-500 dark:text-slate-400 hover:bg-slate-100/50"
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[8px] ${
                      isChecked ? "bg-[#7C3AED] dark:bg-[#38BDF8] border-none text-white dark:text-slate-900 font-extrabold" : "border-slate-300 bg-white dark:bg-[#1E293B]"
                    }`}>
                      {isChecked && "✓"}
                    </span>
                    <span className="text-xs font-semibold">{type}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Admission Options */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 rounded-3xl p-6 shadow-md space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
            <FaInfoCircle className="text-[#7C3AED] dark:text-[#38BDF8] text-sm" />
            <h3 className="text-xs font-black uppercase text-slate-455 tracking-wider">Admission Requirements</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                Interest / Entrance Exam
              </label>
              <select
                value={admissionExam}
                onChange={(e) => setAdmissionExam(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED] cursor-pointer font-semibold"
              >
                <option value="null">Not Configured (Hidden)</option>
                <option value="true">Yes (Exam Required)</option>
                <option value="false">No (Direct/Syllabus Join)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                Direct Admission
              </label>
              <select
                value={directAdmission}
                onChange={(e) => setDirectAdmission(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED] cursor-pointer font-semibold"
              >
                <option value="null">Not Configured (Hidden)</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
        </div>

        {/* School Description */}
        <div className="bg-white dark:bg-[#0B132A] border border-slate-200/60 dark:border-white/10 rounded-3xl p-6 shadow-md space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
            <FaInfoCircle className="text-[#7C3AED] dark:text-[#38BDF8] text-sm" />
            <h3 className="text-xs font-black uppercase text-slate-455 tracking-wider">General Information Description</h3>
          </div>

          <div>
            <textarea
              rows="5"
              placeholder="Provide a detailed description of the school, history, facilities, admissions timeline..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-white placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED] leading-relaxed font-semibold"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto bg-gradient-to-r from-[#7C3AED] to-[#312E81] hover:opacity-90 active:scale-[0.99] text-white px-8 py-3.5 rounded-2xl text-xs font-bold shadow-md shadow-[#7C3AED]/15 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-extrabold uppercase tracking-wide"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <FaSave /> Save Changes
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default AboutYourSchool;
