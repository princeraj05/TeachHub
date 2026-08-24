export const compressImage = (file) => new Promise((resolve, reject) => {
  if (!file.type.startsWith("image/")) return resolve(file);
  const image = new Image(); const url = URL.createObjectURL(file);
  image.onload = () => { const ratio = Math.min(1, 1920 / Math.max(image.width, image.height)); const canvas = document.createElement("canvas"); canvas.width = Math.round(image.width * ratio); canvas.height = Math.round(image.height * ratio); canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height); canvas.toBlob(blob => { URL.revokeObjectURL(url); resolve(blob && blob.size < file.size ? new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }) : file); }, "image/jpeg", 0.82); };
  image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image compression failed")); }; image.src = url;
});
export const videoDuration = (file) => new Promise((resolve, reject) => { const video = document.createElement("video"), url = URL.createObjectURL(file); video.preload = "metadata"; video.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(video.duration); }; video.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read video duration")); }; video.src = url; });

// Browser-native fallback transcoder. It only replaces the original when a smaller
// WebM file is produced; unsupported browsers continue safely with the source file.
export const compressVideo = async (file) => {
  if (!file.type.startsWith("video/") || !window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream || !window.AudioContext) return file;
  const video = document.createElement("video");
  const canvas = document.createElement("canvas");
  const sourceUrl = URL.createObjectURL(file);
  let animationFrame;
  try {
    video.src = sourceUrl; video.playsInline = true; video.preload = "auto";
    await new Promise((resolve, reject) => { video.onloadedmetadata = resolve; video.onerror = reject; });
    const scale = Math.min(1, 1280 / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.max(2, Math.floor(video.videoWidth * scale / 2) * 2);
    canvas.height = Math.max(2, Math.floor(video.videoHeight * scale / 2) * 2);
    const context = canvas.getContext("2d", { alpha: false });
    const canvasStream = canvas.captureStream(24);
    const audioContext = new AudioContext();
    const audioDestination = audioContext.createMediaStreamDestination();
    const mediaSource = audioContext.createMediaElementSource(video);
    mediaSource.connect(audioDestination);
    const combinedStream = new MediaStream([...canvasStream.getVideoTracks(), ...audioDestination.stream.getAudioTracks()]);
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus") ? "video/webm;codecs=vp8,opus" : "video/webm";
    const chunks = [];
    const recorder = new MediaRecorder(combinedStream, { mimeType, videoBitsPerSecond: 1_000_000, audioBitsPerSecond: 96_000 });
    const blobPromise = new Promise((resolve, reject) => { recorder.ondataavailable = (event) => event.data.size && chunks.push(event.data); recorder.onerror = () => reject(new Error("Video compression failed")); recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType })); });
    const drawFrame = () => { context.drawImage(video, 0, 0, canvas.width, canvas.height); if (!video.paused && !video.ended) animationFrame = requestAnimationFrame(drawFrame); };
    await audioContext.resume(); recorder.start(1000); await video.play(); drawFrame(); await new Promise((resolve) => { video.onended = resolve; }); recorder.stop();
    const blob = await blobPromise;
    await audioContext.close();
    return blob.size && blob.size < file.size ? new File([blob], file.name.replace(/\.[^.]+$/, ".webm"), { type: mimeType }) : file;
  } catch { return file; } finally { cancelAnimationFrame(animationFrame); URL.revokeObjectURL(sourceUrl); video.remove(); canvas.remove(); }
};
