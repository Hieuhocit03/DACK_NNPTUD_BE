const OrderRepository = require("../repositories/order.repository");
const OrderItemRepository = require("../repositories/orderItem.repository");
// const MenuItemRepository = require("../repositories/menuItem.repository"); // Tạm comment nếu chưa có
const generateOrderCode = require("../utils/genOrderCode");
const AppError = require("../utils/appError");
const mongoose = require("mongoose"); // Import mongoose để dùng transaction

class OrderService {
  constructor() {
    // Khởi tạo các repository cần thiết
    this.orderRepo = new OrderRepository();
    this.orderItemRepo = new OrderItemRepository();
    // this.menuItemRepo = new MenuItemRepository();
  }

  // --- Các hàm xử lý logic nghiệp vụ cho Order ---

  async createOrder(userId, orderInput) {
    try {
      const { orderDetails, items } = orderInput;

      if (!orderDetails) {
        throw new AppError(
          "Thiếu thông tin chi tiết đơn hàng (orderDetails).",
          400
        );
      }

      const {
        orderDate,
        orderTime,
        customerName,
        phoneNumber,
        numberOfGuests,
        eventType,
        specialRequests,
        totalAmount,
      } = orderDetails;

      if (!items || items.length === 0) {
        throw new AppError("Đơn hàng phải có ít nhất một sản phẩm", 400);
      }

      const orderItemsToCreate = items.map((item) => {
        const unitPrice = item.unitPrice; // TẠM THỜI = 0, phải lấy giá từ DB
        if (item.quantity <= 0) {
          throw new AppError("Số lượng sản phẩm phải là số dương.", 400);
        }
        if (!item.menuItemId) {
          throw new AppError("Thiếu menuItemId trong items.", 400);
        }
        const amount = item.quantity * unitPrice;
        return {
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: unitPrice,
          amount: amount,
        };
      });

      const newOrderData = {
        userId,
        orderCode: generateOrderCode(eventType || "Unknown"),
        orderDate,
        orderTime,
        customerName,
        phoneNumber,
        numberOfGuests,
        eventType,
        specialRequests,
        totalAmount,
      };

      const createdOrder = await this.orderRepo.add(newOrderData);
      if (!createdOrder) {
        throw new AppError("Không thể tạo đơn hàng", 500);
      }

      const finalOrderItems = orderItemsToCreate.map((item) => ({
        ...item,
        orderId: createdOrder._id,
      }));
      await this.orderItemRepo.addMany(finalOrderItems);
      return createdOrder;
    } catch (error) {
      console.error("Error creating order:", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Lỗi khi tạo đơn hàng: " + error.message, 500);
    }
  }

  async getAllOrders(queryParams = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy,
      sortOrder = "desc",
      searchTerm,
    } = queryParams;

    try {
      const filter = {};
      if (status && status !== "all") {
        filter.orderStatus = status;
      }

      // Thêm điều kiện tìm kiếm nếu có searchTerm
      if (searchTerm) {
        filter.$or = [
          { orderCode: { $regex: searchTerm, $options: "i" } },
          { customerName: { $regex: searchTerm, $options: "i" } },
          { phoneNumber: { $regex: searchTerm, $options: "i" } },
        ];
      }

      const sortOptions = {};
      if (sortBy) {
        sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
      } else {
        sortOptions.createdAt = -1; // Mặc định sort theo thời gian tạo mới nhất
      }

      const options = {
        sort: sortOptions,
        skip: (parseInt(page) - 1) * parseInt(limit),
        limit: parseInt(limit),
      };

      const orders = await this.orderRepo.getAll(filter, options);
      const totalCount = await this.orderRepo.count(filter);

      return {
        orders,
        totalCount,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        stats: {
          total: orders.length,
          pending: orders.filter(
            (order) => order.orderStatus === "Đang chờ duyệt"
          ).length,
          confirmed: orders.filter(
            (order) => order.orderStatus === "Đã xác nhận"
          ).length,
          completed: orders.filter(
            (order) => order.orderStatus === "Hoàn thành"
          ).length,
          cancelled: orders.filter((order) => order.orderStatus === "Đã hủy")
            .length,
        },
      };
    } catch (error) {
      console.error("Error getting all orders:", error);
      throw new AppError("Lỗi khi lấy danh sách đơn hàng.", 500);
    }
  }

  async getOrdersByUser(userId, queryParams = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy,
      sortOrder = "desc",
    } = queryParams;
    const filter = { userId: userId };
    if (status && status !== "all") filter.orderStatus = status;

    const sortOptions = {};
    if (sortBy) sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
    else sortOptions.createdAt = -1; // Mặc định sort theo mới nhất

