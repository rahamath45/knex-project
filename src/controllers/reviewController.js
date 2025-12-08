const db = require("../config/db");

async function updateproductRating(product_id){
     const [{ avg }] = await db("reviews")
       .where({ product_id}).avg("rating as avg");

     await db("products").where({ id : product_id}).update({ average_rating: avg || 0})
}

exports.addReview = async (req,res) =>{
    try{
        const { product_id , rating , comment} = req.body;
        const user_id = req.user.id;
        if(!rating || rating < 1 || rating >5){
               return res.status(400).json({ message:"Rating must be 1-5"})
        }
        const existing = await db("reviews").where({ user_id,product_id}).first();
        if (existing) {
      // Update review
      await db("reviews")
        .where({ user_id, product_id })
        .update({ rating, comment });

    } else {
      // Insert new review
      await db("reviews").insert({
        user_id,
        product_id,
        rating,
        comment
      });
    }

    await updateproductRating(product_id);

    res.json({ success: true, message: "Review saved" });
    }catch(err){
        console.log(err);
        res.status(500).json({ message: "Error adding review"})
    }
};
exports.deleteReview = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;

    const review = await db("reviews").where({ id }).first();

    if (!review) 
      return res.status(404).json({ msg: "Review not found" });

    if (review.user_id !== user_id)
      return res.status(403).json({ msg: "Not allowed" });

    // Soft Delete
    await db("reviews")
      .where({ id })
      .update({
        is_delete: true
      });

    await updateproductRating(review.product_id);

    res.json({ success: true, message: "Review soft-deleted" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error deleting review" });
  }
};


exports.getProductReviews = async (req, res) => {
  try {
    const { product_id } = req.params;

    const reviews = await db("reviews")
      .select("reviews.*", "users.name as user_name")
      .leftJoin("users", "reviews.user_id", "users.id")
      .where("reviews.product_id", product_id)
      .orderBy("created_at", "desc");

    res.json({ success: true, reviews });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error fetching reviews" });
  }
};