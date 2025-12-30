exports.up = function (knex){
    return knex.schema.createTable("coupons",(table)=>{
        table.increments("id").primary();
        table.string("code").unique().notNullable();
        table.enum("type",["percent","flat"]).notNullable();
        table.decimal("value",10,2).notNullable();
        table.decimal("min_order",10,2).defaultTo(0);
        table.date("expiry_date").notNullable();
        table.boolean("is_active").defaultTo(true);
        table.timestamp("created_at").defaultTo(knex.fn.now())
    })
}

exports.down = function (knex) {
     return knex.schema.dropTableIfExists("coupons");
}