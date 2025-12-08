const db = require("../config/db");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const shipping = require("../config/shipping");

exports.createAddress = async (req, res) => {
  try {
    const user_id = req.user.id;
    const {
      name,
      line1,
      line2,
      city,
      state,
      postal_code,
      country,
      phone,
      is_default,
    } = req.body;
    if (
      !name ||
      !line1 ||
      !phone ||
      !city ||
      !state ||
      !postal_code ||
      !country
    ) {
      return res.status(400).json({
        status: "error",
        message: "those fields are required",
      });
    }

    const [addressId] = await db("addresses").insert({
      user_id,
      name,
      line1,
      line2,
      city,
      state,
      postal_code,
      country,
      phone,
      is_default: is_default ? 1 : 0,
    });

    res.json({
      success: true,
      message: "Address added successfully",
      address_id: addressId,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Address creation failed" });
  }
};
exports.editAddress = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;

    const address = await db("addresses")
      .where({ id, user_id })
      .first();

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    if (address.is_deleted) {
      return res.status(400).json({ message: "Address already deleted" });
    }

    const {
      name,
      line1,
      line2,
      city,
      state,
      postal_code,
      country,
      phone,
      is_default,
    } = req.body;

    await db("addresses")
      .where({ id })
      .update({
        name,
        line1,
        line2,
        city,
        state,
        postal_code,
        country,
        phone,
        is_default: is_default ? 1 : 0,
      });

    res.json({
      success: true,
      message: "Address updated successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Address update failed" });
  }
};
exports.deleteAddress = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;

    const address = await db("addresses")
      .where({ id, user_id })
      .first();

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    if (address.is_deleted) {
      return res.status(400).json({ message: "Address already deleted" });
    }

    await db("addresses")
      .where({ id })
      .update({ is_deleted: true });

    res.json({
      success: true,
      message: "Address soft-deleted successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete address" });
  }
};
exports.listAddresses = async (req, res) => {
  try {
    const user_id = req.user.id;

    const addresses = await db("addresses")
      .where({ user_id, is_deleted: false })
      .orderBy("is_default", "desc")
      .orderBy("id", "desc");

    res.json({
      success: true,
      addresses,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch addresses" });
  }
};


exports.createOrderFromCart = async (req, res) => {
  const trx = await db.transaction();

  try {
    const user_id = req.user.id;
    const { addresses_id } = req.body;

    const cart = await trx("carts").where({ user_id }).first();
    if (!cart) return res.status(400).json({ message: "Cart empty" });

    const items = await trx("cart_items").where({ cart_id: cart.id });
    if (!items.length) return res.status(400).json({ message: "Cart items empty" });

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

    const shipping_fee = total >= shipping.free_delivery_over ? 0 : shipping.shipping_fee;

    const finalAmount = total + shipping_fee;

    const [orderId] = await trx("order").insert({
      user_id,
      addresses_id,
      total_amount: total,
      shipping_fee,
      final_amount: finalAmount,
      status: "paid",
      payment_method: "stripe",
    });

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

    // Convert cart items to Stripe checkout format
    const line_items = items.map((it) => ({
      price_data: {
        currency: "inr",
        product_data: { name: it.product_id },
        unit_amount: Math.round(it.price * 100),
      },
      quantity: it.quantity,
    }));

    if (shipping_fee > 0) {
      line_items.push({
        price_data: {
          currency: "inr",
          product_data: { name: "Shipping Fee" },
          unit_amount: Math.round(shipping_fee * 100),
        },
        quantity: 1,
      });
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      metadata: { order_id: orderId },
      success_url: `https://your-frontend.com/success?order_id=${orderId}`,
      cancel_url: `https://your-frontend.com/failed?order_id=${orderId}`,
    });
    console.log("Checkout Session ID:", session.id);

    // Save session ID as payment ID
    await trx("order").where({ id: orderId }).update({
      payment_id: session.id,
    });

    // Clear cart items
    await trx("cart_items").where({ cart_id: cart.id }).del();

    await trx.commit();

    res.json({
      success: true,
      order_id: orderId,
      total,
      shipping_fee,
      final_amount: finalAmount,
      checkout_url: session.url, // <- COPY THIS & OPEN IN BROWSER
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
    const orders = await db("order")
      .where({ user_id })
      .orderBy("created_at", "desc");

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders" });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await db("order").where({ id }).first();
    if (!order) return res.status(404).json({ message: "Order not found" });

    const items = await db("order_items")
      .where({ order_id: id })
      .join("products", "order_items.product_id", "products.id")
      .select("order_items.*", "products.title");

    res.json({ order, items });
  } catch (err) {
    res.status(500).json({ message: "Error fetching order details" });
  }
};
 
exports.confirmStripePayment = async (req, res) => {
  const trx = await db.transaction();

  try {
    const { order_id, session_id } = req.body;

    // Retrieve Checkout Session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      // Restore stock
      const items = await trx("order_items").where({ order_id });

      for (const it of items) {
        await trx("products")
          .where({ id: it.product_id })
          .increment("stock", it.quantity);
      }

      await trx("order").where({ id: order_id }).update({
        status: "failed",
      });

      await trx.commit();

      return res.status(400).json({
        success: false,
        message: "Payment failed. Stock restored.",
      });
    }

    // Payment Success
    await trx("order").where({ id: order_id }).update({
      status: "paid",
    });

    await trx("payments").insert({
  order_id,
  payment_id: session.payment_intent,
  status: session.payment_status, // e.g., "paid"
  amount: session.amount_total,   // if available
  currency: session.currency      // if available
});

    await trx.commit();

    res.json({
      success: true,
      message: "Checkout payment verified",
    });
  } catch (err) {
    console.log(err);
    await trx.rollback();
    res.status(500).json({ message: "Stripe Checkout verify error" })
     console.log(err);
  }
};
