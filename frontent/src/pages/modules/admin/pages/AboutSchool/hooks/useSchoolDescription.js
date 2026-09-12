// frontent/src/pages/modules/admin/pages/AboutSchool/hooks/useSchoolDescription.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import API_URL from "../../../../../config/api";

export function useSchoolDescription() {
  const API = API_URL;
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [description, setDescription] = useState("");

  const fetchDescription = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API}/api/schools/my-school/description`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.description !== undefined) {
        setDescription(res.data.description || "");
      }
    } catch (err) {
      console.error("Error fetching school description:", err);
      setError(err.response?.data?.message || "Failed to load school description.");
    } finally {
      setLoading(false);
    }
  }, [API, token]);

  useEffect(() => {
    fetchDescription();
  }, [fetchDescription]);

  const saveDescription = async (descToSave = description) => {
    try {
      setSaving(true);
      setSuccess("");
      setError("");
      const res = await axios.put(`${API}/api/schools/my-school/description`, { description: descToSave }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.success) {
        setSuccess(res.data.message || "School description saved successfully!");
        if (res.data.description !== undefined) {
          setDescription(res.data.description);
        }
        setTimeout(() => setSuccess(""), 4000);
        return true;
      }
    } catch (err) {
      console.error("Error saving school description:", err);
      setError(err.response?.data?.message || "Failed to save school description.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    success,
    error,
    description,
    setDescription,
    saveDescription,
    refetch: fetchDescription
  };
}
