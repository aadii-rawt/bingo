const express = require("express");

const {
  createPayment,
  getPaymentById,
  paymentSuccess,
  paymentFailed,
  refundPayment,
} = require("../controller/paymentController");

const {
  authenticate,
  requirePermission,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  authenticate,
  requirePermission("payment.create"),
  createPayment
);

router.get(
  "/:id",
  authenticate,
  requirePermission("payment.read"),
  getPaymentById
);

router.post(
  "/:id/success",
  authenticate,
  requirePermission("payment.create"),
  paymentSuccess
);

router.post(
  "/:id/fail",
  authenticate,
  requirePermission("payment.create"),
  paymentFailed
);

router.post(
  "/:id/refund",
  authenticate,
  requirePermission("payment.refund"),
  refundPayment
);

module.exports = router;