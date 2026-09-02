import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaArrowLeft,
  FaCamera,
  FaEdit,
  FaPlus,
  FaTrashAlt,
  FaStar,
  FaInfoCircle,
  FaChevronRight,
  FaTimes,
  FaSearch,
  FaExchangeAlt,
  FaBook,
} from "react-icons/fa";

const C = {
  bg: "#080B16",
  card: "#0F1526",
  border: "#1C2333",
  borderSoft: "#161D2E",
  purple: "#7C5CFC",
  purpleDim: "rgba(124,92,252,0.14)",
  green: "#22C58B",
  greenDim: "rgba(34,197,139,0.14)",
  red: "#F0506E",
  redDim: "rgba(240,80,110,0.14)",
  text: "#F3F5F9",
  sub: "#8993A8",
  faint: "#5B6478",
};

const defaultTeachers = [
  { _id: "t1", name: "Maya Smith", email: "adns.t@example.com", subject: "Mathematics", gender: "Female", phoneNumber: "+91 98765 43210" },
  { _id: "t2", name: "Amna Smith", email: "alex.t2@example.com", subject: "Science", gender: "Female", phoneNumber: "+91 98765 43211" }
];

const defaultTeacherData = {
  _id: "t1",
  name: "Maya Smith",
  email: "adns.t@example.com",
  phoneNumber: "+91 98765 43210",
  dob: "12 May 1990",
  gender: "Female",
  qualification: "M.Sc, B.Ed",
  experience: "6 Years",
  joiningDate: "15 Aug 2023",
  employeeId: "TCH8821",
  assignedClasses: ["Class 10-A", "Class 9-B"],
  subjects: ["Mathematics", "Physics"]
};

