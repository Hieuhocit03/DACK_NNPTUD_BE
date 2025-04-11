const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Tham chiếu đến model User trong src
      required: true,
    },
    orderCode: {
      type: String,
      required: true,
      unique: true, // Thêm unique để đảm bảo mã đơn hàng là duy nhất
    },
    orderDate: {
      type: Date,
      required: true,
    },
    orderTime: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    numberOfGuests: {
      type: Number,
      required: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    specialRequests: {
      type: String,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    // Thêm trạng thái đơn hàng
    orderStatus: {
      type: String,
      enum: ["Đang chờ duyệt", "Đã xác nhận", "Đã hủy", "Hoàn thành"],
      default: "Đang chờ duyệt",
      required: true,
    },

    // Thêm trạng thái thanh toán
    paymentStatus: {
      type: String,
      enum: ["Chưa thanh toán", "Thanh toán thất bại", "Đã thanh toán"],
      default: "Chưa thanh toán",
      required: true,
    },

    // Thông tin thanh toán thêm
    depositAmount: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["Tiền mặt", "Chuyển khoản", "MoMo", "VNPay"], // Cập nhật phương thức thanh toán
    },
    paymentDate: {
      type: Date,
    },
    paymentDetails: {
      momoTransId: {
        // Ví dụ cho MoMo
        type: String,
      },
      vnpayTransId: {
        // Ví dụ cho VNPay
        type: String,
      },
      // Có thể thêm các trường khác nếu cần
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
