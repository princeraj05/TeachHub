// frontent/src/pages/modules/admin/pages/AboutSchool/hooks/useMediaPrincipal.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import API_URL from "../../../../../config/api";

export function useMediaPrincipal() {
  const API = API_URL;
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    coverImage: "",
    coverPosition: 50,
    schoolPhotos: [],
    principalPhoto: "",
    principalName: "",
    principalDesignation: "",
    principalEmail: "",
    principalPhone: "",
    principalLeadershipSince: "",
    principalIntroduction: ""
  });

  const fetchMediaPrincipal = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API}/api/schools/my-school/media-principal`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.mediaPrincipal) {
        const m = res.data.mediaPrincipal;
        const lSince = m.principalLeadershipSince;
        setFormData({
          coverImage: m.coverImage || "",
          coverPosition: m.coverPosition !== undefined && m.coverPosition !== null ? m.coverPosition : 50,
          schoolPhotos: Array.isArray(m.schoolPhotos) ? m.schoolPhotos : [],
          principalPhoto: m.principalPhoto || "",
          principalName: m.principalName || "",
          principalDesignation: m.principalDesignation || "",
          principalEmail: m.principalEmail || "",
          principalPhone: m.principalPhone || "",
          principalLeadershipSince: lSince ? lSince.split("T")[0] : "",
          principalIntroduction: m.principalIntroduction || ""
        });
      }
    } catch (err) {
      console.error("Error fetching media & principal profile:", err);
      setError(err.response?.data?.message || "Failed to load media and principal details.");
    } finally {
      setLoading(false);
    }
  }, [API, token]);

  useEffect(() => {
    fetchMediaPrincipal();
  }, [fetchMediaPrincipal]);

  const saveMediaPrincipal = async (dataToSave = formData) => {
    try {
      setSaving(true);
      setSuccess("");
      setError("");
      const sanitizeImg = (imgUrl) => (typeof imgUrl === "string" && imgUrl.startsWith("blob:") ? "" : imgUrl);
      const cleanSchoolPhotos = (dataToSave.schoolPhotos || []).filter(p => typeof p === "string" && !p.startsWith("blob:"));

      const payload = {
        ...dataToSave,
        coverImage: sanitizeImg(dataToSave.coverImage),
        principalPhoto: sanitizeImg(dataToSave.principalPhoto),
        schoolPhotos: cleanSchoolPhotos
      };

      const res = await axios.put(`${API}/api/schools/my-school/media-principal`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.success) {
        setSuccess(res.data.message || "Media & Principal profile saved successfully!");
        if (res.data.mediaPrincipal) {
          const m = res.data.mediaPrincipal;
          const lSince = m.principalLeadershipSince;
          setFormData(prev => ({
            ...prev,
            ...m,
            principalLeadershipSince: lSince ? lSince.split("T")[0] : prev.principalLeadershipSince
          }));
        }
        setTimeout(() => setSuccess(""), 4000);
        return true;
      }
    } catch (err) {
      console.error("Error saving media & principal details:", err);
      setError(err.response?.data?.message || "Failed to save media and principal details.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    loading,
    saving,
    success,
    error,
    formData,
    setFormData,
    updateField,
    saveMediaPrincipal,
    refetch: fetchMediaPrincipal
  };
}
