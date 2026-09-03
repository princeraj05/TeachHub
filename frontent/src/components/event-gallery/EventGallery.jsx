import { useState } from "react";
import { FaImage, FaVideo } from "react-icons/fa";
import PhotoGallery from "./PhotoGallery";
import VideoGallery from "./VideoGallery";

export default function EventGallery({ event, api = "", onDeletePhoto, onDeleteVideo }) {
  const photos = event?.photos || [];
  const videos = event?.videos || [];
  const [activeTab, setActiveTab] = useState(photos.length ? "photos" : "videos");
  const defaultApi = import.meta.env.VITE_API_URL || "https://skyblue-yak-430824.hostingersite.com";
  const effectiveApi = api || defaultApi;
  const getMediaUrl = (url) => {
    if (!url) return "";
    let fullUrl = (url.startsWith("http") || url.startsWith("data:") || url.startsWith("blob:"))
      ? url
      : `${effectiveApi}${url.startsWith("/") ? "" : "/"}${url}`;
    if (fullUrl.startsWith("http")) {
      return encodeURI(fullUrl);
    }
    return fullUrl;
  };

  if (!photos.length && !videos.length) return <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-xs font-bold text-slate-400 dark:border-white/10">No media has been uploaded to this event yet.</div>;

  return <section className="border-t border-slate-100 pt-6 dark:border-white/5">
    <div className="mb-6 flex rounded-2xl border border-slate-200/70 bg-slate-50 p-1.5 dark:border-white/10 dark:bg-white/5">
      <button type="button" onClick={() => setActiveTab("photos")} disabled={!photos.length} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-black transition ${activeTab === "photos" ? "bg-gradient-to-r from-[#7C3AED] to-[#312E81] text-white shadow-md" : "text-slate-500 hover:bg-white dark:text-slate-400 dark:hover:bg-white/5"} disabled:cursor-not-allowed disabled:opacity-40`}><FaImage /> Photos ({photos.length})</button>
      <button type="button" onClick={() => setActiveTab("videos")} disabled={!videos.length} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-black transition ${activeTab === "videos" ? "bg-gradient-to-r from-[#7C3AED] to-[#312E81] text-white shadow-md" : "text-slate-500 hover:bg-white dark:text-slate-400 dark:hover:bg-white/5"} disabled:cursor-not-allowed disabled:opacity-40`}><FaVideo /> Videos ({videos.length})</button>
    </div>
    {activeTab === "photos" ? <PhotoGallery photos={photos} getMediaUrl={getMediaUrl} onDeletePhoto={onDeletePhoto} /> : <VideoGallery videos={videos} getMediaUrl={getMediaUrl} onDeleteVideo={onDeleteVideo} />}
  </section>;
}
