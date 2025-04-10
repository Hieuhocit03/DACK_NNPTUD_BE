require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const _repository = require("../repositories/sub.repository");
const bcrypt = require("bcryptjs");
const userRole = require("../enums/userRole.enum");
const session = require("express-session");
const _otpService = require("./otp.service");

exports.generateToken = (user) => {
  return jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES }
  );
};

exports.register = async (newUserRequest) => {
  // Kiểm tra email đã tồn tại
  const existingUser = await User.findOne({ email: newUserRequest.email });
  if (existingUser)
    throw Object.assign(new Error("Email đã tồn tại"), { status: 400 });

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newUserRequest.email)) {
    throw Object.assign(new Error("Email không hợp lệ"), { status: 400 });
  }

  // Validate password
  if (newUserRequest.password.length < 6) {
    throw Object.assign(new Error("Mật khẩu phải có ít nhất 6 ký tự"), {
      status: 400,
    });
  }

  // Validate name
  if (!newUserRequest.name || newUserRequest.name.trim().length < 2) {
    throw Object.assign(new Error("Tên phải có ít nhất 2 ký tự"), {
      status: 400,
    });
  }

  // Validate age
  if (
    !newUserRequest.age ||
    newUserRequest.age < 0 ||
    newUserRequest.age > 120
  ) {
    throw Object.assign(new Error("Tuổi không hợp lệ"), { status: 400 });
  }

  // Validate gender
  const validGenders = ["male", "female", "other"];
  if (!validGenders.includes(newUserRequest.gender)) {
    throw Object.assign(new Error("Giới tính không hợp lệ"), { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(newUserRequest.password, 10);
  newUserRequest.password = hashedPassword;

  const newUser = await _repository.userRepository.add(newUserRequest);
  return newUser;
};

exports.login = async (name, password) => {
  // Validate input không được trống
  if (!name || !password) {
    throw Object.assign(new Error("Vui lòng nhập đầy đủ thông tin"), {
      status: 400,
    });
  }

  // Validate độ dài tối thiểu
  if (name.length < 2) {
    throw Object.assign(new Error("Tên đăng nhập không hợp lệ"), {
      status: 400,
    });
  }

  if (password.length < 6) {
    throw Object.assign(new Error("Mật khẩu phải có ít nhất 6 ký tự"), {
      status: 400,
    });
  }

  // Tìm user theo tên
  const user = await User.findOne({ name });
  if (!user) {
    throw Object.assign(new Error("Tên người dùng không tồn tại"), {
      status: 404,
    });
  }

  // Kiểm tra trạng thái tài khoản
  if (user.status === "banned") {
    throw Object.assign(new Error("Tài khoản của bạn đã bị khóa"), {
      status: 403,
    });
  }

  // Kiểm tra mật khẩu
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw Object.assign(new Error("Sai mật khẩu. Vui lòng đăng nhập lại"), {
      status: 401,
    });
  }

  session.user = {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
    status: user.status,
  };

  // Tạo và gửi OTP
  const otp = await _otpService.generateOTP();
  //return "Đã gửi mãi OTP đến email của bạn. Vui lòng check email để xác thực";

  return otp;
};
