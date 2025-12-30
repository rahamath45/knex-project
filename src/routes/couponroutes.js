
const express = require("express");
const couponrouter = express.Router();

const {
  applyCoupon,
  createCoupon
} = require("../controllers/couponController");

const isAdmin  = require("../middlewares/authmiddlewares");
const role = require('../middlewares/rolemiddlewares');

// user → apply coupon
couponrouter.post("/apply", applyCoupon);

// admin → create coupon
couponrouter.post("/create", isAdmin, role,createCoupon);

module.exports = couponrouter;
