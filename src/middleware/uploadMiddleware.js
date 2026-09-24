const multer=require("multer");

const upload=multer({
  storage:multer.memoryStorage(),
  limits:{fileSize:Number(process.env.MAX_FILE_SIZE_MB||5)*1024*1024},
  fileFilter:(req,file,cb)=>{
    if(file.mimetype!=="application/pdf") return cb(new Error("Only PDF files are allowed"));
    cb(null,true);
  }
});

module.exports=upload;