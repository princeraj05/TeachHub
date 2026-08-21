const admin = require("firebase-admin");

if (admin.apps.length === 0) {
  let credential;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    try {
      const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      credential = admin.credential.cert(serviceAccount);
      console.log("Firebase Admin initialized via service account file");
    } catch (err) {
      console.error("Error loading Firebase service account JSON:", err.message);
    }
  }

  if (!credential && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
      credential = admin.credential.cert({
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
    admin.initializeApp({
      credential,
    });
  }
}

module.exports = admin;
