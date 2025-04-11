const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const { isAuthenticated, isAdmin } = require("../middlewares/auth.middleware");

// Public routes
router.get("/menu-item/:menuItemId", reviewController.getReviewsByMenuItem);

// User routes
router.get("/my-reviews", isAuthenticated, reviewController.getUserReviews);

// Loại bỏ middleware upload cho đánh giá
router.post("/", isAuthenticated, reviewController.createReview);

// Admin routes
router.get("/admin", isAuthenticated, isAdmin, reviewController.getAllReviews);

router.get(
  "/pending",
  isAuthenticated,
  isAdmin,
  reviewController.getPendingReviews
);

router.patch(
  "/:id/status",
  isAuthenticated,
  isAdmin,
  reviewController.updateReviewStatus
);

router.delete("/:id", isAuthenticated, isAdmin, reviewController.deleteReview);

module.exports = router;
