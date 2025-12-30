require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authroutes = require("./src/routes/authroutes");
const resetRoutes = require("./src/routes/resetroutes")
const categoryRoutes = require('./src/routes/categoryroutes');
const productRoutes = require("./src/routes/productroutes");
const cartRoutes = require('./src/routes/cartroutes');
const orderRoutes = require('./src/routes/orderroutes');
const wishRoutes = require("./src/routes/wishroutes");
const reviewRoutes = require("./src/routes/reviewroutes");
const adminRoutes = require("./src/routes/adminroutes");
const orderstatus = require("./src/routes/orderTimelineRoutes");
const couponRoutes = require("./src/routes/couponroutes");
const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth",authroutes);
app.use("/api/reset",resetRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products",productRoutes);
app.use('/api/cart',cartRoutes );
app.use('/api/orders', orderRoutes);
app.use("/api/wishlist",wishRoutes );
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders/status",orderstatus );
app.use("/api/coupons", couponRoutes);


// allowed all the domain access only get method
app.use((req,res,next)=>{
   res.header("Access-control-Allow-origin","*")
   res.header("Access-control-Allow-Methods","GET")
   next()
})

// allow multiple domains
const allowedDomains =[
   "https://example.com","https://admin.example.com"];

   app.use(
    cors({origin:function(origin,callback){
        if(!origin) return callback(null,true);

        if(allowedDomains.includes(origin)){
          callback(null,true);
        }else {
          callback(new Error("Not allowed by CORS"))
        }
   }
  })
  );



app.use(()=>{

})
app.use((err,req,res,next)=>{
     console.log(err);
     res.status(500).json({ message:"server error",error:err.message})
})

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
