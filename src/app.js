const express =require('express');
const app=express();
const connectDB =require('./config/database.js')
const User=require("./models/user.js")
const bcrypt = require('bcrypt');
const cookieParser=require('cookie-parser')
const jwt=require('jsonwebtoken');
const {userAuth}=require('./middlewares/auth.js')

app.use(express.json());//middlware
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

// app.use("/user",(req,res,next)=>{
//     //route handler
//     console.log("handling user 1");
//     //res.send("res 1")
//     next()
// },(req,res,next)=>{//express does not autmoatically goes to this req handler..so we use next
//     console.log("handling user 2");
//    // res.send("res 2")
//    next()
// }
// )

// app.use("/user",(req,res,next)=>{
//     console.log("user 3");
//     res.send("res 3")
// })

// app.use("/admin",auth);

// app.get("/admin/Check",(req,res)=>{
//     res.send("admin portal")
// })

// app.use((err,req,res,next)=>{
//     if(err)
//     res.status(err.status).send(err.message);
// })

app.post("/signup",async(req,res)=>{
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

app.post("/login",async(req,res)=>{
    try
    {
        const {emailId,password}=req.body;
        const user=await User.findOne({emailId:emailId});
        if(!user)
            res.status(404).send("Invalid credentials");
        const isPasswordValid=await bcrypt.compare(password,user.password);
        if(isPasswordValid)
        {

            //create a jwt

            const token=await jwt.sign({_id:user._id},"devTinder@11",{expiresIn:"7d"});
            console.log(token);

            //add the token to  cookie and send the response back to the user
            res.cookie("token",token);

            res.send("Login successfull")
        }
        else
            throw new Error("Invalid credentials")
    }catch(err)
    {
        res.status(err.status||500).send(err.message||"Something went wrong");
    }
})

app.get("/profile",userAuth,async(req,res)=>{
    try{
    
    const user=await req.user;//attached earlier in auth
    console.log(user);
    res.send("Logged in user found");
    }catch(err)
    {
        res.status(err.status||500).send(err.message||"Something went wrong");
    }
});

app.post("/sendConnectionRequest",userAuth,async(req,res)=>{

    const user=req.user;
    console.log("Sending a connection request by "+user.firstName);

    res.send("Connection request sent");
})

connectDB().then(()=>{//right way
console.log("db connected successfully")
app.listen(3030,()=>{
    console.log("Succesfully running on 3030")
})

}).catch((err)=>{
console.log(err);
})
