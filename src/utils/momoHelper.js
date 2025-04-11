// utils/momoHelper.js
const crypto = require("crypto");

function generateSignature(rawData, secretKey) {
  try {
    return crypto.createHmac("sha256", secretKey).update(rawData).digest("hex");
  } catch (error) {
    console.error("Error generating signature:", error);
    throw error;
  }
}

// Hàm tạo chuỗi raw data để ký cho yêu cầu tạo thanh toán
function buildPaymentRequestRawData(params) {
  // Sắp xếp các key theo alphabet và nối lại theo định dạng MoMo yêu cầu
  // Ví dụ (CẦN XEM LẠI ĐÚNG THEO TÀI LIỆU MOMO HIỆN TẠI):
  // partnerCode=$partnerCode&accessKey=$accessKey&requestId=$requestId&amount=$amount...&extraData=$extraData
  const sortedKeys = Object.keys(params).sort();
  let rawData = "";
  sortedKeys.forEach((key, index) => {
    rawData += `${key}=${params[key]}${
      index < sortedKeys.length - 1 ? "&" : ""
    }`;
  });
  console.log("Raw Signature Data:", rawData); // Log để debug
  return rawData;
}

// Hàm tạo chuỗi raw data để xác thực IPN/Return URL (khác với request)
function buildVerificationRawData(params, relevantKeys) {
  // Lấy các key cần thiết cho việc xác thực (theo tài liệu MoMo)
  // Sắp xếp và nối chuỗi tương tự như trên
  const sortedKeys = relevantKeys.sort();
  let rawData = "";
  sortedKeys.forEach((key, index) => {
    if (params[key] !== undefined) {
      // Chỉ thêm nếu key tồn tại
      rawData += `${key}=${params[key]}${
        index < sortedKeys.length - 1 ? "&" : ""
      }`;
    }
  });
  console.log("Raw Verification Data:", rawData);
  return rawData;
}

module.exports = {
  generateSignature,
  buildPaymentRequestRawData,
  buildVerificationRawData,
};
