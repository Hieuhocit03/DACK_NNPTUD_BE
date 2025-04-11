const _repository = require("../repositories/sub.repository");
const fs = require("fs");
const path = require("path");

exports.getAllCategories = async () => {
  return await _repository.categoryRepository.getAll();
};

exports.getCategoryById = async (id) => {
  const category = await _repository.categoryRepository.getById(id);
  
  if (!category) {
    throw Object.assign(new Error("Danh mục không tồn tại"), { status: 404 });
  }
  
  return category;
};

exports.createCategory = async (categoryData, imageFile) => {
  // Kiểm tra tên danh mục đã tồn tại
  const existingCategory = await _repository.categoryRepository.getByName(categoryData.name);
  
  if (existingCategory) {
    throw Object.assign(new Error("Tên danh mục đã tồn tại"), { status: 400 });
  }
  
  // Xử lý hình ảnh nếu có
  if (imageFile) {
    const imagePath = `/uploads/categories/${Date.now()}-${imageFile.originalname}`;
    const uploadPath = path.join(__dirname, `../../public${imagePath}`);
    
    // Đảm bảo thư mục tồn tại
    const dir = path.dirname(uploadPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Lưu file
    fs.writeFileSync(uploadPath, imageFile.buffer);
    categoryData.image = imagePath;
  }
  
  return await _repository.categoryRepository.add(categoryData);
};

exports.updateCategory = async (id, categoryData, imageFile) => {
  // Kiểm tra danh mục tồn tại
  const category = await _repository.categoryRepository.getById(id);
  
  if (!category) {
    throw Object.assign(new Error("Danh mục không tồn tại"), { status: 404 });
  }
  
  // Kiểm tra trùng tên với danh mục khác
  if (categoryData.name) {
    const existingCategory = await _repository.categoryRepository.getByName(categoryData.name);
    if (existingCategory && existingCategory._id.toString() !== id) {
      throw Object.assign(new Error("Tên danh mục đã tồn tại"), { status: 400 });
    }
  }
  
  // Xử lý hình ảnh nếu có
  if (imageFile) {
    const imagePath = `/uploads/categories/${Date.now()}-${imageFile.originalname}`;
    const uploadPath = path.join(__dirname, `../../public${imagePath}`);
    
    // Đảm bảo thư mục tồn tại
    const dir = path.dirname(uploadPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Lưu file mới
    fs.writeFileSync(uploadPath, imageFile.buffer);
    
    // Xóa file cũ nếu có
    if (category.image && category.image.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, `../../public${category.image}`);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    
    categoryData.image = imagePath;
  }
  
  return await _repository.categoryRepository.update(id, categoryData);
};

exports.deleteCategory = async (id) => {
  // Kiểm tra danh mục tồn tại
  const category = await _repository.categoryRepository.getById(id);
  
  if (!category) {
    throw Object.assign(new Error("Danh mục không tồn tại"), { status: 404 });
  }
  
  // Kiểm tra xem danh mục có món ăn không
  const menuItems = await _repository.menuItemRepository.getByCategory(id);
  
  if (menuItems.length > 0) {
    throw Object.assign(
      new Error("Không thể xóa danh mục đang có món ăn"), 
      { status: 400 }
    );
  }
  
  // Xóa hình ảnh nếu có
  if (category.image && category.image.startsWith('/uploads/')) {
    const imagePath = path.join(__dirname, `../../public${category.image}`);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }
  
  return await _repository.categoryRepository.delete(id);
};
