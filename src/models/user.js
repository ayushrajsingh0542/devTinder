
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
        unique:true, //all deals with indexing for faster querying
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
        enum:{
          values:["Male","Female","Others"],
          message:`{VALUE} is not a valid gender type`
        }
        
    },
    photoUrl:{
        type:String,
        default:"https://geographyandyou.com/images/user-profile.png",
        trim:true,
        
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