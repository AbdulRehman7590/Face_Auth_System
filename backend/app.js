const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const faceRoutes = require("./routes/faceRoutes");
const passwordResetRoutes = require("./routes/passwordResetRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/face", faceRoutes);
app.use("/api/password", passwordResetRoutes);

module.exports = app;
