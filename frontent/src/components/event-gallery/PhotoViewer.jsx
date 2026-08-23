import { useCallback, useEffect, useRef } from "react";
import { FaChevronLeft, FaChevronRight, FaDownload, FaExpand, FaTimes } from "react-icons/fa";

const downloadUrl = (url) => url?.includes("cloudinary.com") ? url.replace("/upload/", "/upload/fl_attachment/") : url;

export default function PhotoViewer({ photos, photoIndex, getMediaUrl, onClose, onChange }) {
  const touchStart = useRef(null);
  const move = useCallback((direction) => onChange((photoIndex + direction + photos.length) % photos.length), [onChange, photoIndex, photos.length]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKeyDown); document.body.style.overflow = previousOverflow; };
  }, [move, onClose]);

  const photo = photos[photoIndex];
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#070b13]/95 p-3 backdrop-blur-sm" onClick={onClose} onTouchStart={(event) => { touchStart.current = event.changedTouches[0].clientX; }} onTouchEnd={(event) => { const distance = event.changedTouches[0].clientX - touchStart.current; if (Math.abs(distance) > 45) move(distance < 0 ? 1 : -1); }}>
    <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent p-4 text-white" onClick={(event) => event.stopPropagation()}>
      <span className="text-xs font-black">Photo {photoIndex + 1} of {photos.length}</span>
      <div className="flex gap-2"><a href={downloadUrl(getMediaUrl(photo.url))} download target="_blank" rel="noreferrer" className="rounded-xl bg-[#7C3AED] px-3 py-2 text-xs font-black"><FaDownload className="inline mr-1.5" />Download</a><button type="button" onClick={() => document.querySelector("[data-gallery-photo]")?.requestFullscreen?.()} className="rounded-xl bg-white/15 p-2" title="Fullscreen photo"><FaExpand /></button><button type="button" onClick={onClose} className="rounded-xl bg-white/15 p-2" title="Close"><FaTimes /></button></div>
    </div>
    <button type="button" onClick={(event) => { event.stopPropagation(); move(-1); }} className="absolute left-3 z-10 rounded-full bg-white/15 p-3 text-white hover:bg-white/25" aria-label="Previous photo"><FaChevronLeft /></button>
    <img data-gallery-photo src={getMediaUrl(photo.url)} alt={photo.filename || "Event photo"} onClick={(event) => event.stopPropagation()} className="max-h-[88vh] max-w-full rounded-xl object-contain shadow-2xl" />
    <button type="button" onClick={(event) => { event.stopPropagation(); move(1); }} className="absolute right-3 z-10 rounded-full bg-white/15 p-3 text-white hover:bg-white/25" aria-label="Next photo"><FaChevronRight /></button>
  </div>;
}
