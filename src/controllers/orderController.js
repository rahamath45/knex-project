const db = require("../config/db");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const shipping = require("../config/shipping");

exports.createOrderFromCart = async (req, res) => {
  const trx = await db.transaction();

  try {
    const user_id = req.user.id;
    const { address_id } = req.body;

    const cart = await trx("carts").where({ user_id }).first();
    if (!cart) return res.status(400).json({ message: "Cart empty" });

    const items = await trx("cart_items").where({ cart_id: cart.id });
    if (!items.length)
      return res.status(400).json({ message: "Cart empty" });

    let total = 0;

    for (const it of items) {
      const product = await trx("products").where({ id: it.product_id }).first();
      if (!product) {
        await trx.rollback();
        return res.status(404).json({ message: "Product missing" });
      }
      if (product.stock < it.quantity) {
        await trx.rollback();
        return res.status(400).json({ message: `${product.title} insufficient stock` });
      }
      total += Number(it.price) * Number(it.quantity);
    }

    
    let shipping_fee = total >= shipping.free_delivery_over ? 0 : shipping.shipping_fee;

    const finalAmount = total + shipping_fee;

    
    const [orderId] = await trx("order").insert({
      user_id,
      address_id,
      total_amount: total,
      shipping_fee,
      final_amount: finalAmount,
      status: "pending",
      payment_method: "stripe",
    });

    // Create order items & reduce stock
    for (const it of items) {
      await trx("order_items").insert({
        order_id: orderId,
        product_id: it.product_id,
        quantity: it.quantity,
        price: it.price,
      });

      await trx("products")
        .where({ id: it.product_id })
        .decrement("stock", it.quantity);
    }

    // Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalAmount * 100),
      currency: "usd",
      metadata: { order_id: orderId },
      automatic_payment_methods: { enabled: true },
      receipt_email: req.user.email,
      description: `Order #${orderId} payment`,
    });

    await trx("order")
      .where({ id: orderId })
      .update({ payment_id: paymentIntent.id });

    await trx("cart_items").where({ cart_id: cart.id }).del();

    await trx.commit();

    res.json({
      success: true,
      order_id: orderId,
      total,
      shipping_fee,
      final_amount: finalAmount,
      client_secret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.log(err);
    await trx.rollback();
    res.status(500).json({ message: "Order failed" });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const user_id = req.user.id;
    const orders = await db("orders")
      .where({ user_id })
      .orderBy("created_at", "desc");

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders" });
  }
};

exports.getOrderDetails = async(req,res) =>{
  try{
       const id = req.params.id;
       const order = await db("orders").where({ id }).first();
    if (!order)
      return res.status(404).json({ message: "Order not found" });

    const items = await db("order_items")
      .where({ order_id: id })
      .join("products", "order_items.product_id", "products.id")
      .select("order_items.*", "products.title");

    res.json({ order, items }); 

  }catch(err){
        res.status(500).json({ message: "Error fetching order details" });
  }
};

exports.confirmStripePayment = async (req, res) => {
  const trx = await db.transaction();

  try {
    const { order_id, payment_intent_id } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    
    if (paymentIntent.status !== "succeeded") {
      const items = await trx("order_items").where({ order_id });

      
      for (const it of items) {
        await trx("products")
          .where({ id: it.product_id })
          .increment("stock", it.quantity);
      }

      await trx("orders")
        .where({ id: order_id })
        .update({ status: "failed" });

      await trx.commit();

      return res.status(400).json({
        success: false,
        message: "Payment failed. Stock restored.",
      });
    }

    
    await trx("orders")
      .where({ id: order_id })
      .update({ status: "paid" });

    
    await trx("payments").insert({
      order_id,
      payment_id: payment_intent_id,
      signature: "stripe",
    });

    await trx.commit();
    
    res.json({ success: true, message: "Payment verified" });
    
  } catch (err) {
    console.log(err);
    await trx.rollback();
    res.status(500).json({ message: "Stripe verify error" });
  }
};

