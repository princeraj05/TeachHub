import { useEffect, useState } from "react";
import axios from "axios";
import { FaSchool, FaUserGraduate, FaCalendarAlt } from "react-icons/fa";

const CARD_ACCENTS = [
  { bg: "bg-indigo-50/50", border: "border-indigo-100/80", icon: "text-indigo-600", iconBg: "bg-indigo-100/50", dot: "bg-indigo-500" },
  { bg: "bg-teal-50/50", border: "border-teal-100/80", icon: "text-teal-600", iconBg: "bg-teal-100/50", dot: "bg-teal-500" },
  { bg: "bg-cyan-50/50", border: "border-cyan-100/80", icon: "text-cyan-600", iconBg: "bg-cyan-100/50", dot: "bg-cyan-500" },
];

const SORA = "'Sora', sans-serif";

function MyClasses() {
  const API = import.meta.env.VITE_API_URL;
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/teacher/my-classes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setClasses(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchClasses();
  }, [API]);

  return (
    <div style={{ fontFamily: SORA }}>
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-1">Academics</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            My Assigned Classes
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">List of course classes assigned under your instruction</p>
        </div>
        <div className="flex items-center gap-2.5 bg-slate-100 border border-slate-200/60 rounded-2xl px-4 py-2.5 w-fit text-xs font-bold text-slate-500 select-none shadow-sm">
          <FaCalendarAlt className="text-slate-400" />
          Academic Year 2026
        </div>
      </div>

      {/* Classes Card Grid */}
      {classes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 text-lg shadow-sm mx-auto mb-3">
            <FaSchool />
          </div>
          <p className="text-slate-800 font-bold text-sm">No Assigned Classes</p>
          <p className="text-slate-400 text-xs font-medium mt-0.5">Please check with school administrator panel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((c, i) => {
            const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
            return (
              <div
                key={c._id}
                className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between"
              >
                {/* Decorative blob in corner */}
                <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-20 blur-xl ${accent.dot}`} />

                <div className="flex items-start gap-4">
                  {/* Icon Panel */}
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${accent.iconBg} ${accent.border} shadow-inner`}>
                    <FaSchool className={`text-base ${accent.icon}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-slate-800 text-sm leading-tight truncate group-hover:text-teal-600 transition-colors">
                      Class {c.name}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">Section {c.section || "—"}</p>
                  </div>
                </div>

                {/* Footer status / count pill */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px]">
                    <FaUserGraduate className="text-slate-400 text-xs shrink-0" />
                    <span>{c.students?.length || 0} Student{c.students?.length !== 1 ? "s" : ""} enrolled</span>
                  </div>
                  <span className="inline-flex items-center text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyClasses;