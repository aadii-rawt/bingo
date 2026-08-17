const express = require("express");

const {
  createService,
  getServices,
  getMyServices,
  getServiceById,
  updateService,
  deleteService,
} = require("../controller/serviceController");

const {
  authenticate,
  requirePermission,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getServices);

router.get(
  "/my",
  authenticate,
  requirePermission("service.read"),
  getMyServices
);

router.get("/:id", getServiceById);

router.post(
  "/",
  authenticate,
  requirePermission("service.create"),
  createService
);

router.patch(
  "/:id",
  authenticate,
  requirePermission("service.update"),
  updateService
);

router.delete(
  "/:id",
  authenticate,
  requirePermission("service.delete"),
  deleteService
);

module.exports = router;