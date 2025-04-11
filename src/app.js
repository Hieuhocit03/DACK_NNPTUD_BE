const express = require("express");
const connectDB = require("./config/database");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const route = require("./imports/routes");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

// ✅ Cấu hình CORS đúng cách (chỉ gọi 1 lần)
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // Frontend dev URLs
    credentials: true, // Cho phép gửi cookie qua
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Middleware đúng thứ tự
app.use(cookieParser());
app.use(bodyParser.json());

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }, // 60s
  })
);

// ✅ Routes
app.use("/api/users", route.userRoutes);
app.use("/api/auth", route.authRoutes);
app.use("/api/otp", route.otp);

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
