const speakeasy = require("speakeasy");
const session = require("express-session");
const nodemailer = require("nodemailer");
const _authService = require("./auth.service");

class OTPService {
    async generateOTP() {
        const email = session.user.email;

        const otp = speakeasy.totp({
            secret: process.env.OTP_SECRET,
            encoding: 'base32',
            step: 100
        });

        // Cấu hình transporter cho nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Cấu hình email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Mã OTP xác thực',
            text: `Mã đăng nhập của bạn là ${otp}`
        };

        // Gửi email
        //return await transporter.sendMail(mailOptions);
        return otp;
    }

    async verifyOTP(userInputOTP) {
        const verified = speakeasy.totp.verify({
            secret: process.env.OTP_SECRET,
            encoding: 'base32',
            token: userInputOTP,
            step: 100,
            window: 0 // chi chap nhan otp moi nhat,nếu là 1 thì chấp nhận cả các otp trước đó
        });

        if (verified) {
            // Xác thực thành công, hoàn tất đăng nhập
            const user = session.user;
            const token = _authService.generateToken(user);
            return token;
        } else {
            throw Object.assign(new Error("Mã OTP bị sai hoặc hết hạn"), { status: 401 });
        }
    }
}

module.exports = new OTPService();
