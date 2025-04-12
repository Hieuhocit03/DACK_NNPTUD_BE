const _categoryService = require("../services/category.service");

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await _categoryService.getAllCategories();
    res.status(200).json(categories);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await _categoryService.getCategoryById(req.params.id);
    res.status(200).json(category);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.createCategory = async (req, res) => {
  console.log(
    "[Category Controller] createCategory called. Body:",
    req.body,
    "File:",
    req.file?.originalname
  );
  try {
    const newCategory = await _categoryService.createCategory(
      req.body,
      req.file
    );
    console.log(
      "[Category Controller] Category created successfully, sending response."
    );
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("[Category Controller] Error in createCategory:", error);
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  console.log(
    `[Category Controller] updateCategory called for ID: ${req.params.id}. Body:`,
    req.body,
    "File:",
    req.file?.originalname
  );
  try {
    const updatedCategory = await _categoryService.updateCategory(
      req.params.id,
      req.body,
      req.file
    );
    console.log(
      "[Category Controller] Category updated successfully, sending response."
    );
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error(
      `[Category Controller] Error in updateCategory for ID ${req.params.id}:`,
      error
    );
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await _categoryService.deleteCategory(req.params.id);
    res.status(200).json({ message: "Xóa danh mục thành công" });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
