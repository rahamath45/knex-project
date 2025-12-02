exports.up = function (knex) {
  return knex.schema.createTable("products", (table) => {
    table.increments("id").primary();
    table.string("title", 255).notNullable();
    table.text("description");
    table.decimal("price", 10, 2).notNullable();
    table.integer("stock").defaultTo(0);

    table
      .integer("category_id")
      .unsigned()
      .references("id")
      .inTable("categories")
      .onDelete("SET NULL");

    table.string("sku", 100);
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("products");
};
