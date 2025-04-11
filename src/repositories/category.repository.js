const BaseRepository = require("./base.repository");

class CategoryRepository extends BaseRepository {
  constructor() {
    super("Category");
  }

  async getActiveCategories() {
    return await this.model.find({ status: true });
  }

  async getAll() {
    return await this.model.find();
  }

  async getByName(name) {
    return await this.model.findOne({ name });
  }

  async getById(id) {
    return await this.model.findById(id);
  }

  async add(data) {
    const category = new this.model(data);
    return await category.save();
  }

  async update(id, data) {
    return await this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }
}

module.exports = CategoryRepository;
