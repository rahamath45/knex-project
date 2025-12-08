const router = require("express").Router();
const { addReview, deleteReview, getProductReviews } = require("../controllers/reviewController");
const auth = require('../middlewares/authmiddlewares');

// Add or update review
router.post("/", auth, addReview);

// Delete review
router.delete("/:id", auth, deleteReview);

// Get product reviews
router.get("/product/:product_id", getProductReviews);

module.exports = router;
