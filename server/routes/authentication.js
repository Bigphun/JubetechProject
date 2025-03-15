const express = require("express");
const { signin, signup, requestOTP } = require("../controllers/authController");

const router = express.Router();

router.post("/signin", signin);
router.post("/signup", signup);
router.post("/request/otp", requestOTP);

module.exports = router;