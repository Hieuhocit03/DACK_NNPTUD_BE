const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const {
  uploadMenuItem: uploadCategory,
  handleUploadError,
} = require("../middlewares/upload.middleware");
const { isAuthenticated, isAdmin } = require("../middlewares/auth.middleware");

// Middleware xử lý lỗi upload
router.use(handleUploadError);

// Public routes
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);

// Admin routes
router.post(
  "/",
  isAuthenticated,
  isAdmin,
  uploadCategory,
  categoryController.createCategory
);

router.put(
  "/:id",
  isAuthenticated,
  isAdmin,
  uploadCategory,
  categoryController.updateCategory
);

router.delete(
  "/:id",
  isAuthenticated,
  isAdmin,
  categoryController.deleteCategory
);

module.exports = router;
