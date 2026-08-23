export const compressImage = (file) => new Promise((resolve, reject) => {
  if (!file.type.startsWith("image/")) return resolve(file);
  const image = new Image(); const url = URL.createObjectURL(file);
  image.onload = () => { const ratio = Math.min(1, 1920 / Math.max(image.width, image.height)); const canvas = document.createElement("canvas"); canvas.width = Math.round(image.width * ratio); canvas.height = Math.round(image.height * ratio); canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height); canvas.toBlob(blob => { URL.revokeObjectURL(url); resolve(blob && blob.size < file.size ? new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }) : file); }, "image/jpeg", 0.82); };
  image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image compression failed")); }; image.src = url;
});
export const videoDuration = (file) => new Promise((resolve, reject) => { const video = document.createElement("video"), url = URL.createObjectURL(file); video.preload = "metadata"; video.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(video.duration); }; video.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read video duration")); }; video.src = url; });
