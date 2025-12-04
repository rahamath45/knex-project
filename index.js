require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authroutes = require("./src/routes/authroutes");
const resetRoutes = require("./src/routes/resetroutes")
const categoryRoutes = require('./src/routes/categoryroutes');
const productRoutes = require("./src/routes/productroutes");
const cartRoutes = require('./src/routes/cartroutes');
const orderRoutes = require('./src/routes/orderroutes');
const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth",authroutes);
app.use("/api/reset",resetRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products",productRoutes);
app.use('/api/cart',cartRoutes );
app.use('/api/orders', orderRoutes);


app.use((err,req,res,next)=>{
     console.log(err);
     res.status(500).json({ message:"server error",error:err.message})
})

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
