import { useState, useEffect } from "react";
import { FaPlay, FaVideo, FaTrash, FaDownload, FaExclamationTriangle, FaExternalLinkAlt } from "react-icons/fa";

export default function VideoGallery({ videos, getMediaUrl, onDeleteVideo }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoError, setVideoError] = useState(false);

  if (!videos.length) {
    return <p className="py-12 text-center text-xs font-bold italic text-slate-400">No videos uploaded to this event gallery yet.</p>;
  }

  const activeVideo = videos[activeIndex] || videos[0];
  const activeUrl = getMediaUrl(activeVideo?.url);

  useEffect(() => {
    setVideoError(false);
  }, [activeUrl]);

  return (
    <section className="flex flex-col gap-6">
      <h4 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-white">
        <FaVideo className="text-[#7C3AED] dark:text-[#38BDF8]" /> Videos ({videos.length})
      </h4>

      {/* Main Active Player Area */}
      <div className="w-full bg-slate-950 dark:bg-slate-950/80 rounded-2.5xl border border-slate-200/60 dark:border-white/10 overflow-hidden shadow-lg flex flex-col select-none">
        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
          <video
            key={activeUrl}
            src={activeUrl}
            controls
            preload="auto"
            playsInline
            crossOrigin={activeUrl?.startsWith("http") ? "anonymous" : undefined}
            onError={() => setVideoError(true)}
            onLoadedMetadata={() => setVideoError(false)}
            onCanPlay={() => setVideoError(false)}
            onPlay={() => setVideoError(false)}
            className="w-full h-full object-contain"
          >
            <source src={activeUrl} type="video/mp4" />
            <source src={activeUrl} type="video/webm" />
            <source src={activeUrl} />
            Your browser does not support playing this video.
          </video>

          {videoError && (
            <div className="absolute top-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md border border-amber-500/30 p-3 rounded-xl text-white flex items-center justify-between gap-3 z-10 shadow-xl">
              <div className="flex items-center gap-2 min-w-0">
                <FaExclamationTriangle className="text-amber-400 text-sm shrink-0" />
                <p className="text-[11px] font-semibold text-slate-200 truncate">
                  Codec warning: If video does not play automatically, click Play or Download.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setVideoError(false)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold rounded-lg transition border border-white/10"
                >
                  Dismiss
                </button>
                <a
                  href={activeUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="inline-flex items-center gap-1 px-3 py-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[10px] font-black rounded-lg transition shadow-sm"
                >
                  <FaDownload /> Download
                </a>
              </div>
            </div>
          )}
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
            <a
              href={activeUrl}
              target="_blank"
              rel="noreferrer"
              download
              className="rounded-xl p-2.5 text-slate-500 hover:text-[#7C3AED] dark:text-slate-400 dark:hover:text-[#38BDF8] hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex items-center gap-1 text-xs font-bold"
              title="Download / Open Video"
            >
              <FaDownload className="text-xs" />
              <span className="hidden sm:inline text-[10px]">Download</span>
            </a>
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
                  className={`group relative aspect-video w-36 sm:w-44 shrink-0 snap-start overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border text-left transition-all duration-300 cursor-pointer ${
                    isActive 
                      ? "border-[#7C3AED] dark:border-[#38BDF8] ring-2 ring-[#7C3AED]/20 dark:ring-[#38BDF8]/20 scale-95" 
                      : "border-slate-200/60 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20"
                  }`}
                >
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
