import { useState, useRef, useEffect, useCallback } from "react";
import {
  FaArrowLeft,
  FaEllipsisV,
  FaRedo,
  FaSearchMinus,
  FaSearchPlus,
  FaCheck,
  FaCropAlt
} from "react-icons/fa";

/**
 * BannerCropModal - Widescreen (3:1 aspect ratio) cover banner crop & rotate modal.
 * 
 * Props:
 *  - imageSrc: File object or string URL of selected cover image.
 *  - onClose: () => void - Callback when user cancels.
 *  - onSave: (croppedBase64: string) => Promise<void> | void - Callback with cropped banner image data URL.
 */
export default function BannerCropModal({ imageSrc, onClose, onSave }) {
  const [step, setStep] = useState(1); // 1: Crop & rotate, 2: Preview, 3: Saving
  const [loadedImage, setLoadedImage] = useState(null);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [zoom, setZoom] = useState(1); // 1x to 3x
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [croppedDataUrl, setCroppedDataUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const containerRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  // Load image object
  useEffect(() => {
    if (!imageSrc) return;
    let url = "";
    if (typeof imageSrc === "string") {
      url = imageSrc;
    } else if (imageSrc instanceof File || imageSrc instanceof Blob) {
      url = URL.createObjectURL(imageSrc);
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => {
      setLoadedImage(img);
      setRotation(0);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };

    return () => {
      if (imageSrc instanceof File || imageSrc instanceof Blob) {
        URL.revokeObjectURL(url);
      }
    };
  }, [imageSrc]);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
    setPan({ x: 0, y: 0 });
  };

  const handleStartDrag = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = {
      x: clientX - panRef.current.x,
      y: clientY - panRef.current.y
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const newX = clientX - dragStartRef.current.x;
      const newY = clientY - dragStartRef.current.y;
      setPan({ x: newX, y: newY });
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging]);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom((prev) => Math.min(Math.max(prev + delta, 1), 3));
  };

  // Metrics for 3:1 aspect ratio crop frame
  const getDisplayMetrics = useCallback(() => {
    if (!loadedImage) return { baseScale: 1, displayW: 0, displayH: 0, cropW: 360, cropH: 120 };

    const cropW = 360;
    const cropH = 120;
    const isRotated = rotation === 90 || rotation === 270;
    const naturalW = isRotated ? loadedImage.height : loadedImage.width;
    const naturalH = isRotated ? loadedImage.width : loadedImage.height;

    const baseScale = Math.max(cropW / naturalW, cropH / naturalH);
    const effectiveScale = baseScale * zoom;

    const displayW = loadedImage.width * effectiveScale;
    const displayH = loadedImage.height * effectiveScale;

    return { baseScale, effectiveScale, displayW, displayH, cropW, cropH };
  }, [loadedImage, rotation, zoom]);

  const generateCroppedImage = useCallback(() => {
    if (!loadedImage) return "";

    const outW = 1200;
    const outH = 400;
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");

    if (!ctx) return "";

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const { effectiveScale, cropW, cropH } = getDisplayMetrics();
    const ratio = outW / cropW;

    ctx.translate(outW / 2, outH / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    const drawW = loadedImage.width * effectiveScale * ratio;
    const drawH = loadedImage.height * effectiveScale * ratio;
    const drawX = pan.x * ratio - drawW / 2;
    const drawY = pan.y * ratio - drawH / 2;

    ctx.drawImage(loadedImage, drawX, drawY, drawW, drawH);

    return canvas.toDataURL("image/jpeg", 0.92);
  }, [loadedImage, rotation, pan, getDisplayMetrics]);

  const handleNext = () => {
    const dataUrl = generateCroppedImage();
    setCroppedDataUrl(dataUrl);
    setStep(2);
  };

  const handleSave = async () => {
    setStep(3);
    setSaving(true);
    try {
      if (onSave) {
        await onSave(croppedDataUrl);
      }
    } catch (err) {
      console.error("Failed to save cropped banner:", err);
      setStep(2);
      setSaving(false);
    }
  };

  const { displayW, displayH } = getDisplayMetrics();

  return (
    <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none font-sans text-white animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#18191B] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[500px] max-h-[95vh] relative">
        
        {/* Header Bar */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-white/10 bg-[#141517]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (step === 2) setStep(1);
                else if (step === 1 && onClose) onClose();
              }}
              disabled={step === 3}
              className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition cursor-pointer disabled:opacity-30"
              title="Back"
            >
              <FaArrowLeft className="text-base" />
            </button>
            <div>
              <h2 className="text-lg font-semibold tracking-wide text-white flex items-center gap-2">
                <FaCropAlt className="text-purple-400 text-sm" /> Crop Cover Banner
              </h2>
              <span className="text-[10px] text-white/50 font-medium">3:1 Widescreen Ratio (1200 x 400px)</span>
            </div>
          </div>
          <button type="button" className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition cursor-pointer">
            <FaEllipsisV className="text-sm" />
          </button>
        </div>

        {/* STEP 1: Crop & Rotate */}
        {step === 1 && (
          <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 overflow-hidden">
            {/* 3:1 Widescreen Crop Viewport */}
            <div
              ref={containerRef}
              onMouseDown={handleStartDrag}
              onTouchStart={handleStartDrag}
              onWheel={handleWheel}
              className="relative w-full aspect-[3/1] bg-[#0d0e10] overflow-hidden rounded-2xl flex items-center justify-center cursor-grab active:cursor-grabbing border border-white/10 shadow-inner"
            >
              {loadedImage ? (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    width: `${displayW}px`,
                    height: `${displayH}px`,
                    transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg)`,
                    transformOrigin: "center center",
                    transition: isDragging ? "none" : "transform 0.1s ease-out"
                  }}
                >
                  <img
                    src={loadedImage.src}
                    alt="Source Cover"
                    className="w-full h-full object-fill pointer-events-none"
                    draggable={false}
                  />
                </div>
              ) : (
                <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
              )}

              {/* Crop Grid Overlay */}
              <div className="absolute inset-0 pointer-events-none border-2 border-purple-500/90 rounded-2xl shadow-2xl">
                <div className="w-full h-full grid grid-cols-3 grid-rows-3 border border-white/20">
                  <div className="border-r border-b border-white/15" />
                  <div className="border-r border-b border-white/15" />
                  <div className="border-b border-white/15" />
                  <div className="border-r border-b border-white/15" />
                  <div className="border-r border-b border-white/15" />
                  <div className="border-b border-white/15" />
                  <div className="border-r border-white/15" />
                  <div className="border-r border-white/15" />
                  <div />
                </div>
              </div>
            </div>

            <p className="text-center text-[10px] text-white/60 font-medium mt-3">
              Drag to reposition • Scroll or use slider to zoom • Rotate if needed
            </p>

            {/* Controls */}
            <div className="flex flex-col items-center gap-3 mt-4">
              <div className="flex items-center gap-3 w-full max-w-xs bg-[#232427] px-4 py-2 rounded-xl border border-white/10">
                <FaSearchMinus className="text-white/60 text-xs shrink-0" />
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
                <FaSearchPlus className="text-white/60 text-xs shrink-0" />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRotate}
                  className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-[#28292C] hover:bg-[#323337] active:scale-95 text-white/90 font-medium text-xs border border-white/10 transition cursor-pointer shadow-md"
                >
                  <FaRedo className="text-xs text-white/80" />
                  <span>Rotate</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); setRotation(0); }}
                  className="px-4 py-2 rounded-2xl bg-[#28292C] hover:bg-[#323337] text-white/70 hover:text-white text-xs border border-white/10 transition cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <span>Apply Crop</span>
                <FaCheck className="text-xs" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Preview & Save */}
        {step === 2 && (
          <div className="flex-1 flex flex-col justify-between p-6">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Cropped Widescreen Preview</span>
              <div className="w-full aspect-[3/1] rounded-2xl overflow-hidden border-2 border-purple-500/50 shadow-2xl bg-[#0d0e10]">
                <img src={croppedDataUrl} alt="Cropped Preview" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                Re-crop
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-7 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-xl transition cursor-pointer flex items-center gap-2 active:scale-95"
              >
                Save Cover Banner
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Saving Loader */}
        {step === 3 && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 text-center">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-white/80">Saving Cover Banner...</p>
          </div>
        )}

      </div>
    </div>
  );
}
