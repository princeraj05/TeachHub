import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const LanguageContext = createContext(null);

export const translations = {
  english: {
    // Nav & Sidebar
    status: "Status",
    notifications: "Notifications",
    event: "Event",
    events: "Events",
    school: "School",
    school_directory: "School Directory",
    profile: "Profile",
    my_profile: "My Profile",
    about_app: "About App",
    logout: "Logout",
    sign_out: "Sign Out of Account",
    dashboard: "Dashboard",
    attendance: "Attendance",
    mark_attendance: "Mark Attendance",
    my_diary: "My Diary",
    my_subjects: "My Subjects",
    my_classes: "My Classes",
    my_students: "My Students",
    exams: "Exams",
    conduct_exam: "Conduct Exam",
    support: "Support",
    help_support: "Help & Support",
    users: "Users",
    schools: "Schools",
    payments: "Payments",

    // Account & Profile
    account_details: "Account Details",
    personal_records: "PERSONAL & APPLICATION RECORDS",
    full_name: "FULL NAME",
    email_address: "EMAIL ADDRESS",
    phone_number: "PHONE NUMBER",
    target_school: "TARGET SCHOOL",
    target_admission_class: "TARGET ADMISSION CLASS",
    previous_class_passed: "PREVIOUS CLASS PASSED",
    previous_school_history: "PREVIOUS SCHOOL HISTORY",
    father_guardian_name: "FATHER / GUARDIAN NAME",
    father_mobile_number: "FATHER MOBILE NUMBER",
    qualification: "QUALIFICATION",
    teaching_experience: "TEACHING EXPERIENCE",
    previous_institute: "PREVIOUS INSTITUTE / SCHOOL WORKED AT",
    subjects_of_expertise: "SUBJECTS OF EXPERTISE",
    applicant_id: "APPLICANT ID",
    application_status: "APPLICATION STATUS",
    academic_session: "ACADEMIC SESSION",
    pending_review: "PENDING REVIEW",
    edit_info: "Edit Info",
    edit_profile: "Edit Profile",
    save_changes: "Save Changes",
    cancel: "Cancel",

    // Preferences & Settings
    app_preferences: "APP PREFERENCES",
    appearance: "Appearance",
    dark_mode_active: "Dark Mode Active",
    light_mode_active: "Light Mode Active",
    language: "Language",
    select_language: "Select Language",
    settings: "Settings",

    // Status Banner
    teacher_account_active: "Teacher Account Active!",
    student_account_active: "Student Account Active!",
    checking_status: "Checking status in real-time",
    browse_schools: "Browse Schools",
    wait_karo: "Status",

    // Confirm Modal
    confirm_logout: "Confirm Logout",
    logout_warning: "Are you sure you want to log out?",
    no: "No",
    yes: "Yes"
  },
  hindi: {
    // Nav & Sidebar
    status: "स्थिति (Status)",
    notifications: "सूचनाएं (Notifications)",
    event: "कार्यक्रम (Event)",
    events: "कार्यक्रम (Events)",
    school: "स्कूल (School)",
    school_directory: "स्कूल निर्देशिका",
    profile: "प्रोफ़ाइल (Profile)",
    my_profile: "मेरी प्रोफ़ाइल",
    about_app: "ऐप के बारे में",
    logout: "लॉगआउट (Logout)",
    sign_out: "अकाउंट से साइन आउट करें",
    dashboard: "डैशबोर्ड (Dashboard)",
    attendance: "उपस्थिति (Attendance)",
    mark_attendance: "उपस्थिति दर्ज करें",
    my_diary: "मेरी डायरी",
    my_subjects: "मेरे विषय",
    my_classes: "मेरी कक्षाएं",
    my_students: "मेरे छात्र",
    exams: "परीक्षाएं (Exams)",
    conduct_exam: "परीक्षा आयोजित करें",
    support: "सहायता (Support)",
    help_support: "सहायता और समर्थन",
    users: "उपयोगकर्ता (Users)",
    schools: "स्कूल (Schools)",
    payments: "भुगतान (Payments)",

    // Account & Profile
    account_details: "खाता विवरण (Account Details)",
    personal_records: "व्यक्तिगत एवं आवेदन रिकॉर्ड",
    full_name: "पूरा नाम (Full Name)",
    email_address: "ईमेल पता (Email Address)",
    phone_number: "फ़ोन नंबर (Phone Number)",
    target_school: "लक्षित स्कूल (Target School)",
    target_admission_class: "प्रवेश कक्षा (Target Class)",
    previous_class_passed: "उत्तीर्ण पिछली कक्षा",
    previous_school_history: "पिछला स्कूल इतिहास",
    father_guardian_name: "पिता/अभिभावक का नाम",
    father_mobile_number: "पिता का मोबाइल नंबर",
    qualification: "योग्यता (Qualification)",
    teaching_experience: "शिक्षण अनुभव (Teaching Exp)",
    previous_institute: "पूर्व कार्यरत संस्थान/स्कूल",
    subjects_of_expertise: "विशेषज्ञता के विषय",
    applicant_id: "आवेदक आईडी (Applicant ID)",
    application_status: "आवेदन की स्थिति",
    academic_session: "शैक्षणिक सत्र",
    pending_review: "समीक्षा लंबित (Pending Review)",
    edit_info: "जानकारी बदलें",
    edit_profile: "प्रोफ़ाइल बदलें",
    save_changes: "सहेजें (Save)",
    cancel: "रद्द करें (Cancel)",

    // Preferences & Settings
    app_preferences: "ऐप तर्जिहात (APP PREFERENCES)",
    appearance: "दिखावट (Appearance)",
    dark_mode_active: "डार्क मोड सक्रिय",
    light_mode_active: "लाइट मोड सक्रिय",
    language: "भाषा (Language)",
    select_language: "भाषा चुनें (Select Language)",
    settings: "सेटिंग्स (Settings)",

    // Status Banner
    teacher_account_active: "शिक्षक खाता सक्रिय!",
    student_account_active: "छात्र खाता सक्रिय!",
    checking_status: "वास्तविक समय में स्थिति जांची जा रही है",
    browse_schools: "स्कूल देखें (Browse Schools)",
    wait_karo: "स्थिति (Status)",

    // Confirm Modal
    confirm_logout: "लॉगआउट की पुष्टि करें",
    logout_warning: "क्या आप निश्चित रूप से लॉगआउट करना चाहते हैं?",
    no: "नहीं (No)",
    yes: "हाँ (Yes)"
  },
  punjabi: {
    // Nav & Sidebar
    status: "ਸਥਿਤੀ (Status)",
    notifications: "ਸੂਚਨਾਵਾਂ (Notifications)",
    event: "ਸਮਾਗਮ (Event)",
    events: "ਸਮਾਗਮ (Events)",
    school: "ਸਕੂਲ (School)",
    school_directory: "ਸਕੂਲ ਡਾਇਰੈਕਟਰੀ",
    profile: "ਪ੍ਰੋਫਾਈਲ (Profile)",
    my_profile: "ਮੇਰੀ ਪ੍ਰੋਫਾਈਲ",
    about_app: "ਐਪ ਬਾਰੇ",
    logout: "ਲੌਗਆਊਟ (Logout)",
    sign_out: "ਅਕਾਊਂਟ ਤੋਂ ਸਾਈਨ ਆਊਟ ਕਰੋ",
    dashboard: "ਡੈਸ਼ਬੋਰਡ (Dashboard)",
    attendance: "ਹਾਜ਼ਰੀ (Attendance)",
    mark_attendance: "ਹਾਜ਼ਰੀ ਲਗਾਓ",
    my_diary: "ਮੇਰੀ ਡਾਇਰੀ",
    my_subjects: "ਮੇਰੇ ਵਿਸ਼ੇ",
    my_classes: "ਮੇਰੀਆਂ ਜਮਾਤਾਂ",
    my_students: "ਮੇਰੇ ਵਿਦਿਆਰਥੀ",
    exams: "ਇਮਤਿਹਾਨ (Exams)",
    conduct_exam: "ਇਮਤਿਹਾਨ ਲਵੋ",
    support: "ਮਦਦ (Support)",
    help_support: "ਮਦਦ ਅਤੇ ਸਹਾਇਤਾ",
    users: "ਵਰਤੋਂਕਾਰ (Users)",
    schools: "ਸਕੂਲ (Schools)",
    payments: "ਭੁਗਤਾਨ (Payments)",

    // Account & Profile
    account_details: "ਅਕਾਊਂਟ ਵੇਰਵੇ (Account Details)",
    personal_records: "ਨਿੱਜੀ ਅਤੇ ਅਰਜ਼ੀ ਰਿਕਾਰਡ",
    full_name: "ਪੂਰਾ ਨਾਂ (Full Name)",
    email_address: "ਈਮੇਲ ਪਤਾ (Email Address)",
    phone_number: "ਫੋਨ ਨੰਬਰ (Phone Number)",
    target_school: "ਟਾਰਗੇਟ ਸਕੂਲ (Target School)",
    target_admission_class: "ਦਾਖਲਾ ਜਮਾਤ (Target Class)",
    previous_class_passed: "ਪਿਛਲੀ ਪਾਸ ਕੀਤੀ ਜਮਾਤ",
    previous_school_history: "ਪਿਛਲੇ ਸਕੂਲ ਦਾ ਇਤਿਹਾਸ",
    father_guardian_name: "ਪਿਤਾ/ਸਰਪ੍ਰਸਤ ਦਾ ਨਾਂ",
    father_mobile_number: "ਪਿਤਾ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ",
    qualification: "ਯੋਗਤਾ (Qualification)",
    teaching_experience: "ਅਧਿਆਪਨ ਤਜਰਬਾ (Teaching Exp)",
    previous_institute: "ਪਿਛਲਾ ਕੰਮ ਕੀਤਾ ਅਦਾਰਾ/ਸਕੂਲ",
    subjects_of_expertise: "ਮਾਹਰ ਵਿਸ਼ੇ",
    applicant_id: "ਆਰਜ਼ੀ ਆਈਡੀ (Applicant ID)",
    application_status: "ਅਰਜ਼ੀ ਦੀ ਸਥਿਤੀ",
    academic_session: "ਪੜ੍ਹਾਈ ਦਾ ਸੈਸ਼ਨ",
    pending_review: "ਸਮੀਖਿਆ ਬਾਕੀ (Pending Review)",
    edit_info: "ਜਾਣਕਾਰੀ ਸੋਧੋ",
    edit_profile: "ਪ੍ਰੋਫਾਈਲ ਸੋਧੋ",
    save_changes: "ਸੰਭਾਲੋ (Save)",
    cancel: "ਰੱਦ ਕਰੋ (Cancel)",

    // Preferences & Settings
    app_preferences: "ਐਪ ਤਰਜੀਹਾਂ (APP PREFERENCES)",
    appearance: "ਦਿੱਖ (Appearance)",
    dark_mode_active: "ਡਾਰਕ ਮੋਡ ਚਾਲੂ",
    light_mode_active: "ਲਾਈਟ ਮੋਡ ਚਾਲੂ",
    language: "ਭਾਸ਼ਾ (Language)",
    select_language: "ਭਾਸ਼ਾ ਚੁਣੋ (Select Language)",
    settings: "ਸੈਟਿੰਗਾਂ (Settings)",

    // Status Banner
    teacher_account_active: "ਅਧਿਆਪਕ ਖਾਤਾ ਚਾਲੂ!",
    student_account_active: "ਵਿਦਿਆਰਥੀ ਖਾਤਾ ਚਾਲੂ!",
    checking_status: "ਅਸਲ ਸਮੇਂ ਵਿੱਚ ਸਥਿਤੀ ਦੀ ਜਾਂਚ ਹੋ ਰਹੀ ਹੈ",
    browse_schools: "ਸਕੂਲ ਵੇਖੋ (Browse Schools)",
    wait_karo: "ਸਥਿਤੀ (Status)",

    // Confirm Modal
    confirm_logout: "ਲੌਗਆਊਟ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ",
    logout_warning: "ਕੀ ਤੁਸੀਂ ਯਕੀਨੀ ਤੌਰ 'ਤੇ ਲੌਗਆਊਟ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?",
    no: "ਨਹੀਂ (No)",
    yes: "ਹਾਂ (Yes)"
  }
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    const defaultLang = (localStorage.getItem("teachhub_language") || "English").toLowerCase();
    const t = (key, fallback) => {
      if (translations[defaultLang] && translations[defaultLang][key]) {
        return translations[defaultLang][key];
      }
      if (translations.english && translations.english[key]) {
        return translations.english[key];
      }
      return fallback || key;
    };
    return {
      language: localStorage.getItem("teachhub_language") || "English",
      changeLanguage: () => {},
      t
    };
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(
    localStorage.getItem("teachhub_language") || "English"
  );

  const syncLanguageFromStorage = () => {
    const stored = localStorage.getItem("teachhub_language") || "English";
    setLanguageState(stored);
  };

  useEffect(() => {
    window.addEventListener("profileUpdate", syncLanguageFromStorage);
    window.addEventListener("languageChange", syncLanguageFromStorage);
    return () => {
      window.removeEventListener("profileUpdate", syncLanguageFromStorage);
      window.removeEventListener("languageChange", syncLanguageFromStorage);
    };
  }, []);

  const changeLanguage = async (newLang) => {
    setLanguageState(newLang);
    localStorage.setItem("teachhub_language", newLang);
    window.dispatchEvent(new Event("languageChange"));

    const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await axios.put(
          `${API}/api/auth/profile`,
          { language: newLang },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("Failed to sync language to backend:", err);
      }
    }
  };

  const t = (key, fallback) => {
    const langKey = (language || "English").toLowerCase();
    if (translations[langKey] && translations[langKey][key]) {
      return translations[langKey][key];
    }
    if (translations.english && translations.english[key]) {
      return translations.english[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
