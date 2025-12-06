const db = require("../config/db");

exports.addToWishlist = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { product_id } = req.params;

    // Product check
    const product = await db("products").where({ id: product_id }).first();
    if (!product) return res.status(404).json({ message: "Product not found" });

    const exists = await db("wishlist")
      .where({ user_id, product_id })
      .first();

    if (exists)
      return res.status(400).json({ message: "Already in wishlist" });

    await db("wishlist").insert({ user_id, product_id });

    res.json({ success: true, message: "Added to wishlist" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Add to wishlist failed" });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { product_id } = req.params;

    // Soft delete by setting deleted_at
    await db("wishlist")
      .where({ user_id, product_id })
      .update({ deleted_at: new Date() });

    res.json({ success: true, message: "Removed from wishlist" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Remove failed" });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const user_id = req.user.id;

   const items = await db("wishlist")
  .select(
    "wishlist.id",
    "wishlist.user_id",
    "wishlist.product_id",
    "wishlist.created_at"
  )
  .where("wishlist.user_id", user_id)
  .orderBy("wishlist.created_at", "desc");

res.json({ wishlist: items });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching wishlist" });
  }
};
