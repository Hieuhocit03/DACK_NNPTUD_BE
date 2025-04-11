const mongoose = require("mongoose");
const UserRole = require("../enums/userRole.enum");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Người đánh giá là bắt buộc"],
    },
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: [true, "Món ăn được đánh giá là bắt buộc"],
    },
    rating: {
      type: Number,
      required: [true, "Số sao đánh giá là bắt buộc"],
      min: [1, "Đánh giá thấp nhất là 1 sao"],
      max: [5, "Đánh giá cao nhất là 5 sao"],
    },
    comment: {
      type: String,
      required: [true, "Nội dung đánh giá là bắt buộc"],
      trim: true,
      minlength: [3, "Nội dung đánh giá phải có ít nhất 3 ký tự"],
    },
    images: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ menuItem: 1, user: 1 }, { unique: true });

reviewSchema.statics.calculateAverageRating = async function (menuItemId) {
  const stats = await this.aggregate([
    {
      $match: {
        menuItem: new mongoose.Types.ObjectId(menuItemId),
        status: "approved",
      },
    },
    {
      $group: {
        _id: "$menuItem",
        avgRating: { $avg: "$rating" },
        nRating: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model("MenuItem").findByIdAndUpdate(menuItemId, {
      ratingAverage: Math.round(stats[0].avgRating * 10) / 10,
      ratingCount: stats[0].nRating,
    });
  } else {
    await mongoose.model("MenuItem").findByIdAndUpdate(menuItemId, {
      ratingAverage: 0,
      ratingCount: 0,
    });
  }
};

reviewSchema.post("save", function () {
  this.constructor.calculateAverageRating(this.menuItem);
});

reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.menuItem);
  }
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
