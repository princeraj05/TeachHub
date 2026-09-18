import { useState, useEffect, useRef } from "react";
import { FaImage, FaVideo } from "react-icons/fa";
import PhotoGallery from "./PhotoGallery";
import VideoGallery from "./VideoGallery";
import ReelsVideoViewer from "../ReelsVideoViewer";
import API_URL from "../../config/api";

export default function EventGallery({ event, api = "", onDeletePhoto, onDeleteVideo, userRole = "student" }) {
  const photos = event?.photos || [];
  const videos = event?.videos || [];
  const [activeTab, setActiveTab] = useState(photos.length ? "photos" : "videos");
  const [showReelsModal, setShowReelsModal] = useState(false);
  const [reelsInitialIndex, setReelsInitialIndex] = useState(0);

  const prevVideosLength = useRef(videos.length);

  useEffect(() => {
    if (videos.length > prevVideosLength.current) {
      setActiveTab("videos");
    } else if (activeTab === "photos" && !photos.length && videos.length) {
      setActiveTab("videos");
    } else if (activeTab === "videos" && !videos.length && photos.length) {
      setActiveTab("photos");
    }
    prevVideosLength.current = videos.length;
  }, [photos.length, videos.length, activeTab]);

  const defaultApi = API_URL;
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

  const openReelsView = (index = 0) => {
    setReelsInitialIndex(index);
    setShowReelsModal(true);
  };

  const reelsFormattedVideos = videos.map((v) => ({
    url: v.url,
    eventId: event?._id,
    eventTitle: event?.title || "School Event",
    eventDate: event?.eventDate,
    schoolName: event?.schoolName || "",
    schoolLogo: event?.schoolLogo || ""
  }));

  if (!photos.length && !videos.length) return <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-xs font-bold text-slate-400 dark:border-white/10">No media has been uploaded to this event yet.</div>;

  return (
    <section className="border-t border-slate-100 pt-6 dark:border-white/5">
      <div className="mb-6 flex rounded-2xl border border-slate-200/70 bg-slate-50 p-1.5 dark:border-white/10 dark:bg-white/5">
        <button type="button" onClick={() => setActiveTab("photos")} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-black transition cursor-pointer ${activeTab === "photos" ? "bg-gradient-to-r from-[#7C3AED] to-[#312E81] text-white shadow-md" : "text-slate-500 hover:bg-white dark:text-slate-400 dark:hover:bg-white/5"}`}><FaImage /> Photos ({photos.length})</button>
        <button type="button" onClick={() => setActiveTab("videos")} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-black transition cursor-pointer ${activeTab === "videos" ? "bg-gradient-to-r from-[#7C3AED] to-[#312E81] text-white shadow-md" : "text-slate-500 hover:bg-white dark:text-slate-400 dark:hover:bg-white/5"}`}><FaVideo /> Videos ({videos.length})</button>
      </div>

      {activeTab === "photos" ? (
        <PhotoGallery photos={photos} getMediaUrl={getMediaUrl} onDeletePhoto={onDeletePhoto} />
      ) : (
        <VideoGallery
          videos={videos}
          getMediaUrl={getMediaUrl}
          onDeleteVideo={onDeleteVideo}
          onOpenReels={openReelsView}
        />
      )}

      {/* Instagram Reels Style Fullscreen Viewer */}
      {showReelsModal && (
        <ReelsVideoViewer
          isOpen={showReelsModal}
          onClose={() => setShowReelsModal(false)}
          videos={reelsFormattedVideos}
          initialIndex={reelsInitialIndex}
          userRole={userRole}
        />
      )}
    </section>
  );
}
