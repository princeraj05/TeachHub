// frontent/src/pages/modules/admin/pages/AboutYourSchool.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FaCheckCircle, FaInfoCircle, FaLock } from "react-icons/fa";

// Modular tab components
import BasicInfoTab from "./AboutSchool/BasicInfoTab";
import MediaPrincipalTab from "./AboutSchool/MediaPrincipalTab";
import AdmissionSettingsTab from "./AboutSchool/AdmissionSettingsTab";
import SchoolDescriptionTab from "./AboutSchool/SchoolDescriptionTab";

// Modular hooks
import { useBasicInfo } from "./AboutSchool/hooks/useBasicInfo";
import { useMediaPrincipal } from "./AboutSchool/hooks/useMediaPrincipal";
import { useAdmissionSettings } from "./AboutSchool/hooks/useAdmissionSettings";
import { useSchoolDescription } from "./AboutSchool/hooks/useSchoolDescription";
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

  // Tab state
  const [activeTab, setActiveTab] = useState("basic");

  // Section custom hooks with True Lazy Loading
  const basic = useBasicInfo({ enabled: activeTab === "basic" });
  const media = useMediaPrincipal({ enabled: activeTab === "media" });
  const admission = useAdmissionSettings({ enabled: activeTab === "admission" });
  const desc = useSchoolDescription({ enabled: activeTab === "description" });

  // Completion breakdown state
  const [completion, setCompletion] = useState({
    basicInformation: 0,
    mediaPrincipal: 0,
    admissionSettings: 0,
    description: 0,
    total: 0
  });

  const fetchCompletion = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/schools/my-school/completion`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.breakdown) {
        setCompletion(res.data.breakdown);
      }
    } catch (err) {
      console.warn("Failed to fetch completion breakdown:", err.message);
    }
  }, [API, token]);

  useEffect(() => {
    fetchCompletion();
  }, [fetchCompletion]);

  const currentTabObj = TABS.find(t => t.id === activeTab) || TABS[0];

  // Helper for tab saving
  const handleSaveActiveTab = async () => {
    let ok = false;
    if (activeTab === "basic") ok = await basic.saveBasicInfo();
    if (activeTab === "media") ok = await media.saveMediaPrincipal();
    if (activeTab === "admission") ok = await admission.saveAdmissionSettings();
    if (activeTab === "description") ok = await desc.saveDescription();
    if (ok) fetchCompletion();
  };

  const isSaving = basic.saving || media.saving || admission.saving || desc.saving;

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 p-6 -m-4 md:-m-6 transition-colors duration-200" style={{ fontFamily: SORA }}>
      
      

      {/* ── TABS NAVIGATION BAR ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-slate-200 dark:border-slate-800/80 pb-3 select-none">
        <div className="flex flex-wrap items-center gap-2">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            let val = 0;
            if (tab.id === "basic") val = completion.basicInformation;
            if (tab.id === "media") val = completion.mediaPrincipal;
            if (tab.id === "admission") val = completion.admissionSettings;
            if (tab.id === "description") val = completion.description;

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
                {val > 0 ? (
                  <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                    ✓ {val}%
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

        {/* Small School Profile Completion Box next to School Description */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#0D1326] border border-slate-200/80 dark:border-slate-800/80 rounded-xl px-3 py-1.5 shadow-xs text-xs font-bold">
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">Profile Completion:</span>
          <span className={`px-2 py-0.5 rounded-lg text-[11px] font-extrabold ${
            completion.total === 100
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20"
          }`}>
            {completion.total}% Completed
          </span>
        </div>
      </div>

      {/* ── STATUS MESSAGES FOR ACTIVE SECTION ── */}
      {activeTab === "basic" && basic.success && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm mb-6 animate-fadeIn">
          <FaCheckCircle className="text-emerald-500 text-lg shrink-0" />
          {basic.success}
        </div>
      )}
      {activeTab === "basic" && basic.error && (
        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm mb-6 animate-fadeIn">
          <FaInfoCircle className="text-rose-500 text-lg shrink-0" />
          {basic.error}
        </div>
      )}

      {activeTab === "media" && media.success && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm mb-6 animate-fadeIn">
          <FaCheckCircle className="text-emerald-500 text-lg shrink-0" />
          {media.success}
        </div>
      )}
      {activeTab === "media" && media.error && (
        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm mb-6 animate-fadeIn">
          <FaInfoCircle className="text-rose-500 text-lg shrink-0" />
          {media.error}
        </div>
      )}

      {activeTab === "admission" && admission.success && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm mb-6 animate-fadeIn">
          <FaCheckCircle className="text-emerald-500 text-lg shrink-0" />
          {admission.success}
        </div>
      )}
      {activeTab === "admission" && admission.error && (
        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm mb-6 animate-fadeIn">
          <FaInfoCircle className="text-rose-500 text-lg shrink-0" />
          {admission.error}
        </div>
      )}

      {activeTab === "description" && desc.success && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm mb-6 animate-fadeIn">
          <FaCheckCircle className="text-emerald-500 text-lg shrink-0" />
          {desc.success}
        </div>
      )}
      {activeTab === "description" && desc.error && (
        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm mb-6 animate-fadeIn">
          <FaInfoCircle className="text-rose-500 text-lg shrink-0" />
          {desc.error}
        </div>
      )}

      {/* ── ACTIVE TAB VIEW CONTENT ── */}
      <div className="mb-6">
        {activeTab === "basic" && (
          <BasicInfoTab
            school={basic.formData}
            isEditing={true}
            principalName={basic.formData.principalName} setPrincipalName={val => basic.updateField("principalName", val)}
            affiliation={basic.formData.affiliation} setAffiliation={val => basic.updateField("affiliation", val)}
            academicYear={basic.formData.academicYear} setAcademicYear={val => basic.updateField("academicYear", val)}
            email={basic.formData.email} setEmail={val => basic.updateField("email", val)}
            medium={basic.formData.medium} setMedium={val => basic.updateField("medium", val)}
            phoneNumber={basic.formData.phoneNumber} setPhoneNumber={val => basic.updateField("phoneNumber", val)}
            website={basic.formData.website} setWebsite={val => basic.updateField("website", val)}
            address={basic.formData.address} setAddress={val => basic.updateField("address", val)}
            established={basic.formData.established} setEstablished={val => basic.updateField("established", val)}
            status={basic.formData.status} setStatus={val => basic.updateField("status", val)}
            schoolType={basic.formData.schoolType} setSchoolType={val => basic.updateField("schoolType", val)}
            registrationNumber={basic.formData.registrationNumber} setRegistrationNumber={val => basic.updateField("registrationNumber", val)}
            code={basic.formData.code} setCode={val => basic.updateField("code", val)}
            category={basic.formData.category} setCategory={val => basic.updateField("category", val)}
            motto={basic.formData.motto} setMotto={val => basic.updateField("motto", val)}
            photo={basic.formData.photo} setPhoto={val => basic.updateField("photo", val)}
            availableClasses={basic.formData.availableClasses} setAvailableClasses={val => basic.updateField("availableClasses", val)}
            API={API}
          />
        )}

        {activeTab === "media" && (
          <MediaPrincipalTab
            coverImage={media.formData.coverImage} setCoverImage={val => media.updateField("coverImage", val)}
            coverPosition={media.formData.coverPosition} setCoverPosition={val => media.updateField("coverPosition", val)}
            schoolPhotos={media.formData.schoolPhotos} setSchoolPhotos={val => media.updateField("schoolPhotos", val)}
            principalPhoto={media.formData.principalPhoto} setPrincipalPhoto={val => media.updateField("principalPhoto", val)}
            principalName={media.formData.principalName} setPrincipalName={val => media.updateField("principalName", val)}
            principalDesignation={media.formData.principalDesignation} setPrincipalDesignation={val => media.updateField("principalDesignation", val)}
            principalEmail={media.formData.principalEmail} setPrincipalEmail={val => media.updateField("principalEmail", val)}
            principalPhone={media.formData.principalPhone} setPrincipalPhone={val => media.updateField("principalPhone", val)}
            principalLeadershipSince={media.formData.principalLeadershipSince} setPrincipalLeadershipSince={val => media.updateField("principalLeadershipSince", val)}
            principalIntroduction={media.formData.principalIntroduction} setPrincipalIntroduction={val => media.updateField("principalIntroduction", val)}
            API={API}
          />
        )}

        {activeTab === "admission" && (
          <AdmissionSettingsTab
            schoolCategoriesList={admission.formData.schoolCategoriesList} setSchoolCategoriesList={val => admission.updateField("schoolCategoriesList", val)}
            admissionProcess={admission.formData.admissionProcess} setAdmissionProcess={val => admission.updateField("admissionProcess", val)}
            schoolBoardType={admission.formData.schoolBoardType} setSchoolBoardType={val => admission.updateField("schoolBoardType", val)}
            workingDays={admission.formData.workingDays} setWorkingDays={val => admission.updateField("workingDays", val)}
            openingTime={admission.formData.openingTime} setOpeningTime={val => admission.updateField("openingTime", val)}
            closingTime={admission.formData.closingTime} setClosingTime={val => admission.updateField("closingTime", val)}
            shortBreakStartTime={admission.formData.shortBreakStartTime} setShortBreakStartTime={val => admission.updateField("shortBreakStartTime", val)}
            shortBreakDuration={admission.formData.shortBreakDuration} setShortBreakDuration={val => admission.updateField("shortBreakDuration", val)}
            lunchBreakStartTime={admission.formData.lunchBreakStartTime} setLunchBreakStartTime={val => admission.updateField("lunchBreakStartTime", val)}
            lunchBreakDuration={admission.formData.lunchBreakDuration} setLunchBreakDuration={val => admission.updateField("lunchBreakDuration", val)}
            holidays={admission.formData.holidays} setHolidays={val => admission.updateField("holidays", val)}
            admissionStartDate={admission.formData.admissionStartDate} setAdmissionStartDate={val => admission.updateField("admissionStartDate", val)}
            admissionLastDate={admission.formData.admissionLastDate} setAdmissionLastDate={val => admission.updateField("admissionLastDate", val)}
            alwaysOpenAdmission={admission.formData.alwaysOpenAdmission} setAlwaysOpenAdmission={val => admission.updateField("alwaysOpenAdmission", val)}
          />
        )}

        {activeTab === "description" && (
          <SchoolDescriptionTab
            description={desc.description} setDescription={desc.setDescription}
            schoolName={basic.formData.name || "Your School"}
          />
        )}
      </div>

      {/* ── FOOTER ACTIONS (SAVE ONLY ACTIVE SECTION) ── */}
      <div className="bg-white dark:bg-[#0D1326] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm dark:shadow-xl select-none animate-fadeIn">
        <div className="flex items-center gap-3 text-blue-500 dark:text-blue-400">
          <FaInfoCircle className="text-lg shrink-0" />
          <p className="text-xs font-bold text-slate-600 dark:text-slate-350">
            Saving updates ONLY the currently active section ({currentTabObj.label}). Other modules remain completely untouched.
          </p>
        </div>
        <button
          onClick={handleSaveActiveTab}
          disabled={isSaving}
          className="flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer w-full sm:w-auto justify-center"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <FaLock className="text-xs" /> Save {currentTabObj.label}
            </>
          )}
        </button>
      </div>

    </div>
  );
}

export default AboutYourSchool;
