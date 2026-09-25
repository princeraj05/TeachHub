// frontent/src/pages/modules/admin/pages/AboutSchool/hooks/useAdmissionSettings.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import API_URL from "../../../../../../config/api";

export function useAdmissionSettings(options = {}) {
  const { enabled = true } = options;
  const API = API_URL;
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    schoolCategoriesList: [],
    admissionProcess: [],
    schoolBoardType: "",
    workingDays: [],
    openingTime: "",
    closingTime: "",
    shortBreakStartTime: "",
    shortBreakDuration: 30,
    lunchBreakStartTime: "",
    lunchBreakDuration: 60,
    holidays: [],
    admissionStartDate: "01 Dec 2026",
    admissionLastDate: "31 May 2027",
    alwaysOpenAdmission: false
  });

  const fetchAdmissionSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API}/api/schools/my-school/admission-settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.admissionSettings) {
        const a = res.data.admissionSettings;
        setFormData({
          schoolCategoriesList: Array.isArray(a.schoolCategoriesList) ? a.schoolCategoriesList : [],
          admissionProcess: Array.isArray(a.admissionProcess) ? a.admissionProcess : (a.admissionProcess ? [a.admissionProcess] : []),
          schoolBoardType: a.schoolBoardType || "",
          workingDays: Array.isArray(a.workingDays) ? a.workingDays : [],
          openingTime: a.openingTime || "",
          closingTime: a.closingTime || "",
          shortBreakStartTime: a.shortBreakStartTime || "",
          shortBreakDuration: a.shortBreakDuration ?? 30,
          lunchBreakStartTime: a.lunchBreakStartTime || "",
          lunchBreakDuration: a.lunchBreakDuration ?? 60,
          holidays: Array.isArray(a.holidays) ? a.holidays : [],
          admissionStartDate: a.admissionStartDate || "01 Dec 2026",
          admissionLastDate: a.admissionLastDate || "31 May 2027",
          alwaysOpenAdmission: Boolean(a.alwaysOpenAdmission)
        });
      }
      setHasLoaded(true);
    } catch (err) {
      console.error("Error fetching admission settings:", err);
      setError(err.response?.data?.message || "Failed to load admission settings.");
    } finally {
      setLoading(false);
    }
  }, [API, token]);

  useEffect(() => {
    if (enabled && !hasLoaded) {
      fetchAdmissionSettings();
    }
  }, [enabled, hasLoaded, fetchAdmissionSettings]);

  const saveAdmissionSettings = async (dataToSave = formData) => {
    try {
      setSaving(true);
      setSuccess("");
      setError("");
      const res = await axios.put(`${API}/api/schools/my-school/admission-settings`, dataToSave, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.success) {
        setSuccess(res.data.message || "Admission & Settings saved successfully!");
        if (res.data.admissionSettings) {
          const a = res.data.admissionSettings;
          setFormData(prev => ({
            ...prev,
            ...a,
            schoolCategoriesList: Array.isArray(a.schoolCategoriesList) ? a.schoolCategoriesList : (Array.isArray(prev.schoolCategoriesList) ? prev.schoolCategoriesList : []),
            admissionProcess: Array.isArray(a.admissionProcess) ? a.admissionProcess : (a.admissionProcess ? [a.admissionProcess] : (Array.isArray(prev.admissionProcess) ? prev.admissionProcess : [])),
            workingDays: Array.isArray(a.workingDays) ? a.workingDays : (Array.isArray(prev.workingDays) ? prev.workingDays : []),
            holidays: Array.isArray(a.holidays) ? a.holidays : (Array.isArray(prev.holidays) ? prev.holidays : [])
          }));
        }
        setTimeout(() => setSuccess(""), 4000);
        return true;
      }
    } catch (err) {
      console.error("Error saving admission settings:", err);
      setError(err.response?.data?.message || "Failed to save admission settings.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === "function" ? value(prev[field]) : value
    }));
  };

  return {
    loading,
    saving,
    success,
    error,
    formData,
    setFormData,
    updateField,
    saveAdmissionSettings,
    refetch: fetchAdmissionSettings
  };
}
