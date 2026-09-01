import { useState } from "react";
import { FaImage, FaTrash } from "react-icons/fa";
import PhotoViewer from "./PhotoViewer";

export default function PhotoGallery({ photos, getMediaUrl, onDeletePhoto }) {
  const [photoIndex, setPhotoIndex] = useState(null);
  if (!photos.length) return <p className="py-12 text-center text-xs font-bold italic text-slate-400">No photos uploaded to this event gallery yet.</p>;
  return <section>
    <h4 className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-white"><FaImage className="text-[#7C3AED] dark:text-[#38BDF8]" /> Photos ({photos.length})</h4>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {photos.map((photo, index) => (
        <button
          key={photo._id || photo.url || index}
          type="button"
          onClick={() => setPhotoIndex(index)}
          className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-left cursor-zoom-in shadow-sm hover:shadow-md transition-all duration-300"
        >
          <img
            src={getMediaUrl(photo.url)}
            alt={photo.filename || `Event photo ${index + 1}`}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=400&q=80";
            }}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-white bg-[#7C3AED] px-2.5 py-1 rounded-lg shadow-sm">View photo</span>
          </div>
          {onDeletePhoto && (
            <span
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation();
                onDeletePhoto(photo._id);
              }}
              onKeyDown={(event) => event.key === "Enter" && onDeletePhoto(photo._id)}
              className="absolute right-2.5 top-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 p-2.5 text-white shadow-lg transition-all duration-200 cursor-pointer"
            >
              <FaTrash className="text-xs" />
            </span>
          )}
        </button>
      ))}
    </div>
    {photoIndex !== null && <PhotoViewer photos={photos} photoIndex={photoIndex} getMediaUrl={getMediaUrl} onChange={setPhotoIndex} onClose={() => setPhotoIndex(null)} />}
  </section>;
}
