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

// Middleware xử lý tệp
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ cho phép tải lên tệp hình ảnh!"), false);
  }
};

// Menu Item Upload
const menuItemStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../public/uploads/menu_images"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const imagePath = `/uploads/menu_images/${uniqueSuffix}-${path.extname(file.originalname)}`;
    const fullPath = path.join(__dirname, '../../public/uploads/menu_images', path.basename(imagePath));
    cb(null, imagePath);
  },
});

const menuItemUpload = multer({
  storage: menuItemStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Error handler middleware
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Lỗi tải ảnh: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

module.exports = {
  uploadMenuItem: menuItemUpload.single("image"),
  handleUploadError,
};
