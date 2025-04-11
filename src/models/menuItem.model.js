const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên món ăn là bắt buộc"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Giá món ăn là bắt buộc"],
      min: [0, "Giá không thể âm"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    image: {
      type: String,
      trim: true,
      default: "",
    },
    detail: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Danh mục là bắt buộc"],
    },
    status: {
      type: Boolean,
      default: true,
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: [0, "Rating không thể nhỏ hơn 0"],
      max: [5, "Rating không thể lớn hơn 5"],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

menuItemSchema.index({ name: "text", description: "text" });
menuItemSchema.index({ category: 1 });
menuItemSchema.index({ price: 1 });

const MenuItem = mongoose.model("MenuItem", menuItemSchema);

module.exports = MenuItem;
