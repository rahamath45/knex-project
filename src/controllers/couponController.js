const  db = require("../config/db");

exports.applyCoupon = async (req,res) => {
      try{
            const{ code , cart_total } = req.body;

            const coupon = await db("coupons")
                            .where({ code,is_active : true})
                            .where("expiry_date",">=",new Date())
                            .first();

                  if(!coupon)
                     return res.status(400).json({ msg :"Invalid coupon"})
                    
                  if(cart_total < coupon.min_order)
                     return res.status(400).json({ msg :"Minimum order not met"})

                  let discount = 0;

                  if(coupon.type === "percent"){
                      discount = ( cart_total * coupon.value)/100;
                  }else{
                      discount = coupon.value;
                  }

                  res.json({
                     success:true,
                     discount,
                     final_amount: cart_total - discount
                  })
      }                    
      catch(err){
        console.log(err);
        res.status(500).json({ msg :"COUPON ERROR"})
      }
}

exports.createCoupon = async (req, res) => {
  try {
    await db("coupons").insert(req.body);
    res.json({ success: true, msg: "Coupon created" });
  } catch (err) {
    res.status(500).json({ msg: "Error creating coupon" });
  }
};