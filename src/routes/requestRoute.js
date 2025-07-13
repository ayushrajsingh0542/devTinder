const express=require('express');
const {userAuth}=require("../middlewares/auth")

const requestRouter=express.Router();

requestRouter.post("/sendConnectionRequest",userAuth,async(req,res)=>{

    const user=req.user;
    console.log("Sending a connection request by "+user.firstName);

    res.send("Connection request sent");
})

module.exports=requestRouter;