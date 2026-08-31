const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const path = require("path");
const fs = require("fs");

let app;

if (getApps().length === 0) {
  let credential;

  // 1. Try FIREBASE_SERVICE_ACCOUNT_JSON env variable (raw JSON string or Base64 string)
  const jsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!credential && jsonEnv) {
    try {
      const jsonStr = jsonEnv.trim();
      let parsed;
      if (jsonStr.startsWith("{")) {
        parsed = JSON.parse(jsonStr);
      } else {
        const decoded = Buffer.from(jsonStr, "base64").toString("utf-8");
        parsed = JSON.parse(decoded);
      }
      credential = cert(parsed);
      console.log("Firebase Admin initialized via JSON environment variable");
    } catch (err) {
      console.error("Error loading Firebase service account from JSON env var:", err.message);
    }
  }

  // 2. Try FIREBASE_SERVICE_ACCOUNT_PATH (file path) if file exists
  if (!credential && process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    try {
      const resolvedPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      if (fs.existsSync(resolvedPath)) {
        const serviceAccount = require(resolvedPath);
        credential = cert(serviceAccount);
        console.log("Firebase Admin initialized via service account file");
      } else {
        console.warn(`⚠️ Firebase service account file not found at: ${resolvedPath}`);
      }
    } catch (err) {
      console.error("Error loading Firebase service account JSON file:", err.message);
    }
  }

  // 3. Try individual env variables
  if (!credential && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;

      if (typeof privateKey === "string") {
        privateKey = privateKey.trim();

        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
          try {
            privateKey = JSON.parse(privateKey);
          } catch (e) {
            privateKey = privateKey.slice(1, -1);
          }
        } else if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
          privateKey = privateKey.slice(1, -1);
        }

        privateKey = privateKey.replace(/\\n/g, "\n").replace(/\r\n/g, "\n");
      }

      credential = cert({
        projectId: process.env.FIREBASE_PROJECT_ID.trim(),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL.trim(),
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

