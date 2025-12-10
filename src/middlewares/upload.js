const multer = require("multer");
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    fileFilter:(req,file,cb) =>{
        if(
            file.mimetype === "test/csv" || 
            file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ){
            cb(null,true);
        }else{
            cb(new Error("only CSV or XLSX allowed"))
        }
    }
});

module.exports = upload;