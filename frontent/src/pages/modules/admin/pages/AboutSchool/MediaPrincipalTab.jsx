import React, { useState } from "react";
import axios from "axios";
import { compressImage } from "../../../../../utils/mediaCompression";
import BannerCropModal from "../../../../../components/BannerCropModal";
import { getMediaUrl } from "../../../../../config/api";
import {
  FaCamera,
  FaEye,
  FaSyncAlt,
  FaTrashAlt,
  FaPlus,
  FaChevronDown,
  FaUserTie,
  FaInfoCircle,
  FaImage,
  FaUpload,
  FaCropAlt,
  FaArrowsAltV
} from "react-icons/fa";

function MediaPrincipalTab({
  coverImage, setCoverImage,
  coverPosition = 50, setCoverPosition,
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
  const [showBannerCropModal, setShowBannerCropModal] = useState(false);
  const [tempCoverForCrop, setTempCoverForCrop] = useState(null);

  const autoSaveMedia = async (updatedPayload) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${API}/api/schools/my-school`, updatedPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.school) {
        if (updatedPayload.principalPhoto !== undefined) {
          setPrincipalPhoto(res.data.school.principalPhoto || "");
        }
        if (updatedPayload.schoolPhotos !== undefined) {
          setSchoolPhotos(res.data.school.schoolPhotos || []);
        }
        if (updatedPayload.coverImage !== undefined) {
          setCoverImage(res.data.school.coverImage || "");
        }
      }
    } catch (err) {
      console.error("Auto-save media failed:", err);
    }
  };

  const handleDeletePhoto = (index) => {
    const updated = [...schoolPhotos];
    updated.splice(index, 1);
    setSchoolPhotos(updated);
    autoSaveMedia({ schoolPhotos: updated });
  };

  const triggerReplacePhotoUpload = (index) => {
    setActiveReplaceIndex(index);
    const inputEl = document.getElementById("replace-photo-file-input");
    if (inputEl) inputEl.click();
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTempCoverForCrop(file);
    setShowBannerCropModal(true);
    e.target.value = "";
  };

  const handleSaveCroppedBanner = async (croppedDataUrl) => {
    try {
      const response = await fetch(croppedDataUrl);
      const blob = await response.blob();
      const file = new File([blob], `cover_${Date.now()}.jpg`, { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("image", file);

      const token = localStorage.getItem("token");
      const res = await axios.post(`${API}/api/schools/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });

      if (res.data?.url) {
        setCoverImage(res.data.url);
        autoSaveMedia({ coverImage: res.data.url });
      }
    } catch (err) {
      console.error("Failed to upload cropped cover banner:", err);
      alert("Failed to save cropped cover banner. Please try again.");
    } finally {
      setShowBannerCropModal(false);
      setTempCoverForCrop(null);
    }
  };

  const handleAddPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (schoolPhotos.length >= 5) {
      alert("Maximum 5 photos allowed.");
      return;
    }
    
    let uploadFile = file;
    try { uploadFile = await compressImage(file); } catch (cErr) {}

    const formData = new FormData();
    formData.append("image", uploadFile);
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API}/api/schools/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data?.url) {
        const updated = [...schoolPhotos, res.data.url];
        setSchoolPhotos(updated);
        autoSaveMedia({ schoolPhotos: updated });
      }
    } catch (err) {
      alert("Failed to upload image. Please try again.");
    }
  };

  const handleReplacePhotoUpload = async (e) => {
    if (activeReplaceIndex === null) return;
    const file = e.target.files?.[0];
    if (!file) return;
    
    let uploadFile = file;
    try { uploadFile = await compressImage(file); } catch (cErr) {}

    const formData = new FormData();
    formData.append("image", uploadFile);
    
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
        autoSaveMedia({ schoolPhotos: updated });
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
    
    let uploadFile = file;
    try { uploadFile = await compressImage(file); } catch (cErr) {}

    const formData = new FormData();
    formData.append("image", uploadFile);
    
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
        autoSaveMedia({ principalPhoto: res.data.url });
      }
    } catch (err) {
      alert("Failed to upload principal photo. Please try again.");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* SCHOOL PHOTOS CARD */}
      <div className="bg-white dark:bg-[#0D1326] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <FaCamera className="text-purple-500 text-sm" />
            <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-350 tracking-wider">School Photos</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{schoolPhotos.length} / 5 Photos</span>
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

        <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mb-4">
          Upload up to 5 photos that represent your school. These photos will be visible to students and parents.
        </p>

        {/* Photos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {schoolPhotos.map((url, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0F172A] group">
                <img
                  src={getMediaUrl(url)}
                  alt={`School Photo ${idx + 1}`}
                  className="w-full h-full object-cover"
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
            <div className="col-span-5 py-8 text-center border-2 border-dashed border-slate-300 dark:border-slate-800/80 rounded-2xl text-slate-500 dark:text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
              <FaImage className="text-2xl text-slate-400" />
              <span>No school photos uploaded yet. Click "+ Add Photo" to upload photos.</span>
            </div>
          )}
        </div>

        <div className="bg-purple-50 dark:bg-[#0F172A] border border-purple-200 dark:border-slate-850 rounded-xl px-4 py-2.5 text-[9px] text-purple-600 dark:text-purple-400 mt-4 flex items-center gap-2">
          <FaInfoCircle className="text-[10px]" />
          <span>The first photo will be shown as the main school image for students and parents.</span>
        </div>
      </div>

      {/* SCHOOL COVER BANNER CARD */}
      <div className="bg-white dark:bg-[#0D1326] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <FaCamera className="text-purple-500 text-sm" />
            <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-350 tracking-wider">School Cover Banner</h3>
          </div>
          <div className="flex items-center gap-2">
            {coverImage && (
              <button
                type="button"
                onClick={() => {
                  setTempCoverForCrop(getMediaUrl(coverImage));
                  setShowBannerCropModal(true);
                }}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition cursor-pointer border border-white/10"
              >
                <FaCropAlt className="text-purple-400" /> Crop Banner
              </button>
            )}
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
              <FaSyncAlt /> {coverImage ? "Change Banner" : "Upload Banner"}
            </button>
          </div>
        </div>

        <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mb-4">
          Upload a high-resolution cover banner that represents your school. Recommended size: <strong className="text-purple-600 dark:text-purple-400 font-bold">1200 x 400 pixels (3:1 aspect ratio)</strong> for the best widescreen preview.
        </p>

        {/* Banner Widescreen Preview Frame */}
        <div className="relative aspect-[3/1] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0F172A] group">
          {coverImage ? (
            <>
              <img
                src={getMediaUrl(coverImage)}
                alt="School Widescreen Cover Banner"
                style={{ objectPosition: `center ${coverPosition !== undefined ? coverPosition : 50}%` }}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
              />
              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTempCoverForCrop(getMediaUrl(coverImage));
                    setShowBannerCropModal(true);
                  }}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-lg"
                >
                  <FaCropAlt /> Crop & Rotate
                </button>
                <button
                  type="button"
                  onClick={() => setActivePhotoPreview(coverImage)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-extrabold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <FaEye /> Preview Widescreen
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCoverImage("");
                    autoSaveMedia({ coverImage: "" });
                  }}
                  className="px-3.5 py-2 bg-rose-600/95 hover:bg-rose-500 text-white text-xs font-extrabold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <FaTrashAlt /> Remove Cover
                </button>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2 border-2 border-dashed border-slate-300 dark:border-slate-800/80 rounded-2xl">
              <FaImage className="text-3xl text-slate-400" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">No cover image uploaded</span>
              <button
                type="button"
                onClick={() => document.getElementById("cover-photo-file-input").click()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[10px] font-black transition cursor-pointer shadow-sm"
              >
                Upload Cover Banner
              </button>
            </div>
          )}
        </div>

        {/* Vertical Position (Upar / Niche Adjust) Controls */}
        {coverImage && (
          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FaArrowsAltV className="text-purple-500 text-xs" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Vertical Alignment (Upar / Niche Adjust):
              </span>
              <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                {coverPosition !== undefined ? coverPosition : 50}%
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={coverPosition !== undefined ? coverPosition : 50}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCoverPosition(val);
                  autoSaveMedia({ coverPosition: val });
                }}
                className="w-full sm:w-48 accent-purple-600 cursor-pointer"
              />
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setCoverPosition(0);
                    autoSaveMedia({ coverPosition: 0 });
                  }}
                  className={`px-2 py-1 rounded-md text-[10px] font-extrabold border cursor-pointer transition ${
                    coverPosition === 0
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  Top
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCoverPosition(50);
                    autoSaveMedia({ coverPosition: 50 });
                  }}
                  className={`px-2 py-1 rounded-md text-[10px] font-extrabold border cursor-pointer transition ${
                    coverPosition === 50
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  Center
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCoverPosition(100);
                    autoSaveMedia({ coverPosition: 100 });
                  }}
                  className={`px-2 py-1 rounded-md text-[10px] font-extrabold border cursor-pointer transition ${
                    coverPosition === 100
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  Bottom
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* LOWER GRID: PRINCIPAL LEADERSHIP & DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Principal Leadership Photo Card (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0D1326] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800/60 pb-3 mb-4">
              <FaUserTie className="text-purple-500 text-sm" />
              <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-350 tracking-wider">Principal Leadership</h3>
            </div>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mb-5">
              Upload principal photo and manage leadership information.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              
              {/* Photo Box */}
              <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group flex items-center justify-center shrink-0">
                {principalPhoto ? (
                  <img
                    src={getMediaUrl(principalPhoto)}
                    alt="Principal"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-1 p-2 text-center">
                    <FaUserTie className="text-4xl text-purple-500/70" />
                    <span className="text-[8.5px] font-extrabold uppercase tracking-wide text-slate-400">No Photo</span>
                  </div>
                )}
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
                  className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center cursor-pointer shadow-lg group-hover:scale-105 transition border-2 border-white dark:border-[#0D1326]"
                  title="Upload Principal Photo"
                >
                  <FaCamera className="text-xs" />
                </button>
              </div>

              {/* Upload file selection */}
              <div className="flex-1 w-full space-y-3">
                <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Principal Photo</span>
                
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => document.getElementById("principal-photo-file-input").click()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold transition cursor-pointer select-none flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <FaUpload className="text-[10px]" /> {principalPhoto ? "Change Photo" : "Upload Photo"}
                  </button>

                  {principalPhoto && (
                    <button
                      type="button"
                      onClick={() => {
                        setPrincipalPhoto("");
                        autoSaveMedia({ principalPhoto: "" });
                      }}
                      className="px-4 py-1.5 border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 rounded-xl text-xs font-bold transition cursor-pointer select-none flex items-center justify-center gap-1.5"
                    >
                      <FaTrashAlt className="text-[10px]" /> Remove Photo
                    </button>
                  )}
                </div>

                <span className="block text-[8.5px] text-slate-400 font-semibold leading-relaxed">
                  {principalPhoto ? "✓ Photo uploaded and saved" : "Select a JPG, PNG or WEBP from your computer, Max size 2MB."}
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* Principal Details Inputs Card (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0D1326] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-[#1E293B]/60 pb-3 mb-4">
            <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-350 tracking-wider">Principal Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Principal Name */}
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Principal Name</label>
              <input
                type="text"
                value={principalName}
                onChange={(e) => setPrincipalName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 font-bold"
              />
            </div>

            {/* Designation */}
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Designation</label>
              <input
                type="text"
                value={principalDesignation}
                onChange={(e) => setPrincipalDesignation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 font-bold"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Email</label>
              <input
                type="email"
                value={principalEmail}
                onChange={(e) => setPrincipalEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 font-bold"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Phone Number</label>
              <input
                type="text"
                value={principalPhone}
                onChange={(e) => setPrincipalPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 font-bold"
              />
            </div>

            {/* Leadership Since */}
            <div className="sm:col-span-2">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Leadership Since</label>
              <input
                type="date"
                value={principalLeadershipSince}
                onChange={(e) => setPrincipalLeadershipSince(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 font-bold cursor-pointer"
              />
            </div>

            {/* Short Introduction */}
            <div className="sm:col-span-2">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Short Introduction</label>
              <textarea
                rows="3"
                value={principalIntroduction}
                onChange={(e) => setPrincipalIntroduction(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 font-medium leading-relaxed"
              />
            </div>

          </div>
        </div>

      </div>

      {/* Photo Preview Modal */}
      {activePhotoPreview && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-3xl max-h-[80vh] bg-[#0D1326] border border-slate-800 rounded-2xl overflow-hidden p-2 shadow-2xl">
            <button
              onClick={() => setActivePhotoPreview(null)}
              className="absolute top-4 right-4 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full p-2 cursor-pointer z-10"
            >
              <FaTimes />
            </button>
            <img src={getMediaUrl(activePhotoPreview)} alt="Preview" className="max-w-full max-h-[75vh] object-contain rounded-lg" />
          </div>
        </div>
      )}

      {/* Banner Crop Modal */}
      {showBannerCropModal && tempCoverForCrop && (
        <BannerCropModal
          imageSrc={tempCoverForCrop}
          onClose={() => {
            setShowBannerCropModal(false);
            setTempCoverForCrop(null);
          }}
          onSave={handleSaveCroppedBanner}
        />
      )}

      {/* Info warning banner */}
      <div className="bg-purple-50 dark:bg-[#0F172A] border border-purple-200 dark:border-slate-850 rounded-xl px-4 py-3.5 text-xs text-slate-700 dark:text-slate-350 mt-4 flex items-center gap-2.5">
        <FaInfoCircle className="text-purple-500 text-base" />
        <span>Good quality photos and complete information help build trust with parents and enhance your school's profile.</span>
      </div>

    </div>
  );
}

function FaTimes(props) {
  return (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 352 512" height="1em" width="1em" {...props}>
      <path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.19 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.19 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path>
    </svg>
  );
}

export default MediaPrincipalTab;
