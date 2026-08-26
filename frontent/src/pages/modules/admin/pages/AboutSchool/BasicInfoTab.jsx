import React from "react";
import axios from "axios";
import {
  FaSchool,
  FaUsers,
  FaChalkboardTeacher,
  FaBook,
  FaCalendarAlt,
  FaArrowUp,
} from "react-icons/fa";

function BasicInfoTab({
  school,
  isEditing,
  principalName, setPrincipalName,
  affiliation, setAffiliation,
  academicYear, setAcademicYear,
  email, setEmail,
  medium, setMedium,
  phoneNumber, setPhoneNumber,
  website, setWebsite,
  address, setAddress,
  established, setEstablished,
  status, setStatus,
  schoolType, setSchoolType,
  registrationNumber, setRegistrationNumber,
  code, setCode,
  category, setCategory,
  motto, setMotto,
  photo, setPhoto,
  availableClasses, setAvailableClasses,
  API
}) {

  const classCountText = school?.totalClasses === 1 ? "1 Class" : `${school?.totalClasses || 0} Classes`;

  const handlePhotoUpload = async (e) => {
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
        setPhoto(res.data.url);
      }
    } catch (err) {
      alert("Failed to upload image. Please try again.");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* CARD 1: BASIC INFORMATION */}
      <div className="bg-[#0D1326] border border-slate-800/80 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3 mb-5">
          <FaSchool className="text-purple-500 text-sm" />
          <h3 className="text-xs font-black uppercase text-slate-350 tracking-wider">Basic Information</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* School Photo (Left) */}
          <div className="lg:col-span-4">
            <div className="rounded-xl overflow-hidden border border-slate-800/80 aspect-[4/3] bg-slate-900 flex items-center justify-center relative group">
              <img
                src={photo || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80"}
                alt="School Building"
                className="w-full h-full object-cover"
              />
              {isEditing && (
                <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-4 text-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Change Main Banner</span>
                  <input
                    type="file"
                    id="main-banner-file-input"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById("main-banner-file-input").click()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-xs text-white font-bold transition cursor-pointer select-none"
                  >
                    Choose Photo File
                  </button>
                  <span className="text-[8px] text-slate-500 mt-2">Recommended: 4:3 Ratio</span>
                </div>
              )}
            </div>
          </div>

          {/* Profile Fields (Right) */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              
              {/* School Name */}
              <div>
                <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">School Name</span>
                <p className="text-xs font-bold text-white bg-[#0F172A]/40 border border-slate-850 px-3.5 py-2 rounded-xl text-slate-400">
                  {school?.name || "G.D Accedmy"}
                </p>
              </div>

              {/* Affiliation */}
              <div>
                <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Affiliation / Board</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={affiliation}
                    onChange={(e) => setAffiliation(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                  />
                ) : (
                  <p className="text-xs font-bold text-white px-1 py-1">{affiliation || "CBSE"}</p>
                )}
              </div>

              {/* Principal Name */}
              <div>
                <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Principal Name</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={principalName}
                    onChange={(e) => setPrincipalName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                  />
                ) : (
                  <p className="text-xs font-bold text-white px-1 py-1">{principalName || "Banny Thapar"}</p>
                )}
              </div>

              {/* Academic Year */}
              <div>
                <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Academic Year</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                  />
                ) : (
                  <p className="text-xs font-bold text-white px-1 py-1">{academicYear || "2026 - 2027"}</p>
                )}
              </div>

              {/* School Email */}
              <div>
                <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">School Email</span>
                {isEditing ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                  />
                ) : (
                  <p className="text-xs font-bold text-white px-1 py-1">{email || "gdaccedmy@gmail.com"}</p>
                )}
              </div>

              {/* Medium */}
              <div>
                <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Medium</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={medium}
                    onChange={(e) => setMedium(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                  />
                ) : (
                  <p className="text-xs font-bold text-white px-1 py-1">{medium || "English"}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Phone Number</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                  />
                ) : (
                  <p className="text-xs font-bold text-white px-1 py-1">{phoneNumber || "+91 98765 43210"}</p>
                )}
              </div>

              {/* Website */}
              <div>
                <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Website</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                  />
                ) : (
                  <p className="text-xs font-bold text-white px-1 py-1">{website || "www.gdaccedmy.edu.in"}</p>
                )}
              </div>

              {/* School Address */}
              <div className="sm:col-span-2">
                <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">School Address</span>
                {isEditing ? (
                  <textarea
                    rows="2"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                  />
                ) : (
                  <p className="text-xs font-bold text-white px-1 py-1 leading-relaxed">
                    {address || "Near Sadar Hospital, Siwan, Bihar - 841226, India"}
                  </p>
                )}
              </div>

              {/* School Established */}
              <div>
                <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">School Established</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={established}
                    onChange={(e) => setEstablished(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                  />
                ) : (
                  <p className="text-xs font-bold text-white px-1 py-1">{established || "2010"}</p>
                )}
              </div>

              {/* School Status */}
              <div>
                <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">School Status</span>
                {isEditing ? (
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold cursor-pointer"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                ) : (
                  <div className="px-1 py-1">
                    <span className="inline-block text-[8px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                      {status || "Active"}
                    </span>
                  </div>
                )}
              </div>

              {/* School Type */}
              <div>
                <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">School Type</span>
                {isEditing ? (
                  <select
                    value={schoolType}
                    onChange={(e) => setSchoolType(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold cursor-pointer"
                  >
                    <option>Private</option>
                    <option>Government</option>
                  </select>
                ) : (
                  <div className="px-1 py-1">
                    <span className="inline-block text-[8px] font-black text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                      {schoolType || "Private"}
                    </span>
                  </div>
                )}
              </div>

              {/* Registration Number */}
              <div>
                <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Registration Number</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                  />
                ) : (
                  <p className="text-xs font-bold text-white px-1 py-1">{registrationNumber || "GD/REG/2010/4125"}</p>
                )}
              </div>

              {/* School Code */}
              <div>
                <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">School Code</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                  />
                ) : (
                  <p className="text-xs font-bold text-white px-1 py-1">{code || "GDAC2026"}</p>
                )}
              </div>

              {/* School Category */}
              <div>
                <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">School Category</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                  />
                ) : (
                  <div className="px-1 py-1">
                    <span className="inline-block text-[8px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                      {category || "Secondary"}
                    </span>
                  </div>
                )}
              </div>

              {/* School Motto */}
              <div className="sm:col-span-2">
                <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">School Motto</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={motto}
                    onChange={(e) => setMotto(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                  />
                ) : (
                  <p className="text-xs font-bold text-slate-200 px-1 py-1 italic">
                    &ldquo;{motto || "Learn • Grow • Succeed"}&rdquo;
                  </p>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* CARD 2: OVERVIEW STATISTICS */}
      <div className="bg-[#0D1326] border border-slate-800/80 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3 mb-5">
          <FaSchool className="text-purple-500 text-sm" />
          <h3 className="text-xs font-black uppercase text-slate-350 tracking-wider">Overview Statistics</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          
          {/* Total Students */}
          <div className="bg-[#131B35]/50 border border-slate-800/60 rounded-xl p-4 flex flex-col justify-between h-24">
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6] text-xs">
                <FaUsers />
              </div>
              <span className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">Total Students</span>
            </div>
            <div className="mt-1">
              <h4 className="text-lg font-black text-white">{school?.totalStudents ?? 0}</h4>
              <p className="text-[8px] font-bold text-emerald-400 flex items-center gap-0.5 mt-0.5">
                <FaArrowUp className="text-[7px]" /> 12 this month
              </p>
            </div>
          </div>

          {/* Total Teachers */}
          <div className="bg-[#131B35]/50 border border-slate-800/60 rounded-xl p-4 flex flex-col justify-between h-24">
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6] text-xs">
                <FaChalkboardTeacher />
              </div>
              <span className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">Total Teachers</span>
            </div>
            <div className="mt-1">
              <h4 className="text-lg font-black text-white">{school?.totalTeachers ?? 0}</h4>
              <p className="text-[8px] font-bold text-emerald-400 flex items-center gap-0.5 mt-0.5">
                <FaArrowUp className="text-[7px]" /> 2 this month
              </p>
            </div>
          </div>

          {/* Total Classes */}
          <div className="bg-[#131B35]/50 border border-slate-800/60 rounded-xl p-4 flex flex-col justify-between h-24">
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-[#10B981]/10 flex items-center justify-center text-[#10B981] text-xs">
                <FaSchool />
              </div>
              <span className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">Total Classes</span>
            </div>
            <div className="mt-1">
              <h4 className="text-lg font-black text-white">{school?.totalClasses ?? 0}</h4>
              <p className="text-[8px] font-bold text-slate-400 mt-0.5">No change</p>
            </div>
          </div>

          {/* Total Subjects */}
          <div className="bg-[#131B35]/50 border border-slate-800/60 rounded-xl p-4 flex flex-col justify-between h-24">
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B] text-xs">
                <FaBook />
              </div>
              <span className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">Total Subjects</span>
            </div>
            <div className="mt-1">
              <h4 className="text-lg font-black text-white">{school?.totalSubjects ?? 0}</h4>
              <p className="text-[8px] font-bold text-emerald-400 flex items-center gap-0.5 mt-0.5">
                <FaArrowUp className="text-[7px]" /> 3 this month
              </p>
            </div>
          </div>

          {/* Available Classes */}
          <div className="bg-[#131B35]/50 border border-slate-800/60 rounded-xl p-4 flex flex-col justify-between h-24">
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-[#14B8A6]/10 flex items-center justify-center text-[#14B8A6] text-xs">
                <FaCalendarAlt />
              </div>
              <span className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">Available Classes</span>
            </div>
            <div className="mt-1">
              {isEditing ? (
                <input
                  type="text"
                  value={availableClasses}
                  onChange={(e) => setAvailableClasses(e.target.value)}
                  className="w-full px-2 py-1 bg-[#0F172A] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                />
              ) : (
                <h4 className="text-xs sm:text-sm font-black text-white truncate">{availableClasses || "Class 1 to 10"}</h4>
              )}
              <p className="text-[8px] font-bold text-teal-400 mt-0.5">{classCountText}</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

export default BasicInfoTab;
