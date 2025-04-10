const express = require("express");
const otpController = require("../controllers/otp.controller");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const userRole = require("../enums/userRole.enum")

router.post("/generateOTP", otpController.generateOTP);
router.post("/verifyOTP", otpController.verifyOTP);
router.post("/resendOTP", otpController.generateOTP);

module.exports = router;