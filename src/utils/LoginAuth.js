    const User=require("../models/user.js")
    const bcrypt = require('bcrypt');
    const cookieParser=require('cookie-parser')
    const jwt=require('jsonwebtoken');
    require('dotenv').config();
    
    async function LoginAuth(emailId,password,req,res)
    {
    const user=await User.findOne({emailId:emailId});
        if(!user)
            return res.status(404).send("Invalid credentials");
        const isPasswordValid=await bcrypt.compare(password,user.password);
        if(isPasswordValid)
        {

            //create a jwt

            const token=await jwt.sign({_id:user._id},process.env.JWT_SECRET,{expiresIn:"7d"});
            //console.log(token);

            //add the token to  cookie and send the response back to the user
            res.cookie("token",token);

            res.send(user)
        }
        else
             return res.status(404).send("Invalid credentials");
    }

module.exports=LoginAuth;