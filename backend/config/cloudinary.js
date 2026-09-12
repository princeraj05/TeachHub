const cloudinary = require("cloudinary").v2;

const cleanEnv = (val) => (val || "").trim().replace(/^["']|["']$/g, "").trim();

const cloudName = cleanEnv(process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME);
const apiKey = cleanEnv(process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_KEY);
const apiSecret = cleanEnv(process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET);

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });
} else if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: cleanEnv(process.env.CLOUDINARY_URL),
    secure: true
  });
}

module.exports = cloudinary;

