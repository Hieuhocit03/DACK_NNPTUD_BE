// utils/vnpayHelper.js
const crypto = require("crypto");
const qs = require("qs");

// Hàm sắp xếp các key của object theo alphabet
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

// Hàm tạo VNP Secure Hash (Kiểm tra lại loại hash trong docs, có thể là SHA512)
function generateSecureHash(params, secretKey) {
  try {
    // Sắp xếp các key theo alphabet
    let sortedParams = sortObject(params);
    // Tạo chuỗi query string từ object đã sắp xếp
    let signData = qs.stringify(sortedParams, { encode: false }); // Log để debug
    // Tạo hash HMAC SHA512
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    return signed;
  } catch (error) {
    console.error("Error generating VNPAY secure hash:", error);
    throw error;
  }
}

module.exports = { sortObject, generateSecureHash };
