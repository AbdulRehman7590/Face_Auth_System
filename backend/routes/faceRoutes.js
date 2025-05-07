const router = require("express").Router();
const multer = require("multer");
const upload = multer();

const {
  verifyAndStoreFace,
  matchFaceLogin,
} = require("../controllers/faceController");

router.post("/store", upload.single("file"), verifyAndStoreFace);
router.post("/match", upload.single("file"), matchFaceLogin);

module.exports = router;
