const db = require("../config/db");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

module.exports = {

  bulkUpload: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ msg: "Upload a CSV or XLSX file" });
      }

      const buffer = req.file.buffer;
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const rows = XLSX.utils.sheet_to_json(sheet);

      if (rows.length === 0) {
        return res.status(400).json({ msg: "File empty or invalid format" });
      }

     

      for (const row of rows) {
        await db("products").insert({
          name: row.name,
          price: row.price,
          stock: row.stock,
          category_id: row.category_id,
          description: row.description || "",
          is_deleted: false,
        });
      }

      res.json({
        success: true,
        message: "Bulk upload completed",
        inserted: rows.length,
      });

    } catch (err) {
      console.log(err);
      res.status(500).json({ msg: "Error processing file" });
    }
  },


  downloadProducts: async (req, res) => {
    try {
      const products = await db("products")
        .select("id", "name", "price", "stock", "category_id", "description");

      const worksheet = XLSX.utils.json_to_sheet(products);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

      const filePath = path.join(__dirname, "../downloads/products.xlsx");
      XLSX.writeFile(workbook, filePath);

      res.download(filePath, "products.xlsx", () => {
        fs.unlinkSync(filePath); 
      });

    } catch (err) {
      console.log(err);
      res.status(500).json({ msg: "Unable to download products" });
    }
  }
};
