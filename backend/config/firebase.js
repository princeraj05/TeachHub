const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const path = require("path");

let app;

if (getApps().length === 0) {
  let credential;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    try {
      const resolvedPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      const serviceAccount = require(resolvedPath);
      credential = cert(serviceAccount);
      console.log("Firebase Admin initialized via service account file");
    } catch (err) {
      console.error("Error loading Firebase service account JSON:", err.message);
    }
  }


  if (!credential && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      
      // Clean up surrounding quotes if pasted from JSON file with quotes
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1);
      }
      // Clean up single quotes if pasted with single quotes
      if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
        privateKey = privateKey.slice(1, -1);
      }
      
      privateKey = privateKey.replace(/\\n/g, "\n");
      
      credential = cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      });
      console.log("Firebase Admin initialized via environment variables");
    } catch (err) {
      console.error("Error initializing Firebase cert from env variables:", err.message);
    }
  }


  if (!credential) {
    console.warn("⚠️ Firebase Admin credentials not configured. Auth sync will fail.");
  } else {
    app = initializeApp({
      credential,
    });
  }
} else {
  app = getApps()[0];
}

const firebaseAdmin = {
  auth: () => {
    if (!getApps().length) {
      throw new Error("Firebase Admin SDK is not initialized. Please configure credentials.");
    }
    return getAuth();
  }
};

module.exports = firebaseAdmin;

