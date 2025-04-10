const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const UserRoleENUM = require("../enums/userRole.enum");

const initAdmin = async () => {
  try {
    // Kiểm tra xem đã có admin chưa
    const existingAdmin = await User.findOne({ email: "admin@gmail.com" });

    if (!existingAdmin) {
      // Mã hóa mật khẩu
      const hashedPassword = await bcrypt.hash("123456Aa", 10);

      // Tạo admin mặc định
      const admin = new User({
        name: "Admin",
        email: "admin@gmail.com",
        password: hashedPassword,
        role: UserRoleENUM.ADMIN,
        age: 99,
        gender: "other",
        status: "active",
      });

      // Lưu admin vào database
      await admin.save();
      console.log("Admin mặc định đã được tạo thành công");
    } else {
      console.log("Admin mặc định đã tồn tại");
    }
  } catch (error) {
    console.error("Lỗi khi tạo admin mặc định:", error);
  }
};

module.exports = initAdmin;
