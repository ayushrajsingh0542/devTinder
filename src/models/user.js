
const mongoose =require("mongoose")
const validator = require('validator');

const userSchema=new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        maxLength:50,
    },
    lastName:String,
    emailId:{
        type:String,
        required:true,
        unique:true, 
        maxLength:50, 
        validate(value)
        {
          if(!validator.isEmail(value))
          {
            throw new Error("Invalid email id");
          }
        },
    },
    password:{
        type:String,
        required:true,
        maxLength:500,
        validate(value)
        {
          if(!validator.isStrongPassword(value))
          {
            throw new Error("Password is weak");
          }
        },
    },
    age:{
        type:Number,
        min:16,
    },
    gender:{
        type:String,
        validate(value)
        {
            if(!["male","female","others"].includes(value))
            {
                throw new Error("Gender is not valid");
            }
        }
        
    },
    photoUrl:{
        type:String,
        default:"https://geographyandyou.com/images/user-profile.png",
        trim:true,
        validate(value)
        {
          if(!validator.isURL(value))
          {
            throw new Error("Invalid url");
          }
        },
    },
    about:{
        type:String,
        default:"This is a default about of the user",

    },
    skills:{
        type:[String],
        validate(value){
           if(value.length>200)
           {
            throw new Error("Skills cannot go beyond 200")
           }
        }
    }

},{timestamps:true})

const User=mongoose.model("User",userSchema);

module.exports=User;