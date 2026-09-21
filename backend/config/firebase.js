const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const path = require("path");
const fs = require("fs");

let app;

if (getApps().length === 0) {
  let credential;

  // 1. Try individual env variables (most reliable on cloud hosters like Hostinger)
  if (!credential && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;

      if (typeof privateKey === "string") {
        privateKey = privateKey.trim();

        // Unquote if JSON stringified
        if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
          try {
            privateKey = JSON.parse(privateKey);
          } catch (e) {
            privateKey = privateKey.slice(1, -1);
          }
        }

        // Clean escaped quotes and normalize backslash newlines
        privateKey = privateKey
          .replace(/\\"/g, '"')
          .replace(/\\'/g, "'")
          .replace(/\\\\n/g, "\n")
          .replace(/\\n/g, "\n")
          .replace(/\r\n/g, "\n")
          .trim();
      }

      credential = cert({
        projectId: process.env.FIREBASE_PROJECT_ID.trim(),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL.trim(),
        privateKey: privateKey,
      });
      console.log("Firebase Admin initialized via environment variables");
    } catch (err) {
      // Silently fall back to next method
    }
  }

  // 2. Try physical service account file (explicit path or auto-detected in backend/root folder)
  if (!credential) {
    const candidatePaths = [
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
      path.join(__dirname, "teachhub-da45a-firebase-adminsdk-fbsvc-97809f78a9.json"),
      path.join(__dirname, "..", "teachhub-da45a-firebase-adminsdk-fbsvc-97809f78a9.json")
    ].filter(Boolean);

    for (const p of candidatePaths) {
      try {
        const resolvedPath = path.resolve(p);
        if (fs.existsSync(resolvedPath)) {
          const serviceAccount = require(resolvedPath);
          credential = cert(serviceAccount);
          console.log(`Firebase Admin initialized via service account file (${path.basename(resolvedPath)})`);
          break;
        }
      } catch (err) {
        // Continue checking other candidates
      }
    }
  }

  // 3. Try FIREBASE_SERVICE_ACCOUNT_JSON env variable (raw JSON string or Base64 string)
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
      if (parsed && typeof parsed.private_key === "string") {
        parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
      }
      credential = cert(parsed);
      console.log("Firebase Admin initialized via JSON environment variable");
    } catch (err) {
      // Silently fall back
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

const { getMessaging } = require("firebase-admin/messaging");

const firebaseAdmin = {
  auth: () => {
    if (!getApps().length) {
      throw new Error("Firebase Admin SDK is not initialized. Please configure credentials.");
    }
    return getAuth();
  },
  messaging: () => {
    if (!getApps().length) {
      return null;
    }
    return getMessaging();
  }
};

module.exports = firebaseAdmin;
