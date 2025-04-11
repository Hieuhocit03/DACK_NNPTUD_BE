const mongoose = require("mongoose");

class BaseRepository {
  constructor(modelName) {
    if (!modelName) {
      throw new Error("Tên model là bắt buộc");
    }
    
    try {
      this.model = mongoose.model(modelName);
    } catch (error) {
      throw new Error(`Model '${modelName}' không tồn tại hoặc chưa được đăng ký.`);
    }
  }

  async getAll() {
    return await this.model.find();
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
    return await this.model.find({ _id: { $in: entity_ids } });
  }

  async add(data) {
    const item = new this.model(data);
    return await item.save();
  }

  async update(id, data) {
    return await this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }
}

module.exports = BaseRepository;
