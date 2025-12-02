exports.up = function(knex) {
  return knex.schema.createTable("addresses", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable();
    table.string("name");
    table.string("line1");
    table.string("line2");
    table.string("city");
    table.string("state");
    table.string("postal_code");
    table.string("country");
    table.string("phone");
    table.boolean("is_default").defaultTo(false);

    table.foreign("user_id").references("id").inTable("users").onDelete("CASCADE");
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("addresses");
};

