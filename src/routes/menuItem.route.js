const express = require("express");
const router = express.Router();
const menuItemController = require("../controllers/menuItem.controller");
const { uploadMenuItem, handleUploadError } = require("../middlewares/upload.middleware");
const { currentUser, verifyRoles } = require("../middlewares/auth.middleware");
const UserRole = require("../enums/userRole.enum");

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
  currentUser,
  verifyRoles([UserRole.ADMIN]),
  uploadMenuItem,
  menuItemController.createMenuItem
);

router.put(
  "/:id",
  currentUser,
  verifyRoles([UserRole.ADMIN]),
  uploadMenuItem,
  menuItemController.updateMenuItem
);

router.delete(
  "/:id",
  currentUser,
  verifyRoles([UserRole.ADMIN]),
  menuItemController.deleteMenuItem
);

module.exports = router;
