const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const { uploadMenuItem: uploadCategory, handleUploadError } = require("../middlewares/upload.middleware");
const { currentUser, verifyRoles } = require("../middlewares/auth.middleware");
const UserRole = require("../enums/userRole.enum");

// Middleware xử lý lỗi upload
router.use(handleUploadError);

// Public routes
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);

// Admin routes
router.post(
  "/",
  currentUser,
  verifyRoles([UserRole.ADMIN]),
  uploadCategory,
  categoryController.createCategory
);

router.put(
  "/:id",
  currentUser,
  verifyRoles([UserRole.ADMIN]),
  uploadCategory,
  categoryController.updateCategory
);

router.delete(
  "/:id",
  currentUser,
  verifyRoles([UserRole.ADMIN]),
  categoryController.deleteCategory
);

module.exports = router;
