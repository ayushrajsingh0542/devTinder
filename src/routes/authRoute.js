const express=require('express');
const LoginAuth=require("../utils/LoginAuth")
const bcrypt=require("bcrypt")
const User=require("../models/user.js")

const authRouter=express.Router();

authRouter.post("/signup",async(req,res)=>{
     console.log(req.body);

     const {firstName,lastName,emailId,password, age,
        gender,
        skills,
        photoUrl}=req.body;

     //validation of the data->done in schema only

     //encrypt the password
     
     const passwordHash=await bcrypt.hash(password,10)

     //creating a new instance of only valid schema
    const user=new User({
        firstName,
        lastName,
        emailId,
        password:passwordHash,
        age,
        gender,
        skills,
        photoUrl,
    });
    await user.save().then(()=>{
        res.send("user added successfully")
    })
    .catch((err)=>{
        res.status(err.status||500).send(err.message||"Something went wrong");
    })
})

authRouter.post("/login",async(req,res)=>{
    try
    {
        const {emailId,password}=req.body;
        LoginAuth(emailId,password,req,res);
        
    }catch(err)
    {
        res.status(err.status||500).send(err.message||"Something went wrong");
    }
})


module.exports=authRouter;