const router = require("express").Router();
const ctrl = require("../controllers/orderController");
const auth = require("../middlewares/authmiddlewares");

router.use(auth);

router.post("/addresses",ctrl.createAddress);
router.post("/create", ctrl.createOrderFromCart);
router.post("/confirm", ctrl.confirmStripePayment);

router.get("/", ctrl.getUserOrders);
router.get("/:id", ctrl.getOrderDetails);

module.exports = router;

