const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const { handleUploadError } = require("../middlewares/upload.middleware");
const { currentUser, verifyRoles } = require("../middlewares/auth.middleware");
const UserRole = require("../enums/userRole.enum");

// Middleware xử lý lỗi upload
router.use(handleUploadError);

// Public routes
router.get("/menu-item/:menuItemId", reviewController.getReviewsByMenuItem);

// User routes
router.get(
  "/my-reviews",
  currentUser,
  reviewController.getUserReviews
);

// Loại bỏ middleware upload cho đánh giá
router.post(
  "/",
  currentUser,
  reviewController.createReview
);

// Admin routes
router.get(
  "/admin",
  currentUser,
  verifyRoles([UserRole.ADMIN]),
  reviewController.getAllReviews
);

router.get(
  "/pending",
  currentUser,
  verifyRoles([UserRole.ADMIN]),
  reviewController.getPendingReviews
);

router.patch(
  "/:id/status",
  currentUser,
  verifyRoles([UserRole.ADMIN]),
  reviewController.updateReviewStatus
);

router.delete(
  "/:id",
  currentUser,
  verifyRoles([UserRole.ADMIN]),
  reviewController.deleteReview
);

module.exports = router;
