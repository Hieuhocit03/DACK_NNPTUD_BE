const User = require("../models/user.model"); // Không cần import User ở đây nữa

class BaseRepository {
  constructor(modelName) {
    this.model = User;

    if (!this.model) {
      throw new Error(`Model '${modelName}' không tồn tại.`);
    }
  }

  async getAll(filter = {}, options = {}) {
    // Thêm filter và options
    return await this.model.find(filter, null, options);
  }

  async getById(id) {
    return await this.model.findById(id);
  }

  async getByName(entityName) {
    return await this.model.findOne({ name: entityName });
  }

  async searchByName(entityName) {
    return await this.model.find({
      name: { $regex: new RegExp(entityName, "i") },
    });
  }

  async find(entity_ids) {
    return await this.model.find({ _id: { $in: entity_ids } }); // use $in for faster query
  }

  async findOne(filter = {}) {
    // Thêm hàm findOne
    return await this.model.findOne(filter);
  }

  async add(data) {
    const item = new this.model(data);
    return await item.save();
  }

  async update(id, data) {
    return await this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async updateOne(filter, data) {
    // Thêm hàm updateOne
    return await this.model.findOneAndUpdate(filter, data, { new: true });
  }

  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async count(filter = {}) {
    // Thêm hàm count
    return await this.model.countDocuments(filter);
  }

  async aggregate(pipeline = []) {
    // Thêm hàm aggregate
    return await this.model.aggregate(pipeline);
  }
}

module.exports = BaseRepository;
