const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createTicket,
  getAllTickets,
  getMyRequests,
  getAssignedTickets,
  getEscalatedTickets,
  getTicketById,
  replyTicket,
  updateTicketStatus,
  escalateTicket,
  assignTicket,
  getSupportDashboard
} = require("../controllers/supportTicketController");

router.use(protect);

// Requester endpoints
router.post("/", authorize("student", "teacher", "admin", "superadmin", "unassigned"), createTicket);
router.get("/my-requests", authorize("student", "teacher", "admin", "superadmin", "unassigned"), getMyRequests);

// Support & Super Admin endpoints
router.get("/", authorize("support", "superadmin"), getAllTickets);
router.get("/assigned", authorize("support", "superadmin"), getAssignedTickets);
router.get("/escalated", authorize("support", "superadmin"), getEscalatedTickets);
router.get("/dashboard-stats", authorize("support", "superadmin"), getSupportDashboard);

// Ticket Detail & Conversation endpoints (Authorization checked inside controller for ownership/department match)
router.get("/:id", getTicketById);
router.post("/:id/reply", replyTicket);
router.patch("/:id/status", authorize("support", "superadmin"), updateTicketStatus);
router.patch("/:id/assign", authorize("superadmin"), assignTicket);
router.post("/:id/escalate", authorize("support", "superadmin"), escalateTicket);

module.exports = router;
