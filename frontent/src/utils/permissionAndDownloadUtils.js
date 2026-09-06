/**
 * TeachHub Permission & Mobile Download Utility
 * Provides Just-In-Time permission requests for Camera, Microphone, Location,
 * Screen Share, and Notifications, plus robust mobile file downloads.
 */

// 1. Just-In-Time Camera & Microphone Permission
export const requestCameraAndMicPermission = async (callType = "video") => {
  try {
    const constraints = {
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      video: callType === "video" ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" } : false
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return { success: true, stream };
  } catch (error) {
    console.error("Camera/Mic Permission Error:", error);
    let message = "Camera and Microphone permission is required.";
    if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
      message = "Camera/Microphone access was denied. Please allow permissions in your browser settings to continue.";
    } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
      message = "No camera or microphone found on this device.";
    }
    return { success: false, error: message };
  }
};

// 2. Just-In-Time Screen Share Permission (for Exam Proctoring & Live Sessions)
export const requestScreenSharePermission = async () => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      throw new Error("Screen sharing is not supported on this device/browser.");
    }
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { cursor: "always" },
      audio: false
    });
    return { success: true, stream };
  } catch (error) {
    console.error("Screen Share Permission Error:", error);
    let message = "Screen sharing permission is required for exam proctoring.";
    if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
      message = "Screen share request was cancelled or denied. Please select screen sharing to proceed with the exam.";
    } else if (error.message) {
      message = error.message;
    }
    return { success: false, error: message };
  }
};

// 3. Just-In-Time Location Permission
export const requestLocationPermission = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ success: false, error: "Geolocation is not supported by your browser." });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          success: true,
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
        });
      },
      (error) => {
        console.error("Location Permission Error:", error);
        let message = "Location permission is required.";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Location access was denied. Please turn on location permissions in your browser settings.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Location information is unavailable.";
        } else if (error.code === error.TIMEOUT) {
          message = "Location request timed out.";
        }
        resolve({ success: false, error: message });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};

// 4. Just-In-Time Notification Permission (for WhatsApp-style Incoming Call notifications)
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    return { success: false, error: "Notifications not supported in this browser." };
  }

  if (Notification.permission === "granted") {
    return { success: true, permission: "granted" };
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      return { success: true, permission: "granted" };
    }
  }

  return { success: false, permission: Notification.permission, error: "Notification permission denied." };
};

// 5. Robust Mobile & Cross-Browser File Downloader
export const downloadFileMobile = async (fileUrl, fileName = "file") => {
  if (!fileUrl) return;

  try {
    // If Data URL / Base64
    if (fileUrl.startsWith("data:")) {
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = fileName || "download";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // Try fetching file blob (bypasses cross-origin navigation on mobile Chrome/Safari)
    const response = await fetch(fileUrl, { mode: "cors" });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    
    // Determine extension
    let extension = "";
    if (!fileName.includes(".")) {
      const mime = blob.type;
      if (mime.includes("pdf")) extension = ".pdf";
      else if (mime.includes("jpeg") || mime.includes("jpg")) extension = ".jpg";
      else if (mime.includes("png")) extension = ".png";
      else if (mime.includes("webm")) extension = ".webm";
      else if (mime.includes("mp4")) extension = ".mp4";
    }

    link.download = fileName + extension;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 2000);
  } catch (error) {
    console.warn("Direct blob download failed, opening directly in browser tab:", error);
    // Fallback: Open URL in new window/tab for native browser download handler
    const link = document.createElement("a");
    link.href = fileUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.download = fileName || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
