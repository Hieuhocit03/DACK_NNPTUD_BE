const _reviewService = require("../services/review.service");

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await _reviewService.getAllReviews();
    res.status(200).json(reviews);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const review = await _reviewService.getReviewById(req.params.id);
    res.status(200).json(review);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.getReviewsByMenuItem = async (req, res) => {
  try {
    const reviews = await _reviewService.getReviewsByMenuItem(
      req.params.menuItemId
    );
    res.status(200).json(reviews);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await _reviewService.getUserReviews(req.user.id);
    res.status(200).json(reviews);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.createReview = async (req, res) => {
  try {
    // Cập nhật dữ liệu review từ body request và user hiện tại
    const reviewData = {
      ...req.body,
      user: req.user.id,
      // Loại bỏ xử lý hình ảnh
      images: [] // Mảng rỗng vì không còn hình ảnh
    };
    
    const newReview = await _reviewService.createReview(reviewData);
    res.status(201).json(newReview);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.updateReviewStatus = async (req, res) => {
  try {
    const updatedReview = await _reviewService.updateReviewStatus(
      req.params.id,
      req.body.status
    );
    res.status(200).json(updatedReview);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    await _reviewService.deleteReview(req.params.id);
    res.status(200).json({ message: "Xóa đánh giá thành công" });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.getPendingReviews = async (req, res) => {
  try {
    const reviews = await _reviewService.getPendingReviews();
    res.status(200).json(reviews);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
