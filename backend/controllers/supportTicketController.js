const mongoose = require("mongoose");
const SupportTicket = require("../models/SupportTicket");
const User = require("../models/User");
const { createAppNotification, notifySupportDepartment, notifyTicketRequester } = require("../utils/notificationHelper");

// Canonical Department Category Mapping
const MAP_CATEGORY_TO_DEPARTMENT = {
  // Billing
  "School Subscription": "Billing",
  "Student Payment": "Billing",
  "Teacher Salary Payment": "Billing",
  "Invoice & Receipt": "Billing",
  "Refund Request": "Billing",
  "Transaction Error": "Billing",

  // Technical
  "Attendance Issue": "Technical",
  "Exam / Proctoring Problem": "Technical",
  "Result Calculation Error": "Technical",
  "App Crash / Error": "Technical",
  "Broken Link / Page Load": "Technical",
  "Audio/Video Call Glitch": "Technical",

  // Onboarding
  "Admin Account Setup": "Onboarding",
  "Teacher Onboarding": "Onboarding",
  "Student Registration": "Onboarding",
  "Bulk Data Upload": "Onboarding",
  "School Profile Setup": "Onboarding",
  "Initial Usage Guidance": "Onboarding"
};

const resolveDepartment = (category) => {
  if (!category) return "Technical";
  if (MAP_CATEGORY_TO_DEPARTMENT[category]) return MAP_CATEGORY_TO_DEPARTMENT[category];

  const catLower = category.toLowerCase();
  if (catLower.includes("pay") || catLower.includes("bill") || catLower.includes("fee") || catLower.includes("subscrib") || catLower.includes("refund") || catLower.includes("invoice") || catLower.includes("transaction")) {
    return "Billing";
  }
  if (catLower.includes("setup") || catLower.includes("onboard") || catLower.includes("upload") || catLower.includes("register") || catLower.includes("account")) {
    return "Onboarding";
  }
  return "Technical";
};

const generateTicketNumber = async () => {
  let attempts = 0;
  while (attempts < 10) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `TH-${randomNum}`;
    const exists = await SupportTicket.findOne({ ticketNumber }).select("_id").lean();
    if (!exists) return ticketNumber;
    attempts++;
  }
  return `TH-${Date.now().toString().slice(-6)}`;
};

const escapeRegex = (str) => (str || "").trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeDepartment = (dept) => {
  const rawDept = (dept || "").trim();
  if (rawDept === "Account Onboarding") return "Onboarding";
  return rawDept;
};