    const options = {
      sort: sortOptions,
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit),
    };

    try {
      const orders = await this.orderRepo.getAll(filter, options);
      const totalCount = await this.orderRepo.count(filter);
      return {
        orders,
        totalCount,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      console.error("Error getting orders by user:", error);
      throw new AppError("Lỗi khi lấy danh sách đơn hàng.", 500);
    }
  }

  async getOrderDetails(orderId, userId, userRole) {
    try {
      const order = await this.orderRepo.getById(orderId);
      if (!order) {
        throw new AppError("Không tìm thấy đơn hàng.", 404);
      }

      if (
        userRole !== "admin" &&
        order.userId.toString() !== userId.toString()
      ) {
        throw new AppError("Bạn không có quyền xem đơn hàng này.", 403);
      }

      const orderItems = await this.orderItemRepo.findByOrderId(orderId);
      return { order, items: orderItems };
    } catch (error) {
      console.error("Error getting order details:", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Lỗi khi lấy chi tiết đơn hàng.", 500);
    }
  }

  async updateOrderStatus(orderId, newStatus, userRole) {
    const allowedStatus = [
      "Đang chờ duyệt",
      "Đã xác nhận",
      "Đã hủy",
      "Hoàn thành",
    ];
    if (!allowedStatus.includes(newStatus)) {
      throw new AppError(`Trạng thái '${newStatus}' không hợp lệ.`, 400);
    }
    if (userRole !== "admin") {
      throw new AppError(
        "Bạn không có quyền cập nhật trạng thái đơn hàng.",
        403
      );
    }
    try {
      const updatedOrder = await this.orderRepo.updateOne(
        { _id: orderId },
        { orderStatus: newStatus }
      );
      if (!updatedOrder) {
        throw new AppError("Không tìm thấy đơn hàng để cập nhật.", 404);
      }
      console.log(`Order ${orderId} status updated to ${newStatus}`);
      return updatedOrder;
    } catch (error) {
      console.error("Error updating order status:", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Lỗi khi cập nhật trạng thái đơn hàng.", 500);
    }
  }

  async cancelOrder(orderId, userId, userRole) {
    try {
      const order = await this.orderRepo.getById(orderId);
      if (!order) {
        throw new AppError("Không tìm thấy đơn hàng.", 404);
      }
      if (
        userRole !== "admin" &&
        order.userId.toString() !== userId.toString()
      ) {
        throw new AppError("Bạn không có quyền hủy đơn hàng này.", 403);
      }
      if (
        order.orderStatus === "Hoàn thành" ||
        order.orderStatus === "Đã hủy"
      ) {
        throw new AppError(
          `Không thể hủy đơn hàng ở trạng thái '${order.orderStatus}'.`,
          400
        );
      }
      const updatedOrder = await this.orderRepo.updateOne(
        { _id: orderId },
        { orderStatus: "Đã hủy" }
      );
      if (!updatedOrder) {
        throw new AppError("Không thể hủy đơn hàng.", 500);
      }
      console.log(
        `Order ${orderId} cancelled by user ${userId} (role: ${userRole})`
      );
      return updatedOrder;
    } catch (error) {
      console.error("Error cancelling order:", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Lỗi khi hủy đơn hàng.", 500);
    }
  }

  async updateOrder(orderId, updateData, userId, userRole) {
    try {
      const order = await this.orderRepo.getById(orderId);

      if (!order) {
        throw new AppError("Không tìm thấy đơn hàng.", 404);
      }

      // Kiểm tra quyền - chỉ admin hoặc chủ đơn hàng mới được cập nhật
      if (
        userRole !== "admin" &&
        order.userId.toString() !== userId.toString()
      ) {
        throw new AppError("Bạn không có quyền cập nhật đơn hàng này.", 403);
      }

      // Kiểm tra trạng thái đơn hàng
      if (
        order.orderStatus === "Hoàn thành" ||
        order.orderStatus === "Đã hủy"
      ) {
        throw new AppError(
          `Không thể cập nhật đơn hàng ở trạng thái '${order.orderStatus}'.`,
          400
        );
      }

      // Thực hiện cập nhật
      const updatedOrder = await this.orderRepo.updateOne(
        { _id: orderId },
        updateData
      );

      if (!updatedOrder) {
        throw new AppError("Không thể cập nhật đơn hàng.", 500);
      }

      console.log(
        `Order ${orderId} updated by user ${userId} (role: ${userRole})`
      );
      return updatedOrder;
    } catch (error) {
      console.error("Error updating order:", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Lỗi khi cập nhật đơn hàng.", 500);
    }
  }

  async deleteOrder(orderId, userId, userRole) {
    try {
      const order = await this.orderRepo.getById(orderId);
      if (!order) {
        throw new AppError("Không tìm thấy đơn hàng.", 404);
      }
      if (
        userRole !== "admin" &&
        order.userId.toString() !== userId.toString()
      ) {
        throw new AppError("Bạn không có quyền xóa đơn hàng này.", 403);
      }
      if (
        order.orderStatus === "Hoàn thành" ||
        order.orderStatus === "Đã hủy"
      ) {
        throw new AppError(
          `Không thể xóa đơn hàng ở trạng thái '${order.orderStatus}'.`,
          400
        );
      }
      const deletedOrder = await this.orderRepo.deleteOne({ _id: orderId });
      if (!deletedOrder) {
        throw new AppError("Không thể xóa đơn hàng.", 500);
      }
      return deletedOrder;
    } catch (error) {
      console.error("Error deleting order:", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Lỗi khi xóa đơn hàng.", 500);
    }
  }

  // ... các hàm khác
}

module.exports = new OrderService();
