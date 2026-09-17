const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createRequest,
  getMyActiveRequest
} = require("../controllers/schoolChangeController");

router.use(protect);

router.post("/", createRequest);
router.get("/my-request", getMyActiveRequest);

module.exports = router;
