import { useCallback, useRef, useState } from "react";
import { FaChevronDown, FaChevronUp, FaVideo } from "react-icons/fa";
import VideoItem from "./VideoItem";

export default function VideoGallery({ videos, getMediaUrl, onDeleteVideo }) {
  const [activeVideo, setActiveVideo] = useState(0);
  const videoRefs = useRef([]);
  const videoFeedRef = useRef(null);
  const registerVideo = (index, node) => { videoRefs.current[index] = node; };
  const setActiveAndPauseOthers = useCallback((index) => {
    setActiveVideo(index);
    videoRefs.current.forEach((video, videoIndex) => { if (videoIndex !== index && video && !video.paused) video.pause(); });
  }, []);
  const goToVideo = (index) => videoFeedRef.current?.children[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (!videos.length) return <p className="py-12 text-center text-xs font-bold italic text-slate-400">No videos uploaded to this event gallery yet.</p>;
  return <section>
    <h4 className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-white"><FaVideo className="text-[#7C3AED] dark:text-[#38BDF8]" /> Videos ({videos.length})</h4>
    <div ref={videoFeedRef} className="h-[min(70vh,42rem)] overflow-y-auto overscroll-contain snap-y snap-mandatory scroll-smooth rounded-3xl border border-slate-200/60 bg-slate-100/70 px-3 dark:border-white/10 dark:bg-black/20" aria-label="Vertical video feed">
      {videos.map((video, index) => <VideoItem key={video._id || video.url || index} media={video} index={index} total={videos.length} getMediaUrl={getMediaUrl} videoRefs={videoRefs} registerVideo={registerVideo} onActive={setActiveAndPauseOthers} onDelete={onDeleteVideo} />)}
    </div>
    <div className="mt-3 flex items-center justify-center gap-3 text-xs font-black text-slate-500 dark:text-slate-300"><button type="button" onClick={() => goToVideo(Math.max(0, activeVideo - 1))} disabled={activeVideo === 0} className="rounded-xl p-2 hover:bg-[#7C3AED]/10 disabled:opacity-30" aria-label="Previous video"><FaChevronUp /></button><span>{activeVideo + 1} / {videos.length}</span><button type="button" onClick={() => goToVideo(Math.min(videos.length - 1, activeVideo + 1))} disabled={activeVideo === videos.length - 1} className="rounded-xl p-2 hover:bg-[#7C3AED]/10 disabled:opacity-30" aria-label="Next video"><FaChevronDown /></button></div>
  </section>;
}
