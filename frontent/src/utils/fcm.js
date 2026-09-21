import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import axios from "axios";
import API_URL from "../config/api";

export const initFCM = async (navigate) => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // 1. Request notification permission (Android 13+ / iOS)
    let permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive === "prompt") {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== "granted") {
      console.warn("FCM Notification permission not granted");
      return;
    }

    // 2. Create high-importance Android Notification Channel
    try {
      await PushNotifications.createChannel({
        id: "default",
        name: "Default Notifications",
        description: "General school updates and alerts",
        importance: 4, // High importance
        visibility: 1, // Public
        vibration: true
      });
    } catch (chanErr) {
      console.warn("FCM channel creation notice:", chanErr.message || chanErr);
    }

    // 3. Listeners setup before register
    await PushNotifications.removeAllListeners();

    PushNotifications.addListener("registration", async (token) => {
      if (token && token.value) {
        console.log("FCM device token received:", token.value);
        await sendTokenToBackend(token.value);
      }
    });

    PushNotifications.addListener("registrationError", (error) => {
      console.error("FCM registration error:", error);
    });

    // Foreground notification listener
    PushNotifications.addListener("pushNotificationReceived", (notification) => {
      console.log("FCM foreground notification received:", notification);
    });

    // Notification tap listener
    PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
      console.log("FCM notification tapped:", action);
      const data = action.notification?.data;
      if (data && (data.route || data.link) && navigate) {
        const targetRoute = data.route || data.link;
        if (targetRoute && targetRoute.startsWith("/")) {
          navigate(targetRoute);
        }
      }
    });

    // 4. Register device for push notifications
    await PushNotifications.register();

  } catch (err) {
    console.error("Failed to initialize FCM Push Notifications:", err);
  }
};

export const sendTokenToBackend = async (fcmToken) => {
  const token = localStorage.getItem("token");
  if (!token || !fcmToken) return;

  try {
    await axios.post(
      `${API_URL}/api/app-notifications/register-fcm-token`,
      { fcmToken },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("FCM device token synced with backend successfully");
  } catch (err) {
    console.warn("Failed to sync FCM token with backend:", err.message);
  }
};

export const unregisterFCM = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    await axios.post(
      `${API_URL}/api/app-notifications/unregister-fcm-token`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("FCM token unregistered from backend");
  } catch (err) {
    console.warn("Failed to unregister FCM token:", err.message);
  }
};
