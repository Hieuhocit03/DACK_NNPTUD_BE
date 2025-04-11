const PaymentService = require("../services/payment.service");
const OrderService = require("../services/order.service"); // Có thể cần để lấy thông tin đơn hàng
const AppError = require("../utils/appError");

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

class PaymentController {
  // --- MoMo Controller Handlers ---

  // --- VNPay Controller Handlers ---
  createVNPayPaymentURL = catchAsync(async (req, res, next) => {
    const { orderId } = req.body;
    if (!orderId) {
      return next(new AppError("Vui lòng cung cấp ID đơn hàng.", 400));
    }
    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : null);

    const orderDetails = await OrderService.getOrderDetails(
      orderId,
      req.user.id,
      req.user.role
    );
    if (!orderDetails || !orderDetails.order) {
      return next(new AppError("Không tìm thấy đơn hàng hợp lệ.", 404));
    }
    if (orderDetails.order.paymentStatus === "Đã thanh toán") {
      return next(new AppError("Đơn hàng này đã được thanh toán.", 400));
    }

    const amount = orderDetails.order.totalAmount;
    const orderInfo = `Thanh toán thành công cho đơn đặt bàn ${orderDetails.order.orderCode}`;

    const result = await PaymentService.createVNPayPaymentURL(
      orderId,
      amount,
      ipAddr,
      orderInfo
    );
    res.status(200).json({
      status: "success",
      data: result,
    });
  });

  handleVNPayIPN = catchAsync(async (req, res, next) => {
    const vnpayResponse = req.query; // VNPay gửi IPN qua query params
    const result = await PaymentService.handleVNPayIPN(vnpayResponse);
    // Phản hồi VNPay theo định dạng yêu cầu
    res.status(200).json(result);
  });

  handleVNPayReturn = catchAsync(async (req, res, next) => {
    const vnpayResponse = req.query;
    const result = await PaymentService.handleVNPayReturn(vnpayResponse);
    // res.redirect(`${config.FRONTEND_URL}/payment/result?success=${result.success}&message=${encodeURIComponent(result.message)}&orderId=${result.orderId}`);
    res.status(200).json({
      status: result.success ? "success" : "fail",
      ...result,
    });
  });
}

module.exports = new PaymentController();
