export const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.includes("hostingersite.com") && !envUrl.includes("localhost:5000") && envUrl.trim() !== "") {
    return envUrl.replace(/\/$/, "");
  }
  return "https://myschool-admin-panel.onrender.com";
};

export const API_URL = getApiUrl();
export default API_URL;
