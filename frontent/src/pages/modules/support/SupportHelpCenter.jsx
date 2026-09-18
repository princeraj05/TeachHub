import { useState, useEffect, useCallback } from "react";
import axios from "axios";
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
  FaBook, 
  FaVideo, 
  FaCheckCircle,
  FaSpinner,
  FaTimes,
  FaEdit,
  FaTrashAlt,
  FaInbox
} from "react-icons/fa";
import API_URL from "../../../config/api";

export default function SupportHelpCenter() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [articles, setArticles] = useState([]);
  const [categoryStats, setCategoryStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Article Modal State
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Management State (SuperAdmin)
  const userRole = localStorage.getItem("userRole") || localStorage.getItem("role") || "";
  const isSuperAdmin = userRole === "superadmin";

  const [showModal, setShowModal] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "General",
    summary: "",
    content: "",
    status: "published",
    isFeatured: false,
    rating: "95%"
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Categories metadata configuration
  const categoryConfig = [
    { key: "Login", label: "Login", desc: "Help with login, password and account issues", icon: FaLock, color: "text-blue-500 bg-blue-500/10" },
    { key: "School Joining", label: "School Joining", desc: "School registration and joining process", icon: FaSchool, color: "text-purple-500 bg-purple-500/10" },
    { key: "Student", label: "Student", desc: "Student account, profile and academic related", icon: FaUserGraduate, color: "text-emerald-500 bg-emerald-500/10" },
    { key: "Teacher", label: "Teacher", desc: "Teacher account and class management", icon: FaChalkboardTeacher, color: "text-amber-500 bg-amber-500/10" },
    { key: "Admin", label: "Admin", desc: "Admin panel and management settings", icon: FaUserShield, color: "text-rose-500 bg-rose-500/10" },
    { key: "Fees", label: "Fees", desc: "Fee payment and related issues", icon: FaCreditCard, color: "text-rose-400 bg-rose-500/10" },
    { key: "Attendance", label: "Attendance", desc: "Attendance marking and reports", icon: FaCalendarCheck, color: "text-emerald-400 bg-emerald-500/10" },
    { key: "Exams", label: "Exams", desc: "Exam setup, results and related", icon: FaFileAlt, color: "text-purple-400 bg-purple-500/10" },
    { key: "Technical Issues", label: "Technical Issues", desc: "App errors, bugs and technical support", icon: FaWrench, color: "text-blue-400 bg-blue-500/10" }
  ];

  const fetchArticles = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (search.trim()) params.append("search", search.trim());

      const res = await axios.get(`${API_URL}/api/support/help-articles?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data) {
        setArticles(res.data.articles || []);
        setCategoryStats(res.data.categoryStats || {});
      }
    } catch (err) {
      console.error("Error fetching help articles:", err.message);
      setError(err.response?.data?.message || "Failed to load help center articles.");
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, search]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Open Article Detail
  const handleViewArticle = async (articleId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoadingDetail(true);
      const res = await axios.get(`${API_URL}/api/support/help-articles/${articleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedArticle(res.data);
    } catch (err) {
      console.error("Error loading article detail:", err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Open Create/Edit Modal
  const handleOpenCreateModal = (art = null) => {
    if (art) {
      setEditingArticleId(art._id);
      setFormData({
        title: art.title || "",
        category: art.category || "General",
        summary: art.summary || "",
        content: art.content || "",
        status: art.status || "published",
        isFeatured: !!art.isFeatured,
        rating: art.rating || "95%"
      });
    } else {
      setEditingArticleId(null);
      setFormData({
        title: "",
        category: "General",
        summary: "",
        content: "",
        status: "published",
        isFeatured: false,
        rating: "95%"
      });
    }
    setFormError("");
    setShowModal(true);
  };

  // Submit Save Article
  const handleSaveArticle = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!formData.title.trim() || !formData.content.trim()) {
      setFormError("Title and content are required.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");
      if (editingArticleId) {
        await axios.put(`${API_URL}/api/support/help-articles/${editingArticleId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/api/support/help-articles`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setShowModal(false);
      fetchArticles();
      if (selectedArticle && selectedArticle._id === editingArticleId) {
        handleViewArticle(editingArticleId);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save article.");
    } finally {
      setSaving(false);
    }
  };

  // Delete Article
  const handleDeleteArticle = async (articleId) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.delete(`${API_URL}/api/support/help-articles/${articleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (selectedArticle && selectedArticle._id === articleId) {
        setSelectedArticle(null);
      }
      fetchArticles();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete article.");
    }
  };

  // Helper for Category Colors in Badges
  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case "Login": return "bg-blue-500/10 text-blue-400";
      case "School Joining": return "bg-purple-500/10 text-purple-400";
      case "Student": return "bg-emerald-500/10 text-emerald-400";
      case "Teacher": return "bg-amber-500/10 text-amber-400";
      case "Admin": return "bg-rose-500/10 text-rose-400";
      case "Fees": return "bg-rose-400/10 text-rose-400";
      case "Attendance": return "bg-emerald-400/10 text-emerald-400";
      case "Exams": return "bg-purple-400/10 text-purple-400";
      case "Technical Issues": return "bg-blue-400/10 text-blue-400";
      default: return "bg-slate-500/10 text-slate-400";
    }
  };

  const mostViewed = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  const featuredArticle = articles.find(a => a.isFeatured) || articles[0];

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

        {isSuperAdmin && (
          <button 
            onClick={() => handleOpenCreateModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-purple-600/25 transition cursor-pointer"
          >
            <FaPlus className="text-xs" />
            <span>Add Article</span>
          </button>
        )}
      </div>

      {/* TOP CATEGORY CARDS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {categoryConfig.map((cat) => {
          const Icon = cat.icon;
          const count = categoryStats[cat.key] || 0;
          const isSelected = selectedCategory.toLowerCase() === cat.key.toLowerCase();

          return (
            <div 
              key={cat.key}
              onClick={() => setSelectedCategory(isSelected ? "all" : cat.key)}
              className={`p-4 bg-white dark:bg-[#0D1527] border rounded-2xl cursor-pointer transition shadow-sm space-y-2 ${
                isSelected ? "border-purple-500 ring-2 ring-purple-500/20" : "border-slate-200 dark:border-white/10 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-xl ${cat.color} flex items-center justify-center`}>
                  <Icon className="text-base" />
                </div>
                <span className="text-[10px] font-bold text-slate-400">{count} articles</span>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white text-xs">{cat.label}</h4>
                <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{cat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* MAIN LAYOUT: Popular Articles List & Sidebar */}
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
                className="bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none text-xs"
              >
                <option value="all">All Categories</option>
                {categoryConfig.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {/* Articles Stream */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider mb-2">Knowledge Base Articles</h3>

            {loading ? (
              <div className="p-12 text-center text-slate-400 font-bold text-xs flex flex-col items-center justify-center gap-3">
                <FaSpinner className="text-2xl animate-spin text-purple-500" />
                <span>Loading help articles...</span>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-rose-400 font-bold text-xs">
                {error}
              </div>
            ) : articles.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-bold text-xs flex flex-col items-center justify-center gap-3">
                <FaInbox className="text-3xl text-slate-300 dark:text-slate-600" />
                <span>No articles found in this category.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {articles.map((art) => (
                  <div key={art._id} className="p-3.5 bg-slate-50 dark:bg-[#121B2E] border border-slate-200 dark:border-white/5 rounded-xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-white/5 transition">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FaBookOpen className="text-xs" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 dark:text-white text-xs">{art.title}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getCategoryBadgeClass(art.category)}`}>
                            {art.category}
                          </span>
                          {art.status !== "published" && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-400">
                              {art.status}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{art.summary || art.content}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs flex-shrink-0 ml-3">
                      <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                        <FaEye /> {art.views || 0}
                      </span>
                      <button 
                        onClick={() => handleViewArticle(art._id)}
                        className="px-3 py-1 bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white font-bold rounded-lg transition text-[11px] cursor-pointer"
                      >
                        View
                      </button>
                      {isSuperAdmin && (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleOpenCreateModal(art)} className="p-1.5 text-slate-400 hover:text-white cursor-pointer" title="Edit">
                            <FaEdit className="text-xs" />
                          </button>
                          <button onClick={() => handleDeleteArticle(art._id)} className="p-1.5 text-slate-400 hover:text-rose-400 cursor-pointer" title="Delete">
                            <FaTrashAlt className="text-xs" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* FEATURED & MOST VIEWED SIDEBAR (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Featured Article Promo Box */}
          {featuredArticle && (
            <div className="bg-gradient-to-tr from-purple-700 via-indigo-600 to-blue-600 rounded-2xl p-5 text-white shadow-lg space-y-3">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-white/20 uppercase tracking-wider">Featured</span>
              <div>
                <h3 className="font-bold text-base">{featuredArticle.title}</h3>
                <p className="text-xs opacity-80 mt-1 line-clamp-2">{featuredArticle.summary || featuredArticle.content}</p>
              </div>
              <button 
                onClick={() => handleViewArticle(featuredArticle._id)}
                className="w-full py-2 bg-white text-purple-900 font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 hover:bg-slate-100 transition cursor-pointer"
              >
                <span>Read Now</span>
                <FaArrowRight className="text-xs" />
              </button>
            </div>
          )}

          {/* Most Viewed Articles Ranking */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
              <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Most Viewed Articles</h3>
            </div>

            <div className="space-y-2.5">
              {mostViewed.length === 0 ? (
                <span className="text-slate-400 text-xs">No articles available.</span>
              ) : (
                mostViewed.map((item, idx) => (
                  <div key={item._id} onClick={() => handleViewArticle(item._id)} className="flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 p-1 rounded-lg">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-white text-xs hover:text-purple-400 line-clamp-1">
                        {item.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono ml-2">{item.views || 0}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Helpful Links Box */}
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-2 text-xs">
            <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider mb-2">Helpful Links</h3>
            
            <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl font-semibold cursor-pointer">
                <span className="flex items-center gap-2"><FaBook className="text-purple-400" /> TeachHub User Manual</span>
                <FaArrowRight className="text-[10px] text-slate-400" />
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl font-semibold cursor-pointer">
                <span className="flex items-center gap-2"><FaVideo className="text-blue-400" /> Video Tutorials</span>
                <FaArrowRight className="text-[10px] text-slate-400" />
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl font-semibold cursor-pointer">
                <span className="flex items-center gap-2"><FaCheckCircle className="text-emerald-400" /> System Status</span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">Operational</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ARTICLE DETAIL MODAL */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl text-slate-800 dark:text-white">
            
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getCategoryBadgeClass(selectedArticle.category)}`}>
                    {selectedArticle.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Updated {new Date(selectedArticle.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-xl font-black mt-1.5">{selectedArticle.title}</h2>
              </div>

              <button 
                onClick={() => setSelectedArticle(null)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-400 hover:text-white transition"
              >
                <FaTimes />
              </button>
            </div>

            {selectedArticle.summary && (
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs font-semibold text-purple-300">
                {selectedArticle.summary}
              </div>
            )}

            <div className="text-xs leading-relaxed space-y-3 whitespace-pre-wrap text-slate-700 dark:text-slate-300">
              {selectedArticle.content}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>Views: {selectedArticle.views || 0}</span>
              {isSuperAdmin && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { setSelectedArticle(null); handleOpenCreateModal(selectedArticle); }}
                    className="px-3 py-1.5 bg-purple-600 text-white font-bold rounded-xl text-xs flex items-center gap-1"
                  >
                    <FaEdit /> Edit
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* CREATE / EDIT ARTICLE MODAL (SuperAdmin Only) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveArticle} className="bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-3xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl text-slate-800 dark:text-white">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <h3 className="font-black text-lg">
                {editingArticleId ? "Edit Help Article" : "Create New Help Article"}
              </h3>
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-400"
              >
                <FaTimes />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 font-bold text-xs">
                {formError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Title *</label>
                <input 
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. How to reset account password"
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white"
                  >
                    {categoryConfig.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Summary (Short overview)</label>
                <input 
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Brief 1-line description of this article"
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Article Content *</label>
                <textarea 
                  required
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Provide detailed step-by-step instructions..."
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="isFeatured" className="font-bold text-slate-300">Feature this article on top</label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 disabled:opacity-50"
              >
                {saving ? <FaSpinner className="animate-spin" /> : "Save Article"}
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
