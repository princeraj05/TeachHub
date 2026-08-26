const http = require("http");
const UserSession = require("../models/UserSession");

function parseUserAgent(uaString) {
  if (!uaString) {
    return { device: "Unknown Device", browser: "Unknown Browser" };
  }
  let device = "Unknown Device";
  let browser = "Unknown Browser";

  // Simple Device/OS Detection
  if (uaString.includes("Windows NT 10.0")) {
    device = "Windows PC (Windows 10/11)";
  } else if (uaString.includes("Windows NT 6.3")) {
    device = "Windows PC (Windows 8.1)";
  } else if (uaString.includes("Windows NT 6.2")) {
    device = "Windows PC (Windows 8)";
  } else if (uaString.includes("Windows NT 6.1")) {
    device = "Windows PC (Windows 7)";
  } else if (uaString.includes("Macintosh")) {
    device = "Macintosh (macOS)";
  } else if (uaString.includes("iPhone")) {
    const match = uaString.match(/iPhone OS ([\d_]+)/);
    const osVer = match ? match[1].replace(/_/g, ".") : "";
    device = `iPhone (iOS ${osVer || "iOS"})`;
  } else if (uaString.includes("iPad")) {
    device = "iPad (iOS)";
  } else if (uaString.includes("Android")) {
    const match = uaString.match(/Android ([\d.]+)/);
    const osVer = match ? match[1] : "";
    let model = "";
    const parts = uaString.split(')');
    if (parts.length > 0) {
      const subParts = parts[0].split(';');
      if (subParts.length > 2) {
        model = subParts[subParts.length - 1].trim();
      }
    }
    device = `${model || "Android Device"} (Android ${osVer || "Android"})`;
  } else if (uaString.includes("Linux")) {
    device = "Linux PC";
  }

  // Simple Browser Detection
  if (uaString.includes("Edg/")) {
    const match = uaString.match(/Edg\/([\d.]+)/);
    browser = `Edge ${match ? match[1] : ""}`;
  } else if (uaString.includes("Chrome/") || uaString.includes("CriOS/")) {
    const match = uaString.match(/(?:Chrome|CriOS)\/([\d.]+)/);
    browser = `Chrome ${match ? match[1] : ""}`;
  } else if (uaString.includes("Firefox/") || uaString.includes("FxiOS/")) {
    const match = uaString.match(/(?:Firefox|FxiOS)\/([\d.]+)/);
    browser = `Firefox ${match ? match[1] : ""}`;
  } else if (uaString.includes("Safari/")) {
    const match = uaString.match(/Version\/([\d.]+)/);
    browser = `Safari ${match ? match[1] : ""}`;
  }

  return { device, browser };
}

function getIpLocation(ip) {
  return new Promise((resolve) => {
    if (
      !ip ||
      ip === "127.0.0.1" ||
      ip === "::1" ||
      ip.startsWith("192.168.") ||
      ip.startsWith("10.") ||
      ip.startsWith("172.16.") ||
      ip.startsWith("::ffff:127.0.0.1") ||
      ip.startsWith("::ffff:192.168.") ||
      ip.startsWith("::ffff:10.") ||
      ip.startsWith("::ffff:172.16.")
    ) {
      resolve("Local Session");
      return;
    }

    // strip IPv6 prefix if present e.g. ::ffff:103.21.45.67
    const cleanIp = ip.includes(":") ? ip.split(":").pop() : ip;

    http.get(`http://ip-api.com/json/${cleanIp}`, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed && parsed.status === "success") {
            const loc = [parsed.city, parsed.regionName, parsed.country].filter(Boolean).join(", ");
            resolve(loc || "Unknown Location");
          } else {
            resolve("Unknown Location");
          }
        } catch (e) {
          resolve("Unknown Location");
        }
      });
    }).on("error", () => {
      resolve("Unknown Location");
    });
  });
}

async function createSession(userId, token, req) {
  try {
    const ua = req.headers["user-agent"] || "";
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    const { device, browser } = parseUserAgent(ua);
    const location = await getIpLocation(ip);

    await UserSession.create({
      userId,
      token,
      device,
      browser,
      ip,
      location,
      status: "Active",
      lastActive: new Date()
    });
  } catch (error) {
    console.error("Error creating user session:", error);
  }
}

module.exports = {
  parseUserAgent,
  getIpLocation,
  createSession
};
