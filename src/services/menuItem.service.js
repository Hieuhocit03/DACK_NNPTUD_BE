const _repository = require("../repositories/menuItem.repository");
const category = require("../models/category.model");
const fs = require("fs");
const path = require("path");

const repository = new _repository();

exports.getAllMenuItems = async () => {
  return await repository.getAll();
};

exports.getMenuItemById = async (id) => {
  const menuItem = await repository.getById(id);

  if (!menuItem) {
    throw Object.assign(new Error("Món ăn không tồn tại"), { status: 404 });
  }

  return menuItem;
};

exports.getMenuItemsByCategory = async (categoryId) => {
  // Kiểm tra danh mục tồn tại
  const category = await category.findById(categoryId);

  if (!category) {
    throw Object.assign(new Error("Danh mục không tồn tại"), { status: 404 });
  }

  return await repository.menuItemRepository.getByCategory(categoryId);
};

exports.createMenuItem = async (menuItemData, imageFile) => {
  // Kiểm tra danh mục tồn tại
  const category1 = await category.findById(menuItemData.category);
  console.log(category1);

  if (!category1) {
    throw Object.assign(new Error("Danh mục không tồn tại"), { status: 404 });
  }

  // Xử lý hình ảnh nếu có
  if (imageFile) {
    const imagePath = `/uploads/menu-items/${Date.now()}-${
      imageFile.originalname
    }`;
    const uploadPath = path.join(__dirname, `../../public${imagePath}`);

    // Đảm bảo thư mục tồn tại
    const dir = path.dirname(uploadPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Lưu file
    fs.writeFileSync(uploadPath, imageFile.buffer);
    menuItemData.image = imagePath;
  }

  return await repository.create(menuItemData);
};

exports.updateMenuItem = async (id, menuItemData, imageFile) => {
  // Kiểm tra món ăn tồn tại
  const menuItem = await repository.getById(id);

  if (!menuItem) {
    throw Object.assign(new Error("Món ăn không tồn tại"), { status: 404 });
  }

  // Kiểm tra danh mục tồn tại nếu có cập nhật danh mục
  if (menuItemData.category) {
    const category1 = await category.findById(menuItemData.category);

    if (!category1) {
      throw Object.assign(new Error("Danh mục không tồn tại"), { status: 404 });
    }
  }

  // Xử lý hình ảnh nếu có
  if (imageFile) {
    const imagePath = `/uploads/menu-items/${Date.now()}-${
      imageFile.originalname
    }`;
    const uploadPath = path.join(__dirname, `../../public${imagePath}`);

    // Đảm bảo thư mục tồn tại
    const dir = path.dirname(uploadPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Lưu file mới
    fs.writeFileSync(uploadPath, imageFile.buffer);

    // Xóa file cũ nếu có
    if (menuItem.image && menuItem.image.startsWith("/uploads/")) {
      const oldPath = path.join(__dirname, `../../public${menuItem.image}`);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    menuItemData.image = imagePath;
  }

  return await repository.update(id, menuItemData);
};

exports.deleteMenuItem = async (id) => {
  // Kiểm tra món ăn tồn tại
  const menuItem = await repository.getById(id);

  if (!menuItem) {
    throw Object.assign(new Error("Món ăn không tồn tại"), { status: 404 });
  }

  // Xóa hình ảnh nếu có
  if (menuItem.image && menuItem.image.startsWith("/uploads/")) {
    const imagePath = path.join(__dirname, `../../public${menuItem.image}`);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  // Xóa các đánh giá liên quan
  // await review.deleteMany({ menuItem: id });

  return await repository.delete(id);
};

exports.searchMenuItems = async (query) => {
  return await repository.menuItemRepository.search(query);
};

exports.getTopRatedMenuItems = async (limit) => {
  return await repository.menuItemRepository.getTopRated(limit);
};
