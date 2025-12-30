exports.cancelOrder = async (req, res) => {
  const trx = await db.transaction();
  try {
    const user_id = req.user.id;
    const { order_id } = req.params;
    const { reason } = req.body;

    const order = await trx("order")
      .where({ id: order_id, user_id })
      .first();

    if (!order) {
      await trx.rollback();
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "paid") {
      await trx.rollback();
      return res.status(400).json({
        message: "Order cannot be cancelled at this stage"
      });
    }

    // Update order status
    await trx("order")
      .where({ id: order_id })
      .update({ status: "cancel_requested" });

    // Log request
    await trx("order_requests").insert({
      order_id,
      user_id,
      type: "cancel",
      reason
    });

    // Status log
    await trx("order_status_logs").insert({
      order_id,
      old_status: order.status,
      new_status: "cancel_requested"
    });

    await trx.commit();

    res.json({
      success: true,
      message: "Cancel request submitted"
    });

  } catch (err) {
    await trx.rollback();
    console.log(err);
    res.status(500).json({ message: "Cancel request failed" });
  }
};

exports.returnOrder = async (req, res) => {
  const trx = await db.transaction();
  try {
    const user_id = req.user.id;
    const { order_id } = req.params;
    const { reason } = req.body;

    const order = await trx("order")
      .where({ id: order_id, user_id })
      .first();

    if (!order) {
      await trx.rollback();
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "delivered") {
      await trx.rollback();
      return res.status(400).json({
        message: "Return allowed only after delivery"
      });
    }

    await trx("order")
      .where({ id: order_id })
      .update({ status: "return_requested" });

    await trx("order_requests").insert({
      order_id,
      user_id,
      type: "return",
      reason
    });

    await trx("order_status_logs").insert({
      order_id,
      old_status: order.status,
      new_status: "return_requested"
    });

    await trx.commit();

    res.json({
      success: true,
      message: "Return request submitted"
    });

  } catch (err) {
    await trx.rollback();
    console.log(err);
    res.status(500).json({ message: "Return request failed" });
  }
};
