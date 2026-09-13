const mongoose = require("mongoose");

const aboutAppSchema = new mongoose.Schema({
  // Platform Info
  platformName: { type: String, default: "TeachHub" },
  tagline: { type: String, default: "Smart School Management & Communication Platform" },
  version: { type: String, default: "2.1.0" },
  platformWebsite: { type: String, default: "https://teachhub.app" },
  logoUrl: { type: String, default: "" },

  // Developer Info
  developerName: { type: String, default: "TeachHub Technologies Pvt. Ltd." },
  developerAddress: { type: String, default: "B-32, Sector-63, Noida, Uttar Pradesh - 201301, India" },
  developerEmail: { type: String, default: "hello@teachhub.app" },
  developerPhone: { type: String, default: "+91 98765 43210" },

  // Support Contact
  supportEmail: { type: String, default: "support@teachhub.app" },
  supportPhone: { type: String, default: "+91 98765 43210" },
  supportWhatsapp: { type: String, default: "+91 98765 43210" },
  supportHours: { type: String, default: "Monday - Saturday: 9:00 AM to 6:00 PM (IST)" },

  // Legal Links
  privacyPolicyUrl: { type: String, default: "https://skyblue-yak-430824.hostingersite.com/privacy-policy" },
  cookiePolicyUrl: { type: String, default: "https://skyblue-yak-430824.hostingersite.com/cookie-policy" },
  termsOfServiceUrl: { type: String, default: "https://skyblue-yak-430824.hostingersite.com/terms-of-service" },
  disclaimerUrl: { type: String, default: "https://skyblue-yak-430824.hostingersite.com/disclaimer" },
  refundPolicyUrl: { type: String, default: "https://skyblue-yak-430824.hostingersite.com/refund-policy" },
  aboutUsUrl: { type: String, default: "https://skyblue-yak-430824.hostingersite.com/about-us" },
  accountDeletionUrl: { type: String, default: "https://skyblue-yak-430824.hostingersite.com/delete-account" },

  // App Stores & Social Links
  playStoreLink: { type: String, default: "https://play.google.com/store/apps/details?id=com.teachhub.app" },
  appStoreLink: { type: String, default: "https://apps.apple.com/app/teachhub" },
  socialFacebook: { type: String, default: "https://facebook.com" },
  socialTwitter: { type: String, default: "https://twitter.com" },
  socialInstagram: { type: String, default: "https://instagram.com" },
  socialYoutube: { type: String, default: "https://youtube.com" },
  socialLinkedin: { type: String, default: "https://linkedin.com" }
}, { timestamps: true });

module.exports = mongoose.model("AboutApp", aboutAppSchema);
