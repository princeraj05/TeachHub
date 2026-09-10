import { useState } from "react";
import { 
  FaBookOpen, 
  FaSearch, 
  FaPlus, 
  FaFilter, 
  FaLock, 
  FaSchool, 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaUserShield, 
  FaCreditCard, 
  FaCalendarCheck, 
  FaFileAlt, 
  FaWrench, 
  FaEye, 
  FaThumbsUp, 
  FaArrowRight, 
  FaQuestionCircle, 
  FaBook, 
  FaVideo, 
  FaCheckCircle 
} from "react-icons/fa";

export default function SupportHelpCenter() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { key: "login", label: "Login", count: "24 articles", desc: "Help with login, password and account issues", icon: FaLock, color: "text-blue-500 bg-blue-500/10" },
    { key: "joining", label: "School Joining", count: "18 articles", desc: "School registration and joining process", icon: FaSchool, color: "text-purple-500 bg-purple-500/10" },
    { key: "student", label: "Student", count: "26 articles", desc: "Student account, profile and academic related", icon: FaUserGraduate, color: "text-emerald-500 bg-emerald-500/10" },
    { key: "teacher", label: "Teacher", count: "20 articles", desc: "Teacher account and class management", icon: FaChalkboardTeacher, color: "text-amber-500 bg-amber-500/10" },
    { key: "admin", label: "Admin", count: "22 articles", desc: "Admin panel and management settings", icon: FaUserShield, color: "text-rose-500 bg-rose-500/10" },
    { key: "fees", label: "Fees", count: "16 articles", desc: "Fee payment and related issues", icon: FaCreditCard, color: "text-rose-400 bg-rose-500/10" },
    { key: "attendance", label: "Attendance", count: "15 articles", desc: "Attendance marking and reports", icon: FaCalendarCheck, color: "text-emerald-400 bg-emerald-500/10" },
    { key: "exams", label: "Exams", count: "18 articles", desc: "Exam setup, results and related", icon: FaFileAlt, color: "text-purple-400 bg-purple-500/10" },
    { key: "tech", label: "Technical Issues", count: "28 articles", desc: "App errors, bugs and technical support", icon: FaWrench, color: "text-blue-400 bg-blue-500/10" }
  ];

  const popularArticles = [
    { id: 1, title: "How to reset password?", category: "Login", categoryBg: "bg-blue-500/10 text-blue-400", desc: "Step by step guide to reset your TeachHub account password.", views: "2.4K", rating: "98%" },
    { id: 2, title: "How to join a school as a student?", category: "School Joining", categoryBg: "bg-purple-500/10 text-purple-400", desc: "Learn how students can join their school using the invite code.", views: "1.8K", rating: "95%" },
    { id: 3, title: "How to mark attendance?", category: "Attendance", categoryBg: "bg-emerald-500/10 text-emerald-400", desc: "Complete guide to mark and manage attendance in TeachHub.", views: "1.6K", rating: "94%" },
    { id: 4, title: "How to add a new student?", category: "Admin", categoryBg: "bg-rose-500/10 text-rose-400", desc: "Steps to add and manage students in school admin panel.", views: "1.5K", rating: "92%" },
    { id: 5, title: "Fee payment failed - what to do?", category: "Fees", categoryBg: "bg-amber-500/10 text-amber-400", desc: "Solutions for common fee payment issues.", views: "1.4K", rating: "91%" },
    { id: 6, title: "How to create an exam?", category: "Exams", categoryBg: "bg-purple-500/10 text-purple-400", desc: "Learn how to create, schedule and manage exams.", views: "1.2K", rating: "90%" },
    { id: 7, title: "App not working on Android?", category: "Technical Issues", categoryBg: "bg-blue-500/10 text-blue-400", desc: "Troubleshooting steps for common app issues.", views: "1.1K", rating: "89%" },
    { id: 8, title: "How to add a new teacher?", category: "Teacher", categoryBg: "bg-amber-500/10 text-amber-400", desc: "Guide to add and activate teacher accounts.", views: "1.0K", rating: "88%" }
  ];

  const filteredArticles = popularArticles.filter(a => {
    if (selectedCategory !== "all" && a.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    if (search) {
      return a.title.toLowerCase().includes(search.toLowerCase()) || a.desc.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
            <span>Help Center / Knowledge Base</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Find quick solutions to common questions and help users faster.
          </p>
        </div>

        <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-purple-600/25">
          <FaPlus className="text-xs" />
          <span>Add Article</span>
        </button>
      </div>

      {/* TOP CATEGORY CARDS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div 
              key={cat.key}
              onClick={() => setSelectedCategory(cat.label)}
              className={`p-4 bg-white dark:bg-[#0D1527] border rounded-2xl cursor-pointer transition shadow-sm space-y-2 ${
                selectedCategory === cat.label ? "border-purple-500 ring-2 ring-purple-500/20" : "border-slate-200 dark:border-white/10 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-xl ${cat.color} flex items-center justify-center`}>
                  <Icon className="text-base" />
                </div>
                <span className="text-[10px] font-bold text-slate-400">{cat.count}</span>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white text-xs">{cat.label}</h4>
                <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{cat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* MAIN LAYOUT: Popular Articles List (Col 8) & Sidebar (Col 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* POPULAR ARTICLES LIST (Col 8) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Search Controls */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <FaSearch className="text-xs" />
              </div>
              <input 
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles in this category..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c.key} value={c.label}>{c.label}</option>)}
              </select>

              <button className="flex items-center gap-1 bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 px-3 py-2 rounded-xl text-slate-400 hover:text-white">
                <FaFilter />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Articles Stream */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider mb-2">Popular Articles</h3>

            <div className="space-y-2">
              {filteredArticles.map((art) => (
                <div key={art.id} className="p-3.5 bg-slate-50 dark:bg-[#121B2E] border border-slate-200 dark:border-white/5 rounded-xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-white/5 transition">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FaBookOpen className="text-xs" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 dark:text-white text-xs">{art.title}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${art.categoryBg}`}>
                          {art.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{art.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs flex-shrink-0">
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <FaEye /> {art.views}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <FaThumbsUp className="text-emerald-400" /> {art.rating}
                    </span>
                    <button className="px-3 py-1 bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white font-bold rounded-lg transition text-[11px]">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* FEATURED & MOST VIEWED SIDEBAR (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Featured Article Promo Box */}
          <div className="bg-gradient-to-tr from-purple-700 via-indigo-600 to-blue-600 rounded-2xl p-5 text-white shadow-lg space-y-3">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-white/20 uppercase tracking-wider">Popular</span>
            <div>
              <h3 className="font-bold text-base">Quick Start Guide for Support Team</h3>
              <p className="text-xs opacity-80 mt-1">Complete overview of TeachHub platform with key features and support tips.</p>
            </div>
            <button className="w-full py-2 bg-white text-purple-900 font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 hover:bg-slate-100 transition">
              <span>Read Now</span>
              <FaArrowRight className="text-xs" />
            </button>
          </div>

          {/* Most Viewed Articles Ranking */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
              <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Most Viewed Articles</h3>
              <button className="text-purple-400 font-bold text-[10px] hover:underline">View All</button>
            </div>

            <div className="space-y-2.5">
              {[
                { rank: 1, title: "How to reset password?", views: "2.4K", color: "bg-blue-600" },
                { rank: 2, title: "How to join a school as a student?", views: "1.8K", color: "bg-purple-600" },
                { rank: 3, title: "How to mark attendance?", views: "1.6K", color: "bg-emerald-600" },
                { rank: 4, title: "Fee payment failed - what to do?", views: "1.4K", color: "bg-amber-600" },
                { rank: 5, title: "App not working on Android?", views: "1.1K", color: "bg-rose-600" }
              ].map((item) => (
                <div key={item.rank} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded-full ${item.color} text-white font-bold text-[10px] flex items-center justify-center`}>
                      {item.rank}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-white text-xs hover:text-purple-400 cursor-pointer">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{item.views}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Helpful Links Box */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-2 text-xs">
            <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider mb-2">Helpful Links</h3>
            
            <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
              <a href="#" className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl font-semibold">
                <span className="flex items-center gap-2"><FaBook className="text-purple-400" /> TeachHub User Manual</span>
                <FaArrowRight className="text-[10px] text-slate-400" />
              </a>
              <a href="#" className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl font-semibold">
                <span className="flex items-center gap-2"><FaVideo className="text-blue-400" /> Video Tutorials</span>
                <FaArrowRight className="text-[10px] text-slate-400" />
              </a>
              <a href="#" className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl font-semibold">
                <span className="flex items-center gap-2"><FaCheckCircle className="text-emerald-400" /> System Status</span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">Operational</span>
              </a>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
