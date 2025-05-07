const otpGenerator = require("otp-generator");
const { sendEmail } = require("../utils/mailer");

const otpStore = {};

exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  const otp = otpGenerator.generate(6, { digits: true });
  otpStore[email] = otp;

  await sendEmail(email, "Your OTP Code", `<h1>Your OTP: ${otp}</h1>`);
  res.json({ message: "OTP sent" });
};

exports.verifyOTP = (req, res) => {
  const { email, otp } = req.body;
  if (otpStore[email] && otpStore[email] === otp) {
    delete otpStore[email];
    return res.json({ verified: true });
  }
  res.status(400).json({ message: "Invalid OTP" });
};
