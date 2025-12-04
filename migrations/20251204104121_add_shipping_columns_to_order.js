exports.up = function (knex) {
  return knex.schema.alterTable("order", (table) => {
    table.decimal("shipping_fee", 10, 2).defaultTo(0);
    table.decimal("final_amount", 10, 2);
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("order", (table) => {
    table.dropColumn("shipping_fee");
    table.dropColumn("final_amount");
  });
};

