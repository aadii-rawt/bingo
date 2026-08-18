const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { getAdminDashboard, getAdminBookings, forceRejectBooking } = require("../controller/adminController");

const router = express.Router();


router.get(
  "/dashboard",
  authenticate,
  getAdminDashboard
);

router.get(
  "/bookings",
  authenticate,
  getAdminBookings
);
router.patch(
  "/bookings/:id/force-reject",
  authenticate,
  forceRejectBooking
);
module.exports = router;