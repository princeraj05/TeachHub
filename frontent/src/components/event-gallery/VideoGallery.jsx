import { useState } from "react";
import { FaPlay, FaVideo, FaTrash } from "react-icons/fa";

export default function VideoGallery({ videos, getMediaUrl, onDeleteVideo }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!videos.length) {
    return <p className="py-12 text-center text-xs font-bold italic text-slate-400">No videos uploaded to this event gallery yet.</p>;
  }

  const activeVideo = videos[activeIndex] || videos[0];
  const activeUrl = getMediaUrl(activeVideo?.url);

  return (
    <section className="flex flex-col gap-6">
      <h4 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-white">
        <FaVideo className="text-[#7C3AED] dark:text-[#38BDF8]" /> Videos ({videos.length})
      </h4>

      {/* Main Active Player Area */}
      <div className="w-full bg-slate-950 dark:bg-slate-950/80 rounded-2.5xl border border-slate-200/60 dark:border-white/10 overflow-hidden shadow-lg flex flex-col select-none">
        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
          {/* Main Video */}
          <video
            key={activeUrl}
            src={activeUrl}
            controls
            autoPlay={activeIndex !== 0} // Autoplay when user manually selects subsequent videos
            preload="metadata"
            playsInline
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Caption bar */}
        <div className="flex items-center justify-between gap-4 bg-white px-5 py-4 dark:bg-[#0F172A] border-t border-slate-100 dark:border-white/5">
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#7C3AED] dark:text-[#38BDF8]">Playing Now</span>
            <p className="text-xs font-bold text-slate-850 dark:text-white truncate mt-0.5">
              {activeVideo.filename || `Video ${activeIndex + 1}`}
            </p>
          </div>
          
          <div className="flex shrink-0 items-center gap-2">
            {onDeleteVideo && (
              <button
                type="button"
                onClick={() => {
                  onDeleteVideo(activeVideo._id);
                  if (activeIndex >= videos.length - 1 && activeIndex > 0) {
                    setActiveIndex(activeIndex - 1);
                  }
                }}
                className="rounded-xl p-2.5 text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Delete video"
              >
                <FaTrash className="text-xs" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Thumbnail Selector (Only if multiple videos exist) */}
      {videos.length > 1 && (
        <div className="flex flex-col gap-3 select-none">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">All Clips</p>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10 snap-x">
            {videos.map((video, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={video._id || video.url || index}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`group relative aspect-video w-36 sm:w-44 shrink-0 snap-start overflow-hidden rounded-2xl bg-slate-900 border text-left transition-all duration-300 ${
                    isActive 
                      ? "border-[#7C3AED] dark:border-[#38BDF8] ring-2 ring-[#7C3AED]/20 dark:ring-[#38BDF8]/20 scale-95" 
                      : "border-slate-200/60 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20"
                  }`}
                >
                  {/* Subtle video preview background using standard video element but paused */}
                  <video
                    src={getMediaUrl(video.url)}
                    preload="metadata"
                    muted
                    className="absolute inset-0 h-full w-full object-cover opacity-60 group-hover:opacity-80 transition duration-300"
                  />
                  
                  {/* Overlay and play button icon */}
                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-all duration-300 ${
                      isActive ? "bg-[#7C3AED] scale-110" : "bg-black/45 group-hover:bg-white group-hover:text-black group-hover:scale-110"
                    }`}>
                      <FaPlay className="text-[10px] translate-x-[1px]" />
                    </span>
                  </div>

                  {/* Thumbnail number tag */}
                  <span className="absolute bottom-2 left-2 text-[9px] font-black uppercase tracking-wider text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded border border-white/5">
                    Clip {index + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
