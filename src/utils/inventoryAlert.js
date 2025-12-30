  const db = require("../config/db")


  const LOW_STOCK_LIMIT = 5;

  exports.checkLowStock = async (product_id,trx = db)=>{
    const product = await trx("products")
                    .where({ id : product_id})
                    .first(); 

           if(!product) return ;
           
           if(product.stock < LOW_STOCK_LIMIT){
              const exists = await trx("notifications")
                             .where({
                                product_id,type:"low_stock",
                             }).first()

             if(!exists){
                await trx("notification").insert({
                     type:"low_stock",
                     product_id,
                     message:`product "${product.title}" is running low (${product.stock} left)`
                })
             }              
           }
  }      