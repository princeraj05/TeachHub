import React, { useState } from "react";
import axios from "axios";
import {
  FaCamera,
  FaEye,
  FaSyncAlt,
  FaTrashAlt,
  FaPlus,
  FaChevronDown,
  FaUserTie,
  FaInfoCircle
} from "react-icons/fa";

function MediaPrincipalTab({
  coverImage, setCoverImage,
  schoolPhotos, setSchoolPhotos,
  principalPhoto, setPrincipalPhoto,
  principalName, setPrincipalName,
  principalDesignation, setPrincipalDesignation,
  principalEmail, setPrincipalEmail,
  principalPhone, setPrincipalPhone,
  principalLeadershipSince, setPrincipalLeadershipSince,
  principalIntroduction, setPrincipalIntroduction,
  API
}) {

  const [activePhotoPreview, setActivePhotoPreview] = useState(null);
  const [activeReplaceIndex, setActiveReplaceIndex] = useState(null);

  const handleDeletePhoto = (index) => {
    const updated = [...schoolPhotos];
    updated.splice(index, 1);
    setSchoolPhotos(updated);
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append("image", file);
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API}/api/schools/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data?.url) {
        setCoverImage(res.data.url);
      }
    } catch (err) {
      alert("Failed to upload cover banner image. Please try again.");
    }
  };

  const handleAddPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (schoolPhotos.length >= 5) return;
    
    const formData = new FormData();
    formData.append("image", file);
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API}/api/schools/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data?.url) {
        setSchoolPhotos([...schoolPhotos, res.data.url]);
      }
    } catch (err) {
      alert("Failed to upload image. Please try again.");
    }
  };

  const handleReplacePhotoUpload = async (e) => {
    if (activeReplaceIndex === null) return;
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append("image", file);
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API}/api/schools/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data?.url) {
        const updated = [...schoolPhotos];
        updated[activeReplaceIndex] = res.data.url;
        setSchoolPhotos(updated);
      }
    } catch (err) {
      alert("Failed to upload image. Please try again.");
    } finally {
      setActiveReplaceIndex(null);
    }
  };

  const handlePrincipalPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append("image", file);
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API}/api/schools/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data?.url) {
        setPrincipalPhoto(res.data.url);
      }
    } catch (err) {
      alert("Failed to upload image. Please try again.");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* SCHOOL PHOTOS CARD */}
      <div className="bg-[#0D1326] border border-slate-800/80 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <FaCamera className="text-purple-500 text-sm" />
            <h3 className="text-xs font-black uppercase text-slate-350 tracking-wider">School Photos</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400">{schoolPhotos.length} / 5 Photos</span>
            {schoolPhotos.length < 5 && (
              <>
                <input
                  type="file"
                  id="add-photo-file-input"
                  accept="image/*"
                  onChange={handleAddPhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById("add-photo-file-input").click()}
                  className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  <FaPlus /> Add Photo
                </button>
              </>
            )}
          </div>
        </div>

        <p className="text-[10px] text-slate-450 font-medium mb-4">
          Upload up to 5 photos that represent your school. These photos will be visible to students and parents.
        </p>

        {/* Photos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {schoolPhotos.map((url, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-800 bg-[#0F172A] group">
                <img
                  src={url}
                  alt={`School Photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80";
                  }}
                />
                <span className="absolute top-2 left-2 w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-black flex items-center justify-center shadow-md">
                  {idx + 1}
                </span>

                {/* Overlays and Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                  {/* View */}
                  <button
                    type="button"
                    onClick={() => setActivePhotoPreview(url)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] transition cursor-pointer"
                    title="View Photo"
                  >
                    <FaEye />
                  </button>
                  {/* Refresh/Change */}
                  <button
                    type="button"
                    onClick={() => triggerReplacePhotoUpload(idx)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] transition cursor-pointer"
                    title="Change Photo"
                  >
                    <FaSyncAlt />
                  </button>
                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(idx)}
                    className="p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white text-[11px] transition cursor-pointer"
                    title="Delete Photo"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            </div>
          ))}
          <input
            type="file"
            id="replace-photo-file-input"
            accept="image/*"
            onChange={handleReplacePhotoUpload}
            className="hidden"
          />

          {/* Empty slot placeholder */}
          {schoolPhotos.length === 0 && (
            <div className="col-span-5 py-6 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
              No photos uploaded. Click "+ Add Photo" to start.
            </div>
          )}
        </div>

        <div className="bg-[#0F172A] border border-slate-850 rounded-xl px-4 py-2.5 text-[9px] text-purple-400 mt-4 flex items-center gap-2">
          <FaInfoCircle className="text-[10px]" />
          <span>Drag and drop to reorder photos. The first photo will be shown as the main image.</span>
        </div>
      </div>

      {/* SCHOOL COVER BANNER CARD */}
      <div className="bg-[#0D1326] border border-slate-800/80 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <FaCamera className="text-purple-500 text-sm" />
            <h3 className="text-xs font-black uppercase text-slate-350 tracking-wider">School Cover Banner</h3>
          </div>
          <div>
            <input
              type="file"
              id="cover-photo-file-input"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => document.getElementById("cover-photo-file-input").click()}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              <FaSyncAlt /> Change Banner
            </button>
          </div>
        </div>

        <p className="text-[10px] text-slate-450 font-medium mb-4">
          Upload a high-resolution cover banner that represents your school. Recommended size: <strong className="text-purple-400 font-bold">1200 x 400 pixels (3:1 aspect ratio)</strong> for the best widescreen preview.
        </p>

        {/* Banner Widescreen Preview Frame */}
        <div className="relative aspect-[3/1] w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#0F172A] group">
          {coverImage ? (
            <>
              <img
                src={coverImage}
                alt="School Widescreen Cover Banner"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
              />
              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setActivePhotoPreview(coverImage)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-extrabold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <FaEye /> Preview Widescreen
                </button>
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  className="px-3.5 py-2 bg-rose-600/95 hover:bg-rose-500 text-white text-xs font-extrabold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <FaTrashAlt /> Remove Cover
                </button>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2 border border-dashed border-slate-800 rounded-2xl">
              <span className="text-xs font-bold text-slate-400">No cover image uploaded</span>
              <button
                type="button"
                onClick={() => document.getElementById("cover-photo-file-input").click()}
                className="px-4 py-2 bg-[#0F172A] border border-slate-800 hover:bg-slate-850 rounded-xl text-[10px] text-white font-black transition cursor-pointer"
              >
                Upload Cover Banner
              </button>
            </div>
          )}
        </div>
      </div>

      {/* LOWER GRID: PRINCIPAL LEADERSHIP & DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Principal Leadership Photo Card (5 Cols) */}
        <div className="lg:col-span-5 bg-[#0D1326] border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3 mb-4">
              <FaUserTie className="text-purple-500 text-sm" />
              <h3 className="text-xs font-black uppercase text-slate-350 tracking-wider">Principal Leadership</h3>
            </div>
            <p className="text-[10px] text-slate-450 font-medium mb-5">
              Upload principal photo and manage leadership information.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              
              {/* Photo Box with overlay camera */}
              <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 group">
                <img
                  src={principalPhoto || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&h=300&q=80"}
                  alt="Principal"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&h=300&q=80";
                  }}
                />
                <input
                  type="file"
                  id="principal-photo-file-input"
                  accept="image/*"
                  onChange={handlePrincipalPhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById("principal-photo-file-input").click()}
                  className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center cursor-pointer shadow-lg group-hover:scale-105 transition border-0 focus:outline-none"
                >
                  <FaCamera className="text-xs" />
                </button>
              </div>

              {/* Upload file selection */}
              <div className="flex-1 w-full space-y-3">
                <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Change Principal Photo</span>
                
                <button
                  type="button"
                  onClick={() => document.getElementById("principal-photo-file-input").click()}
                  className="px-4 py-2 bg-[#0F172A] border border-slate-800 hover:bg-slate-850 rounded-xl text-xs text-white font-bold transition cursor-pointer select-none"
                >
                  Choose Image File
                </button>

                <span className="block text-[8px] text-slate-500">
                  {principalPhoto ? "Current: File uploaded successfully" : "Select a JPG, PNG or WEBP from your computer, Max size 2MB."}
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* Principal Details Inputs Card (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0D1326] border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1E293B]/60 pb-3 mb-4">
            <h3 className="text-xs font-black uppercase text-slate-350 tracking-wider">Principal Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Principal Name */}
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Principal Name</label>
              <input
                type="text"
                value={principalName}
                onChange={(e) => setPrincipalName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
              />
            </div>

            {/* Designation */}
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Designation</label>
              <input
                type="text"
                value={principalDesignation}
                onChange={(e) => setPrincipalDesignation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Email</label>
              <input
                type="email"
                value={principalEmail}
                onChange={(e) => setPrincipalEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Phone Number</label>
              <input
                type="text"
                value={principalPhone}
                onChange={(e) => setPrincipalPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
              />
            </div>

            {/* Leadership Since */}
            <div className="sm:col-span-2">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Leadership Since</label>
              <input
                type="date"
                value={principalLeadershipSince}
                onChange={(e) => setPrincipalLeadershipSince(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold cursor-pointer"
              />
            </div>

            {/* Short Introduction */}
            <div className="sm:col-span-2">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Short Introduction</label>
              <textarea
                rows="3"
                value={principalIntroduction}
                onChange={(e) => setPrincipalIntroduction(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-medium leading-relaxed"
              />
            </div>

          </div>
        </div>

      </div>

      {/* Photo Preview Modal */}
      {activePhotoPreview && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-3xl max-h-[80vh] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-2 shadow-2xl">
            <button
              onClick={() => setActivePhotoPreview(null)}
              className="absolute top-4 right-4 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full p-2 cursor-pointer z-10"
            >
              <FaTimes />
            </button>
            <img src={activePhotoPreview} alt="Preview" className="max-w-full max-h-[75vh] object-contain rounded-lg" />
          </div>
        </div>
      )}

      {/* Info warning banner */}
      <div className="bg-[#0F172A] border border-slate-850 rounded-xl px-4 py-3.5 text-xs text-slate-350 mt-4 flex items-center gap-2.5">
        <FaInfoCircle className="text-purple-500 text-base" />
        <span>Good quality photos and complete information help build trust with parents and enhance your school's profile.</span>
      </div>

    </div>
  );
}

// Simple absolute icons for modal closer
function FaTimes(props) {
  return (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 352 512" height="1em" width="1em" {...props}>
      <path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.19 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.19 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path>
    </svg>
  );
}

export default MediaPrincipalTab;
