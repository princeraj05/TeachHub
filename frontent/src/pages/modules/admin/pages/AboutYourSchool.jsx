import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaCheckCircle,
  FaInfoCircle,
  FaEdit,
  FaTimes,
  FaLock
} from "react-icons/fa";

// Import sub-navigation tab components
import BasicInfoTab from "./AboutSchool/BasicInfoTab";
import MediaPrincipalTab from "./AboutSchool/MediaPrincipalTab";
import AdmissionSettingsTab from "./AboutSchool/AdmissionSettingsTab";
import SchoolDescriptionTab from "./AboutSchool/SchoolDescriptionTab";

import API_URL from "../../../../config/api";

const SORA = "'Sora', sans-serif";

const TABS = [
  { id: "basic", label: "Basic Information", breadcrumb: "Basic Information" },
  { id: "media", label: "School Media & Principal Profile", breadcrumb: "School Media & Principal Profile" },
  { id: "admission", label: "Admission & Settings", breadcrumb: "Admission & Settings" },
  { id: "description", label: "School Description", breadcrumb: "School Description" }
];

function AboutYourSchool() {
  const API = API_URL;
  const token = localStorage.getItem("token");

  // Tabs state
  const [activeTab, setActiveTab] = useState("basic");

  // General state
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Tab 1: Basic Information form states
  const [principalName, setPrincipalName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [established, setEstablished] = useState("");
  const [schoolType, setSchoolType] = useState("");
  const [code, setCode] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [medium, setMedium] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState("Active");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [category, setCategory] = useState("");
  const [motto, setMotto] = useState("");
  const [photo, setPhoto] = useState("");
  const [availableClasses, setAvailableClasses] = useState("");

  // Tab 2: School Media & Principal details states
  const [coverImage, setCoverImage] = useState("");
  const [coverPosition, setCoverPosition] = useState(50);
  const [schoolPhotos, setSchoolPhotos] = useState([]);
  const [principalPhoto, setPrincipalPhoto] = useState("");
  const [principalDesignation, setPrincipalDesignation] = useState("");
  const [principalEmail, setPrincipalEmail] = useState("");
  const [principalPhone, setPrincipalPhone] = useState("");
  const [principalLeadershipSince, setPrincipalLeadershipSince] = useState("");
  const [principalIntroduction, setPrincipalIntroduction] = useState("");

  // Tab 3: Admission & Settings states
  const [schoolCategoriesList, setSchoolCategoriesList] = useState([]);
  const [admissionProcess, setAdmissionProcess] = useState([]);
  const [schoolBoardType, setSchoolBoardType] = useState("");
  const [workingDays, setWorkingDays] = useState([]);
  const [openingTime, setOpeningTime] = useState("");
  const [closingTime, setClosingTime] = useState("");
  const [shortBreakStartTime, setShortBreakStartTime] = useState("");
  const [shortBreakDuration, setShortBreakDuration] = useState(30);
  const [lunchBreakStartTime, setLunchBreakStartTime] = useState("");
  const [lunchBreakDuration, setLunchBreakDuration] = useState(60);
  const [holidays, setHolidays] = useState([]);

  // Tab 4: Description state
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchSchoolData();
  }, []);

  const fetchSchoolData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API}/api/schools/my-school`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });

      if (res.data && (res.data.success || res.data.school)) {
        const s = res.data.school || res.data;
        const stats = res.data.statistics || {};
        setSchool({ ...s, ...stats });

        // Tab 1 fields
        setPrincipalName(s.principalName || "");
        setEmail(s.email || "");
        setPhoneNumber(s.phoneNumber || "");
        setAddress(s.address || "");
        setEstablished(s.established || "");
        setSchoolType(s.schoolType || "");
        setCode(s.code || "");
        setAffiliation(s.affiliation || "");
        setAcademicYear(s.academicYear || "");
        setMedium(s.medium || "");
        setWebsite(s.website || "");
        setStatus(s.status || "Active");
        setRegistrationNumber(s.registrationNumber || "");
        setCategory(s.category || "");
        setMotto(s.motto || "");
        setPhoto(s.photo || "");
        setAvailableClasses(s.availableClasses || "");

        // Tab 2 fields
        setCoverImage(s.coverImage || "");
        setCoverPosition(s.coverPosition !== undefined && s.coverPosition !== null ? s.coverPosition : 50);
        setSchoolPhotos(s.schoolPhotos || []);
        setPrincipalPhoto(s.principalPhoto || "");
        setPrincipalDesignation(s.principalDesignation || "");
        setPrincipalEmail(s.principalEmail || "");
        setPrincipalPhone(s.principalPhone || "");
        if (s.principalLeadershipSince) {
          setPrincipalLeadershipSince(s.principalLeadershipSince.split("T")[0]);
        } else {
          setPrincipalLeadershipSince("");
        }
        setPrincipalIntroduction(s.principalIntroduction || "");

        // Tab 3 fields
        setSchoolCategoriesList(s.schoolCategoriesList || []);
        setAdmissionProcess(Array.isArray(s.admissionProcess) ? s.admissionProcess : (s.admissionProcess ? [s.admissionProcess] : []));
        setSchoolBoardType(s.schoolBoardType || "");
        setWorkingDays(s.workingDays || []);
        setOpeningTime(s.openingTime || "");
        setClosingTime(s.closingTime || "");
        setShortBreakStartTime(s.shortBreakStartTime || "");
        setShortBreakDuration(s.shortBreakDuration ?? 30);
        setLunchBreakStartTime(s.lunchBreakStartTime || "");
        setLunchBreakDuration(s.lunchBreakDuration ?? 60);
        setHolidays(s.holidays || []);

        // Tab 4 fields
        setDescription(s.description || "");
      }
    } catch (err) {
      console.error("Error fetching school data:", err);
      setError(err.response?.data?.message || "Failed to load school profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSuccess("");
    setError("");

    try {
      const payload = {
        // Tab 1 fields
        principalName,
        email,
        phoneNumber,
        address,
        established,
        schoolType,
        code,
        affiliation,
        academicYear,
        medium,
        website,
        status,
        registrationNumber,
        category,
        motto,
        photo,
        availableClasses,

        // Tab 2 fields
        coverImage,
        coverPosition,
        schoolPhotos,
        principalPhoto,
        principalDesignation,
        principalEmail,
        principalPhone,
        principalLeadershipSince,
        principalIntroduction,

        // Tab 3 fields
        schoolCategoriesList,
        admissionProcess,
        schoolBoardType,
        workingDays,
        openingTime,
        closingTime,
        shortBreakStartTime,
        shortBreakDuration,
        lunchBreakStartTime,
        lunchBreakDuration,
        holidays,

        // Tab 4 fields
        description
      };

      const res = await axios.put(`${API}/api/schools/my-school`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.success || res.data?.school) {
        setSuccess(res.data.message || "School details saved successfully!");
        setIsEditing(false);
        if (res.data.school) {
          const s = res.data.school;
          const stats = res.data.statistics || {};
          setSchool({ ...s, ...stats });
        }
        setTimeout(() => setSuccess(""), 4000);
      }
    } catch (err) {
      console.error("Error saving school details:", err);
      setError(err.response?.data?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-slate-500 dark:text-slate-400 bg-transparent p-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-sm font-semibold tracking-wide">Loading School Profile...</p>
      </div>
    );
  }

  // Tab completion calculation (25% per tab: 0%, 25%, 50%, 75%, 100%)
  const isBasicFilled = Boolean(
    email?.trim() ||
    phoneNumber?.trim() ||
    address?.trim() ||
    affiliation?.trim() ||
    code?.trim() ||
    established?.trim()
  );

  const isMediaFilled = Boolean(
    principalName?.trim() ||
    principalEmail?.trim() ||
    principalPhone?.trim() ||
    principalPhoto?.trim() ||
    coverImage?.trim() ||
    (schoolPhotos && schoolPhotos.length > 0)
  );

  const isAdmissionFilled = Boolean(
    (workingDays && workingDays.length > 0) ||
    openingTime?.trim() ||
    closingTime?.trim() ||
    schoolBoardType?.trim() ||
    (admissionProcess && admissionProcess.length > 0)
  );

  const isDescriptionFilled = Boolean(
    description && description.replace(/<[^>]*>/g, "").trim().length > 20
  );

  const filledCount =
    (isBasicFilled ? 1 : 0) +
    (isMediaFilled ? 1 : 0) +
    (isAdmissionFilled ? 1 : 0) +
    (isDescriptionFilled ? 1 : 0);

  const profileCompletionPercentage = filledCount * 25;

  // Get active breadcrumb name
  const currentTabObj = TABS.find(t => t.id === activeTab) || TABS[0];

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 p-6 -m-4 md:-m-6 transition-colors duration-200" style={{ fontFamily: SORA }}>
      
      {/* ── TOP HEADER & BREADCRUMBS ── */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mb-1">
            <span>About Your School</span>
            <span>&gt;</span>
            <span className="text-purple-500">{currentTabObj.breadcrumb}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            About Your School
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 animate-fadeIn">
            Manage your school's details, media, admissions policies, and profile settings.
          </p>
        </div>

        {/* Edit Button (Only visible/applicable for Basic Info, other tabs have direct inputs) */}
        {activeTab === "basic" && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition self-start sm:self-auto cursor-pointer"
          >
            {isEditing ? (
              <>
                <FaTimes className="text-sm" /> Cancel Editing
              </>
            ) : (
              <>
                <FaEdit className="text-sm" /> Edit School Information
              </>
            )}
          </button>
        )}
      </div>

      {/* ── PROFILE COMPLETION PROGRESS BAR ── */}
      <div className="mb-6 bg-white dark:bg-[#0D1326] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-xl select-none animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
              profileCompletionPercentage === 100
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20"
            }`}>
              {profileCompletionPercentage}%
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-wider flex items-center gap-2">
                School Profile Completion
                {profileCompletionPercentage === 100 && (
                  <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase">
                    ✓ 100% Completed
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {filledCount} of 4 navigation sections completed (25% per filled section)
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {profileCompletionPercentage}% Completed
            </span>
          </div>
        </div>

        {/* Dynamic progress bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              profileCompletionPercentage === 100
                ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                : profileCompletionPercentage >= 50
                ? "bg-gradient-to-r from-purple-600 to-indigo-500"
                : "bg-gradient-to-r from-amber-500 to-purple-600"
            }`}
            style={{ width: `${profileCompletionPercentage}%` }}
          />
        </div>

        {/* Tab status checklist badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-[10px] font-bold">
          <div className={`flex items-center gap-1.5 ${isBasicFilled ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
            <span>{isBasicFilled ? "✓" : "○"}</span> 1. Basic Info ({isBasicFilled ? "25%" : "0%"})
          </div>
          <div className={`flex items-center gap-1.5 ${isMediaFilled ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
            <span>{isMediaFilled ? "✓" : "○"}</span> 2. Media & Principal ({isMediaFilled ? "25%" : "0%"})
          </div>
          <div className={`flex items-center gap-1.5 ${isAdmissionFilled ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
            <span>{isAdmissionFilled ? "✓" : "○"}</span> 3. Admission ({isAdmissionFilled ? "25%" : "0%"})
          </div>
          <div className={`flex items-center gap-1.5 ${isDescriptionFilled ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
            <span>{isDescriptionFilled ? "✓" : "○"}</span> 4. Description ({isDescriptionFilled ? "25%" : "0%"})
          </div>
        </div>
      </div>

      {/* ── TABS NAVIGATION BAR ── */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-800/80 pb-3 select-none">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          let isTabFilled = false;
          if (tab.id === "basic") isTabFilled = isBasicFilled;
          if (tab.id === "media") isTabFilled = isMediaFilled;
          if (tab.id === "admission") isTabFilled = isAdmissionFilled;
          if (tab.id === "description") isTabFilled = isDescriptionFilled;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer select-none ${
                isActive
                  ? "bg-[#7C3AED]/10 text-purple-600 dark:text-purple-400 border border-[#7C3AED]/30"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>{tab.label}</span>
              {isTabFilled ? (
                <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  ✓ 25%
                </span>
              ) : (
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                  0%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── STATUS MESSAGES ── */}
      {success && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm mb-6 animate-fadeIn">
          <FaCheckCircle className="text-emerald-500 text-lg shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-455 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm mb-6 animate-fadeIn">
          <FaInfoCircle className="text-rose-500 text-lg shrink-0" />
          {error}
        </div>
      )}

      {/* ── ACTIVE TAB VIEW CONTENT ── */}
      <div className="mb-6">
        {activeTab === "basic" && (
          <BasicInfoTab
            school={school}
            isEditing={isEditing}
            principalName={principalName} setPrincipalName={setPrincipalName}
            affiliation={affiliation} setAffiliation={setAffiliation}
            academicYear={academicYear} setAcademicYear={setAcademicYear}
            email={email} setEmail={setEmail}
            medium={medium} setMedium={setMedium}
            phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber}
            website={website} setWebsite={setWebsite}
            address={address} setAddress={setAddress}
            established={established} setEstablished={setEstablished}
            status={status} setStatus={setStatus}
            schoolType={schoolType} setSchoolType={setSchoolType}
            registrationNumber={registrationNumber} setRegistrationNumber={setRegistrationNumber}
            code={code} setCode={setCode}
            category={category} setCategory={setCategory}
            motto={motto} setMotto={setMotto}
            photo={photo} setPhoto={setPhoto}
            availableClasses={availableClasses} setAvailableClasses={setAvailableClasses}
            API={API}
          />
        )}

        {activeTab === "media" && (
          <MediaPrincipalTab
            coverImage={coverImage} setCoverImage={setCoverImage}
            coverPosition={coverPosition} setCoverPosition={setCoverPosition}
            schoolPhotos={schoolPhotos} setSchoolPhotos={setSchoolPhotos}
            principalPhoto={principalPhoto} setPrincipalPhoto={setPrincipalPhoto}
            principalName={principalName} setPrincipalName={setPrincipalName}
            principalDesignation={principalDesignation} setPrincipalDesignation={setPrincipalDesignation}
            principalEmail={principalEmail} setPrincipalEmail={setPrincipalEmail}
            principalPhone={principalPhone} setPrincipalPhone={setPrincipalPhone}
            principalLeadershipSince={principalLeadershipSince} setPrincipalLeadershipSince={setPrincipalLeadershipSince}
            principalIntroduction={principalIntroduction} setPrincipalIntroduction={setPrincipalIntroduction}
            API={API}
          />
        )}

        {activeTab === "admission" && (
          <AdmissionSettingsTab
            schoolCategoriesList={schoolCategoriesList} setSchoolCategoriesList={setSchoolCategoriesList}
            admissionProcess={admissionProcess} setAdmissionProcess={setAdmissionProcess}
            schoolBoardType={schoolBoardType} setSchoolBoardType={setSchoolBoardType}
            workingDays={workingDays} setWorkingDays={setWorkingDays}
            openingTime={openingTime} setOpeningTime={setOpeningTime}
            closingTime={closingTime} setClosingTime={setClosingTime}
            shortBreakStartTime={shortBreakStartTime} setShortBreakStartTime={setShortBreakStartTime}
            shortBreakDuration={shortBreakDuration} setShortBreakDuration={setShortBreakDuration}
            lunchBreakStartTime={lunchBreakStartTime} setLunchBreakStartTime={setLunchBreakStartTime}
            lunchBreakDuration={lunchBreakDuration} setLunchBreakDuration={setLunchBreakDuration}
            holidays={holidays} setHolidays={setHolidays}
          />
        )}

        {activeTab === "description" && (
          <SchoolDescriptionTab
            description={description} setDescription={setDescription}
            schoolName={school?.name || "G.D Academy"}
          />
        )}
      </div>

      {/* ── FOOTER ACTIONS (FOR NON-BASIC TABS OR EDIT MODE BASIC TAB) ── */}
      {(activeTab !== "basic" || isEditing) && (
        <div className="bg-white dark:bg-[#0D1326] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm dark:shadow-xl select-none animate-fadeIn">
          <div className="flex items-center gap-3 text-blue-500 dark:text-blue-400">
            <FaInfoCircle className="text-lg shrink-0" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-350">
              Keep your school information updated. This information is visible to parents and students.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer w-full sm:w-auto justify-center"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FaLock className="text-xs" /> Save Changes
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
}

export default AboutYourSchool;
