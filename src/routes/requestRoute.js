const express=require('express');
const {userAuth}=require("../middlewares/auth")
const ConnectionRequest=require('../models/connectionRequest.js');
const User = require('../models/user');

const requestRouter=express.Router();

requestRouter.post("/request/send/:status/:toUserId",userAuth,async(req,res)=>{

   try{
    const fromUserId=req.user._id;
    const toUserId=req.params.toUserId;
    const status=req.params.status;

    const toUser=await User.findById(toUserId)//checking if the other user exists in db;
    if(!toUser)
        throw new Error("Invalid User")


    const allowedStatus=["ignored","interested"];
    if(!allowedStatus.includes(status))
    {
        throw new Error("invalid status type");
    }

    //if there is an exsiting connection request
    const existingConnectionRequest=await ConnectionRequest.findOne({
        $or:[{fromUserId:fromUserId,
        toUserId:toUserId},{fromUserId:toUserId,
        toUserId:fromUserId,}]
        
    })// a has sent to b or vice versa already
    if(existingConnectionRequest)
    {
        return res.status(400).send("Connection request already exists!")
    }


    const connectionRequest=new ConnectionRequest({
        fromUserId,toUserId,status,
    })

    const data=await connectionRequest.save();
    const isLike=status==="interested"?"likes":"ignored";
    res.json({
        message:`${req.user.firstName} ${isLike} ${toUser.firstName}`,
        data,
    })

   }catch(err)
   {
    res.status(err.status||400).send(err.message||"Something went wrong");
   }
})

requestRouter.post("/request/review/:status/:requestId",userAuth,async(req,res)=>{

   try{
    const loggedInUser=req.user;
    const status=req.params.status;
    const requestId=req.params.requestId;

    //validate the status
    const allowedStatus=["accepted","rejected"];
    if(!allowedStatus.includes(status))
    {
        throw new Error("invalid status type");
    }

    //loggedInId=toUserId..status should be interested not ignored to accept/reject
    const connectionRequest=await ConnectionRequest.findOne({
        _id:requestId,// this request id is in our db
        toUserId:loggedInUser._id,
        status:"interested"
    })
    
    if(!connectionRequest)
    {
        return res.status(404).send("Connection request not found");
    }

    connectionRequest.status=status;//changing interested to accepted/rejected

    const data=await connectionRequest.save()
    
    res.json({message:"Connection request "+status, data})

    }

   catch(err)
   {
    res.status(err.status||400).send(err.message||"Something went wrong");
   }
})

module.exports=requestRouter;