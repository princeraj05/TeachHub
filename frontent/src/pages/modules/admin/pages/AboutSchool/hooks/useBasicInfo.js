// frontent/src/pages/modules/admin/pages/AboutSchool/hooks/useBasicInfo.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import API_URL from "../../../../../../config/api";

export function useBasicInfo(options = {}) {
  const { enabled = true } = options;
  const API = API_URL;
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: localStorage.getItem("schoolName") || "",
    principalName: "",
    email: "",
    phoneNumber: "",
    address: "",
    established: "",
    schoolType: "",
    code: "",
    affiliation: "",
    academicYear: "",
    medium: "",
    website: "",
    status: "Active",
    registrationNumber: "",
    category: "",
    motto: "",
    photo: "",
    availableClasses: ""
  });

  const fetchBasicInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API}/api/schools/my-school/basic-info`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.basicInfo) {
        const b = res.data.basicInfo;
        setFormData({
          name: b.name || b.schoolName || localStorage.getItem("schoolName") || "",
          principalName: b.principalName || "",
          email: b.email || b.schoolEmail || "",
          phoneNumber: b.phoneNumber || "",
          address: b.address || b.schoolAddress || "",
          established: b.established || "",
          schoolType: b.schoolType || "",
          code: b.code || b.schoolCode || "",
          affiliation: b.affiliation || "",
          academicYear: b.academicYear || "",
          medium: b.medium || "",
          website: b.website || "",
          status: b.status || b.schoolStatus || "Active",
          registrationNumber: b.registrationNumber || "",
          category: b.category || "",
          motto: b.motto || b.schoolMotto || "",
          photo: b.photo || b.logo || "",
          availableClasses: b.availableClasses || ""
        });
      }
      setHasLoaded(true);
    } catch (err) {
      console.error("Error fetching basic info:", err);
      setError(err.response?.data?.message || "Failed to load basic information.");
    } finally {
      setLoading(false);
    }
  }, [API, token]);

  useEffect(() => {
    if (enabled && !hasLoaded) {
      fetchBasicInfo();
    }
  }, [enabled, hasLoaded, fetchBasicInfo]);

  const saveBasicInfo = async (dataToSave = formData) => {
    try {
      setSaving(true);
      setSuccess("");
      setError("");
      const res = await axios.put(`${API}/api/schools/my-school/basic-info`, dataToSave, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.success) {
        setSuccess(res.data.message || "Basic information saved successfully!");
        if (res.data.basicInfo) {
          const b = res.data.basicInfo;
          setFormData(prev => ({
            ...prev,
            ...b
          }));
        }
        setTimeout(() => setSuccess(""), 4000);
        return true;
      }
    } catch (err) {
      console.error("Error saving basic info:", err);
      setError(err.response?.data?.message || "Failed to save basic information.");
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
    saveBasicInfo,
    refetch: fetchBasicInfo
  };
}
