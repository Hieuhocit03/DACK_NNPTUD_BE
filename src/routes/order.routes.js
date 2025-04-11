const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/order.controller");
const { isAuthenticated, isAdmin } = require("../middlewares/auth.middleware"); // Sử dụng middleware xác thực và phân quyền

// POST /api/orders - Tạo đơn hàng mới (yêu cầu đăng nhập)
router.post("/", isAuthenticated, OrderController.createOrder);

// GET /api/orders/all - Lấy tất cả đơn hàng (chỉ admin)
router.get("/all", isAuthenticated, isAdmin, OrderController.getAllOrders);

// GET /api/orders/my-orders - Lấy danh sách đơn hàng của người dùng hiện tại (yêu cầu đăng nhập)
router.get("/my-orders", isAuthenticated, OrderController.getOrdersByUser);

// GET /api/orders/:orderId - Lấy chi tiết đơn hàng (yêu cầu đăng nhập, kiểm tra quyền trong service)
router.get("/:orderId", isAuthenticated, OrderController.getOrderDetails);

// PUT /api/orders/:orderId/status - Cập nhật trạng thái đơn hàng (chỉ admin)
router.put(
  "/:orderId/status",
  isAuthenticated,
  isAdmin,
  OrderController.updateOrderStatus
);

// PUT /api/orders/:orderId - Cập nhật thông tin đơn hàng (yêu cầu đăng nhập)
router.put("/:orderId", isAuthenticated, OrderController.updateOrder);

// PUT /api/orders/:orderId/cancel - Hủy đơn hàng (yêu cầu đăng nhập, kiểm tra quyền trong service)
router.patch("/:orderId/cancel", isAuthenticated, OrderController.cancelOrder);

// DELETE /api/orders/:orderId - Xóa đơn hàng (yêu cầu đăng nhập, kiểm tra quyền trong service)
router.delete("/:orderId", isAuthenticated, OrderController.deleteOrder);

// GET /api/orders/admin/all - Lấy tất cả đơn hàng (chỉ admin - cần implement controller/service)
// router.get('/admin/all', isAuthenticated, isAdmin, OrderController.getAllOrdersForAdmin);

module.exports = router;
