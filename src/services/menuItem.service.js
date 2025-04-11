const _repository = require("../repositories/sub.repository");
const fs = require("fs");
const path = require("path");

exports.getAllMenuItems = async () => {
  return await _repository.menuItemRepository.getAll();
};

exports.getMenuItemById = async (id) => {
  const menuItem = await _repository.menuItemRepository.getById(id);
  
  if (!menuItem) {
    throw Object.assign(new Error("Món ăn không tồn tại"), { status: 404 });
  }
  
  return menuItem;
};

exports.getMenuItemsByCategory = async (categoryId) => {
  // Kiểm tra danh mục tồn tại
  const category = await _repository.categoryRepository.getById(categoryId);
  
  if (!category) {
    throw Object.assign(new Error("Danh mục không tồn tại"), { status: 404 });
  }
  
  return await _repository.menuItemRepository.getByCategory(categoryId);
};

exports.createMenuItem = async (menuItemData, imageFile) => {
  // Kiểm tra danh mục tồn tại
  const category = await _repository.categoryRepository.getById(menuItemData.category);
  
  if (!category) {
    throw Object.assign(new Error("Danh mục không tồn tại"), { status: 404 });
  }
  
  // Xử lý hình ảnh nếu có
  if (imageFile) {
    const imagePath = `/uploads/menu-items/${Date.now()}-${imageFile.originalname}`;
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
  
  return await _repository.menuItemRepository.add(menuItemData);
};

exports.updateMenuItem = async (id, menuItemData, imageFile) => {
  // Kiểm tra món ăn tồn tại
  const menuItem = await _repository.menuItemRepository.getById(id);
  
  if (!menuItem) {
    throw Object.assign(new Error("Món ăn không tồn tại"), { status: 404 });
  }
  
  // Kiểm tra danh mục tồn tại nếu có cập nhật danh mục
  if (menuItemData.category) {
    const category = await _repository.categoryRepository.getById(menuItemData.category);
    
    if (!category) {
      throw Object.assign(new Error("Danh mục không tồn tại"), { status: 404 });
    }
  }
  
  // Xử lý hình ảnh nếu có
  if (imageFile) {
    const imagePath = `/uploads/menu-items/${Date.now()}-${imageFile.originalname}`;
    const uploadPath = path.join(__dirname, `../../public${imagePath}`);
    
    // Đảm bảo thư mục tồn tại
    const dir = path.dirname(uploadPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Lưu file mới
    fs.writeFileSync(uploadPath, imageFile.buffer);
    
    // Xóa file cũ nếu có
    if (menuItem.image && menuItem.image.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, `../../public${menuItem.image}`);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    
    menuItemData.image = imagePath;
  }
  
  return await _repository.menuItemRepository.update(id, menuItemData);
};

exports.deleteMenuItem = async (id) => {
  // Kiểm tra món ăn tồn tại
  const menuItem = await _repository.menuItemRepository.getById(id);
  
  if (!menuItem) {
    throw Object.assign(new Error("Món ăn không tồn tại"), { status: 404 });
  }
  
  // Xóa hình ảnh nếu có
  if (menuItem.image && menuItem.image.startsWith('/uploads/')) {
    const imagePath = path.join(__dirname, `../../public${menuItem.image}`);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }
  
  // Xóa các đánh giá liên quan
  await _repository.reviewRepository.model.deleteMany({ menuItem: id });
  
  return await _repository.menuItemRepository.delete(id);
};

exports.searchMenuItems = async (query) => {
  return await _repository.menuItemRepository.search(query);
};

exports.getTopRatedMenuItems = async (limit) => {
  return await _repository.menuItemRepository.getTopRated(limit);
};
