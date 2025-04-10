const express = require("express");
const connectDB = require("./config/database");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const route = require("./imports/routes");
const session = require("express-session");
const speakeasy = require("speakeasy");

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

// Routes
app.use("/api/users", route.userRoutes);
app.use("/api/auth", route.authRoutes);
app.use("/api/otp",route.otp);

app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
