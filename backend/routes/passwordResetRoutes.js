const router = require("express").Router();
const {
  requestReset,
  resetPassword,
} = require("../controllers/passwordResetController");

router.post("/request", requestReset);
router.post("/reset", resetPassword);

module.exports = router;
