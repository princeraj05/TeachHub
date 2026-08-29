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

const SORA = "'Sora', sans-serif";

const TABS = [
  { id: "basic", label: "Basic Information", breadcrumb: "Basic Information" },
  { id: "media", label: "School Media & Principal Profile", breadcrumb: "School Media & Principal Profile" },
  { id: "admission", label: "Admission & Settings", breadcrumb: "Admission & Settings" },
  { id: "description", label: "School Description", breadcrumb: "School Description" }
];

function AboutYourSchool() {
  const API = import.meta.env.VITE_API_URL;
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
  const [status, setStatus] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [category, setCategory] = useState("");
  const [motto, setMotto] = useState("");
  const [photo, setPhoto] = useState("");
  const [availableClasses, setAvailableClasses] = useState("");

  // Tab 2: School Media & Principal details states
  const [coverImage, setCoverImage] = useState("");
  const [schoolPhotos, setSchoolPhotos] = useState([]);
  const [principalPhoto, setPrincipalPhoto] = useState("");
  const [principalDesignation, setPrincipalDesignation] = useState("");
  const [principalEmail, setPrincipalEmail] = useState("");
  const [principalPhone, setPrincipalPhone] = useState("");
  const [principalLeadershipSince, setPrincipalLeadershipSince] = useState("");
  const [principalIntroduction, setPrincipalIntroduction] = useState("");

  // Tab 3: Admission & Settings states
  const [schoolCategoriesList, setSchoolCategoriesList] = useState([]);
  const [admissionProcess, setAdmissionProcess] = useState("Direct Admission");
  const [schoolBoardType, setSchoolBoardType] = useState("Private");
  const [teacherAppointmentBooking, setTeacherAppointmentBooking] = useState(true);
  const [appointmentBookingType, setAppointmentBookingType] = useState("Online Booking");
  const [appointmentAdvanceDays, setAppointmentAdvanceDays] = useState(7);
  const [appointmentMaxPerDay, setAppointmentMaxPerDay] = useState(5);
  const [appointmentDuration, setAppointmentDuration] = useState(30);
  const [workingDays, setWorkingDays] = useState(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [openingTime, setOpeningTime] = useState("08:00 AM");
  const [closingTime, setClosingTime] = useState("04:00 PM");
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
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;
      if (data) {
        setSchool(data);
        
        // Tab 1 fields
        setPrincipalName(data.principalName || "");
        setEmail(data.email || "");
        setPhoneNumber(data.phoneNumber || "");
        setAddress(data.address || "");
        setEstablished(data.established || "");
        setSchoolType(data.schoolType || "Private");
        setCode(data.code || "");
        setAffiliation(data.affiliation || "");
        setAcademicYear(data.academicYear || "");
        setMedium(data.medium || "");
        setWebsite(data.website || "");
        setStatus(data.status || "Active");
        setRegistrationNumber(data.registrationNumber || "");
        setCategory(data.category || "");
        setMotto(data.motto || "");
        setPhoto(data.photo || "");
        setAvailableClasses(data.availableClasses || "");

        // Tab 2 fields
        setCoverImage(data.coverImage || "");
        setSchoolPhotos(data.schoolPhotos || []);
        setPrincipalPhoto(data.principalPhoto || "");
        setPrincipalDesignation(data.principalDesignation || "Head of Institution");
        setPrincipalEmail(data.principalEmail || "");
        setPrincipalPhone(data.principalPhone || "");
        
        // Parse date for input type=date
        if (data.principalLeadershipSince) {
          const dateOnly = data.principalLeadershipSince.split("T")[0];
          setPrincipalLeadershipSince(dateOnly);
        } else {
          setPrincipalLeadershipSince("");
        }
        
        setPrincipalIntroduction(data.principalIntroduction || "");

        // Tab 3 fields
        setSchoolCategoriesList(data.schoolCategoriesList || []);
        setAdmissionProcess(data.admissionProcess || "Direct Admission");
        setSchoolBoardType(data.schoolBoardType || "Private");
        setTeacherAppointmentBooking(data.teacherAppointmentBooking !== false);
        setAppointmentBookingType(data.appointmentBookingType || "Online Booking");
        setAppointmentAdvanceDays(data.appointmentAdvanceDays || 7);
        setAppointmentMaxPerDay(data.appointmentMaxPerDay || 5);
        setAppointmentDuration(data.appointmentDuration || 30);
        setWorkingDays(data.workingDays || ["Mon", "Tue", "Wed", "Thu", "Fri"]);
        setOpeningTime(data.openingTime || "08:00 AM");
        setClosingTime(data.closingTime || "04:00 PM");
        setHolidays(data.holidays || []);

        // Tab 4 fields
        setDescription(data.description || "");
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
        teacherAppointmentBooking,
        appointmentBookingType,
        appointmentAdvanceDays,
        appointmentMaxPerDay,
        appointmentDuration,
        workingDays,
        openingTime,
        closingTime,
        holidays,

        // Tab 4 fields
        description
      };

      await axios.put(`${API}/api/schools/my-school`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess("School details saved successfully!");
      setIsEditing(false);
      setTimeout(() => setSuccess(""), 4000);
      fetchSchoolData();
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

      {/* ── TABS NAVIGATION BAR ── */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-800/80 pb-3 select-none">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer select-none ${
                isActive
                  ? "bg-[#7C3AED]/10 text-purple-600 dark:text-purple-400 border border-[#7C3AED]/30"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
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
            teacherAppointmentBooking={teacherAppointmentBooking} setTeacherAppointmentBooking={setTeacherAppointmentBooking}
            appointmentBookingType={appointmentBookingType} setAppointmentBookingType={setAppointmentBookingType}
            appointmentAdvanceDays={appointmentAdvanceDays} setAppointmentAdvanceDays={setAppointmentAdvanceDays}
            appointmentMaxPerDay={appointmentMaxPerDay} setAppointmentMaxPerDay={setAppointmentMaxPerDay}
            appointmentDuration={appointmentDuration} setAppointmentDuration={setAppointmentDuration}
            workingDays={workingDays} setWorkingDays={setWorkingDays}
            openingTime={openingTime} setOpeningTime={openingTime}
            closingTime={closingTime} setClosingTime={closingTime}
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
