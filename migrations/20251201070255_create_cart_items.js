exports.up = function(knex) {
  return knex.schema.createTable("cart_items", (table) => {
    table.increments("id").primary();
    table.integer("cart_id").unsigned().notNullable();
    table.integer("product_id").unsigned().notNullable();
    table.integer("quantity").defaultTo(1);
    table.decimal("price", 10,2).notNullable();

    table.foreign("cart_id").references("id").inTable("carts").onDelete("CASCADE");
    table.foreign("product_id").references("id").inTable("products").onDelete("RESTRICT");
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("cart_items");
};

