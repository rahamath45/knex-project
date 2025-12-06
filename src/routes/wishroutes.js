const express = require("express");
const router = express.Router();
const auth = require('../middlewares/authmiddlewares');
const {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} = require("../controllers/wishlistController");

router.post("/add/:product_id", auth, addToWishlist);
router.delete("/remove/:product_id", auth, removeFromWishlist);
router.get("/", auth, getWishlist);

module.exports = router;
