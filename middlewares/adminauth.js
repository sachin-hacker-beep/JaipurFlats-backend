const export verifyAdmin = (req,res,next)=>{
    if(req.existingUser.role !== "admin"){
        return res.status(403).json({message:"Access Denied "})
    }
    next();
}