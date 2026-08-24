const router = require("express").Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const payment = require("../controllers/paymentController");

router.post("/student-payments/create-order", protect, authorize("student"), payment.createStudentOrder);
router.post("/student-payments/offline-request", protect, authorize("student"), payment.createOfflineStudentRequest);
router.post("/school-subscription/create-order", protect, authorize("admin"), payment.createSubscriptionOrder);
router.post("/teacher-payments/:teacherId/create-order", protect, authorize("admin"), payment.createTeacherSalaryOrder);
router.post("/payments/verify-checkout", protect, payment.verifyCheckout);
router.get("/payments", protect, payment.listPayments);
router.put("/payments/:id/approve-offline", protect, authorize("admin"), payment.approveOffline);
router.get("/payment-settings", protect, authorize("superadmin"), payment.getSettings);
router.put("/payment-settings", protect, authorize("superadmin"), payment.updateSettings);
router.get("/admin/fee-plan", protect, authorize("admin"), payment.getFeePlan);
router.put("/admin/fee-plan", protect, authorize("admin"), payment.setFeePlan);
router.put("/admin/teacher-compensations/:teacherId", protect, authorize("admin"), payment.setTeacherCompensation);
router.put("/superadmin/subscriptions/:schoolName", protect, authorize("superadmin"), payment.setSubscription);
router.post("/superadmin/subscriptions/:schoolName/free-period", protect, authorize("superadmin"), payment.grantFreePeriod);
module.exports = router;
