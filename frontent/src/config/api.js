export const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.replace(/\/+$/, "");
  }
  return import.meta.env.DEV ? "http://localhost:5000" : "https://teachhub-tp9j.onrender.com";
};

export const API_URL = getApiUrl();

export const getPublicSiteUrl = () => {
  const envUrl = import.meta.env.VITE_PUBLIC_SITE_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined" && window.location && window.location.origin) {
    const origin = window.location.origin;
    if (!origin.includes("localhost") && !origin.includes("127.0.0.1")) {
      return origin.replace(/\/+$/, "");
    }
  }
  return "https://myschool-admin-panel.vercel.app";
};

export const PUBLIC_SITE_URL = getPublicSiteUrl();

export const PUBLIC_LEGAL_URLS = {
  privacyPolicy: `${PUBLIC_SITE_URL}/privacy-policy`,
  cookiePolicy: `${PUBLIC_SITE_URL}/cookie-policy`,
  termsOfService: `${PUBLIC_SITE_URL}/terms-of-service`,
  disclaimer: `${PUBLIC_SITE_URL}/disclaimer`,
  refundPolicy: `${PUBLIC_SITE_URL}/refund-policy`,
  aboutUs: `${PUBLIC_SITE_URL}/about-us`,
  accountDeletion: `${PUBLIC_SITE_URL}/delete-account`
};

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
