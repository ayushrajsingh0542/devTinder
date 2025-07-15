const jwt=require('jsonwebtoken');
const User=require("../models/user.js")

  const userAuth=async(req,res,next)=>{
    const cookies=req.cookies;
    //read the token
    const {token}=cookies;
    if(!token)
        return res.status(401).send("Unauthorised user");
    const decodedMsg=await jwt.verify(token,"devTinder@11");

    const {_id}=decodedMsg;
    const user=await User.findById({_id});
    //validate the user
    if(!user)
    {

        const err=new Error("user not found")
        err.status=404;
        next(err);
    }
    //if user exists call next->req handler
    else
    { 
        req.user=user;//attaching this user to req
        next();
    }
}

module.exports={
    userAuth,
};



