const express = require("express");
const router = express.Router();
const controller = require("../controllers/authController");
const verify = require("../middlewares/authmiddlewares");
router.post("/register",controller.register);
router.post("/login", controller.login);
router.get("/me", verify, controller.me);

module.exports = router;

