const express = require("express");

const {
  createOffering,
  getOfferings,
  getMyOfferings,
  getOfferingById,
  updateOffering,
  deleteOffering,
  getOfferingsByService,
} = require("../controller/offeringController");

const {
  authenticate,
  requirePermission,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getOfferings);

router.get(
  "/my",
  authenticate,
  requirePermission("offering.read"),
  getMyOfferings
);

router.get("/:id", getOfferingById);
router.get(
  "/service/:serviceId",
  getOfferingsByService
);
router.post(
  "/",
  authenticate,
  requirePermission("offering.create"),
  createOffering
);

router.patch(
  "/:id",
  authenticate,
  requirePermission("offering.update"),
  updateOffering
);

router.delete(
  "/:id",
  authenticate,
  requirePermission("offering.delete"),
  deleteOffering
);

module.exports = router;