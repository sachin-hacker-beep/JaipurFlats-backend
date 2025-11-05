import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export const verifyToken = (req,res,next)=>{
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if(!authHeader || !authHeader.startsWith("Bearer")){
        return res.status(401).json({message: "unauthorized request"});
    }
    const authHeaderToken = authHeader.split(" ")[1];
        const decoded = jwt.verify(authHeaderToken, process.env.JWT_SECRET_KEY, (err, decoded)=>{
            if(err){
                if(err.name==="TokenExpiredError"){
                    return res.status(401).json({message:"Token Expired"});
                }
                return res.status(403).json({message:"Invalid Token"});
            }
            req.user = decoded;
            next();
        });
};