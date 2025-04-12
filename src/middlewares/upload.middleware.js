const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Đảm bảo thư mục uploads/menu_images tồn tại
const createUploadDir = () => {
  const dir = path.join(__dirname, "../../public/uploads/menu_images");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

createUploadDir();

// Cấu hình lưu trữ (memory storage)
const storage = multer.memoryStorage();
console.log("[Upload Middleware] Using memoryStorage");

// Hàm kiểm tra loại file
const fileFilter = (req, file, cb) => {
  console.log(
    "[Upload Middleware] fileFilter checking file:",
    file.originalname,
    file.mimetype
  );
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimetype && extname) {
    console.log("[Upload Middleware] fileFilter: File type accepted");
    return cb(null, true);
  } else {
    console.log("[Upload Middleware] fileFilter: File type rejected");
    // Truyền lỗi vào callback để middleware xử lý lỗi bắt được
    cb(
      new Error(
        "Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)!",
        "LIMIT_UNEXPECTED_FILE"
      ),
      false
    );
  }
};

// Cấu hình Multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1 * 1024 * 1024, // Giới hạn 1MB
  },
  fileFilter: fileFilter,
});

console.log("[Upload Middleware] Multer configured with fileSize limit: 1MB");

// Middleware cho upload một ảnh (ví dụ: category, menuItem)
// Sử dụng .single(fieldName) - fieldName phải khớp với tên trường trong FormData
const uploadSingleImage = (fieldName) => {
  console.log(
    `[Upload Middleware] Setting up single upload for field: ${fieldName}`
  );
  return (req, res, next) => {
    console.log(
      `[Upload Middleware] Attempting single upload for field: ${fieldName}`
    );
    const uploadSingle = upload.single(fieldName);

    uploadSingle(req, res, (err) => {
      if (err) {
        console.error("[Upload Middleware] Error during single upload:", err);
        // Chuyển lỗi cho middleware xử lý lỗi chung
        return next(err);
      } else {
        console.log(
          `[Upload Middleware] Single upload for field ${fieldName} successful. req.file:`,
          req.file
        );
        next(); // Chuyển tiếp nếu không có lỗi
      }
    });
  };
};

// Middleware xử lý lỗi từ Multer và các lỗi khác
const handleUploadError = (err, req, res, next) => {
  console.log("[Upload Middleware] handleUploadError caught error:", err);
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "Kích thước file quá lớn (tối đa 1MB)." });
    }
    // Xử lý các lỗi Multer khác nếu cần
    return res.status(400).json({ message: `Lỗi upload: ${err.message}` });
  } else if (err) {
    // Lỗi từ fileFilter hoặc lỗi khác
    return res
      .status(400)
      .json({ message: err.message || "Lỗi không xác định khi upload file." });
  }
  // Nếu không có lỗi, chuyển tiếp
  next();
};

module.exports = {
  uploadMenuItem: uploadSingleImage("image"), // Giả sử field name là 'image'
  uploadCategory: uploadSingleImage("image"), // Giả sử field name là 'image'
  handleUploadError,
};
