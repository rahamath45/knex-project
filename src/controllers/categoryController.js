const db = require("../config/db");

exports.createCategory = async(req,res) =>{
    try{
         
        const{ name, slug} = req.body;
        if(!name || !slug){
        return res.status(400),json({
            status:"error",
             message:"those field are required "
        })
    }
        const [id] = await db('categories').insert({ name ,slug});
        const cat = await db('categories').where({ id }).first();
        res.status(201).json(cat);
    }catch(err){
        if(err.code === 'ER_DUP_ENTRY') return res.status(400).json({message:"Category already exists"})
    }
};

exports.listCategories = async (req,res) =>{
    try{
        const cats = await db("categories").select('*').orderBy('name');
         res.json(cats);
    }catch(err){
        console.log(err)
         res.json({ status: "err", message: "categories listing show error" });
    }
}
exports.getCategory = async (req, res) => {
  try {
    const cat = await db('categories').where({ id: req.params.id }).first();
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    res.json(cat);
  } catch (err) {
    console.log(err)
     res.json({ status: "err", message: "categories id show error" });
   }
};

exports.updateCategory = async (req, res) => {
  try {
      const { name, slug } = req.body;  // only allowed fields
      
      if(!name || !slug){
          return res.status(400),json({
              status:"error",
               message:"those field are required "
          })
      }
    await db('categories')
      .where({ id: req.params.id })
      .update({ name, slug });

    const category = await db('categories')
      .where({ id: req.params.id })
      .first();

    res.json(category);

  } catch (err) {
    console.log(err);
    res.json({ status: "err", message: "update error" });
  }
};


exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params; 

    await db("categories")
      .where({ id })
      .update({ is_delete: true });

    return res.json({
      success: true,
      message: "Category deleted successfully",
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "error",
      message: "Error deleting category",
    });
  }
};
