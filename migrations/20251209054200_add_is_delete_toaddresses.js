exports.up = function (knex) {
  return knex.schema.alterTable("addresses", (table) => {
    table.boolean("is_deleted").defaultTo(false);
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("addresses", (table) => {
    table.dropColumn("is_deleted");
  });
};
