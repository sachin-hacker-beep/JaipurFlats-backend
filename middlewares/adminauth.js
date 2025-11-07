export const verifyAdmin = (req,res,next)=>{
    try{
        if(req.user.role !== "admin"){
            return res.status(405).json({message:"Access Denied, you are not admin "})
        }
    }
    catch(err){
        return res.status(500).json({message:"verify Admin Middleware Error", error: err.message})
    }
    next();
}  