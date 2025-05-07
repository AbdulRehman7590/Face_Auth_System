const axios = require("axios");
const User = require("../models/User");
const { encryptData, decryptData } = require("../utils/encryption");

const FASTAPI_HEADERS = {
  headers: {
    "Content-Type": "application/octet-stream",
  },
};

const checkFace = async (imageBuffer) => {
  // Step 1: Get all users with stored encodings
  const users = await User.find({ faceEncoding: { $exists: true } });
  const encodings = users.map((u) =>
    JSON.parse(decryptData(u.faceEncoding.encrypted, u.faceEncoding.iv))
  );

  // Step 2: Send encodings and captured image to FastAPI for comparison
  const matchRes = await axios.post(`${process.env.FASTAPI_URL}/match-face`, {
    encodings,
    target: Buffer.from(imageBuffer).toString("base64"),
  });

  return matchRes.data.index;
};

exports.verifyAndStoreFace = async (req, res) => {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ message: "No image file provided" });
  }

  const email = req.body.email || req.query.email;
  const imageBuffer = req.file.buffer;

  try {
    // step 0: Check for already existing face encoding
    const existingUser = await checkFace(imageBuffer);
    if (existingUser !== -1) {
      console.log("User already has a face encoding");
      return res.status(400).json({ message: "Face encoding already exists" });
    }

    // Step 1: Check Liveness
    const livenessRes = await axios.post(
      `${process.env.FASTAPI_URL}/check-liveness`,
      imageBuffer,
      FASTAPI_HEADERS
    );
    if (!livenessRes.data.live) {
      return res.status(400).json({ message: "Liveness check failed" });
    }

    // Step 2: Face Detection / Verification
    const verifyRes = await axios.post(
      `${process.env.FASTAPI_URL}/verify-face`,
      imageBuffer,
      FASTAPI_HEADERS
    );
    if (!verifyRes.data.verified) {
      return res.status(400).json({ message: "Face not detected/verified" });
    }

    // Step 3: Extract face encoding using face_recognition library
    const encodingRes = await axios.post(
      `${process.env.FASTAPI_URL}/extract-encoding`,
      imageBuffer,
      FASTAPI_HEADERS
    );
    if (!encodingRes.data.encoding) {
      return res.status(500).json({ message: "Failed to extract encoding" });
    }

    // Step 4: Encrypt and store the face encoding in MongoDB
    const encrypted = encryptData(JSON.stringify(encodingRes.data.encoding));
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { faceEncoding: encrypted },
      { new: true }
    );
    if (!updatedUser) {
      console.log("User not found, no update performed.", email);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Face encoding stored successfully for user:", email);
    return res.json({
      message: "Face encoding stored successfully",
    });
  } catch (error) {
    console.error("verifyAndStoreFace error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.matchFaceLogin = async (req, res) => {
  const imageBuffer = req.file.buffer;

  try {
    const index = await checkFace(imageBuffer);
    if (index === -1) {
      console.log("Face not recognized in the database");
      return res.status(404).json({ message: "Face not recognized" });
    }

    const matchedUser = await User.find({
      faceEncoding: { $exists: true },
    }).then((users) => users[index]);
    if (!matchedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Face matched successfully for user:", matchedUser.email);
    return res.json({ email: matchedUser.email });
  } catch (error) {
    console.error("matchFaceLogin error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
