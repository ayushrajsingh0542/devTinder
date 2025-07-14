const mongoose=require('mongoose');

const connectionRequestSchema=new mongoose.Schema({

    fromUserId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",//link between user model ,ref to user collection
        required:true
    },
    toUserId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",//link between user model ,ref to user collection
        required:true
    },
    status:{
        type:"String",
        required:true,
        enum:{
            values:["ignored","interested","accepted","rejected"],
            message:`{VALUE} is incorrect status type`
        }
    }

},{
    timestamps:true,
})

connectionRequestSchema.index({fromUserId:1,toUserId:1});//indexing for faster querying..compound indexing

connectionRequestSchema.pre("save",function(next){//like a middleware,called before "save" is called .save()
    const connectionRequest=this;
    //check if from and to are same so before saving
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId))
    {
        throw new Error("Cannot send request to self");
    }
    next();
})

const ConnectionRequest= mongoose.model("ConnectionRequest",connectionRequestSchema);

module.exports=ConnectionRequest;