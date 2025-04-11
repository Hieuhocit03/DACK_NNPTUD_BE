const _menuItemService = require("../services/menuItem.service");
const _reviewService = require("../services/review.service");

exports.getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await _menuItemService.getAllMenuItems();
    res.status(200).json(menuItems);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.getMenuItemById = async (req, res) => {
  try {
    const menuItem = await _menuItemService.getMenuItemById(req.params.id);
    res.status(200).json(menuItem);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.getMenuItemsByCategory = async (req, res) => {
  try {
    const menuItems = await _menuItemService.getMenuItemsByCategory(
      req.params.categoryId
    );
    res.status(200).json(menuItems);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.createMenuItem = async (req, res) => {
  try {
    const newMenuItem = await _menuItemService.createMenuItem(
      req.body,
      req.file
    );
    res.status(201).json(newMenuItem);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const updatedMenuItem = await _menuItemService.updateMenuItem(
      req.params.id,
      req.body,
      req.file
    );
    res.status(200).json(updatedMenuItem);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    await _menuItemService.deleteMenuItem(req.params.id);
    res.status(200).json({ message: "Xóa món ăn thành công" });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.searchMenuItems = async (req, res) => {
  try {
    const menuItems = await _menuItemService.searchMenuItems(req.query.q);
    res.status(200).json(menuItems);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.getTopRatedMenuItems = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const menuItems = await _menuItemService.getTopRatedMenuItems(limit);
    res.status(200).json(menuItems);
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
    };
    
    // Mảng files từ middleware upload
    const imageFiles = req.files || [];
    
    const newReview = await _reviewService.createReview(reviewData, imageFiles);
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
