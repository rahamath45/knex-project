const router = require("express").Router();
const adminCtrl = require("../controllers/adminController");
const adminAuth = require("../middlewares/rolemiddlewares");
const adminbulkCtrl = require("../controllers/adminproductBulkController");
const upload = require("../middlewares/upload");

router.get("/users", adminAuth, adminCtrl.getUsers);
router.get("/orders", adminAuth, adminCtrl.getOrders);
router.get("/products", adminAuth, adminCtrl.getProducts);
router.get("/sales-stats", adminAuth, adminCtrl.salesStats);
router.get("/top-products", adminAuth, adminCtrl.topProducts);
router.get("/monthly-revenue", adminAuth, adminCtrl.monthlyRevenue);
router.post("/products/bulk-upload", adminAuth, upload.single("file"), adminbulkCtrl.bulkUpload);
router.get("/products/download", adminAuth, adminbulkCtrl.downloadProducts);

module.exports = router;
