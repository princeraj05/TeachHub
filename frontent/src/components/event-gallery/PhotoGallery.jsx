import { useState } from "react";
import { FaImage, FaTrash } from "react-icons/fa";
import PhotoViewer from "./PhotoViewer";

export default function PhotoGallery({ photos, getMediaUrl, onDeletePhoto }) {
  const [photoIndex, setPhotoIndex] = useState(null);
  if (!photos.length) return <p className="py-12 text-center text-xs font-bold italic text-slate-400">No photos uploaded to this event gallery yet.</p>;
  return <section>
    <h4 className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-white"><FaImage className="text-[#7C3AED] dark:text-[#38BDF8]" /> Photos ({photos.length})</h4>
    <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
      {photos.map((photo, index) => <button key={photo._id || photo.url || index} type="button" onClick={() => setPhotoIndex(index)} className="group relative aspect-square w-36 shrink-0 snap-start overflow-hidden rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-left cursor-zoom-in sm:w-44">
        <img src={getMediaUrl(photo.url)} alt={photo.filename || `Event photo ${index + 1}`} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        <span className="absolute inset-0 grid place-items-center bg-black/40 text-[10px] font-black uppercase tracking-wider text-white opacity-0 transition group-hover:opacity-100">View photo</span>
        {onDeletePhoto && <span role="button" tabIndex={0} onClick={(event) => { event.stopPropagation(); onDeletePhoto(photo._id); }} onKeyDown={(event) => event.key === "Enter" && onDeletePhoto(photo._id)} className="absolute right-2 top-2 rounded-lg bg-rose-600 p-2 text-white opacity-0 transition group-hover:opacity-100"><FaTrash /></span>}
      </button>)}
    </div>
    {photoIndex !== null && <PhotoViewer photos={photos} photoIndex={photoIndex} getMediaUrl={getMediaUrl} onChange={setPhotoIndex} onClose={() => setPhotoIndex(null)} />}
  </section>;
}
