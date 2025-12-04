const db = require("../config/db");

exports.createProduct = async (req,res) =>{
       try{
        const{title,description,price,stock=0,category_id,sku,images=[]} = req.body;
        
    if (!title|| !description || !price || !stock || !category_id) {
      return res.status(400).json({
        status: "error",
        message: "title, price, stock and category_id fields are required"
      });
    }
        const [id] = await db("products").insert({
             title,description,price,stock,category_id,sku });
             if(Array.isArray(images) && images.length > 0){
                 const rows = images.map((url,index) =>({
                     product_id:id,
                     url,
                     is_primary:index === 0 ? true :false
                 }));
                 await db("product_images").insert(rows);
             }
             const product = await db("products").where({id}).first();
             res.status(201).json({ status:"success",product})
       }catch(err){
          console.log(err)
         res.json({ status: "err", message: "createproduct  show error" });
       }
};

exports.updateProduct = async (req, res) => {
  try {
    const { title, description, price, stock, category_id } = req.body;

    if (!title|| !description || !price || !stock || !category_id) {
      return res.status(400).json({
        status: "error",
        message: "title, price, stock and category_id fields are required"
      });
    }

    await db("products")
      .where({ id: req.params.id })
      .update({ title, description, price, stock, category_id });

    const updatedProduct = await db("products")
      .where({ id: req.params.id })
      .first();

    res.json(updatedProduct);

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "error",
      message: "Product update error"
    });
  }
};


exports.deleteproduct = async (req, res) => {
  try {
    const { id } = req.params;

    await db("products")
      .where({ id })
      .update({ is_delete: true });

    return res.json({
      success: true,
      message: "products deleted successfully",
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "error",
      message: "Error deleting products",
    });
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const id = req.params.id;

    const product = await db("products")
      .select("products.*", "categories.name as category")
      .leftJoin("categories", "products.category_id", "categories.id")
      .where("products.id", id)
      .first();

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    const images = await db("product_images")
      .where({ product_id: id })
      .orderBy("is_primary", "desc");

    product.images = images;

    res.json(product);

  } catch (err) {
    console.log(err)
         res.json({ status: "err", message: "get products show error" });
  }
};

exports.listProducts = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    const base = db("products")
      .select("products.*", "categories.name as category")
      .leftJoin("categories", "products.category_id", "categories.id");

    // category filter
    if (req.query.category_id)
      base.where("products.category_id", req.query.category_id);

    // keyword search
    if (req.query.q)
      base.where("products.title", "like", `%${req.query.q}%`);

    // price range
    if (req.query.minPrice)
      base.where("products.price", ">=", Number(req.query.minPrice));

    if (req.query.maxPrice)
      base.where("products.price", "<=", Number(req.query.maxPrice));

    // sorting
    if (req.query.sort) {
      switch (req.query.sort) {
        case "price_low_high":
          base.orderBy("products.price", "asc");
          break;
        case "price_high_low":
          base.orderBy("products.price", "desc");
          break;
        case "newest":
          base.orderBy("products.created_at", "desc");
          break;
        case "oldest":
          base.orderBy("products.created_at", "asc");
          break;
        case "popular":
          base.orderBy("products.sold_count", "desc");
          break;
      }
    } else {
      base.orderBy("products.created_at", "desc");
    }

    const products = await base.limit(limit).offset(offset);

    // total count
    const [{ count }] = await db("products").count("id as count");

    res.json({ products, total: Number(count) });

  } catch (err) {
    console.log(err)
    res.json({ status: "err", message: "products listing show error" });
  }
};
