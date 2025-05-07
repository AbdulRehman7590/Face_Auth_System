const crypto = require("crypto");
const User = require("../models/User");
const { sendEmail } = require("../utils/mailer");
const bcrypt = require("bcryptjs");

const tokens = {}; // token store

exports.requestReset = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const token = crypto.randomBytes(32).toString("hex");
  tokens[token] = email;

  const resetLink = `http://localhost:3000/reset-password?token=${token}`;
  await sendEmail(
    email,
    "Password Reset",
    `<a href="${resetLink}">Reset Password</a>`
  );
  res.json({ message: "Reset link sent" });
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  const email = tokens[token];
  if (!email) return res.status(400).json({ message: "Invalid token" });

  const hashed = await bcrypt.hash(newPassword, 10);
  await User.findOneAndUpdate({ email }, { password: hashed });
  delete tokens[token];

  res.json({ message: "Password updated" });
};
