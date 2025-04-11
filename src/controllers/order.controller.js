const OrderService = require("../services/order.service");

// Middleware helper để bắt lỗi async (nếu chưa có)
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

class OrderController {
  createOrder = catchAsync(async (req, res, next) => {
    // userId lấy từ req.user (được gắn bởi middleware xác thực)
    console.log("req.user", req.user);
    const userId = req.user._id;
    const orderInput = req.body; // Dữ liệu đơn hàng từ client
    console.log("order", orderInput);
    const createdOrder = await OrderService.createOrder(userId, orderInput);
    res.status(201).json({
      status: "success",
      message: "Đơn hàng đã được tạo thành công.",
      data: createdOrder,
    });
  });

  getAllOrders = catchAsync(async (req, res, next) => {
    const queryParams = req.query; // Lấy các tham số query (page, limit, status, sortBy, ...)
    const result = await OrderService.getAllOrders(queryParams);
    res.status(200).json({
      status: "success",
      results: result.orders.length,
      data: result,
    });
  });

  getOrdersByUser = catchAsync(async (req, res, next) => {
    const userId = req.query.userId;
    console.log("userId", userId);
    const queryParams = req.query; // Lấy các tham số query (page, limit, status, ...)
    console.log("queryParams", queryParams);
    const result = await OrderService.getOrdersByUser(userId, queryParams);
    res.status(200).json({
      status: "success",
      results: result.orders.length,
      data: result,
    });
  });

  getOrderDetails = catchAsync(async (req, res, next) => {
    const orderId = req.params.orderId;
    const userId = req.user.id;
    const userRole = req.user.role;
    const orderDetails = await OrderService.getOrderDetails(
      orderId,
      userId,
      userRole
    );
    res.status(200).json({
      status: "success",
      data: orderDetails,
    });
  });

  updateOrderStatus = catchAsync(async (req, res, next) => {
    const orderId = req.params.orderId;
    const { status } = req.body; // Trạng thái mới từ body
    const userRole = req.user.role; // Lấy role từ user đã xác thực
    const updatedOrder = await OrderService.updateOrderStatus(
      orderId,
      status,
      userRole
    );
    res.status(200).json({
      status: "success",
      message: "Cập nhật trạng thái đơn hàng thành công.",
      data: updatedOrder,
    });
  });

  cancelOrder = catchAsync(async (req, res, next) => {
    const orderId = req.params.orderId;
    const userId = req.user.id;
    const userRole = req.user.role;
    const cancelledOrder = await OrderService.cancelOrder(
      orderId,
      userId,
      userRole
    );
    res.status(200).json({
      status: "success",
      message: "Hủy đơn hàng thành công.",
      data: cancelledOrder,
    });
  });

  updateOrder = catchAsync(async (req, res, next) => {
    const orderId = req.params.orderId;
    const userId = req.user.id;
    const userRole = req.user.role;
    const updateData = req.body;

    const updatedOrder = await OrderService.updateOrder(
      orderId,
      updateData,
      userId,
      userRole
    );

    res.status(200).json({
      status: "success",
      message: "Cập nhật đơn hàng thành công.",
      data: updatedOrder,
    });
  });

  deleteOrder = catchAsync(async (req, res, next) => {
    const orderId = req.params.orderId;
    const userId = req.user.id;
    const userRole = req.user.role;
    const deletedOrder = await OrderService.deleteOrder(
      orderId,
      userId,
      userRole
    );
    res.status(200).json({
      status: "success",
      message: "Xóa đơn hàng thành công.",
      data: deletedOrder,
    });
  });

  // Có thể thêm hàm getAllOrders cho admin nếu cần
  // getAllOrdersForAdmin = catchAsync(async (req, res, next) => { ... });
}

module.exports = new OrderController();
