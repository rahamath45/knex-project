 const db = require("../config/db");

 async function getOrCreateCart(user_id){
    let cart = await db("carts").where({ user_id}).first();
    if(!cart){
        const [id] = await db("carts").insert({ user_id});
        cart = await db("carts").where({id}).first();
    }
    return cart;
 };

 exports.getCart = async (req,res)=>{
      try{
        const user_id = req.user.id;
        const cart = await getOrCreateCart(user_id);
        const items = await db("cart_items")
                .where({ cart_id: cart.id})  
                .join("products","cart_items.product_id","products.id")
                .select("cart_items.*","products.title","products.sku","products.price as current_price") ;
                 res.json({ cart, items });        
      }catch(err){
        console.log(err);
    return res.status(500).json({
      status: "error",
      message: "getcart show error"
    });
      }
 }
 exports.addItem = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { product_id, quantity = 1 } = req.body;
    const cart = await getOrCreateCart(user_id);
    const product = await db('products').where({ id: product_id }).first();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ message: 'Not enough stock' });

    const existing = await db('cart_items').where({ cart_id: cart.id, product_id }).first();
    if (existing) {
      await db('cart_items').where({ id: existing.id }).update({ quantity: existing.quantity + quantity });
    } else {
      await db('cart_items').insert({ cart_id: cart.id, product_id, quantity, price: product.price });
    }
    res.json({ success: true, message:"item add to the cart" });
  } catch (err) { 
     console.log(err);
    return res.status(500).json({
      status: "error",
      message: "addItem show error"
    });
   }
};

exports.updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;              
    const { quantity, price } = req.body;    

    if (!quantity && !price) {
      return res.status(400).json({
        status: "error",
        message: "Provide at least one field: quantity or price"
      });
    }

    const updateData = {};

    if (quantity) updateData.quantity = quantity;
    if (price) updateData.price = price;     

    await db("cart_items")
      .where({ id })
      .update(updateData);

    res.json({ success: true, updated: updateData });

  } catch (err) {
      console.log(err);
    return res.status(500).json({
      status: "error",
      message: "update item show error"
    });
  }
};
exports.removeItem = async (req, res) => {
  try {
    const { id } = req.params;   

    await db("cart_items")
      .where({ id })
      .update({ is_delete: true }); 
        // soft delete

    return res.json({
      success: true,
      message: "cart item deleted successfully"
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "error",
      message: "Error remove item"
    });
  }
};

