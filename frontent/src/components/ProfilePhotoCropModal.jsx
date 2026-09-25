import { useState, useRef, useEffect, useCallback } from "react";
import { 
  FaArrowLeft, 
  FaEllipsisV, 
  FaRedo, 
  FaSearchMinus, 
  FaSearchPlus 
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

/**
 * ProfilePhotoCropModal - Google Account style profile picture crop & rotate modal.
 * Supports light & dark themes seamlessly with interactive corner handle scaling,
 * clickable +/- zoom buttons, and full image fit options.
 */
export default function ProfilePhotoCropModal({ imageSrc, onClose, onSave }) {
  const { theme } = useTheme();

  const [step, setStep] = useState(1); // 1: Crop & rotate, 2: Preview, 3: Saving
  const [loadedImage, setLoadedImage] = useState(null);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [zoom, setZoom] = useState(1); // 0.2x to 4x
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isCornerDragging, setIsCornerDragging] = useState(false);
  const [croppedDataUrl, setCroppedDataUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const containerRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const cornerDragStartRef = useRef({ startDist: 1, initialZoom: 1 });
  const panRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);

  // Keep refs synced
  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

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

  // Handle rotate
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
    setPan({ x: 0, y: 0 });
  };

  // Drag Pan handling via window listeners
  const handleStartDrag = (e) => {
    if (isCornerDragging) return;
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

  // Interactive Corner Bracket Dragging to scale crop area
  const handleCornerStartDrag = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsCornerDragging(true);

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const startDist = Math.hypot(clientX - centerX, clientY - centerY);
    cornerDragStartRef.current = {
      startDist: Math.max(startDist, 10),
      initialZoom: zoomRef.current,
      centerX,
      centerY
    };
  };

  useEffect(() => {
    if (!isCornerDragging) return;

    const handleCornerMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const { centerX, centerY, startDist, initialZoom } = cornerDragStartRef.current;
      const currentDist = Math.hypot(clientX - centerX, clientY - centerY);
      
      const ratio = currentDist / startDist;
      const newZoom = Math.min(Math.max(initialZoom * ratio, 0.2), 4.0);
      setZoom(Math.round(newZoom * 100) / 100);
    };

    const handleCornerEnd = () => {
      setIsCornerDragging(false);
    };

    window.addEventListener("mousemove", handleCornerMove);
    window.addEventListener("mouseup", handleCornerEnd);
    window.addEventListener("touchmove", handleCornerMove, { passive: false });
    window.addEventListener("touchend", handleCornerEnd);

    return () => {
      window.removeEventListener("mousemove", handleCornerMove);
      window.removeEventListener("mouseup", handleCornerEnd);
      window.removeEventListener("touchmove", handleCornerMove);
      window.removeEventListener("touchend", handleCornerEnd);
    };
  }, [isCornerDragging]);

  // Wheel zoom handler
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.2), 4.0));
  };

  // Calculate Base Scale & Display Dimensions
  const getDisplayMetrics = useCallback(() => {
    if (!loadedImage) return { baseScale: 1, displayW: 0, displayH: 0, cropBoxSize: 260 };

    const cropBoxSize = 260; // UI crop viewport size in px
    const isRotated = rotation === 90 || rotation === 270;
    const naturalW = isRotated ? loadedImage.height : loadedImage.width;
    const naturalH = isRotated ? loadedImage.width : loadedImage.height;

    // Scale so image fits cleanly inside crop box by default
    const baseScale = Math.min(cropBoxSize / naturalW, cropBoxSize / naturalH);
    const effectiveScale = baseScale * zoom;

    const displayW = loadedImage.width * effectiveScale;
    const displayH = loadedImage.height * effectiveScale;

    return { baseScale, effectiveScale, displayW, displayH, cropBoxSize };
  }, [loadedImage, rotation, zoom]);

  // Generate Cropped Image Canvas Data
  const generateCroppedImage = useCallback(() => {
    if (!loadedImage) return "";

    const outputSize = 500; // Output square avatar resolution in px
    const canvas = document.createElement("canvas");
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext("2d");

    if (!ctx) return "";

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Clean white background fill
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, outputSize, outputSize);

    const { effectiveScale, cropBoxSize } = getDisplayMetrics();
    const ratio = outputSize / cropBoxSize;

    // Translate to canvas center
    ctx.translate(outputSize / 2, outputSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    const drawW = loadedImage.width * effectiveScale * ratio;
    const drawH = loadedImage.height * effectiveScale * ratio;
    const drawX = pan.x * ratio - drawW / 2;
    const drawY = pan.y * ratio - drawH / 2;

    ctx.drawImage(loadedImage, drawX, drawY, drawW, drawH);

    return canvas.toDataURL("image/jpeg", 0.92);
  }, [loadedImage, rotation, pan, getDisplayMetrics]);

  // Click Next -> move to preview
  const handleNext = () => {
    const dataUrl = generateCroppedImage();
    setCroppedDataUrl(dataUrl);
    setStep(2);
  };

  // Click Save -> move to saving state & save
  const handleSave = async () => {
    setStep(3);
    setSaving(true);
    try {
      if (onSave) {
        await onSave(croppedDataUrl);
      }
    } catch (err) {
      console.error("Failed to save profile picture:", err);
      setStep(2);
      setSaving(false);
    }
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.2, Math.round((prev - 0.15) * 100) / 100));
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(4.0, Math.round((prev + 0.15) * 100) / 100));
  };

  const { displayW, displayH } = getDisplayMetrics();

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-900/60 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none font-sans animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-[#18191B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[540px] max-h-[95vh] relative">
        
        {/* Header Bar */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141517]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (step === 2) setStep(1);
                else if (step === 1 && onClose) onClose();
              }}
              disabled={step === 3}
              className="w-9 h-9 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white transition cursor-pointer disabled:opacity-30"
              title="Back"
            >
              <FaArrowLeft className="text-base" />
            </button>
            <h2 className="text-lg font-semibold tracking-wide text-slate-900 dark:text-white">Crop & rotate</h2>
          </div>
          <button className="w-9 h-9 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition cursor-pointer">
            <FaEllipsisV className="text-sm" />
          </button>
        </div>

        {/* STEP 1: Crop & Rotate */}
        {step === 1 && (
          <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 overflow-hidden">
            {/* Image Canvas Crop Container */}
            <div
              ref={containerRef}
              onMouseDown={handleStartDrag}
              onTouchStart={handleStartDrag}
              onWheel={handleWheel}
              className="relative w-full aspect-square max-w-[310px] mx-auto rounded-2xl bg-slate-900 dark:bg-[#0d0e10] overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing border border-slate-300 dark:border-white/10 shadow-inner"
            >
              {loadedImage ? (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    width: `${displayW}px`,
                    height: `${displayH}px`,
                    transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg)`,
                    transformOrigin: "center center",
                    transition: (isDragging || isCornerDragging) ? "none" : "transform 0.1s ease-out"
                  }}
                >
                  <img
                    src={loadedImage.src}
                    alt="Source"
                    className="w-full h-full object-fill pointer-events-none"
                    draggable={false}
                  />
                </div>
              ) : (
                <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
              )}

              {/* Crop Box Overlay & Circle Mask */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-full h-full relative">
                  {/* Radial translucent mask */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "radial-gradient(circle at center, transparent 129px, rgba(0, 0, 0, 0.75) 130px)"
                    }}
                  />
                  {/* Square Crop Boundary with Interactive Drag Corner Brackets */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] border-2 border-white rounded-none shadow-2xl pointer-events-none">
                    {/* Top-Left Corner Handle */}
                    <span
                      onMouseDown={handleCornerStartDrag}
                      onTouchStart={handleCornerStartDrag}
                      className="absolute -top-3 -left-3 w-8 h-8 flex items-center justify-center pointer-events-auto cursor-nwse-resize active:scale-125 transition-transform"
                      title="Drag corner to scale crop size"
                    >
                      <span className="w-5 h-5 border-t-4 border-l-4 border-white drop-shadow-md" />
                    </span>

                    {/* Top-Right Corner Handle */}
                    <span
                      onMouseDown={handleCornerStartDrag}
                      onTouchStart={handleCornerStartDrag}
                      className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center pointer-events-auto cursor-nesw-resize active:scale-125 transition-transform"
                      title="Drag corner to scale crop size"
                    >
                      <span className="w-5 h-5 border-t-4 border-r-4 border-white drop-shadow-md" />
                    </span>

                    {/* Bottom-Left Corner Handle */}
                    <span
                      onMouseDown={handleCornerStartDrag}
                      onTouchStart={handleCornerStartDrag}
                      className="absolute -bottom-3 -left-3 w-8 h-8 flex items-center justify-center pointer-events-auto cursor-nesw-resize active:scale-125 transition-transform"
                      title="Drag corner to scale crop size"
                    >
                      <span className="w-5 h-5 border-b-4 border-l-4 border-white drop-shadow-md" />
                    </span>

                    {/* Bottom-Right Corner Handle */}
                    <span
                      onMouseDown={handleCornerStartDrag}
                      onTouchStart={handleCornerStartDrag}
                      className="absolute -bottom-3 -right-3 w-8 h-8 flex items-center justify-center pointer-events-auto cursor-nwse-resize active:scale-125 transition-transform"
                      title="Drag corner to scale crop size"
                    >
                      <span className="w-5 h-5 border-b-4 border-r-4 border-white drop-shadow-md" />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Area: Zoom Slider & Rotate Button */}
            <div className="flex flex-col items-center gap-3 mt-3">
              {/* Zoom Slider with Clickable - and + buttons */}
              <div className="flex items-center gap-2.5 w-full max-w-[290px] bg-slate-100 dark:bg-[#232427] px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-white/80 active:scale-90 transition cursor-pointer shrink-0"
                  title="Zoom Out (Show full image)"
                >
                  <FaSearchMinus className="text-sm" />
                </button>
                <input
                  type="range"
                  min="0.2"
                  max="4.0"
                  step="0.02"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-[#7C3AED] dark:accent-[#A8C7FA] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-white/80 active:scale-90 transition cursor-pointer shrink-0"
                  title="Zoom In"
                >
                  <FaSearchPlus className="text-sm" />
                </button>
              </div>

              {/* Rotate & Reset Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRotate}
                  className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-slate-100 dark:bg-[#28292C] hover:bg-slate-200 dark:hover:bg-[#323337] active:scale-95 text-slate-800 dark:text-white/90 font-medium text-xs border border-slate-200 dark:border-white/10 transition cursor-pointer shadow-sm"
                >
                  <FaRedo className="text-xs text-slate-600 dark:text-white/80" />
                  <span>Rotate</span>
                </button>
                <button
                  onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                  className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-[#28292C] hover:bg-slate-200 dark:hover:bg-[#323337] active:scale-95 text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white font-medium text-xs border border-slate-200 dark:border-white/10 transition cursor-pointer"
                >
                  Reset
                </button>
              </div>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="w-full max-w-[200px] py-2.5 rounded-full bg-[#7C3AED] dark:bg-[#A8C7FA] hover:bg-[#6D28D9] dark:hover:bg-[#BBE0FF] active:scale-95 text-white dark:text-[#041E49] font-bold text-sm transition cursor-pointer shadow-lg tracking-wide mt-1"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Preview Confirmation */}
        {step === 2 && (
          <div className="flex-1 flex flex-col justify-between p-5 sm:p-7 text-center">
            <div className="space-y-4 flex flex-col items-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide">Your new profile picture</h3>

              {/* Circular Cropped Photo Preview */}
              <div className="w-48 h-48 sm:w-52 sm:h-52 rounded-full overflow-hidden border-4 border-slate-200 dark:border-white/20 shadow-2xl my-2 bg-white">
                <img src={croppedDataUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Step 2 Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-white/10">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="px-7 py-2.5 rounded-full bg-[#7C3AED] dark:bg-[#A8C7FA] hover:bg-[#6D28D9] dark:hover:bg-[#BBE0FF] active:scale-95 text-white dark:text-[#041E49] font-bold text-xs transition cursor-pointer shadow-lg"
              >
                Save as profile picture
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Saving State */}
        {step === 3 && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
            {/* Avatar Circle with Animated Ring */}
            <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
              {/* Spinning Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-[#7C3AED] dark:border-[#A8C7FA] border-t-transparent animate-spin" />
              {/* Profile Image inside */}
              <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full overflow-hidden shadow-xl bg-white">
                <img src={croppedDataUrl} alt="Saving" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-wide">Saving profile picture...</p>
              <p className="text-xs text-slate-500 dark:text-white/60 font-medium">Please wait while your photo updates</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
