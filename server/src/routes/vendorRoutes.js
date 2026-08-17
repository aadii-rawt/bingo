const express = require("express");

const {
  getMyVendor,
  getPendingVendors,
  getAllVendors,
  getVendorById,
  updateVendorProfile,
  updateVendorStatus,
} = require("../controller/vendorController");

const {
  authenticate,
  requirePermission,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/me",
  authenticate,
  requirePermission("vendor.profile.read"),
  getMyVendor
);

router.patch(
  "/me",
  authenticate,
  requirePermission("vendor.profile.update"),
  updateVendorProfile
);

router.get(
  "/pending",
  authenticate,
  requirePermission("vendor.approve"),
  getPendingVendors
);

router.get(
  "/",
  authenticate,
  requirePermission("vendor.read"),
  getAllVendors
);

router.get(
  "/:id",
  authenticate,
  requirePermission("vendor.read"),
  getVendorById
);

router.patch(
  "/:id/status",
  authenticate,
  requirePermission("vendor.approve"),
  updateVendorStatus
);

module.exports = router;