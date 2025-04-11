const BaseRepository = require("./base.repository");
const dayjs = require("dayjs");

// Đảm bảo các model được đăng ký trước khi sử dụng
require("../models/user.model");
require("../models/category.model");
require("../models/menuItem.model");  
require("../models/review.model");

class UserRepository extends BaseRepository {
  constructor() {
    super("User");
  }

  async getAllByRole(role) {
    return await this.model.find({ role: role });
  }
}

class CategoryRepository extends BaseRepository {
  constructor() {
    super("Category");
  }
  
  async getActiveCategories() {
    return await this.model.find({ status: true });
  }
}

class MenuItemRepository extends BaseRepository {
  constructor() {
    super("MenuItem");
  }
  
  async getByCategory(categoryId) {
    return await this.model.find({ category: categoryId, status: true });
  }
  
  async getTopRated(limit = 5) {
    return await this.model
      .find({ status: true })
      .sort({ ratingAverage: -1 })
      .limit(limit);
  }
  
  async search(query) {
    return await this.model.find({
      $text: { $search: query },
      status: true
    });
  }
}

class ReviewRepository extends BaseRepository {
  constructor() {
    super("Review");
  }
  
  async getByMenuItem(menuItemId) {
    return await this.model
      .find({ menuItem: menuItemId, status: "approved" })
      .populate("user", "name");
  }
  
  async getPendingReviews() {
    return await this.model
      .find({ status: "pending" })
      .populate("user", "name")
      .populate("menuItem", "name");
  }
  
  async getUserReviews(userId) {
    return await this.model
      .find({ user: userId })
      .populate("menuItem", "name image");
  }
}

module.exports = {
  userRepository: new UserRepository(),
  categoryRepository: new CategoryRepository(),
  menuItemRepository: new MenuItemRepository(),
  reviewRepository: new ReviewRepository(),
};