export default function TeacherManagement() {
  const api = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const headers = { Authorization: "Bearer " + localStorage.getItem("token") };

  const [teachers, setTeachers] = useState(() => {
    try {
      const cached = localStorage.getItem("teachhub_cache_teachers_list");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return defaultTeachers;
  });

  const [selectedTeacherId, setSelectedTeacherId] = useState("t1");
  const [teacherData, setTeacherData] = useState(() => {
    try {
      const cached = localStorage.getItem("teachhub_cache_teacher_detail");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.name) return parsed;
      }
    } catch (e) {}
    return defaultTeacherData;
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Edit Profile Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "Maya Smith",
    email: "adns.t@example.com",
    phoneNumber: "+91 98765 43210",
    dob: "12 May 1990",
    gender: "Female",
    qualification: "M.Sc, B.Ed",
    experience: "6 Years",
    joiningDate: "15 Aug 2023",
    employeeId: "TCH8821",
  });

  // Assign Subject Modal State for Admin
  const [showAssignSubjectModal, setShowAssignSubjectModal] = useState(false);
  const [allSchoolSubjects, setAllSchoolSubjects] = useState([]);
  const [assignSubjectId, setAssignSubjectId] = useState("");

  // Load list of all teachers in the school
  const loadTeachers = async () => {
    try {
      const res = await axios.get(`${api}/api/admin/users/teachers`, { headers });
      if (Array.isArray(res.data) && res.data.length > 0) {
        setTeachers(res.data);
        localStorage.setItem("teachhub_cache_teachers_list", JSON.stringify(res.data));
        setSelectedTeacherId(res.data[0]._id);
      }
    } catch (err) {
      console.log("Using cached teachers list");
    } finally {
      setLoading(false);
    }
  };

  // Load all school subjects for assigning
  const loadSchoolSubjects = async () => {
    try {
      const res = await axios.get(`${api}/api/admin/subjects`, { headers });
      setAllSchoolSubjects(res.data || []);
    } catch (err) {
      console.error("Failed to load school subjects", err);
    }
  };

  // Load profile of selected teacher
  const loadTeacherProfile = async (id) => {
    if (!id || id.startsWith("t")) return;
    try {
      const res = await axios.get(`${api}/api/admin/users/teachers/${id}`, { headers });
      if (res.data) {
        setTeacherData(res.data);
        localStorage.setItem("teachhub_cache_teacher_detail", JSON.stringify(res.data));
        setEditForm({
          name: res.data.name || "",
          email: res.data.email || "",
          phoneNumber: res.data.phoneNumber || "",
          dob: res.data.dob || "12 May 1990",
          gender: res.data.gender || "Female",
          qualification: res.data.qualification || "M.Sc, B.Ed",
          experience: res.data.experience || "6 Years",
          joiningDate: res.data.joiningDate || "15 Aug 2023",
          employeeId: res.data.employeeId || `TCH${id.slice(-4).toUpperCase()}`,
        });
      }
    } catch (err) {
      console.log("Using cached teacher detail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    if (selectedTeacherId) {
      loadTeacherProfile(selectedTeacherId);
    }
  }, [selectedTeacherId]);

  // Edit profile submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `${api}/api/admin/users/teachers/${selectedTeacherId}`,
        editForm,
        { headers }
      );
      setTeacherData((prev) => ({ ...prev, ...res.data }));
      setShowEditModal(false);
      alert("Teacher details updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update teacher details");
    }
  };

  // Assign Subject Submit for Admin
  const handleAssignSubjectSubmit = async (e) => {
    e.preventDefault();
    if (!assignSubjectId || !selectedTeacherId) return;

    try {
      await axios.post(
        `${api}/api/admin/assign/assign-subject-teacher`,
        { subjectId: assignSubjectId, teacherId: selectedTeacherId },
        { headers }
      );
      alert("Subject assigned to teacher successfully!");
      setShowAssignSubjectModal(false);
      setAssignSubjectId("");
      loadTeacherProfile(selectedTeacherId);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign subject");
    }
  };

  // Upload local photo file
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (teacherData?.galleryPhotos?.length >= 5) {
      alert("Maximum photo limit (5) reached. Delete a photo to add a new one.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const uploadRes = await axios.post(`${api}/api/schools/upload`, formData, {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      });

      const uploadedUrl = uploadRes.data.url;
      const uploadedFilename = file.name;

      const res = await axios.post(
        `${api}/api/admin/users/teachers/${selectedTeacherId}/photos`,
        { url: uploadedUrl, filename: uploadedFilename },
        { headers }
      );

      setTeacherData((prev) => ({ ...prev, galleryPhotos: res.data }));
      alert("Photo uploaded successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to upload photo file.");
    } finally {
      setUploading(false);
    }
  };

  // Delete photo
  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm("Are you sure you want to delete this photo from the gallery?")) return;
    try {
      const res = await axios.delete(
        `${api}/api/admin/users/teachers/${selectedTeacherId}/photos/${photoId}`,
        { headers }
      );
      setTeacherData((prev) => ({ ...prev, galleryPhotos: res.data }));
      alert("Photo deleted successfully.");
    } catch (err) {
      alert("Failed to delete photo.");
    }
  };

  // Reorder left/right
  const handleReorder = async (index, direction) => {
    if (!teacherData?.galleryPhotos) return;
    const list = [...teacherData.galleryPhotos];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    try {
      const res = await axios.put(
        `${api}/api/admin/users/teachers/${selectedTeacherId}/photos/reorder`,
        { photos: list },
        { headers }
      );
      setTeacherData((prev) => ({ ...prev, galleryPhotos: res.data }));
    } catch (err) {
      alert("Failed to update photo ordering.");
    }
  };

  if (loading && !teacherData) {
    return (
      <div className="flex h-full w-full items-center justify-center py-20 text-slate-400">
        <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mr-2"></span>
        Loading Teacher details...
      </div>
    );
  }

  const resolveImageUrl = (url, fallback) => {
    if (!url) return fallback;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }
    const api = import.meta.env.VITE_API_URL || "";
    return `${api.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
  };

  const nameInitials = (n = "") =>
    n
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const subjects = teacherData?.subjects || [];
  const classes = teacherData?.classes || [];
  const photos = teacherData?.galleryPhotos || [];

  return (
    <div
      style={{ background: C.bg, color: C.text, fontFamily: "Inter, system-ui, sans-serif" }}
      className="flex-1 overflow-y-auto px-6 py-6 text-[13px]"
    >
      {/* Search Header Row */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Select Teacher:</label>
          <select
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
          >
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name} ({t.email})
              </option>
            ))}
          </select>
        </div>

        <div className="text-[11px] font-semibold text-slate-500">
          Teachers <span className="text-slate-700">›</span> Teacher Management <span className="text-slate-700">›</span>{" "}
          <span style={{ color: C.purple }}>{teacherData?.name}</span> <span className="text-slate-700">›</span> Photo Gallery
        </div>
      </div>

      {/* Main Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[26px] font-extrabold leading-tight">Teacher Management & Profile</h1>
          <p style={{ color: C.sub }} className="mt-0.5 text-[12.5px]">
            Manage teacher information, assigned subjects, and photo gallery for {teacherData?.name}.
          </p>
        </div>
        <button
          onClick={() => window.history.back()}
          style={{ borderColor: C.border }}
          className="flex items-center gap-2 border bg-slate-900 hover:bg-slate-850 px-4 py-2 rounded-xl text-xs font-bold text-white transition cursor-pointer"
        >
          <FaArrowLeft size={12} /> Back to Dashboard
        </button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left Panel: Profile Summary Card */}
        <div className="w-full lg:w-[340px] shrink-0 space-y-4">
          <div style={{ background: C.card, borderColor: C.border }} className="rounded-2xl border p-5 shadow-xl">
            <div className="flex flex-col items-center text-center">
              {/* Circular Avatar */}
              <div className="relative w-28 h-28 rounded-full overflow-hidden border border-slate-800 bg-slate-900 mb-4 flex items-center justify-center">
                {teacherData?.avatar ? (
                  <img
                    src={resolveImageUrl(teacherData.avatar)}
                    alt="Teacher"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(teacherData.name)}`;
                    }}
                  />
                ) : (
                  <span className="text-3xl font-black text-white">{nameInitials(teacherData?.name)}</span>
                )}
              </div>

              <h2 className="text-lg font-black flex items-center gap-1.5 justify-center leading-tight">
                {teacherData?.name}
                <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-450 px-2 py-0.5 rounded-full text-[9px] font-extrabold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                </span>
              </h2>
              <p style={{ color: C.sub }} className="text-xs font-bold mt-1">
                {subjects.length > 0 ? `${subjects.map(s => s.name).join(", ")} Teacher` : "Faculty Teacher"}
              </p>

              <div className="flex items-center gap-1 text-amber-500 text-xs font-black mt-2">
                <FaStar />
                <span>
                  {teacherData?.rating || "4.8"}{" "}
                  <span style={{ color: C.faint }}>({teacherData?.reviewsCount || "32"} Reviews)</span>
                </span>
              </div>
            </div>

            {/* Profile Fields */}
            <div style={{ borderColor: C.borderSoft }} className="mt-5 border-t pt-4 space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Teacher Information</span>
                <button
                  onClick={() => setShowEditModal(true)}
                  style={{ color: C.purple, background: C.purpleDim }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold transition hover:bg-purple-650/20 cursor-pointer"
                >
                  <FaEdit size={10} /> Edit
                </button>
              </div>

              <Row label="Employee ID" value={editForm.employeeId} />
              <Row label="Email" value={editForm.email} />
              <Row label="Phone" value={editForm.phoneNumber} />
              <Row label="Date of Birth" value={editForm.dob} />
              <Row label="Gender" value={editForm.gender} />
              <Row label="Qualification" value={editForm.qualification} />
              <Row label="Experience" value={editForm.experience} />
              <Row label="Joining Date" value={editForm.joiningDate} />
              <Row label="Status" value="Active" />
            </div>

            {/* Subjects badge list with Admin Assign trigger */}
            <div style={{ borderColor: C.borderSoft }} className="mt-4 border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Assigned Subjects</span>
                <button
                  onClick={() => {
                    loadSchoolSubjects();
                    setShowAssignSubjectModal(true);
                  }}
                  style={{ color: C.purple, background: C.purpleDim }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9.5px] font-bold hover:bg-purple-650/20 cursor-pointer transition"
                >
                  <FaPlus size={8} /> Assign Subject
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {subjects.map((sub, idx) => (
                  <span
                    key={idx}
                    style={{ background: C.purpleDim, color: C.purple }}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-purple-500/20"
                  >
                    {sub.name}
                  </span>
                ))}
                {subjects.length === 0 && <span style={{ color: C.faint }} className="text-xs">No subjects assigned yet</span>}
              </div>
            </div>

            {/* Assigned Classes badge list */}
            <div style={{ borderColor: C.borderSoft }} className="mt-4 border-t pt-4">
              <span className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Assigned Classes</span>
              <div className="flex flex-wrap gap-1.5">
                {classes.map((cls, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-900 border border-slate-800 text-slate-300"
                  >
                    {cls.name} - {cls.section || "A"}
                  </span>
                ))}
                {classes.length === 0 && <span style={{ color: C.faint }} className="text-xs">No classes assigned</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Photo Gallery Grid */}
        <div className="flex-1 space-y-4">
          <div style={{ background: C.card, borderColor: C.border }} className="rounded-2xl border p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-4">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-350 tracking-wider">Teacher Photos ({photos.length} / 5)</h3>
                <p style={{ color: C.faint }} className="text-[10px] mt-0.5">Upload up to 5 photos. Reorder using arrow controls.</p>
              </div>

              {photos.length < 5 && (
                <>
                  <input
                    type="file"
                    id="teacher-photo-gallery-input"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => document.getElementById("teacher-photo-gallery-input").click()}
                    className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 text-white text-xs font-extrabold px-4 py-2 rounded-xl transition cursor-pointer select-none"
                  >
                    <FaPlus /> {uploading ? "Uploading..." : "Upload Photo"}
                  </button>
                </>
              )}
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo, idx) => (
                <div key={photo._id || idx} className="flex flex-col gap-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-2.5 relative group">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-800 bg-[#0F172A]">
                    <img
                      src={resolveImageUrl(photo.url)}
                      alt={`Gallery ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=80";
                      }}
                    />
                    
                    {/* Index Badge */}
                    <span className="absolute top-2 left-2 w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-black flex items-center justify-center shadow-md">
                      {idx + 1}
                    </span>

                    {/* Actions Overlay */}
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(photo._id)}
                        className="p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white text-[10px] transition cursor-pointer"
                        title="Delete Photo"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>

                  {/* Meta details */}
                  <div className="px-1 py-1">
                    <p className="text-[11px] font-bold text-slate-300 truncate" title={photo.filename}>
                      {photo.filename || `IMG_${idx + 1}.jpg`}
                    </p>
                    <p style={{ color: C.faint }} className="text-[9px] mt-0.5">
                      Uploaded on {new Date(photo.uploadedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>

                  {/* Reordering bar at footer */}
                  <div style={{ borderColor: C.borderSoft }} className="mt-1 border-t pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleReorder(idx, -1)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-[9px] transition cursor-pointer flex items-center gap-1 font-bold"
                    >
                      ◀ Move Left
                    </button>
                    
                    <FaExchangeAlt size={10} style={{ color: C.faint }} />

                    <button
                      type="button"
                      disabled={idx === photos.length - 1}
                      onClick={() => handleReorder(idx, 1)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-[9px] transition cursor-pointer flex items-center gap-1 font-bold"
                    >
                      Move Right ▶
                    </button>
                  </div>
                </div>
              ))}

              {photos.length === 0 && (
                <div className="col-span-full py-16 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
                  No photos uploaded for this teacher yet. Click "+ Upload Photo" to add.
                </div>
              )}
            </div>

            {/* Note banner at bottom */}
            <div className="bg-[#0F172A] border border-slate-850 rounded-xl px-4 py-3 text-[10px] text-purple-400 mt-6 flex items-center gap-2">
              <FaInfoCircle className="text-[12px] shrink-0" />
              <span>Note: First photo will be displayed as the profile photo in the teacher directory.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Edit Details Dialog Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div style={{ background: C.card, borderColor: C.border }} className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl animate-scaleIn text-white">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
              <h3 className="text-sm font-black uppercase text-slate-350 tracking-wider">Edit Teacher Information</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-450 hover:text-white transition">
                <FaTimes size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={editForm.employeeId}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, employeeId: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Date of Birth</label>
                  <input
                    type="text"
                    value={editForm.dob}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, dob: e.target.value }))}
                    placeholder="e.g. 12 May 1990"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Gender</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-bold"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Qualification</label>
                  <input
                    type="text"
                    value={editForm.qualification}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, qualification: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Experience</label>
                  <input
                    type="text"
                    value={editForm.experience}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, experience: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Joining Date</label>
                  <input
                    type="text"
                    value={editForm.joiningDate}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, joiningDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800/80 mt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Assign Subject Modal for Admin */}
      {showAssignSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div style={{ background: C.card, borderColor: C.border }} className="w-full max-w-md rounded-2xl border p-6 shadow-2xl animate-scaleIn text-white">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
              <h3 className="text-sm font-black uppercase text-slate-350 tracking-wider">Assign Subject to {teacherData?.name}</h3>
              <button onClick={() => setShowAssignSubjectModal(false)} className="text-slate-450 hover:text-white transition">
                <FaTimes size={16} />
              </button>
            </div>

            <form onSubmit={handleAssignSubjectSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Select Course Subject</label>
                <select
                  value={assignSubjectId}
                  onChange={(e) => setAssignSubjectId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                >
                  <option value="">Choose Course Subject...</option>
                  {allSchoolSubjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} {s.class ? `(Class ${s.class.name}-${s.class.section})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                Note: Admin can assign multiple subjects to a single teacher (e.g. Teacher Prince can be assigned Math, Science, Hindi, English). Assigned subjects will appear in the teacher's profile as read-only.
              </p>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800/80 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAssignSubjectModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md"
                >
                  Assign Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1 text-xs">
      <span style={{ color: C.sub }} className="font-semibold">{label}</span>
      <span className="font-bold text-slate-200 text-right truncate max-w-[180px]">{value || "—"}</span>
    </div>
  );
}
