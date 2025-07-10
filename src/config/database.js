const mongoose=require('mongoose');

async function connectDB(){
    await mongoose.connect('mongodb+srv://aayushrajsingh11:ayushsingh11@cluster0.1zaimnk.mongodb.net/devTinder')
}

module.exports=connectDB