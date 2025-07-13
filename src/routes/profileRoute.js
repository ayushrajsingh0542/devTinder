const express=require('express');
const {userAuth}=require("../middlewares/auth")

const profileRouter=express.Router();

profileRouter.get("/profile",userAuth,async(req,res)=>{
    try{
    
    const user=await req.user;//attached earlier in auth
    console.log(user);
    res.send("Logged in user found");
    }catch(err)
    {
        res.status(err.status||500).send(err.message||"Something went wrong");
    }
});

module.exports=profileRouter;