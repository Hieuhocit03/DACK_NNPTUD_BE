// const BaseRepository = require("./base.repository"); // Tạm thời không kế thừa
const Order = require("../models/order.model");

// class OrderRepository extends BaseRepository { // Tạm thời không kế thừa
class OrderRepository {
  constructor() {
    console.log(
      "Initializing OrderRepository (no inheritance) with model:",
      Order.modelName
    );
    // super(Order);
    this.model = Order; // Gán model trực tiếp
  }

  // Định nghĩa lại các hàm cần thiết
  async add(data, options = {}) {
    // return await this.model.create([data], options); // Dùng create để hỗ trợ session
    const item = new this.model(data);
    return await item.save(options);
  }

  async findOne(filter = {}) {
    return await this.model.findOne(filter);
  }

  async getById(id) {
    return await this.model.findById(id);
  }

  async getAll(filter = {}, options = {}) {
    return await this.model.find(filter, null, options);
  }

  async deleteOne(filter, options = {}) {
    return await this.model.findOneAndDelete(filter, options);
  }

  async updateOne(filter, data, options = {}) {
    return await this.model.findOneAndUpdate(filter, data, {
      new: true,
      ...options,
    });
  }

  async count(filter = {}) {
    return await this.model.countDocuments(filter);
  }

  // Các phương thức tùy chỉnh giữ nguyên
  async findByOrderCode(orderCode) {
    return await this.findOne({ orderCode: orderCode });
  }

  async findByUserId(userId, options = {}) {
    return await this.getAll({ userId: userId }, options);
  }
}

module.exports = OrderRepository; // Vẫn export class
