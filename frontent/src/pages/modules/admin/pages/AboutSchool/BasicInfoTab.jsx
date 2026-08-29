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
  const [detectingLocation, setDetectingLocation] = React.useState(false);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "en"
              }
            }
          );
          if (res.data && res.data.display_name) {
            setAddress(res.data.display_name);
          } else {
            setAddress(`${latitude}, ${longitude}`);
          }
        } catch (err) {
          setAddress(`${latitude}, ${longitude}`);
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        alert("Failed to get location: " + error.message);
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

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
      <div className="bg-white dark:bg-[#0D1326] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800/60 pb-3 mb-5">
          <FaSchool className="text-purple-500 text-sm" />
          <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-350 tracking-wider">Basic Information</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* School Logo (Left) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center">
            <div className="rounded-full overflow-hidden border-4 border-slate-800/80 w-36 h-36 bg-slate-900 flex items-center justify-center relative group shadow-xl">
              <img
                src={photo || "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=200&h=200&q=80"}
                alt="School Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=200&h=200&q=80";
                }}
              />
              {isEditing && (
                <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-3 text-center transition-opacity duration-200">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">School Logo</span>
                  <input
                    type="file"
                    id="main-logo-file-input"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById("main-logo-file-input").click()}
                    className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-[9px] text-white font-extrabold transition cursor-pointer select-none"
                  >
                    Upload Logo
                  </button>
                  <span className="text-[7px] text-slate-500 mt-1.5">Square 1:1 Ratio</span>
                </div>
              )}
            </div>
            <span className="text-[10px] font-bold text-slate-400 mt-3 select-none">Official School Logo Badge</span>
          </div>

          {/* Profile Fields (Right) */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              
              {/* School Name */}
              <div>
                <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">School Name</span>
                <p className="text-xs font-bold text-white bg-[#0F172A]/40 border border-slate-850 px-3.5 py-2 rounded-xl text-slate-400">
                  {school?.name || "G.D Academy"}
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
                <div className="flex items-center justify-between mb-1">
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">School Address</span>
                  {isEditing && (
                    <button
                      type="button"
                      disabled={detectingLocation}
                      onClick={handleGetCurrentLocation}
                      className="text-[9px] font-black text-[#7C3AED] dark:text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer bg-transparent hover:underline"
                    >
                      📍 {detectingLocation ? "Detecting location..." : "Choose your current location"}
                    </button>
                  )}
                </div>
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
      <div className="bg-white dark:bg-[#0D1326] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm dark:shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800/60 pb-3 mb-5">
          <FaSchool className="text-purple-500 text-sm" />
          <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-350 tracking-wider">Overview Statistics</h3>
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
