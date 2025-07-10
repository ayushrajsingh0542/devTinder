const express =require('express');

const app=express();

app.use("/",(req,res)=>{
    res.send("Learning")
})

app.use("/hello",(req,res)=>{
    res.send("Hello from the server")
})

app.listen(3030,()=>{
    console.log("Succesfully running on 3030")
})