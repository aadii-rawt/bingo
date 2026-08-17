const express = require("express");

const {
  createCategory,
  getCategories,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controller/categoryController");

const {
  authenticate,
  requirePermission,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getCategories);

router.get(
  "/all",
  authenticate,
  requirePermission("category.read"),
  getAllCategories
);

router.get("/:id", getCategoryById);

router.post(
  "/",
  authenticate,
  requirePermission("category.create"),
  createCategory
);

router.patch(
  "/:id",
  authenticate,
  requirePermission("category.update"),
  updateCategory
);

router.delete(
  "/:id",
  authenticate,
  requirePermission("category.delete"),
  deleteCategory
);

module.exports = router;