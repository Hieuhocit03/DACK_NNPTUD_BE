const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/payment.controller");
const { isAuthenticated } = require("../middlewares/auth.middleware"); // Chỉ cần xác thực để tạo yêu cầu thanh toán

// --- VNPay Routes ---

// POST /api/payments/vnpay/create - Tạo URL thanh toán VNPay (yêu cầu đăng nhập)
router.post(
  "/vnpay/create",
  isAuthenticated,
  PaymentController.createVNPayPaymentURL
);

// GET /api/payments/vnpay/notify - Nhận IPN từ VNPay (Webhook - không cần xác thực)
// Thường VNPay gửi IPN qua GET request với query params
router.get("/vnpay/notify", PaymentController.handleVNPayIPN);

// GET /api/payments/vnpay/return - Xử lý redirect từ VNPay (không cần xác thực ở route)
router.get("/vnpay/return", PaymentController.handleVNPayReturn);

module.exports = router;
