const repository = require("../repositories/category.repository");
const MenuItem = require("../models/menuItem.model");
const fs = require("fs");
const path = require("path");

const _repository = new repository();

exports.getAllCategories = async () => {
  return await _repository.getAll();
};

exports.getCategoryById = async (id) => {
  const category = await _repository.getById(id);

  if (!category) {
    throw Object.assign(new Error("Danh mục không tồn tại"), { status: 404 });
  }

  return category;
};

exports.createCategory = async (categoryData, imageFile) => {
  console.log(
    "[Category Service] createCategory called with data:",
    categoryData,
    "and file:",
    imageFile?.originalname
  );
  // Kiểm tra tên danh mục đã tồn tại
  const existingCategory = await _repository.getByName(categoryData.name);

  if (existingCategory) {
    console.log(
      "[Category Service] Category name already exists:",
      categoryData.name
    );
    throw Object.assign(new Error("Tên danh mục đã tồn tại"), { status: 400 });
  }

  // Xử lý hình ảnh nếu có
  if (imageFile) {
    console.log(
      "[Category Service] Processing image file:",
      imageFile.originalname
    );
    const imagePath = `/uploads/categories/${Date.now()}-${
      imageFile.originalname
    }`;
    const uploadPath = path.join(__dirname, `../../public${imagePath}`);
    console.log(
      `[Category Service] Attempting to save image to: ${uploadPath}`
    );

    // Đảm bảo thư mục tồn tại
    const dir = path.dirname(uploadPath);
    if (!fs.existsSync(dir)) {
      console.log(`[Category Service] Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }

    // Lưu file
    try {
      fs.writeFileSync(uploadPath, imageFile.buffer);
      console.log(
        `[Category Service] File successfully written to: ${uploadPath}`
      );
      categoryData.image = imagePath;
    } catch (writeError) {
      console.error(
        `[Category Service] Error writing file to ${uploadPath}:`,
        writeError
      );
      throw Object.assign(
        new Error(`Failed to save image file: ${writeError.message}`),
        { status: 500 }
      );
    }
  } else {
    console.log("[Category Service] No image file provided.");
  }

  console.log(
    "[Category Service] Adding category to database with data:",
    categoryData
  );
  const newCategory = await _repository.add(categoryData);
  console.log(
    "[Category Service] Category added successfully:",
    newCategory?._id
  );
  return newCategory;
};

exports.updateCategory = async (id, categoryData, imageFile) => {
  console.log(
    `[Category Service] updateCategory called for ID: ${id} with data:`,
    categoryData,
    "and file:",
    imageFile?.originalname
  );
  // Kiểm tra danh mục tồn tại
  const category = await _repository.getById(id);

  if (!category) {
    console.log(
      `[Category Service] Category with ID ${id} not found for update.`
    );
    throw Object.assign(new Error("Danh mục không tồn tại"), { status: 404 });
  }

  // Kiểm tra trùng tên với danh mục khác
  if (categoryData.name) {
    const existingCategory = await _repository.getByName(categoryData.name);
    if (existingCategory && existingCategory._id.toString() !== id) {
      console.log(
        "[Category Service] Category name already exists:",
        categoryData.name
      );
      throw Object.assign(new Error("Tên danh mục đã tồn tại"), {
        status: 400,
      });
    }
  }

  // Xử lý hình ảnh nếu có
  if (imageFile) {
    console.log(
      "[Category Service] Processing image file for update:",
      imageFile.originalname
    );
    const imagePath = `/uploads/categories/${Date.now()}-${
      imageFile.originalname
    }`;
    const uploadPath = path.join(__dirname, `../../public${imagePath}`);
    console.log(
      `[Category Service] Attempting to save updated image to: ${uploadPath}`
    );
    const dir = path.dirname(uploadPath);
    if (!fs.existsSync(dir)) {
      console.log(`[Category Service] Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }

    try {
      // Lưu file mới
      fs.writeFileSync(uploadPath, imageFile.buffer);
      console.log(
        `[Category Service] Updated file successfully written to: ${uploadPath}`
      );
      categoryData.image = imagePath; // Gán đường dẫn mới

      // Xóa file cũ nếu có
      if (category.image && category.image.startsWith("/uploads/")) {
        const oldPath = path.join(__dirname, `../../public${category.image}`);
        if (fs.existsSync(oldPath)) {
          console.log(
            `[Category Service] Attempting to delete old image: ${oldPath}`
          );
          try {
            fs.unlinkSync(oldPath);
            console.log(
              `[Category Service] Old image deleted successfully: ${oldPath}`
            );
          } catch (unlinkErr) {
            console.error(
              `[Category Service] Error deleting old image ${oldPath}:`,
              unlinkErr
            );
            // Không ném lỗi ở đây, tiếp tục cập nhật DB
          }
        } else {
          console.log(
            `[Category Service] Old image path not found, skipping delete: ${oldPath}`
          );
        }
      }
    } catch (writeError) {
      console.error(
        `[Category Service] Error writing updated file to ${uploadPath}:`,
        writeError
      );
      throw Object.assign(
        new Error(`Failed to save updated image file: ${writeError.message}`),
        { status: 500 }
      );
    }
  } else {
    console.log("[Category Service] No new image file provided for update.");
  }

  console.log(
    `[Category Service] Updating category ${id} in database with data:`,
    categoryData
  );
  const updatedCategory = await _repository.update(id, categoryData);
  console.log(
    "[Category Service] Category updated successfully:",
    updatedCategory?._id
  );
  return updatedCategory;
};

exports.deleteCategory = async (id) => {
  // Kiểm tra danh mục tồn tại
  const category = await _repository.getById(id);

  if (!category) {
    throw Object.assign(new Error("Danh mục không tồn tại"), { status: 404 });
  }

  // Kiểm tra xem danh mục có món ăn không
  const menuItems = await MenuItem.find({ category: id });

  if (menuItems.length > 0) {
    throw Object.assign(new Error("Không thể xóa danh mục đang có món ăn"), {
      status: 400,
    });
  }

  // Xóa hình ảnh nếu có
  if (category.image && category.image.startsWith("/uploads/")) {
    const imagePath = path.join(__dirname, `../../public${category.image}`);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  return await _repository.delete(id);
};
