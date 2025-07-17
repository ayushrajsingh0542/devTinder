const express = require("express");
const app = express();
const connectDB = require("./config/database.js");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//  CORS Setup
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("/profile/edit", cors(corsOptions)); //  handles preflight for all routes

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRouter = require("./routes/authRoute.js");
const profileRouter = require("./routes/profileRoute.js");
const requestRouter = require("./routes/requestRoute.js");
const userRouter = require("./routes/userRoute.js");

app.use(authRouter);
app.use(profileRouter);
app.use(requestRouter);
app.use(userRouter);

//  Start server after DB connects
connectDB()
  .then(() => {
    console.log(" DB connected successfully");
    app.listen(3030, "0.0.0.0", () => {
  console.log(" Server running on http://0.0.0.0:3030");
});
  })
  .catch((err) => {
    console.error(" DB connection error:", err);
  });

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







