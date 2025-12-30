const db = require("../config/db");
const { isValidStatusUpdate } = require("../utils/orderStatusFlow");


// UPDATE ORDER STATUS

exports.updateOrderStatus = async (req, res) => {
  const trx = await db.transaction();

  try {
    const { order_id } = req.params;
    const { new_status } = req.body;

    if (!new_status) {
      return res.status(400).json({ msg: "new_status required" });
    }

    const order = await trx("order").where({ id: order_id }).first();

    if (!order) {
      await trx.rollback();
      return res.status(404).json({ msg: "Order not found" });
    }

    // Validate flow
    if (!isValidStatusUpdate(order.status, new_status)) {
      await trx.rollback();
      return res.status(400).json({
        msg: `Invalid status change from ${order.status} to ${new_status}`
      });
    }
    if(!isValidStatusUpdate(order.status,new_status)){
        await trx.rollback();
        return res.status(400)
    }

    // Update order status
    await trx("order")
      .where({ id: order_id })
      .update({
        status: new_status,
        updated_at: db.fn.now()
      });

    // Insert log
    await trx("order_status_logs").insert({
      order_id,
      old_status: order.status,
      new_status
    });

    await trx.commit();

    res.json({
      success: true,
      message: "Order status updated",
      from: order.status,
      to: new_status
    });

  } catch (err) {
    await trx.rollback();
    console.log(err);
    res.status(500).json({ msg: "Failed to update order status" });
  }
};

// GET ORDER STATUS HISTORY

exports.getOrderTimeline = async (req, res) => {
  try {
    const { order_id } = req.params;

    const logs = await db("order_status_logs")
      .where({ order_id })
      .orderBy("changed_at", "asc");

    if (!logs.length) {
      return res.json({
        success: true,
        timeline: []
      });
    }

    res.json({
      success: true,
      timeline: logs
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error fetching order timeline" });
  }
};
