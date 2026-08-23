import { useCallback, useEffect, useRef, useState } from "react";
import { FaChevronDown, FaChevronLeft, FaChevronRight, FaChevronUp, FaDownload, FaExpand, FaImage, FaTimes, FaTrash, FaVideo } from "react-icons/fa";

const downloadUrl = (url) => url?.includes("cloudinary.com") ? url.replace("/upload/", "/upload/fl_attachment/") : url;

function MediaVideo({ media, index, total, getMediaUrl, videoRefs, registerVideo, onActive, onDelete }) {
  const [ratio, setRatio] = useState(null);
  const itemRef = useRef(null);
  const url = getMediaUrl(media.url);
  const pauseOthers = () => videoRefs.current.forEach((video, videoIndex) => {
    if (videoIndex !== index && video && !video.paused) video.pause();
  });

  useEffect(() => {
    const video = videoRefs.current[index];
    const item = itemRef.current;
    if (!video || !item || !window.IntersectionObserver) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio >= 0.6) onActive(index);
      if (entry.intersectionRatio < 0.35 && !video.paused) video.pause();
    }, { threshold: [0.35, 0.6] });
    observer.observe(item);
    return () => observer.disconnect();
  }, [index, onActive, videoRefs]);

  return (
    <article ref={itemRef} className="snap-start min-h-full w-full shrink-0 flex flex-col items-center justify-center py-3">
      <div className="w-full max-w-[34rem] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200/60 dark:border-white/10 shadow-lg">
      <div className="flex items-center justify-center bg-black">
        <video
          ref={(node) => registerVideo(index, node)}
          src={url}
          controls
          preload="metadata"
          playsInline
          onLoadedMetadata={(event) => setRatio(event.currentTarget.videoWidth / event.currentTarget.videoHeight)}
          onPlay={pauseOthers}
          className="max-h-[calc(min(70vh,42rem)-5rem)] max-w-full object-contain"
          style={ratio ? { aspectRatio: String(ratio) } : undefined}
        />
      </div>
      <div className="bg-white dark:bg-[#0F172A] px-3 py-2.5 flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-[10px] font-bold text-slate-500 dark:text-slate-400">{media.filename || `Video ${index + 1}`}</span>
        <div className="flex shrink-0 items-center gap-1.5">
          <button type="button" onClick={() => videoRefs.current[index]?.requestFullscreen?.()} className="rounded-lg p-2 text-[#7C3AED] dark:text-[#38BDF8] hover:bg-[#7C3AED]/10" title="Fullscreen video"><FaExpand /></button>
          {onDelete && <button type="button" onClick={() => onDelete(media._id)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-500/10" title="Delete video"><FaTrash /></button>}
        </div>
      </div>
      </div>
      <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Video {index + 1} of {total}</span>
    </article>
  );
}

export default function EventGallery({ event, api = "", onDeletePhoto, onDeleteVideo }) {
  const photos = event?.photos || [];
  const videos = event?.videos || [];
  const [photoIndex, setPhotoIndex] = useState(null);
  const [activeVideo, setActiveVideo] = useState(0);
  const touchStart = useRef(null);
  const videoRefs = useRef([]);
  const videoFeedRef = useRef(null);
  const getMediaUrl = (url) => url?.startsWith("http") ? url : `${api}${url || ""}`;
  const closePhoto = () => setPhotoIndex(null);
  const movePhoto = useCallback((direction) => setPhotoIndex((current) => (current + direction + photos.length) % photos.length), [photos.length]);
  const registerVideo = (index, node) => { videoRefs.current[index] = node; };
  const goToVideo = (index) => videoFeedRef.current?.children[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
  const setActiveAndPauseOthers = useCallback((index) => {
    setActiveVideo(index);
    videoRefs.current.forEach((video, videoIndex) => {
      if (videoIndex !== index && video && !video.paused) video.pause();
    });
  }, []);

  useEffect(() => {
    if (photoIndex === null) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") closePhoto();
      if (event.key === "ArrowLeft") movePhoto(-1);
      if (event.key === "ArrowRight") movePhoto(1);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [photoIndex, movePhoto]);

  return (
    <>
      <section className="border-t border-slate-100 dark:border-white/5 pt-6 mb-8">
        <h4 className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-white"><FaImage className="text-[#7C3AED] dark:text-[#38BDF8]" /> Photos ({photos.length})</h4>
        {photos.length ? <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((photo, index) => <button key={photo._id || photo.url || index} type="button" onClick={() => setPhotoIndex(index)} className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-left cursor-zoom-in">
            <img src={getMediaUrl(photo.url)} alt={photo.filename || `Event photo ${index + 1}`} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
            <span className="absolute inset-0 grid place-items-center bg-black/40 text-[10px] font-black uppercase tracking-wider text-white opacity-0 transition group-hover:opacity-100">View photo</span>
            {onDeletePhoto && <span role="button" tabIndex={0} onClick={(event) => { event.stopPropagation(); onDeletePhoto(photo._id); }} onKeyDown={(event) => event.key === "Enter" && onDeletePhoto(photo._id)} className="absolute right-2 top-2 rounded-lg bg-rose-600 p-2 text-white opacity-0 transition group-hover:opacity-100"><FaTrash /></span>}
          </button>)}
        </div> : <p className="text-[10px] font-bold italic text-slate-400">No photos uploaded to this event gallery yet.</p>}
      </section>

      <section className="border-t border-slate-100 dark:border-white/5 pt-6">
        <h4 className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-white"><FaVideo className="text-[#7C3AED] dark:text-[#38BDF8]" /> Videos ({videos.length})</h4>
        {videos.length ? <>
          <div ref={videoFeedRef} className="h-[min(70vh,42rem)] overflow-y-auto overscroll-contain snap-y snap-mandatory scroll-smooth rounded-3xl bg-slate-100/70 dark:bg-black/20 border border-slate-200/60 dark:border-white/10 px-3" aria-label="Vertical video feed">
            {videos.map((video, index) => <MediaVideo key={video._id || video.url || index} media={video} index={index} total={videos.length} getMediaUrl={getMediaUrl} videoRefs={videoRefs} registerVideo={registerVideo} onActive={setActiveAndPauseOthers} onDelete={onDeleteVideo} />)}
          </div>
          <div className="mt-3 flex items-center justify-center gap-3 text-xs font-black text-slate-500 dark:text-slate-300">
            <button type="button" onClick={() => goToVideo(Math.max(0, activeVideo - 1))} disabled={activeVideo === 0} className="rounded-xl p-2 hover:bg-[#7C3AED]/10 disabled:opacity-30" aria-label="Previous video"><FaChevronUp /></button>
            <span>{activeVideo + 1} / {videos.length}</span>
            <button type="button" onClick={() => goToVideo(Math.min(videos.length - 1, activeVideo + 1))} disabled={activeVideo === videos.length - 1} className="rounded-xl p-2 hover:bg-[#7C3AED]/10 disabled:opacity-30" aria-label="Next video"><FaChevronDown /></button>
          </div>
        </> : <p className="text-[10px] font-bold italic text-slate-400">No videos uploaded to this event gallery yet.</p>}
      </section>

      {photoIndex !== null && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#070b13]/95 p-3 backdrop-blur-sm" onClick={closePhoto} onTouchStart={(event) => { touchStart.current = event.changedTouches[0].clientX; }} onTouchEnd={(event) => { const distance = event.changedTouches[0].clientX - touchStart.current; if (Math.abs(distance) > 45) movePhoto(distance < 0 ? 1 : -1); }}>
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent p-4 text-white" onClick={(event) => event.stopPropagation()}>
          <span className="text-xs font-black">Photo {photoIndex + 1} of {photos.length}</span>
          <div className="flex gap-2">
            <a href={downloadUrl(getMediaUrl(photos[photoIndex].url))} download target="_blank" rel="noreferrer" className="rounded-xl bg-[#7C3AED] px-3 py-2 text-xs font-black"><FaDownload className="inline mr-1.5" />Download</a>
            <button type="button" onClick={() => document.querySelector("[data-gallery-photo]")?.requestFullscreen?.()} className="rounded-xl bg-white/15 p-2" title="Fullscreen photo"><FaExpand /></button>
            <button type="button" onClick={closePhoto} className="rounded-xl bg-white/15 p-2" title="Close"><FaTimes /></button>
          </div>
        </div>
        <button type="button" onClick={(event) => { event.stopPropagation(); movePhoto(-1); }} className="absolute left-3 z-10 rounded-full bg-white/15 p-3 text-white hover:bg-white/25" aria-label="Previous photo"><FaChevronLeft /></button>
        <img data-gallery-photo src={getMediaUrl(photos[photoIndex].url)} alt={photos[photoIndex].filename || "Event photo"} onClick={(event) => event.stopPropagation()} className="max-h-[88vh] max-w-full rounded-xl object-contain shadow-2xl" />
        <button type="button" onClick={(event) => { event.stopPropagation(); movePhoto(1); }} className="absolute right-3 z-10 rounded-full bg-white/15 p-3 text-white hover:bg-white/25" aria-label="Next photo"><FaChevronRight /></button>
      </div>}
    </>
  );
}
