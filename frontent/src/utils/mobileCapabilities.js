import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";

/**
 * TeachHub Shared Mobile Capability Architecture
 * Provides a unified, safe abstraction layer to distinguish Web Browser
 * vs. Android Capacitor runtime environments, while supporting multi-app target roles.
 */

// 1. Platform Detection
export const isNativePlatform = () => {
  return typeof window !== "undefined" && Boolean(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
};

export const getPlatform = () => {
  if (isNativePlatform()) {
    const platform = window.Capacitor.getPlatform ? window.Capacitor.getPlatform() : "android";
    return platform;
  }
  return "web";
};

// 2. App Target Role Configuration (Combined, Student, Teacher, Admin)
export const getAppRole = () => {
  if (typeof window !== "undefined" && window.__TEACHHUB_APP_ROLE__) {
    return window.__TEACHHUB_APP_ROLE__;
  }
  return import.meta.env.VITE_APP_ROLE || "combined";
};

export const getAppConfig = () => {
  const role = getAppRole();
  const configs = {
    combined: {
      role: "combined",
      appName: "Your School Admin",
      appId: "com.yourschool.adminapp",
      entryRoute: "/",
      supportsSuperAdmin: true,
      rolesAllowed: ["admin", "teacher", "student", "super_admin", "support"]
    },
    student: {
      role: "student",
      appName: "Your School Student",
      appId: "com.yourschool.studentapp",
      entryRoute: "/student/login",
      supportsSuperAdmin: false,
      rolesAllowed: ["student"]
    },
    teacher: {
      role: "teacher",
      appName: "Your School Teacher",
      appId: "com.yourschool.teacherapp",
      entryRoute: "/teacher/login",
      supportsSuperAdmin: false,
      rolesAllowed: ["teacher"]
    },
    admin: {
      role: "admin",
      appName: "Your School Admin",
      appId: "com.yourschool.adminapp",
      entryRoute: "/admin/login",
      supportsSuperAdmin: true,
      rolesAllowed: ["admin", "super_admin"]
    }
  };

  return configs[role] || configs.combined;
};

// 3. Platform Capabilities & Status Flags
export const mobilePlatform = {
  get isNative() {
    return isNativePlatform();
  },
  get isWeb() {
    return !isNativePlatform();
  },
  get platform() {
    return getPlatform();
  },
  get isAndroid() {
    return getPlatform() === "android";
  },
  get isIOS() {
    return getPlatform() === "ios";
  },
  get appRole() {
    return getAppRole();
  },
  get appConfig() {
    return getAppConfig();
  }
};

// 4. Native Capabilities Detector
export const checkNativeCapability = (capability) => {
  const isNative = isNativePlatform();

  switch (capability) {
    case "camera":
      return {
        supported: true,
        isNative,
        mode: isNative ? "native_or_file_chooser" : "browser_input"
      };
    case "download":
      return {
        supported: true,
        isNative,
        mode: isNative ? "android_storage_or_blob" : "browser_blob"
      };
    case "webrtc":
      return {
        supported: typeof navigator !== "undefined" && Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        isNative,
        mode: "webrtc_peer_connection"
      };
    case "notifications":
      return {
        supported: typeof window !== "undefined" && "Notification" in window,
        isNative,
        mode: isNative ? "native_push" : "web_notification"
      };
    default:
      return { supported: false, isNative, mode: "unknown" };
  }
};

export const pickProfilePhotoFromCamera = async () => {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    let imageWebPath = null;
    let format = "jpg";
    
    if (typeof Camera.takePhoto === "function") {
      const res = await Camera.takePhoto({ quality: 90 });
      if (res && (res.webPath || res.path)) {
        imageWebPath = res.webPath || res.path;
        format = res.format || "jpg";
      }
    } else {
      const photo = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });
      imageWebPath = photo?.webPath;
      format = photo?.format || "jpg";
    }

    if (imageWebPath) {
      const response = await fetch(imageWebPath);
      const blob = await response.blob();
      return new File([blob], `camera_${Date.now()}.${format}`, {
        type: blob.type || `image/${format === "png" ? "png" : "jpeg"}`
      });
    }
  } catch (err) {
    console.warn("Camera photo capture cancelled or failed:", err);
  }
  return null;
};

export const pickProfilePhotoFromGallery = async () => {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    let imageWebPath = null;
    let format = "jpg";

    if (typeof Camera.chooseFromGallery === "function") {
      const res = await Camera.chooseFromGallery({ quality: 90, selectionLimit: 1 });
      if (res && res.result && res.result.length > 0) {
        const item = res.result[0];
        imageWebPath = item.webPath || item.path;
        format = item.format || "jpg";
      }
    } else {
      const photo = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos
      });
      imageWebPath = photo?.webPath;
      format = photo?.format || "jpg";
    }

    if (imageWebPath) {
      const response = await fetch(imageWebPath);
      const blob = await response.blob();
      return new File([blob], `gallery_${Date.now()}.${format}`, {
        type: blob.type || `image/${format === "png" ? "png" : "jpeg"}`
      });
    }
  } catch (err) {
    console.warn("Gallery photo selection cancelled or failed:", err);
  }
  return null;
};

export const pickProfilePhoto = async (preferredSource = "prompt") => {
  if (!Capacitor.isNativePlatform()) return null;

  if (preferredSource === "camera") {
    return await pickProfilePhotoFromCamera();
  }
  if (preferredSource === "gallery") {
    return await pickProfilePhotoFromGallery();
  }

  try {
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt,
      promptLabelHeader: "Profile Photo",
      promptLabelCancel: "Cancel",
      promptLabelPhoto: "Choose from Gallery",
      promptLabelPicture: "Take Photo"
    });

    if (photo && photo.webPath) {
      const response = await fetch(photo.webPath);
      const blob = await response.blob();
      return new File([blob], `profile_${Date.now()}.${photo.format || "jpg"}`, {
        type: blob.type || "image/jpeg"
      });
    }
  } catch (err) {
    if (err && err.message && !err.message.includes("cancelled") && !err.message.includes("canceled")) {
      return await pickProfilePhotoFromGallery();
    }
  }
  return null;
};

export default {
  isNativePlatform,
  getPlatform,
  getAppRole,
  getAppConfig,
  mobilePlatform,
  checkNativeCapability,
  pickProfilePhoto,
  pickProfilePhotoFromCamera,
  pickProfilePhotoFromGallery
};
