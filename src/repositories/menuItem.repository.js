const MenuItem = require("../models/menuItem.model");
class MenuItemRepository {
  constructor() {
    this.model = MenuItem;
  }

  // Get all menu items
  async getAll() {
    return await this.model.find();
  }

  // Get menu item by ID
  async getById(id) {
    return await this.model.findById(id);
  }

  // Get menu items by category
  async getByCategory(categoryId) {
    return await this.model.find({ category: categoryId, status: true });
  }

  // Create new menu item
  async create(menuItemData) {
    const menuItem = new this.model(menuItemData);
    return await menuItem.save();
  }

  // Update menu item
  async update(id, updateData) {
    return await this.model.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: Date.now() },
      { new: true }
    );
  }

  // Delete menu item
  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }

  // Get top rated menu items
  async getTopRated(limit = 5) {
    return await this.model
      .find({ status: true })
      .sort({ ratingAverage: -1 })
      .limit(limit);
  }

  // Search menu items
  async search(query) {
    return await this.model.find({
      $text: { $search: query },
      status: true,
    });
  }
}

module.exports = MenuItemRepository;
