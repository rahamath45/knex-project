
module.exports = function(requiredRole = 'admin'){
    return (req,res,next) =>{
        if(!req.user) return res.status(401).json({message: "unauthorized"});
        if(req.user.role !== requiredRole) return res.status(403).json({message:"unallowed enteries"})
         next();
    }
}