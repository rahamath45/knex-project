exports.up = function(knex){
    return knex.schema.createTable("categories",(table)=>{
         table.increments("id").primary();
         table.string("name",100).unique().notNullable();
         table.string("slug",150);
         table.timestamp("created_at").defaultTo()
    });
};

exports.down = function(knex){
    return knex.schema.dropTableIfExists("categories");
}
 