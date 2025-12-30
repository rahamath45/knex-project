exports.up = function(knex){
    return knex.schema.createTable("order_requests",(table)=>{
         table.increments("id").primary();

          table
               .integer("order_id")
               .unsigned()
                .notNullable()
                .references("id")
                .inTable("order")
                .onDelete("CASCADE");

           table
                .integer("user_id")
                .unsigned()
                 .notNullable()
                 .references("id")
                 .inTable("users")
                 .onDelete("CASCADE");

            table
                 .enu("type",["cancel","return"])
                  .notNullable();

            table.string("reason",255);

            table
                 .enu("status",["requested","approved","rejected"])
                 .defaultTo("requested");

             table.timestamp("created_at").defaultTo(knex.fn.now())
    });
};

exports.down = function (knex) {
       return knex.schema.dropTableIfExists("order_requests");
}