const express = require("express");

const {
  createBooking,
  getMyBookings,
  getBookingById,
  getVendorBookings,
  confirmBooking,
  rejectBooking,
  cancelBooking,
  completeBooking,
} = require("../controller/bookingController");

const {
  authenticate,
  requirePermission,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  authenticate,
  requirePermission("booking.create"),
  createBooking
);

router.get(
  "/my",
  authenticate,
  requirePermission("booking.read"),
  getMyBookings
);

router.get(
  "/vendor",
  authenticate,
  requirePermission("booking.read"),
  getVendorBookings
);

router.get(
  "/:id",
  authenticate,
  requirePermission("booking.read"),
  getBookingById
);

router.patch(
  "/:id/confirm",
  authenticate,
  requirePermission("booking.confirm"),
  confirmBooking
);

router.patch(
  "/:id/reject",
  authenticate,
  requirePermission("booking.reject"),
  rejectBooking
);

router.patch(
  "/:id/cancel",
  authenticate,
  requirePermission("booking.cancel"),
  cancelBooking
);

router.patch(
  "/:id/complete",
  authenticate,
  requirePermission("booking.complete"),
  completeBooking
);

module.exports = router;