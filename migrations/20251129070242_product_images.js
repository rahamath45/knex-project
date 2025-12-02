exports.up = function(knex){
    return knex.schema.createTable("product_images",(table)=>{
        table.increments("id").primary();
        table.integer("product_id")
              .unsigned()
              .references("id")
              .inTable("products")
              .onDelete("CASCADE");

        table.string("url",500).notNullable();
        table.boolean("is_primary").defaultTo(false)
    })
}

exports.down = function(knex){
    return knex.schema.dropTable("product_images");
};