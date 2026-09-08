export const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.includes("localhost:5000") && envUrl.trim() !== "") {
    return envUrl.replace(/\/$/, "");
  }
  return "https://skyblue-yak-430824.hostingersite.com";
};

export const API_URL = getApiUrl();

export const getMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;
  const cleanBase = API_URL.replace(/\/+$/, "");

  if (url.includes("/uploads/")) {
    const path = url.substring(url.indexOf("/uploads/"));
    return `${cleanBase}${path}`;
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (url.startsWith("/")) {
    return `${cleanBase}${url}`;
  }
  return `${cleanBase}/${url}`;
};

export default API_URL;
