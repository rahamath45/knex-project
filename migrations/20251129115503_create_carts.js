exports.up = function(knex) {
  return knex.schema.createTable("carts", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().unique().notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());

    table.foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("carts");
};
