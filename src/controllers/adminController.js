const db = require("../config/db");

module.exports = {
  // -------------------------------
  // 1. Users List
  // -------------------------------
  getUsers: async (req, res) => {
    try {
      const users = await db("users")
        .select("id", "name", "email", "role", "created_at")
        .where({ is_deleted: 0 });

      res.json({ success: true, users });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  },


  getOrders: async (req, res) => {
    try {
      const orders = await db("order AS o")
        .leftJoin("users AS u", "o.user_id", "u.id")
        .select(
          "o.id",
          "u.name AS customer",
          "o.total_amount",
          "o.shipping_fee",
          "o.final_amount",
          "o.status",
          "o.created_at"
        )
        .orderBy("o.id", "desc");

      res.json({ success: true, orders });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  },

  
  getProducts: async (req, res) => {
    try {
      const products = await db("products")
        .select(
          "id",
          "name",
          "price",
          "stock",
          "category_id",
          "average_rating",
          "created_at"
        )
        .where({ is_deleted: false });

      res.json({ success: true, products });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  },

 

  salesStats: async (req, res) => {
    try {
      const totalRevenue = await db("order")
        .where("status", "paid")
        .sum("final_amount as total")
        .first();

      const totalOrders = await db("order")
        .where("status", "paid")
        .count("id as count")
        .first();

      const totalUsers = await db("users")
        .where({ is_deleted: 0 })
        .count("id as count")
        .first();

      const totalProducts = await db("products")
        .where({ is_deleted: false })
        .count("id as count")
        .first();

      res.json({
        success: true,
        stats: {
          totalRevenue: totalRevenue.total || 0,
          totalOrders: totalOrders.count,
          totalUsers: totalUsers.count,
          totalProducts: totalProducts.count,
        },
      });

    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Failed to get sales stats" });
    }
  },


  topProducts: async (req, res) => {
    try {
      const top = await db("order_items as oi")
        .leftJoin("products as p", "p.id", "oi.product_id")
        .select("p.id", "p.name")
        .sum("oi.quantity as totalSold")
        .groupBy("p.id")
        .orderBy("totalSold", "desc")
        .limit(5);

      res.json({ success: true, top });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Failed to fetch top products" });
    }
  },

 
  monthlyRevenue: async (req, res) => {
    try {
      const revenue = await db("order")
        .select(
          db.raw("MONTH(created_at) as month"),
          db.raw("SUM(final_amount) as total")
        )
        .where("status", "paid")
        .groupBy("month")
        .orderBy("month");

      res.json({ success: true, revenue });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Failed to fetch monthly revenue" });
    }
  },
};
