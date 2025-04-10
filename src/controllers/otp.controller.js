const session = require("express-session");
const _otpService = require("../services/otp.service");

exports.generateOTP = async (req, res) => {
  const otp = await _otpService.generateOTP();
  res.status(200).json({ otp });
};

exports.verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const token = await _otpService.verifyOTP(otp);

    res.cookie("token", token, {
      httpOnly: true, // Bảo mật, không thể truy cập từ frontend JavaScript
      secure: false,
      sameSite: "strict",
    });

    const role = session.user.role;

    res.status(200).json({ message: "Đăng nhập thành công", token, role });
  } catch (error) {
    res.status(error.status).json({ message: error.message });
  }
};
