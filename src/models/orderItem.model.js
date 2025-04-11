const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order", // Tham chiếu đến model Order trong src
    required: true,
  },
  menuItemId: {
    // Đổi tên từ productId sang menuItemId để phù hợp dự án gốc
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem", // Tham chiếu đến model MenuItem trong src
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

const OrderItem = mongoose.model("OrderItem", orderItemSchema);

module.exports = OrderItem;
