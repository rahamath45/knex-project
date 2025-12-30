exports.up = function(knex){
    return knex.schema.createTable("order_status_logs",(table)=>{
        table.increments("id").primary();
        table.integer("order_id").unsigned().notNullable();
        table.string("old_status");
        table.string("new_status").notNullable();
        table.timestamp("changed_at").defaultTo(knex.fn.now());

        table.foreign("order_id")
              .references("id")
              .inTable("order")
              .onDelete("CASCADE")
    })
};

exports.down = function(knex){
    return knex.schema.dropTableIfExists("order_status_logs");
}