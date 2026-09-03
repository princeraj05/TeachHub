export const compressImage = async (file) => file;

export const compressAvatar = (file) => new Promise((resolve) => resolve(file));

export const videoDuration = (file) => new Promise((resolve) => {
  if (!file || !file.type?.startsWith("video/")) return resolve(0);
  const video = document.createElement("video");
  const url = URL.createObjectURL(file);
  video.preload = "metadata";
  video.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(video.duration); };
  video.onerror = () => { URL.revokeObjectURL(url); resolve(0); };
  video.src = url;
});

export const compressVideo = async (file) => file;

