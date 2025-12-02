const router = require("express").Router();
const reset = require("../controllers/resetController");

router.post("/forgot-password",reset.forgotPassword);
router.post("/reset-password/:token", reset.resetPassword);

module.exports = router;
