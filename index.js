import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { Property } from "./models/property.model.js";
import {user} from "./models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { verifyToken } from "./middlewares/auth.js";
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
const PORT = process.env.PORT || 3000;
const URI = process.env.URI;
mongoose.connect(URI).then(()=> console.log("MongoDB Atlas connected"))
    .catch((err)=> console.log("not connected"));

                                // API for Properties Operations

app.get("/properties",(req, resp)=>{
    Property.find().then((data)=>{resp.json(data)})
    .catch((err)=>{resp.status(500).send({message:"Error Occured"})});
});
app.get("/properties/MyProperty",verifyToken, async (req, resp)=>{
    
    try{
        const UserId = req.user.id;
        const property = await Property.find({UserId});
        if(!property){
            return resp.status(404).json({message: "No Properties Found"});
        }
        resp.json({ message: "Properties fetched successfully", properties: property });
    }
    catch(err){
        console.log("Error while fetching user's properties:", err);
        resp.status(500).json({message: "Error occured",error: err.message})
    }
});
app.post("/add-property",verifyToken ,async (req,resp)=>{
    try{
        const UserId = req.user.id;
        const last = await Property.findOne().sort({id:-1});
        let newId = 1;
        if(last && !isNaN(last.id)){
            newId = last.id + 1;
        }
        const newProperty = new Property({ ...req.body, id: newId, UserId });
        await newProperty.save();
        resp.status(200).json({message:"Property Added Successfully"});
    }
    catch(err){
        console.error("Error while adding property:", err);
        resp.status(500).send({message:"Error Occured"},err.message);
    }
     });
    
   
app.put("/property/update/:id",verifyToken, async (req,resp)=>{
    try{
        const UserId = req.user.id;
        const {id} = req.params;
        const property = await Property.findOne({id: Number(id)});
        if(!property){
            return resp.status(404).json({message: "Property Not Found"});
        }
        if(property.UserId.toString() !== UserId){
            return resp.status(403).json({message: "You Are Not Authorized To Update This Property"})
        }
        const updated = await Property.findOneAndUpdate(
            {id:Number(id)},
            {...req.body},
            {new: true}
        )
        resp.json({message:"property updated successfully",
            Property: updated,
        });
    }
    catch(err){
        resp.status(500).send({message:"Error Occured"});
    }
    } 
);
app.delete("/property/delete/:id", verifyToken , async (req,res)=>{
    
    try{
        const UserId = req.user.id;
        const {id} = req.params;
        const property = await Property.findOne({id: Number(id)}); 
        console.log(property);
        if(!property){
            return res.status(404).json({message: "Property Not Found"})
        }
        if(property.UserId.toString() !== UserId){
            return res.status(403).json({message: "You Are Not Authorized Person"});
        }
        const deleted = await Property.findOneAndDelete({id:Number(id)});
        if(!deleted){
            return res.status(404).json({message:"Property Not Deleted"})
        }
        res.json({
            message: "Property Deleted Successfully",
            Property: deleted,
        })
    }
    catch (err){
        console.error("Error while deleting property:", err);
        res.status(500).json({message:"error occured"})
        // 
    }
})
// 
                                // API for User Operations


app.get("/GetAllUsers", async (req,res)=>{
    try{
        const Allusers = await user.find();
        res.json(Allusers);
    }
    catch(err){
        console.log("Error while fetching users:", err);
        res.status(500).json({message:"error occured"});
    }
})

app.post("/User/SignUp", async (req, res) => {
    try{
        const {Username, email, password, role} = req.body;
        if(!Username || !email || !password || Username.trim() === "" || email.trim() === "" || password.trim() === ""){
            res.status(400).json({message: "All Fields Are Required"})
        }
        const UserExist = await user.findOne({email});
        if(UserExist){
            return res.status(409).json({message: "User Already Exist"});
        }
        const HashedPassword = await bcrypt.hash(password, 10);
        const newUser = new user({
            Username,
            email,
            password: HashedPassword,
            role: role || "user"
        })
        await newUser.save();
        res.status(200).json({message: "User Registered Successfully"});
    }

    catch(err){
        console.log("ERROR WHILE REGISTERING USER:" , err);
    }
}
);

app.post("/User/SignIn", async (req, res) => {
    try{
        const {email, password} = req.body;
        console.log("SignIn attempt for email:", email);
        if(!email || !password || email.trim()=== "" || password.trim() === ""){
            return res.status(400).json({message: "All Fields Are Required"});
        }
        const existingUser = await user.findOne({email});
        if(!existingUser){
            return res.status(404).json({message: "User Not Found, Please Sign Up"});
        }
        const passwordMatch = await bcrypt.compare(password, existingUser.password);
        if(!passwordMatch){
            return res.status(401).json({message: "Invalid Credentials"})
        }
        const payload = {id: existingUser._id, email: existingUser.email, role: existingUser.role};
        const token = jwt.sign(payload,process.env.JWT_SECRET_KEY,{expiresIn: process.env.JWT_EXPIRE_IN});
        res.status(200).json({message: "Sign In Successful", token,username: existingUser.Username, role: existingUser.role});
        console.log("User signed in successfully:", existingUser.Username); 
    }
    catch(err){
        console.log("Error while signing in:", err);
        res.status(500).json({message: "Error Occured"});
    }
});    
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});