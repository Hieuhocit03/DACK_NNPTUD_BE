const express = require("express");
const connectDB = require("./config/database");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const route = require("./imports/routes");
const session = require("express-session");
const speakeasy = require("speakeasy");
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Session
app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 60000 } // 60s
}));

// Cookies
app.use(cookieParser());

// Static files - Cấu hình đúng
app.use('/api/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use(express.static(path.join(__dirname, '../public')));

// Thêm cấu hình cho /api/uploads để hỗ trợ URL cũ
//app.use('/api/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Routes
app.use("/api/users", route.userRoutes);
app.use("/api/auth", route.authRoutes);
app.use("/api/otp", route.otpRoutes);
app.use("/api/categories", route.categoryRoutes);
app.use("/api/menu-items", route.menuItemRoutes);
app.use("/api/reviews", route.reviewRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
