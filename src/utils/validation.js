const validator=require("validator");
const validateSignUpData=(req)=>{
    const {firstName,lastName,emailId,password}=req.body;
}//already in user schema

const validateEditProfileData=(req)=>{
    const allowedEditFields=["firstName","lastName","photoUrl","gender","age","about","skills"];

   const isEditAllowed= Object.keys(req.body).every((field)=>allowedEditFields.includes(field));

   return isEditAllowed;
}

module.exports={validateEditProfileData};