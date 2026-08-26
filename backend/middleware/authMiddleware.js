const jwt = require("jsonwebtoken");

exports.protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // A token only identifies the user. Read the current role and school from the
    // database so a stale token cannot retain permissions after an admin change.
    const User = require("../models/User");
    const user = await User.findById(decoded.id).select("role schoolName").lean();
    if (!user) return res.status(401).json({ message: "User no longer exists" });

    // Validate User Session
    const UserSession = require("../models/UserSession");
    const { parseUserAgent, getIpLocation } = require("../utils/sessionHelper");
    
    let session = await UserSession.findOne({ token });
    if (!session) {
      // Create session on the fly for active legacy tokens
      const ua = req.headers["user-agent"] || "";
      const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
      const { device, browser } = parseUserAgent(ua);
      const location = await getIpLocation(ip);
      session = await UserSession.create({
        userId: user._id,
        token,
        device,
        browser,
        ip,
        location,
        status: "Active",
        lastActive: new Date()
      });
    } else if (session.status === "Logged out") {
      return res.status(401).json({ message: "Session has been logged out" });
    } else {
      session.lastActive = new Date();
      await session.save();
    }

    req.user = { ...decoded, role: user.role, schoolName: user.schoolName || "" };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalid" });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access Denied" });
    }
    next();
  };
};
