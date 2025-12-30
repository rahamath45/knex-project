// host : example.com

const allowedDomain = async(req,res,next) =>{
   try{
     const user = req.user;
     const origin = req.headers.origin;
     const host = req.headers.host;

     const requestDomain = origin ? new URL(origin).hostname : host.split(":")[0];

      if(user.allowedDomain !== requestDomain){
        return res.status(403).json({
             error:"AccessDenied",
             message:"Domain not allowed for this user"
        })
      }
      next();
   }catch(err){
    console.log(err);
    return res.status(500).json({
        error:"serverError"
    })
   }
}




//  router.get("/dashboard",authMiddlewares,accessmiddlewares,dashboardController)

