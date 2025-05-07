const router = require("express").Router();
const {
  registerUser,
  verifyPasswordLogin,
} = require("../controllers/authController");
const { sendOTP, verifyOTP } = require("../controllers/otpController");

router.post("/register", registerUser);
router.post("/login-password", verifyPasswordLogin);
router.post("/otp/send", sendOTP);
router.post("/otp/verify", verifyOTP);

module.exports = router;