// ================= 1. CREATE TICKET =================
// POST /api/support/tickets
exports.createTicket = async (req, res) => {
  try {
    const { role, requestedRole: userRequestedRole, id: userId, schoolName: userSchool } = req.user;

    if (role === "support") {
      return res.status(403).json({ message: "Support Agents cannot submit support tickets." });
    }

    const allowedRequesterRoles = ["student", "teacher", "admin"];
    let requesterRole = role;

    if (role === "unassigned") {
      if (allowedRequesterRoles.includes(userRequestedRole)) {
        requesterRole = userRequestedRole;
      } else if (userRequestedRole === "superadmin") {
        requesterRole = "admin";
      } else {
        return res.status(400).json({
          message: "Pending user must have a valid requested role (student, teacher, or admin) to submit support tickets."
        });
      }
    } else if (!allowedRequesterRoles.includes(role)) {
      if (role === "superadmin") {
        requesterRole = "admin";
      } else {
        return res.status(403).json({ message: "Only Students, Teachers, Admins, and Pending Users can create support tickets." });
      }
    }

    const { category, subject, description, priority, attachments } = req.body;

    if (!category || !subject || !description) {
      return res.status(400).json({ message: "Category, subject, and description are required." });
    }

    const schoolName = (userSchool || "").trim();
    const department = resolveDepartment(category);
    const validPriorities = ["Low", "Medium", "High", "Urgent"];
    const finalPriority = validPriorities.includes(priority) ? priority : "Medium";
    const ticketNumber = await generateTicketNumber();

    const ticket = await SupportTicket.create({
      ticketNumber,
      requester: userId,
      requesterRole,
      schoolName,
      department,
      assignedDepartment: department,
      category: category.trim(),
      subject: subject.trim(),
      description: description.trim(),
      priority: finalPriority,
      status: "New",
      assignedTo: null,
      isEscalated: false,
      attachments: Array.isArray(attachments) ? attachments : []
    });

    const populated = await SupportTicket.findById(ticket._id)
      .populate("requester", "name email role avatar schoolName");

    // Trigger Notification for Support Department & SuperAdmins asynchronously
    notifySupportDepartment({
      department,
      title: `New Support Request #${ticketNumber}`,
      message: `${populated?.requester?.name || "User"} (${schoolName || "TeachHub"}) raised a new request: "${subject.trim()}"`,
      category: "Support",
      link: `/support/requests/${ticket._id}`,
      metadata: { ticketId: ticket._id, ticketNumber, category, priority: finalPriority }
    }).catch((err) => console.error("Notification error in createTicket:", err.message));

    res.status(201).json({
      message: "Support ticket created successfully",
      ticket: populated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= 2. GET ALL TICKETS (Support / Super Admin) =================
// GET /api/support/tickets
exports.getAllTickets = async (req, res) => {
  try {
    const { role } = req.user;
    const supportDepartment = normalizeDepartment(req.user.supportDepartment);
    const query = {};

    // Support Agent Department Isolation
    if (role === "support") {
      if (!supportDepartment) {
        return res.status(403).json({ message: "Support department not assigned to your account." });
      }
      query.assignedDepartment = supportDepartment;
    } else if (role === "superadmin") {
      if (req.query.department) {
        query.assignedDepartment = normalizeDepartment(req.query.department);
      }
    }

    // Safe Query Filtering
    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;
    if (req.query.category) query.category = req.query.category;
    if (req.query.assignedTo) query.assignedTo = req.query.assignedTo;
    if (req.query.schoolName) query.schoolName = new RegExp("^" + escapeRegex(req.query.schoolName) + "$", "i");

    if (req.query.search) {
      const sRegex = new RegExp(escapeRegex(req.query.search), "i");
      query.$or = [
        { ticketNumber: sRegex },
        { subject: sRegex },
        { category: sRegex },
        { schoolName: sRegex }
      ];
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 20), 100);
    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      SupportTicket.find(query)
        .populate("requester", "name email role avatar schoolName")
        .populate("assignedTo", "name email avatar supportDepartment")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SupportTicket.countDocuments(query)
    ]);

    res.json({
      tickets,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= 3. GET MY REQUESTS (Requester Self-Only) =================
// GET /api/support/tickets/my-requests
exports.getMyRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = { requester: userId };

    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 20), 100);
    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      SupportTicket.find(query)
        .populate("assignedTo", "name avatar supportDepartment")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SupportTicket.countDocuments(query)
    ]);

    res.json({
      tickets,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= 4. GET ASSIGNED TICKETS (Support Agent / Super Admin) =================
// GET /api/support/tickets/assigned
exports.getAssignedTickets = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const query = {};

    if (role === "support") {
      query.assignedTo = userId;
    } else if (role === "superadmin") {
      if (req.query.assignedTo) {
        query.assignedTo = req.query.assignedTo;
      } else {
        query.assignedTo = { $ne: null };
      }
    }

    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 20), 100);
    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      SupportTicket.find(query)
        .populate("requester", "name email role avatar schoolName")
        .populate("assignedTo", "name email avatar supportDepartment")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SupportTicket.countDocuments(query)
    ]);

    res.json({
      tickets,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= 5. GET ESCALATED TICKETS (Super Admin / Support) =================
// GET /api/support/tickets/escalated
exports.getEscalatedTickets = async (req, res) => {
  try {
    const { role } = req.user;
    const supportDepartment = normalizeDepartment(req.user.supportDepartment);
    const query = { isEscalated: true };

    if (role === "support") {
      if (!supportDepartment) {
        return res.status(403).json({ message: "Support department not assigned to your account." });
      }
      query.assignedDepartment = supportDepartment;
    } else if (role === "superadmin") {
      if (req.query.department) {
        query.assignedDepartment = normalizeDepartment(req.query.department);
      }
    }

    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;

    if (req.query.search && req.query.search.trim()) {
      const sRegex = new RegExp(escapeRegex(req.query.search), "i");
      query.$or = [
        { ticketNumber: sRegex },
        { subject: sRegex },
        { category: sRegex },
        { schoolName: sRegex },
        { escalatedReason: sRegex }
      ];
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 20), 100);
    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      SupportTicket.find(query)
        .populate("requester", "name email role avatar schoolName")
        .populate("assignedTo", "name email avatar supportDepartment")
        .sort({ escalatedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SupportTicket.countDocuments(query)
    ]);

    res.json({
      tickets,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= 6. GET TICKET BY ID =================
// GET /api/support/tickets/:id
exports.getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ticket ID format." });
    }

    const ticket = await SupportTicket.findById(id)
      .populate("requester", "name email role avatar schoolName")
      .populate("assignedTo", "name email avatar supportDepartment")
      .populate("messages.sender", "name email role avatar");

    if (!ticket) {
      return res.status(404).json({ message: "Support ticket not found." });
    }

    const { role, id: userId } = req.user;
    const supportDepartment = normalizeDepartment(req.user.supportDepartment);

    // Authorization Guard
    let isAuthorized = false;
    if (role === "superadmin") {
      isAuthorized = true;
    } else if (ticket.requester && ticket.requester._id.toString() === userId) {
      isAuthorized = true;
    } else if (role === "support" && supportDepartment === ticket.assignedDepartment) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return res.status(403).json({ message: "Access Denied: You do not have permission to view this ticket." });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= 7. REPLY TO TICKET =================
// POST /api/support/tickets/:id/reply
exports.replyTicket = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ticket ID format." });
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Support ticket not found." });
    }

    const { role, id: userId } = req.user;
    const supportDepartment = normalizeDepartment(req.user.supportDepartment);

    // Authorization Guard
    let isAuthorized = false;
    if (role === "superadmin") {
      isAuthorized = true;
    } else if (ticket.requester.toString() === userId) {
      isAuthorized = true;
    } else if (role === "support" && supportDepartment === ticket.assignedDepartment) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return res.status(403).json({ message: "Access Denied: You do not have permission to reply to this ticket." });
    }

    const { message, attachments } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message content cannot be empty." });
    }

    if (message.trim().length > 5000) {
      return res.status(400).json({ message: "Message length exceeds maximum limit of 5000 characters." });
    }

    // Set first response timestamp for staff replies
    if (role === "support" || role === "superadmin") {
      if (!ticket.firstResponseAt) {
        ticket.firstResponseAt = new Date();
      }
      if (ticket.status === "New") {
        ticket.status = "In Progress";
      }
    }

    ticket.messages.push({
      sender: userId,
      senderRole: role,
      message: message.trim(),
      attachments: Array.isArray(attachments) ? attachments : [],
      createdAt: new Date()
    });

    await ticket.save();

    const updated = await SupportTicket.findById(id)
      .populate("requester", "name email role avatar schoolName")
      .populate("assignedTo", "name email avatar supportDepartment")
      .populate("messages.sender", "name email role avatar");

    // Trigger Notification asynchronously based on who replied
    if (role === "support" || role === "superadmin") {
      notifyTicketRequester({
        requesterId: ticket.requester,
        title: `New Message on #${ticket.ticketNumber}`,
        message: `Support Agent sent a new message in ticket #${ticket.ticketNumber}`,
        category: "Support",
        link: `/support/requests/${ticket._id}`,
        metadata: { ticketId: ticket._id, ticketNumber: ticket.ticketNumber }
      }).catch((err) => console.error("Notification error in replyTicket:", err.message));
    } else {
      if (ticket.assignedTo) {
        createAppNotification({
          recipient: ticket.assignedTo,
          schoolName: "TeachHub HQ",
          role: "support",
          title: `New Message on #${ticket.ticketNumber}`,
          message: `${req.user.name || "Requester"} sent a new message in ticket #${ticket.ticketNumber}`,
          category: "Support",
          link: `/support/requests/${ticket._id}`,
          metadata: { ticketId: ticket._id, ticketNumber: ticket.ticketNumber }
        }).catch((err) => console.error("Notification error in replyTicket:", err.message));
      } else {
        notifySupportDepartment({
          department: ticket.assignedDepartment,
          title: `New Message on #${ticket.ticketNumber}`,
          message: `${req.user.name || "Requester"} sent a new message in ticket #${ticket.ticketNumber}`,
          category: "Support",
          link: `/support/requests/${ticket._id}`,
          metadata: { ticketId: ticket._id, ticketNumber: ticket.ticketNumber }
        }).catch((err) => console.error("Notification error in replyTicket:", err.message));
      }
    }

    res.json({
      message: "Reply added successfully",
      ticket: updated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= 8. UPDATE TICKET STATUS / PRIORITY / ASSIGNMENT / DEPARTMENT =================
// PATCH /api/support/tickets/:id/status
exports.updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ticket ID format." });
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Support ticket not found." });
    }

    const { role } = req.user;
    const supportDepartment = normalizeDepartment(req.user.supportDepartment);

    // Authorization Guard
    let isAuthorized = false;
    if (role === "superadmin") {
      isAuthorized = true;
    } else if (role === "support" && supportDepartment === ticket.assignedDepartment) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return res.status(403).json({ message: "Access Denied: You are not authorized to update this ticket." });
    }

    const oldStatus = ticket.status;
    const oldAssignedTo = ticket.assignedTo ? ticket.assignedTo.toString() : null;

    const { status, priority, assignedTo, department } = req.body;

    // Status Update
    if (status) {
      const validStatuses = ["New", "Open", "In Progress", "Waiting", "Resolved", "Closed", "Escalated"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid ticket status specified." });
      }
      ticket.status = status;
      if (status === "Resolved" && !ticket.resolvedAt) {
        ticket.resolvedAt = new Date();
      }
      if (status === "Closed" && !ticket.closedAt) {
        ticket.closedAt = new Date();
      }
    }

    // Priority Update
    if (priority) {
      const validPriorities = ["Low", "Medium", "High", "Urgent"];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({ message: "Invalid priority specified." });
      }
      ticket.priority = priority;
    }

    // Agent Assignment Update
    if (assignedTo !== undefined) {
      if (assignedTo === null || assignedTo === "") {
        ticket.assignedTo = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
          return res.status(400).json({ message: "Invalid assigned agent ID format." });
        }
        const agent = await User.findById(assignedTo);
        if (!agent || agent.role !== "support") {
          return res.status(400).json({ message: "Target user is not a valid Support Agent." });
        }
        if (agent.supportStatus === "suspended") {
          return res.status(400).json({ message: "Cannot assign ticket to a suspended Support Agent." });
        }

        // Support agents can only assign within their assigned department
        if (role === "support" && agent.supportDepartment !== ticket.assignedDepartment) {
          return res.status(403).json({ message: "Cannot assign ticket to an agent outside your department." });
        }

        ticket.assignedTo = agent._id;
      }
    }

    // Department Reassignment (Super Admin ONLY)
    if (department) {
      if (role !== "superadmin") {
        return res.status(403).json({ message: "Only Super Admin can reassign ticket departments." });
      }
      const validDepts = ["Billing", "Technical", "Onboarding"];
      if (!validDepts.includes(department)) {
        return res.status(400).json({ message: "Invalid department specified." });
      }
      ticket.department = department;
      ticket.assignedDepartment = department;

      // Clear assigned agent if agent belongs to old department
      if (ticket.assignedTo) {
        const currentAgent = await User.findById(ticket.assignedTo).select("supportDepartment");
        if (currentAgent && currentAgent.supportDepartment !== department) {
          ticket.assignedTo = null;
        }
      }
    }

    await ticket.save();

    const updated = await SupportTicket.findById(id)
      .populate("requester", "name email role avatar schoolName")
      .populate("assignedTo", "name email avatar supportDepartment");

    // Notifications for status change and assignment change
    if (status && oldStatus !== status) {
      let notifTitle = `Ticket #${ticket.ticketNumber} Status Updated`;
      let notifMsg = `Your ticket status changed from ${oldStatus} to ${status}`;

      if (status === "Resolved") {
        notifTitle = `Ticket #${ticket.ticketNumber} Resolved`;
        notifMsg = `Your support ticket #${ticket.ticketNumber} has been resolved.`;
      } else if (status === "Closed") {
        notifTitle = `Ticket #${ticket.ticketNumber} Closed`;
        notifMsg = `Your support ticket #${ticket.ticketNumber} has been closed.`;
      }

      notifyTicketRequester({
        requesterId: ticket.requester,
        title: notifTitle,
        message: notifMsg,
        category: "Support",
        link: `/support/requests/${ticket._id}`,
        metadata: { ticketId: ticket._id, ticketNumber: ticket.ticketNumber, oldStatus, newStatus: status }
      }).catch((err) => console.error("Notification error in updateTicketStatus:", err.message));
    }

    const newAssignedTo = ticket.assignedTo ? ticket.assignedTo.toString() : null;
    if (oldAssignedTo !== newAssignedTo) {
      // Notify new assigned agent
      if (newAssignedTo) {
        createAppNotification({
          recipient: ticket.assignedTo,
          schoolName: "TeachHub HQ",
          role: "support",
          title: `Ticket Assigned to You`,
          message: `Ticket #${ticket.ticketNumber} has been assigned to you.`,
          category: "Support",
          link: `/support/requests/${ticket._id}`,
          metadata: { ticketId: ticket._id, ticketNumber: ticket.ticketNumber }
        }).catch((err) => console.error("Notification error in updateTicketStatus:", err.message));
      }

      // Notify previous assigned agent if replaced or unassigned
      if (oldAssignedTo) {
        createAppNotification({
          recipient: oldAssignedTo,
          schoolName: "TeachHub HQ",
          role: "support",
          title: `Ticket #${ticket.ticketNumber} Reassigned`,
          message: newAssignedTo 
            ? `Ticket #${ticket.ticketNumber} was reassigned to another agent.` 
            : `Ticket #${ticket.ticketNumber} was unassigned.`,
          category: "Support",
          link: `/support/requests/${ticket._id}`,
          metadata: { ticketId: ticket._id, ticketNumber: ticket.ticketNumber }
        }).catch((err) => console.error("Notification error in updateTicketStatus:", err.message));
      }
    }

    res.json({
      message: "Ticket updated successfully",
      ticket: updated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= 9. ESCALATE TICKET =================
// POST /api/support/tickets/:id/escalate
exports.escalateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ticket ID format." });
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Support ticket not found." });
    }

    if (ticket.isEscalated) {
      return res.status(400).json({ message: "This support ticket has already been escalated." });
    }

    const { role } = req.user;
    const supportDepartment = normalizeDepartment(req.user.supportDepartment);

    // Authorization Guard
    let isAuthorized = false;
    if (role === "superadmin") {
      isAuthorized = true;
    } else if (role === "support" && supportDepartment === ticket.assignedDepartment) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return res.status(403).json({ message: "Access Denied: You are not authorized to escalate this ticket." });
    }

    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: "Escalation reason is required." });
    }

    if (reason.trim().length > 2000) {
      return res.status(400).json({ message: "Escalation reason exceeds maximum length of 2000 characters." });
    }

    ticket.isEscalated = true;
    ticket.status = "Escalated";
    ticket.escalatedReason = reason.trim();
    ticket.escalatedAt = new Date();

    await ticket.save();

    const updated = await SupportTicket.findById(id)
      .populate("requester", "name email role avatar schoolName")
      .populate("assignedTo", "name email avatar supportDepartment");

    // Trigger Notification for Escalation
    notifySupportDepartment({
      department: ticket.assignedDepartment,
      title: `Escalated Issue #${ticket.ticketNumber}`,
      message: `Ticket #${ticket.ticketNumber} has been escalated to high priority. Reason: ${reason.trim()}`,
      category: "Support",
      link: `/support/requests/${ticket._id}`,
      metadata: { ticketId: ticket._id, ticketNumber: ticket.ticketNumber, escalatedReason: reason.trim() }
    }).catch((err) => console.error("Notification error in escalateTicket:", err.message));

    res.json({
      message: "Ticket escalated to Super Admin successfully",
      ticket: updated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= 10. ASSIGN TICKET (Super Admin ONLY) =================
// PATCH /api/support/tickets/:id/assign
exports.assignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ticket ID format." });
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Support ticket not found." });
    }

    // Strict Authorization: SuperAdmin ONLY
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access Denied: Only Super Admin can assign or reassign support tickets." });
    }

    const oldAssignedTo = ticket.assignedTo ? ticket.assignedTo.toString() : null;
    const { assignedTo } = req.body;

    // Unassign case
    if (assignedTo === null || assignedTo === "") {
      ticket.assignedTo = null;
      await ticket.save();

      const updated = await SupportTicket.findById(id)
        .populate("requester", "name email role avatar schoolName")
        .populate("assignedTo", "name email avatar supportDepartment");

      if (oldAssignedTo) {
        createAppNotification({
          recipient: oldAssignedTo,
          schoolName: "TeachHub HQ",
          role: "support",
          title: `Ticket #${ticket.ticketNumber} Reassigned`,
          message: `Ticket #${ticket.ticketNumber} was unassigned.`,
          category: "Support",
          link: `/support/requests/${ticket._id}`,
          metadata: { ticketId: ticket._id, ticketNumber: ticket.ticketNumber }
        }).catch((err) => console.error("Notification error in assignTicket unassign:", err.message));
      }

      return res.json({
        message: "Support ticket unassigned successfully",
        ticket: updated
      });
    }

    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({ message: "Invalid target support agent ID format." });
    }

    const agent = await User.findById(assignedTo);
    if (!agent || agent.role !== "support") {
      return res.status(400).json({ message: "Target user is not a valid Support Agent." });
    }

    if (agent.supportStatus === "suspended" || agent.requestStatus === "rejected") {
      return res.status(400).json({ message: "Cannot assign ticket to a suspended Support Agent." });
    }

    // Department Matching Rule
    if (agent.supportDepartment !== ticket.assignedDepartment) {
      return res.status(400).json({
        message: `Department mismatch: Target agent belongs to '${agent.supportDepartment || "Unassigned"}' department, but ticket belongs to '${ticket.assignedDepartment}' department.`
      });
    }

    ticket.assignedTo = agent._id;
    await ticket.save();

    const updated = await SupportTicket.findById(id)
      .populate("requester", "name email role avatar schoolName")
      .populate("assignedTo", "name email avatar supportDepartment");

    const newAssignedTo = ticket.assignedTo ? ticket.assignedTo.toString() : null;
    if (oldAssignedTo !== newAssignedTo) {
      if (newAssignedTo) {
        createAppNotification({
          recipient: ticket.assignedTo,
          schoolName: "TeachHub HQ",
          role: "support",
          title: `Ticket Assigned to You`,
          message: `Ticket #${ticket.ticketNumber} has been assigned to you by Admin.`,
          category: "Support",
          link: `/support/requests/${ticket._id}`,
          metadata: { ticketId: ticket._id, ticketNumber: ticket.ticketNumber }
        }).catch((err) => console.error("Notification error in assignTicket:", err.message));
      }

      if (oldAssignedTo) {
        createAppNotification({
          recipient: oldAssignedTo,
          schoolName: "TeachHub HQ",
          role: "support",
          title: `Ticket #${ticket.ticketNumber} Reassigned`,
          message: `Ticket #${ticket.ticketNumber} was reassigned to another agent.`,
          category: "Support",
          link: `/support/requests/${ticket._id}`,
          metadata: { ticketId: ticket._id, ticketNumber: ticket.ticketNumber }
        }).catch((err) => console.error("Notification error in assignTicket:", err.message));
      }
    }

    res.json({
      message: `Support ticket assigned to ${agent.name} successfully`,
      ticket: updated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= 11. GET SUPPORT DASHBOARD METRICS =================
// GET /api/support/tickets/dashboard-stats
exports.getSupportDashboard = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const supportDepartment = normalizeDepartment(req.user.supportDepartment);
    const deptQuery = {};

    // Support Agent Department Isolation
    if (role === "support") {
      if (!supportDepartment) {
        return res.status(403).json({ message: "Support department not assigned to your account." });
      }
      deptQuery.assignedDepartment = supportDepartment;
    } else if (role === "superadmin") {
      if (req.query.department) {
        deptQuery.assignedDepartment = normalizeDepartment(req.query.department);
      }
    }

    const [
      all,
      newCount,
      openCount,
      inProgressCount,
      waitingCount,
      resolvedCount,
      closedCount,
      escalatedCount,
      unassignedCount,
      myAssignedCount,
      myNewCount,
      myInProgressCount,
      myWaitingCount,
      urgentCount,
      highCount,
      mediumCount,
      lowCount,
      recentTickets
    ] = await Promise.all([
      SupportTicket.countDocuments(deptQuery),
      SupportTicket.countDocuments({ ...deptQuery, status: "New" }),
      SupportTicket.countDocuments({ ...deptQuery, status: "Open" }),
      SupportTicket.countDocuments({ ...deptQuery, status: "In Progress" }),
      SupportTicket.countDocuments({ ...deptQuery, status: "Waiting" }),
      SupportTicket.countDocuments({ ...deptQuery, status: "Resolved" }),
      SupportTicket.countDocuments({ ...deptQuery, status: "Closed" }),
      SupportTicket.countDocuments({ ...deptQuery, $or: [{ status: "Escalated" }, { isEscalated: true }] }),
      SupportTicket.countDocuments({ ...deptQuery, assignedTo: null }),
      SupportTicket.countDocuments({ ...deptQuery, assignedTo: userId }),
      SupportTicket.countDocuments({ ...deptQuery, assignedTo: userId, status: "New" }),
      SupportTicket.countDocuments({ ...deptQuery, assignedTo: userId, status: "In Progress" }),
      SupportTicket.countDocuments({ ...deptQuery, assignedTo: userId, status: "Waiting" }),
      SupportTicket.countDocuments({ ...deptQuery, priority: "Urgent" }),
      SupportTicket.countDocuments({ ...deptQuery, priority: "High" }),
      SupportTicket.countDocuments({ ...deptQuery, priority: "Medium" }),
      SupportTicket.countDocuments({ ...deptQuery, priority: "Low" }),
      SupportTicket.find(deptQuery)
        .populate("requester", "name email role avatar schoolName")
        .populate("assignedTo", "name email avatar supportDepartment")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    res.json({
      department: role === "support" ? supportDepartment : (req.query.department || "All Departments"),
      totals: {
        all,
        new: newCount,
        open: openCount,
        inProgress: inProgressCount,
        waiting: waitingCount,
        resolved: resolvedCount,
        closed: closedCount,
        escalated: escalatedCount,
        unassigned: unassignedCount,
        myAssigned: myAssignedCount
      },
      priority: {
        urgent: urgentCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount
      },
      myWorkload: {
        total: myAssignedCount,
        new: myNewCount,
        inProgress: myInProgressCount,
        waiting: myWaitingCount
      },
      recentTickets
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


