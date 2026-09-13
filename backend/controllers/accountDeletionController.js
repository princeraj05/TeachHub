const AccountDeletionRequest = require("../models/AccountDeletionRequest");
const User = require("../models/User");

// Simple email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public POST endpoint to submit deletion request
exports.submitDeletionRequest = async (req, res) => {
  try {
    const { email, name, role, schoolName, reason } = req.body;

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";

    // Check if user account exists (informational, does not leak user details)
    const existingUser = await User.findOne({ email: cleanEmail }).select("_id role schoolName name").lean();

    // Check for recent pending request to prevent spam
    const recentRequest = await AccountDeletionRequest.findOne({
      email: cleanEmail,
      status: "pending",
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (recentRequest) {
      return res.status(400).json({
        message: "An account deletion request for this email has already been submitted recently. Our compliance team is processing it."
      });
    }

    const requestDoc = await AccountDeletionRequest.create({
      email: cleanEmail,
      name: (name || (existingUser ? existingUser.name : "")).trim(),
      role: role || (existingUser ? existingUser.role : "other"),
      schoolName: (schoolName || (existingUser ? existingUser.schoolName : "")).trim(),
      reason: (reason || "").trim(),
      status: "pending",
      ip: String(clientIp)
    });

    res.status(201).json({
      success: true,
      message: "Account deletion request submitted successfully. Our privacy team will process your request within 7 business days.",
      requestId: requestDoc._id
    });
  } catch (error) {
    console.error("Error submitting account deletion request:", error);
    res.status(500).json({ message: "An error occurred while submitting your request. Please try again later." });
  }
};

// Protected GET endpoint for SuperAdmin to view deletion requests
exports.getDeletionRequests = async (req, res) => {
  try {
    const requests = await AccountDeletionRequest.find().sort({ createdAt: -1 }).limit(100);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Protected PUT endpoint for SuperAdmin to update request status
exports.updateDeletionRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const requestDoc = await AccountDeletionRequest.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );

    if (!requestDoc) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json(requestDoc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
