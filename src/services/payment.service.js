const axios = require("axios");
const config = require("../config/config"); // Để lấy các secret key và URL từ .env
// const momoHelper = require("../utils/momoHelper"); // Bỏ nếu Momo dùng thư viện riêng
// const vnpayHelper = require("../utils/vnpayHelper"); // Thư viện vnpay sẽ xử lý
const OrderRepository = require("../repositories/order.repository");
const AppError = require("../utils/appError");
// const uuid = require("uuid"); // Không thấy sử dụng trong VNPay
// const moment = require("moment"); // Thư viện vnpay tự xử lý ngày tạo
// const qs = require("qs"); // Thư viện vnpay tự xử lý query string
const crypto = require("crypto"); // Dùng cho tạo hash thủ công (như ví dụ router)
const { VNPay } = require("vnpay"); // Import thư viện VNPay

// --- Helper Functions (tạm thời giữ lại cho IPN theo ví dụ router) ---
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

function generateSecureHash(params, secretKey) {
  const sortedParams = sortObject(params); // Đảm bảo params đã được sort
  const signData = Object.keys(sortedParams)
    .map((key) => `${key}=${sortedParams[key]}`)
    .join("&");
  return crypto.createHmac("sha512", secretKey).update(signData).digest("hex");
}
// --- End Helper Functions ---

class PaymentService {
  constructor() {
    this.orderRepo = new OrderRepository();
    // Khởi tạo instance VNPay dùng chung nếu muốn
    this.vnpayInstance = new VNPay({
      api_Host: process.env.VNP_URL,
      tmnCode: process.env.VNP_TMNCODE, // Đảm bảo tên biến khớp config/env
      secureSecret: process.env.VNP_HASH_SECRET,
      testMode: process.env.NODE_ENV !== "production", // Dùng biến môi trường NODE_ENV
      hashAlgorithm: "SHA512", // Hoặc 'SHA256'
      // returnUrl: config.VNP_RETURN_URL, // Thường được truyền trong buildPaymentUrl
    });
  }

  // --- Logic xử lý thanh toán MoMo ---
  // Giữ nguyên nếu có

  // --- Logic xử lý thanh toán VNPay (Refactored) ---
  async createVNPayPaymentURL(
    orderId,
    amount,
    ipAddr,
    orderInfo = "Thanh toan don hang",
    bankCode = "" // Thêm bankCode tùy chọn
  ) {
    try {
      const returnUrl = process.env.VNP_RETURN_URL;
      if (!returnUrl) {
        throw new AppError("Thiếu cấu hình VNP_RETURN_URL.", 500);
      }

      // Tạo mã giao dịch duy nhất (thư viện có thể tự làm nhưng làm rõ ràng hơn)
      const txnRef = `${orderId}_${Date.now()}`; // Dùng timestamp thay moment

      // Chuẩn bị tham số cho buildPaymentUrl của thư viện
      const paymentData = {
        vnp_Amount: amount * 100, // Nhân 100
        vnp_IpAddr: ipAddr?.replace("::ffff:", "") || "127.0.0.1", // IP đã làm sạch
        vnp_TxnRef: txnRef,
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: "other", // Mã loại hàng hóa
        vnp_ReturnUrl: returnUrl, // URL trả về
        vnp_Locale: "vn", // Ngôn ngữ
        // Thư viện tự thêm các trường: vnp_CreateDate, vnp_Command, vnp_CurrCode, vnp_Version, vnp_TmnCode
      };

      // Thêm bankCode nếu có và hợp lệ
      if (bankCode && bankCode !== "") {
        paymentData.vnp_BankCode = bankCode;
      }

      // Gọi hàm buildPaymentUrl của thư viện
      const paymentUrl = this.vnpayInstance.buildPaymentUrl(paymentData);

      console.log("VNPay Payment URL created (using library):", paymentUrl);
      // Trả về đúng format frontend mong đợi (vd: { success: true, vnpUrl: '...' })
      return { success: true, vnpUrl: paymentUrl }; // Đổi key thành vnpUrl
    } catch (error) {
      console.error("Error creating VNPay Payment URL with library:", error);
      if (error instanceof AppError) throw error;
      // Trả về lỗi rõ ràng hơn
      throw new AppError(
        error.message || "Lỗi khi tạo URL thanh toán VNPay bằng thư viện.",
        500
      );
    }
  }

