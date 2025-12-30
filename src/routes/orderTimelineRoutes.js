const router = require("express").Router();
const ctrl = require("../controllers/orderTimelineController");
const auth = require("../middlewares/authmiddlewares");
const isAdmin = require("../middlewares/rolemiddlewares");

// Admin updates status
router.put(
  "/:order_id/status",
  auth,
  isAdmin,
  ctrl.updateOrderStatus
);

// User/Admin view timeline
router.get(
  "/:order_id/timeline",
  auth,
  ctrl.getOrderTimeline
);

module.exports = router;
