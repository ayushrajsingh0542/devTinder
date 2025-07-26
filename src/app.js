const express = require("express");
const app = express();
const connectDB = require("./config/database.js");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();


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



// Normal body parsing comes AFTER the webhook
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRouter = require("./routes/authRoute.js");
const profileRouter = require("./routes/profileRoute.js");
const requestRouter = require("./routes/requestRoute.js");
const userRouter = require("./routes/userRoute.js");
const paymentRouter=require('./routes/paymentRoute.js')   // ✅ This was missing from use()

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

app.use("/", paymentRouter);

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