  async handleVNPayIPN(vnpayResponse) {
    console.log("--- VNPay IPN Received ---", vnpayResponse);
    let vnp_Params = { ...vnpayResponse }; // Copy để tránh thay đổi object gốc
    let secureHash = vnp_Params["vnp_SecureHash"];

    // Xóa hash và hashType (nếu có) khỏi params để kiểm tra chữ ký
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"]; // Xóa cả type nếu có

    try {
      const secretKey = config.VNP_HASH_SECRET;
      if (!secretKey) {
        console.error("IPN Error: Missing VNP_HASH_SECRET in config.");
        return {
          RspCode: "99",
          Message: "Internal Server Error (Missing Secret)",
        };
      }
      // --- Xác thực chữ ký thủ công (như ví dụ router) ---
      const checkHash = generateSecureHash(vnp_Params, secretKey); // Sử dụng helper
      console.log("IPN Received Hash:", secureHash);
      console.log("IPN Calculated Hash:", checkHash);
      // --- Kết thúc xác thực chữ ký thủ công ---

      // Sử dụng hàm verifyIpnCall của thư viện (Cách tốt hơn nếu muốn)
      // const isValidSignature = this.vnpayInstance.verifyIpnCall(vnpayResponse);
      // console.log("IPN Signature valid (library):", isValidSignature);
      // if (!isValidSignature) { ... }

      if (secureHash === checkHash) {
        // Hoặc dùng isValidSignature nếu đổi cách xác thực
        console.log("IPN Signature Verified.");

        const orderIdParts = vnp_Params["vnp_TxnRef"]?.split("_");
        const orderDbId = orderIdParts.length > 0 ? orderIdParts[0] : null;
        const rspCode = vnp_Params["vnp_ResponseCode"];
        const vnpAmount = parseInt(vnp_Params["vnp_Amount"]) / 100; // Chia lại cho 100
        const transactionStatus = vnp_Params["vnp_TransactionStatus"]; // Trạng thái chi tiết

        console.log(
          `IPN Check for Order: ${orderDbId}, RspCode: ${rspCode}, Amount: ${vnpAmount}, Status: ${transactionStatus}`
        );

        if (!orderDbId) {
          console.warn(
            "IPN Warning: Cannot extract orderDbId from vnp_TxnRef."
          );
          return { RspCode: "01", Message: "Order not found" };
        }

        const order = await this.orderRepo.getById(orderDbId);
        if (!order) {
          console.warn(`IPN Warning: Order ${orderDbId} not found in DB.`);
          return { RspCode: "01", Message: "Order not found" };
        }

        if (order.totalAmount !== vnpAmount) {
          console.warn(
            `IPN Warning: Amount mismatch for order ${orderDbId}. Expected ${order.totalAmount}, got ${vnpAmount}.`
          );
          return { RspCode: "04", Message: "Invalid amount" };
        }

        // Kiểm tra trạng thái đơn hàng (tránh xử lý lại)
        if (order.paymentStatus === "Đã thanh toán") {
          console.log(`IPN Info: Order ${orderDbId} already processed/paid.`);
          return { RspCode: "02", Message: "Order already confirmed" };
        }

        // Xử lý kết quả thanh toán
        let updateData = {};
        let success = false;

        // Chỉ cập nhật thành công nếu cả rspCode và transactionStatus đều là '00'
        if (rspCode === "00" && transactionStatus === "00") {
          console.log(
            `IPN Success: Payment confirmed for Order ${orderDbId}, TransNo: ${vnp_Params["vnp_TransactionNo"]}`
          );
          updateData = {
            paymentStatus: "Đã thanh toán",
            paymentMethod: "VNPay",
            paymentDate: new Date(),
            "paymentDetails.vnp_TxnRef": vnp_Params["vnp_TxnRef"],
            "paymentDetails.vnp_TransactionNo": vnp_Params["vnp_TransactionNo"],
            "paymentDetails.vnp_BankCode": vnp_Params["vnp_BankCode"],
            "paymentDetails.vnp_PayDate": vnp_Params["vnp_PayDate"], // Lưu ngày thanh toán từ VNPAY
          };
          success = true;
        } else {
          console.log(
            `IPN Failed/Pending: Payment for Order ${orderDbId}. RspCode: ${rspCode}, Status: ${transactionStatus}`
          );
          // Chỉ cập nhật thất bại nếu chắc chắn thất bại, còn đang chờ thì không nên đổi status vội
          if (rspCode !== "00") {
            // Nếu mã lỗi khác 00 -> thất bại
            updateData = {
              paymentStatus: "Thanh toán thất bại",
              paymentMethod: "VNPay",
            };
          } else {
            // Trường hợp rspCode = 00 nhưng status khác 00 (vd: đang xử lý) -> không cập nhật vội
            console.log(
              `IPN Info: Order ${orderDbId} payment status is pending/processing (Status: ${transactionStatus}). No update.`
            );
            // Vẫn trả về thành công cho VNPAY để tránh họ gửi lại IPN không cần thiết
            return {
              RspCode: "00",
              Message: "Confirm Success (Pending Status)",
            };
          }
        }

        // Chỉ cập nhật DB nếu có thay đổi (thành công hoặc thất bại rõ ràng)
        if (Object.keys(updateData).length > 0) {
          await this.orderRepo.updateOne({ _id: orderDbId }, updateData);
        }

        // Luôn phản hồi thành công cho VNPAY nếu chữ ký đúng và đã xử lý logic
        // (kể cả giao dịch thất bại) để VNPAY không gửi lại IPN.
        return { RspCode: "00", Message: "Confirm Success" };
      } else {
        // Sai chữ ký
        console.error("IPN Error: Invalid signature for received data.");
        return { RspCode: "97", Message: "Invalid Checksum" }; // Mã lỗi VNPAY
      }
    } catch (error) {
      console.error("Error processing VNPAY IPN:", error);
      // Phản hồi lỗi cho VNPAY để họ thử lại (nếu có lỗi hệ thống)
      return { RspCode: "99", Message: "Internal Server Error" }; // Mã lỗi VNPAY
    }
  }

