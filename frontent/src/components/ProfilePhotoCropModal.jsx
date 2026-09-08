import { useState, useRef, useEffect, useCallback } from "react";
import { FaArrowLeft, FaEllipsisV, FaRedo, FaGlobe, FaInfoCircle } from "react-icons/fa";

/**
 * ProfilePhotoCropModal - Google Account style profile picture crop & rotate modal.
 * 
 * Props:
 *  - imageSrc: File object or base64 / URL string of the selected image.
 *  - onClose: () => void - Callback to close modal without saving.
 *  - onSave: (croppedBase64: string) => Promise<void> | void - Callback when user clicks "Save as profile picture".
 */
export default function ProfilePhotoCropModal({ imageSrc, onClose, onSave }) {
  const [step, setStep] = useState(1); // 1: Crop & rotate, 2: Preview, 3: Saving
  const [loadedImage, setLoadedImage] = useState(null);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [croppedDataUrl, setCroppedDataUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const containerRef = useRef(null);

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
    setPan({ x: 0, y: 0 }); // reset pan on rotate
  };

  // Drag pan handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - pan.x, y: clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setPan({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Generate Cropped Image Canvas Data
  const generateCroppedImage = useCallback(() => {
    if (!loadedImage) return "";

    const size = 500; // Output square size
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    if (!ctx) return "";

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Translate to center
    ctx.translate(size / 2, size / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // Calculate scale factor relative to crop box
    const cropBoxSize = 260; // Rendered crop box px in UI
    const isRotated = rotation === 90 || rotation === 270;
    const imgW = isRotated ? loadedImage.height : loadedImage.width;
    const imgH = isRotated ? loadedImage.width : loadedImage.height;

    const baseScale = Math.max(cropBoxSize / imgW, cropBoxSize / imgH);
    const renderScale = baseScale * zoom;

    // Scale factor from UI crop box to final canvas size
    const uiToCanvasRatio = size / cropBoxSize;

    const drawW = loadedImage.width * renderScale * uiToCanvasRatio;
    const drawH = loadedImage.height * renderScale * uiToCanvasRatio;
    const offsetX = pan.x * uiToCanvasRatio;
    const offsetY = pan.y * uiToCanvasRatio;

    ctx.drawImage(
      loadedImage,
      -drawW / 2 + offsetX,
      -drawH / 2 + offsetY,
      drawW,
      drawH
    );

    return canvas.toDataURL("image/jpeg", 0.85);
  }, [loadedImage, rotation, zoom, pan]);

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
      setStep(2); // return to preview if error
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none font-sans text-white animate-fadeIn">
      <div className="w-full max-w-lg bg-[#18191B] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[520px] max-h-[92vh] relative">
        
        {/* Header Bar */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-white/10 bg-[#141517]">
          <div className="flex items-center gap-3">
            <button
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
            <h2 className="text-lg font-semibold tracking-wide text-white">Crop & rotate</h2>
          </div>
          <button className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition cursor-pointer">
            <FaEllipsisV className="text-sm" />
          </button>
        </div>

        {/* STEP 1: Crop & Rotate */}
        {step === 1 && (
          <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 overflow-hidden">
            {/* Image Canvas Crop Container */}
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
              className="relative w-full aspect-square max-w-[320px] mx-auto rounded-2xl bg-black overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing border border-white/10 shadow-inner"
            >
              {loadedImage ? (
                <div
                  className="absolute transition-transform duration-100 ease-out"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${zoom})`,
                    transformOrigin: "center center"
                  }}
                >
                  <img
                    src={loadedImage.src}
                    alt="Source"
                    className="max-w-[280px] max-h-[280px] object-contain pointer-events-none"
                    draggable={false}
                  />
                </div>
              ) : (
                <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
              )}

              {/* Crop Box Overlay & Circle Mask */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* Translucent background overlay with circular viewport */}
                <div className="w-full h-full relative">
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "radial-gradient(circle at center, transparent 130px, rgba(0, 0, 0, 0.75) 131px)"
                    }}
                  />
                  {/* Square boundary crop corner brackets */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] border-2 border-white/90 rounded-none shadow-2xl">
                    {/* Top-Left Corner */}
                    <span className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-white" />
                    {/* Top-Right Corner */}
                    <span className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-white" />
                    {/* Bottom-Left Corner */}
                    <span className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-white" />
                    {/* Bottom-Right Corner */}
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Area */}
            <div className="flex flex-col items-center gap-4 mt-4">
              {/* Rotate Button */}
              <button
                onClick={handleRotate}
                className="flex items-center gap-2.5 px-6 py-2.5 rounded-2xl bg-[#28292C] hover:bg-[#323337] active:scale-95 text-white/90 font-medium text-xs border border-white/10 transition cursor-pointer shadow-md"
              >
                <FaRedo className="text-xs text-white/80" />
                <span>Rotate</span>
              </button>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="w-full max-w-[200px] py-3 rounded-full bg-[#A8C7FA] hover:bg-[#BBE0FF] active:scale-95 text-[#041E49] font-bold text-sm transition cursor-pointer shadow-lg tracking-wide"
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
              <h3 className="text-xl font-bold text-white tracking-wide">Your new profile picture</h3>

              {/* Visible to anyone pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#232427] border border-white/15 text-xs font-semibold text-white/90 shadow-sm">
                <FaGlobe className="text-white/70 text-xs" />
                <span>Visible to anyone</span>
              </div>

              {/* Circular Cropped Photo Preview */}
              <div className="w-48 h-48 sm:w-52 sm:h-52 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl my-2 bg-black">
                <img src={croppedDataUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>

              {/* Info Notice Box */}
              <div className="w-full bg-[#232427] border border-white/10 rounded-2xl p-3.5 flex items-center gap-3 text-left shadow-sm">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <FaInfoCircle className="text-white/80 text-sm" />
                </div>
                <p className="text-xs text-white/80 leading-relaxed font-medium">
                  It could take a moment to see the change across all your TeachHub services.
                </p>
              </div>
            </div>

            {/* Step 2 Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="px-7 py-2.5 rounded-full bg-[#A8C7FA] hover:bg-[#BBE0FF] active:scale-95 text-[#041E49] font-bold text-xs transition cursor-pointer shadow-lg"
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
              <div className="absolute inset-0 rounded-full border-4 border-[#A8C7FA] border-t-transparent animate-spin" />
              {/* Profile Image inside */}
              <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full overflow-hidden shadow-xl bg-black">
                <img src={croppedDataUrl} alt="Saving" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-base sm:text-lg font-bold text-white tracking-wide">Saving profile picture...</p>
              <p className="text-xs text-white/60 font-medium">Please wait while your photo updates</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
