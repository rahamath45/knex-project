exports.up = function (knex) {
  return knex.schema.createTable("payments", (table) => {
    table.increments("id").primary();

    table.integer("order_id").unsigned()
      .references("id").inTable("order")
      .onDelete("CASCADE");

    table.string("payment_id");  
    table.string("client_secret");   
    table.string("status").defaultTo("pending");

    table.decimal("amount", 10, 2);
    table.string("currency").defaultTo("usd");

    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("payments");
};


