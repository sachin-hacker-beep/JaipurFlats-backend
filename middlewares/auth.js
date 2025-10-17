import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export const verifyToken = (req,res,next)=>{
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if(!authHeader || !authHeader.startsWith("Bearer")){
        return res.status(401).json({message: "unauthorized request"});
    }
    const authHeaderToken = authHeader.split(" ")[1];
    try{
        const decoded = jwt.verify(authHeaderToken, process.env.JWT_SECRET_KEY);
        req.user = decoded;
        next();
    }
    catch(err){
        return res.status(500).json({message: "Invalid token"});
    }
}