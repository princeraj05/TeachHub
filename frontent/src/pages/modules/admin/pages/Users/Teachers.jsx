import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaChalkboardTeacher,
  FaEnvelope,
  FaSearch,
  FaUserCircle,
} from "react-icons/fa";

function Teachers() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");

  const fetchTeachers = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/teachers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const filtered = teachers.filter(
    (t) =>
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase())
  );

  const avatarColors = [
    "bg-teal-500",
    "bg-emerald-500",
    "bg-cyan-500",
    "bg-sky-500",
    "bg-indigo-500",
    "bg-violet-500",
  ];

  return (
    <div style={{ fontFamily: "'Sora', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');`}</style>

      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Teachers</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            All registered teachers in TeachHub
          </p>
        </div>

        {/* Stats pill */}
        <div className="flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-2xl px-4 py-2.5 w-fit">
          <FaChalkboardTeacher className="text-teal-500 text-lg" />
          <span className="text-sm font-bold text-teal-700">
            {teachers.length} Teachers
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6 max-w-sm">
        <FaSearch className="absolute top-1/2 -translate-y-1/2 left-3.5 text-slate-400 text-sm" />
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent shadow-sm transition"
        />
      </div>

      {/* Teachers Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center shadow-sm">
          <FaUserCircle className="text-slate-300 text-5xl mx-auto mb-3" />
          <p className="text-slate-400 font-semibold text-sm">No teachers found</p>
          <p className="text-slate-300 text-xs mt-1">Try a different search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((teacher, i) => (
            <div
              key={teacher._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
            >
              {/* Card top accent */}
              <div className="h-1.5 w-full bg-gradient-to-r from-teal-400 to-emerald-400" />

              <div className="p-5">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div
                    className={`w-12 h-12 rounded-xl ${
                      avatarColors[i % avatarColors.length]
                    } flex items-center justify-center text-white font-extrabold text-lg shadow-md flex-shrink-0`}
                  >
                    {teacher.name?.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-base truncate">
                      {teacher.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <FaEnvelope className="text-slate-400 text-xs flex-shrink-0" />
                      <p className="text-xs text-slate-500 truncate">
                        {teacher.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Role badge */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1 rounded-full">
                    <FaChalkboardTeacher className="text-xs" />
                    Teacher
                  </span>
                  <span className="text-xs text-slate-400">
                    #{String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Teachers;