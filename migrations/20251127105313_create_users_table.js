exports.up = function (knex) {
  return knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("name", 100);
    table.string("email", 255).unique().notNullable();
    table.string("phone",20).unique().notNullable();
    table.string("password", 255).notNullable();
    table.enum("role", ["user", "admin"]).defaultTo("user");
    table.timestamp("created_at").defaultTo();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("users");
};

