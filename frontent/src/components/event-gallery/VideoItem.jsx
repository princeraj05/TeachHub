import { useEffect, useRef, useState } from "react";
import { FaExpand, FaTrash } from "react-icons/fa";

export default function VideoItem({ media, index, total, getMediaUrl, videoRefs, registerVideo, onActive, onDelete }) {
  const [ratio, setRatio] = useState(null);
  const itemRef = useRef(null);
  const url = getMediaUrl(media.url);
  const pauseOthers = () => videoRefs.current.forEach((video, videoIndex) => { if (videoIndex !== index && video && !video.paused) video.pause(); });

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

  return <article ref={itemRef} className="snap-start min-h-full w-full shrink-0 flex flex-col items-center justify-center py-3">
    <div className="w-full max-w-[34rem] overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-950 shadow-lg dark:border-white/10">
      <div className="flex items-center justify-center bg-black">
        <video src={url} ref={(node) => registerVideo(index, node)} controls preload="metadata" playsInline crossOrigin={url?.startsWith("http") ? "anonymous" : undefined} onLoadedMetadata={(event) => setRatio(event.currentTarget.videoWidth / event.currentTarget.videoHeight)} onPlay={pauseOthers} className="max-h-[calc(min(70vh,42rem)-5rem)] max-w-full object-contain" style={ratio ? { aspectRatio: String(ratio) } : undefined}>
          <source src={url} type="video/mp4" />
          <source src={url} />
          Your browser does not support playing this video.
        </video>
      </div>
      <div className="flex items-center justify-between gap-2 bg-white px-3 py-2.5 dark:bg-[#0F172A]"><span className="min-w-0 truncate text-[10px] font-bold text-slate-500 dark:text-slate-400">{media.filename || `Video ${index + 1}`}</span><div className="flex shrink-0 items-center gap-1.5"><button type="button" onClick={() => videoRefs.current[index]?.requestFullscreen?.()} className="rounded-lg p-2 text-[#7C3AED] hover:bg-[#7C3AED]/10 dark:text-[#38BDF8]" title="Fullscreen video"><FaExpand /></button>{onDelete && <button type="button" onClick={() => onDelete(media._id)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-500/10" title="Delete video"><FaTrash /></button>}</div></div>
    </div>
    <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Video {index + 1} of {total}</span>
  </article>;
}
