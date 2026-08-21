const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { sendMessage, getHistory, getContacts } = require("../controllers/supportController");

router.use(protect);

router.post("/message", sendMessage);
router.get("/history", getHistory);
router.get("/users", getContacts);

module.exports = router;
