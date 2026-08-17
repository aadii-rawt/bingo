const express = require("express");

const {
  createAvailabilityRule,
  getServiceAvailabilityRules,
  getMyAvailabilityRules,
  updateAvailabilityRule,
  deleteAvailabilityRule,
  createAvailabilityException,
  getServiceAvailabilityExceptions,
  getMyAvailabilityExceptions,
  updateAvailabilityException,
  deleteAvailabilityException,
  generateSlots
} = require("../controller/availabilityController");

const {
  authenticate,
  requirePermission,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/slots", generateSlots);
router.get(
  "/rules/my",
  authenticate,
  requirePermission("availability.read"),
  getMyAvailabilityRules
);

router.post(
  "/rules",
  authenticate,
  requirePermission("availability.create"),
  createAvailabilityRule
);

router.get(
  "/rules/service/:serviceId",
  getServiceAvailabilityRules
);

router.patch(
  "/rules/:id",
  authenticate,
  requirePermission("availability.update"),
  updateAvailabilityRule
);

router.delete(
  "/rules/:id",
  authenticate,
  requirePermission("availability.delete"),
  deleteAvailabilityRule
);

router.get(
  "/exceptions/my",
  authenticate,
  requirePermission("availability.read"),
  getMyAvailabilityExceptions
);

router.post(
  "/exceptions",
  authenticate,
  requirePermission("availability.create"),
  createAvailabilityException
);

router.get(
  "/exceptions/service/:serviceId",
  getServiceAvailabilityExceptions
);

router.patch(
  "/exceptions/:id",
  authenticate,
  requirePermission("availability.update"),
  updateAvailabilityException
);

router.delete(
  "/exceptions/:id",
  authenticate,
  requirePermission("availability.delete"),
  deleteAvailabilityException
);

module.exports = router;