exports.up = function(knex){
    return knex.schema.createTable("order",(table)=>{
        table.increments("id").primary();
        table.integer("user_id").unsigned().references("id").inTable("users").onDelete("SET NULL");
        table.integer("addresses_id").unsigned().references("id").inTable("addresses").onDelete("SET NULL");
        table.decimal("total_amount",10,2).notNullable();
        table.enum("status",["pending","paid","failed","shipped","delivered","cancelled"]).defaultTo("pending");
        table.string("payment_method");
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
    })
};

exports.down = function(knex){
    return knex.schema.dropTableIfExists("order");
};
