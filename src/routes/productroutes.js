const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/productController");
const auth = require('../middlewares/authmiddlewares');
const role = require('../middlewares/rolemiddlewares');


router.post("/",auth,role("admin"),ctrl.createProduct);
router.put("/:id",auth,role("admin"),ctrl.updateProduct);
router.delete("/:id",auth,role("admin"),ctrl.deleteproduct);

router.get("/", ctrl.listProducts);
router.get("/:id", ctrl.getProduct);

module.exports = router; 