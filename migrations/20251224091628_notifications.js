// migrations/xxxx_create_notifications.js
exports.up = function (knex) {
  return knex.schema.createTable("notifications", (table) => {
    table.increments("id").primary();
    table.string("type"); // low_stock
    table.integer("product_id").unsigned();
    table.text("message");
    table.boolean("is_read").defaultTo(false);
    table.timestamp("created_at").defaultTo(knex.fn.now());

    table.foreign("product_id")
      .references("id")
      .inTable("products")
      .onDelete("CASCADE");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("notifications");
};