  async handleVNPayReturn(vnpayResponse) {
    console.log("--- VNPay Return Received ---", vnpayResponse);
    const query = { ...vnpayResponse }; // Copy query params

    try {
      // --- Sử dụng thư viện chính thức 'vnpay' ĐỂ XÁC THỰC Return ---
      const isSignatureValid = this.vnpayInstance.verifyReturnUrl(query);
      console.log("VNPay Return Signature Valid (library):", isSignatureValid);
      // --- Kết thúc xác thực bằng thư viện ---

      const orderIdParts = query["vnp_TxnRef"]?.split("_");
      const orderDbId = orderIdParts.length > 0 ? orderIdParts[0] : null;
      const rspCode = query["vnp_ResponseCode"];
      const transactionStatus = query["vnp_TransactionStatus"]; // Thường có trong return URL mới

      const order = await this.orderRepo.getById(
        query["vnp_TxnRef"]?.split("_")[0]
      );
      if (rspCode === "00" && transactionStatus === "00" && order) {
        await this.orderRepo.updateOne(
          { _id: order._id },
          {
            $set: {
              paymentStatus: "Đã thanh toán",
              paymentMethod: "VNPAY",
            },
          }
        );
      } else {
        await this.orderRepo.updateOne(
          { _id: order._id },
          {
            $set: {
              paymentStatus: "Thanh toán thất bại",
            },
          }
        );
      }

      if (!orderDbId) {
        console.warn(
          "VNPay Return Warning: Cannot extract orderDbId from vnp_TxnRef."
        );
        // Không throw lỗi ngay, cố gắng trả về thông tin lỗi cho frontend
        return {
          success: false,
          message: "Lỗi xử lý phản hồi: Không tìm thấy mã đơn hàng.",
          code: rspCode || "99", // Mã lỗi chung nếu không có rspCode
          orderId: null,
        };
      }

      if (isSignatureValid) {
        console.log("[VNPAY RETURN] Signature Verified Successfully.");

        // Kiểm tra rspCode và transactionStatus để xác định thành công
        // Giao dịch thành công khi cả hai là '00'
        const success = rspCode === "00" && transactionStatus === "00";

        console.log(
          `[VNPAY RETURN] Order: ${orderDbId}, RspCode: ${rspCode}, Status: ${transactionStatus}, Success: ${success}`
        );

        // *** Quan trọng: Return URL chỉ dùng để hiển thị kết quả cho khách hàng.
        // KHÔNG nên cập nhật trạng thái DB ở đây vì độ tin cậy không cao (user có thể không quay lại).
        // Việc cập nhật DB nên dựa hoàn toàn vào IPN.
        // Bạn có thể lấy trạng thái mới nhất từ DB để hiển thị nếu cần.
        // const order = await this.orderRepo.getById(orderDbId);
        // const currentPaymentStatus = order ? order.paymentStatus : 'Không rõ';

        return {
          success: success,
          message:
            query["vnp_OrderInfo"] ||
            (success
              ? "Giao dịch thành công"
              : "Giao dịch chưa hoàn tất hoặc thất bại"),
          code: rspCode,
          orderId: orderDbId,
          vnpayTransId: query["vnp_TransactionNo"], // Mã GD VNPay
          // currentDbStatus: currentPaymentStatus // Có thể thêm trạng thái DB hiện tại
        };
      } else {
        console.warn("[VNPAY RETURN] WARNING: Invalid signature detected!");
        // Trả về lỗi cho frontend biết chữ ký không hợp lệ
        return {
          success: false,
          message: "Lỗi xác thực thông tin trả về từ VNPay (Sai chữ ký).",
          code: "97", // Mã lỗi chữ ký sai
          orderId: orderDbId, // Vẫn trả về orderId nếu có
        };
      }
    } catch (error) {
      console.error("[VNPAY RETURN] Error processing VNPAY Return URL:", error);
      // Check if the error message indicates a checksum/signature issue from the library itself
      if (
        error.message &&
        (error.message.toLowerCase().includes("checksum") ||
          error.message.toLowerCase().includes("signature"))
      ) {
        return {
          success: false,
          message: "Lỗi xác thực chữ ký: " + error.message,
          code: "97",
        };
      }
      // Lỗi khác không liên quan đến signature
      throw new AppError(error.message || "Lỗi xử lý phản hồi từ VNPay.", 500); // Ném lỗi để controller bắt
    }
  }

  // ... các hàm tiện ích khác nếu cần
}

module.exports = new PaymentService();
