exports.up = function (knex) {
  return knex.schema.alterTable("products", (table) => {
    table.decimal("average_rating", 3, 2).defaultTo(0);
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("products", (table) => {
    table.dropColumn("average_rating");
  });
};
