const express = require("express");
const router = express.Router();
const menuItemController = require("../controllers/menuItem.controller");
const {
  uploadMenuItem,
  handleUploadError,
} = require("../middlewares/upload.middleware");
const { isAuthenticated, isAdmin } = require("../middlewares/auth.middleware");

// Middleware xử lý lỗi upload
router.use(handleUploadError);

// Public routes
router.get("/", menuItemController.getAllMenuItems);
router.get("/search", menuItemController.searchMenuItems);
router.get("/top-rated", menuItemController.getTopRatedMenuItems);
router.get("/:id", menuItemController.getMenuItemById);
router.get("/category/:categoryId", menuItemController.getMenuItemsByCategory);

// Admin routes
router.post(
  "/",
  isAuthenticated,
  isAdmin,
  uploadMenuItem,
  menuItemController.createMenuItem
);

router.put(
  "/:id",
  isAuthenticated,
  isAdmin,
  uploadMenuItem,
  menuItemController.updateMenuItem
);

router.delete(
  "/:id",
  isAuthenticated,
  isAdmin,
  menuItemController.deleteMenuItem
);

module.exports = router;
