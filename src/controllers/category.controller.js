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
  try {
    const newCategory = await _categoryService.createCategory(
      req.body,
      req.file
    );
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const updatedCategory = await _categoryService.updateCategory(
      req.params.id,
      req.body,
      req.file
    );
    res.status(200).json(updatedCategory);
  } catch (error) {
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
