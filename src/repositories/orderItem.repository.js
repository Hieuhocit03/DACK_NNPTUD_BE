// const BaseRepository = require("./base.repository"); // Tạm thời không kế thừa
const OrderItem = require("../models/orderItem.model");

// class OrderItemRepository extends BaseRepository { // Tạm thời không kế thừa
class OrderItemRepository {
  constructor() {
    // super(OrderItem);
    this.model = OrderItem; // Gán model trực tiếp
  }

  // Định nghĩa lại các hàm cần thiết
  async addMany(itemsData, options = {}) {
    // Sử dụng insertMany để thêm nhiều document cùng lúc
    return await this.model.insertMany(itemsData, options);
  }

  async getAll(filter = {}, options = {}) {
    return await this.model.find(filter, null, options);
  }

  // Các phương thức tùy chỉnh giữ nguyên
  async findByOrderId(orderId) {
    // Gọi find và populate trực tiếp từ model
    return await this.model.find({ orderId: orderId }).populate("menuItemId");
  }
}

module.exports = OrderItemRepository; // Vẫn export class
