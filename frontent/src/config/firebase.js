import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCTzTXromN6LcZSrIuF9whtl_KsDAHWTbs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "teachhub-da45a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "teachhub-da45a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "teachhub-da45a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "50641468952",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:50641468952:android:2b7f8007181ae3011f4d6d",
};

let app;
let auth = null;
let googleProvider = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
} catch (error) {
  console.error("Firebase initialization error:", error);
}

export { auth, googleProvider };

