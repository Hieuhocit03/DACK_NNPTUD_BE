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
  (req, res, next) => {
    console.log("[Route /api/categories POST] Before upload middleware");
    next();
  },
  uploadCategory,
  (req, res, next) => {
    console.log(
      "[Route /api/categories POST] After upload middleware, file:",
      req.file
    );
    next();
  },
  categoryController.createCategory
);

router.put(
  "/:id",
  isAuthenticated,
  isAdmin,
  (req, res, next) => {
    console.log(
      `[Route /api/categories PUT ${req.params.id}] Before upload middleware`
    );
    next();
  },
  uploadCategory,
  (req, res, next) => {
    console.log(
      `[Route /api/categories PUT ${req.params.id}] After upload middleware, file:`,
      req.file
    );
    next();
  },
  categoryController.updateCategory
);

router.delete(
  "/:id",
  isAuthenticated,
  isAdmin,
  categoryController.deleteCategory
);

module.exports = router;
