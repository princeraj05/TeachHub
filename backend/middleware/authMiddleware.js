const jwt = require("jsonwebtoken");

exports.protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY");

    // A token only identifies the user. Read the current role and school from the
    // database so a stale token cannot retain permissions after an admin change.
    const User = require("../models/User");
    const user = await User.findById(decoded.id).select("role requestedRole schoolName supportStatus").lean();
    if (!user) return res.status(401).json({ message: "User no longer exists" });

    if (user.role === "support" && user.supportStatus === "suspended") {
      return res.status(403).json({ message: "Support Team account is suspended. Access denied." });
    }

    // Validate User Session safely
    try {
      const UserSession = require("../models/UserSession");
      const { parseUserAgent, getIpLocation } = require("../utils/sessionHelper");
      
      let session = await UserSession.findOne({ token }).lean();
      if (!session) {
        const ua = req.headers["user-agent"] || "";
        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
        const { device, browser } = parseUserAgent(ua);
        UserSession.create({
          userId: user._id,
          token,
          device,
          browser,
          ip,
          location: "Unknown Location",
          status: "Active",
          lastActive: new Date()
        }).then(newSession => {
          getIpLocation(ip).then(loc => {
            if (loc && loc !== "Unknown Location") {
              UserSession.findByIdAndUpdate(newSession._id, { location: loc }).catch(() => {});
            }
          }).catch(() => {});
        }).catch(() => {});
      } else if (session.status === "Logged out") {
        return res.status(401).json({ message: "Session has been logged out" });
      } else {
        const now = Date.now();
        if (!session.lastActive || now - new Date(session.lastActive).getTime() > 60000) {
          UserSession.updateOne({ _id: session._id }, { lastActive: new Date() }).catch(() => {});
        }
      }
    } catch (sErr) {
      console.error("UserSession middleware check error:", sErr.message);
    }

    req.user = { ...decoded, id: decoded.id || user._id.toString(), _id: user._id, role: user.role, requestedRole: user.requestedRole || "", schoolName: user.schoolName || "" };
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
