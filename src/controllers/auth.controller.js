const _authService = require("../services/auth.service");
const session = require("express-session");

exports.register = async (req, res) => {
  try {
    await _authService.register(req.body);

    res.status(201).json({ message: "Đăng ký thành công!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { name, password } = req.body;

    const sendOTP = await _authService.login(name, password);
    res.status(200).json({ OTP: sendOTP });

    /*res.cookie("token", token, {
            httpOnly: true, // Bảo mật, không thể truy cập từ frontend JavaScript
            secure: false, 
            sameSite: "strict" // Chặn truy cập từ trang khác
        });


        res.json({ message: "Đăng nhập thành công", token });*/
  } catch (error) {
    res.status(error.status).json({ message: error.message });
  }
};

exports.logout = async (res) => {
  try {
    res.clearCookie("token");
    res.json({ message: "Đăng xuất thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
