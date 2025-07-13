const express =require('express');
const app=express();
const connectDB =require('./config/database.js')
const User=require("./models/user.js")
const bcrypt = require('bcrypt');
const cookieParser=require('cookie-parser')
const jwt=require('jsonwebtoken');
const {userAuth}=require('./middlewares/auth.js')
const LoginAuth=require('./utils/LoginAuth.js')

app.use(express.json());//middlware
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

const authRouter=require("./routes/authRoute.js")
const profileRouter=require("./routes/profileRoute.js")
const requestRouter=require("./routes/requestRoute.js")

app.use(authRouter);
app.use(profileRouter);
app.use(requestRouter);

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







connectDB().then(()=>{//right way
console.log("db connected successfully")
app.listen(3030,()=>{
    console.log("Succesfully running on 3030")
})

}).catch((err)=>{
console.log(err);
})
