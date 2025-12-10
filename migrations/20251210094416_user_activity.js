exports.up = function (knex) {
  return knex.schema.createTable("user_activity", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().references("id").inTable("users").onDelete("CASCADE");
    table.integer("product_id").unsigned().references("id").inTable("products").onDelete("CASCADE");
    table.timestamp("viewed_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("user_activity");
};

