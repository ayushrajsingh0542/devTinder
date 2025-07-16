const express = require("express");
const { userAuth } = require("../middlewares/auth");
const userRouter = express.Router();
const User = require("../models/user.js");
const ConnectionRequest = require("../models/connectionRequest");

//get all the pending connection request for the logged in user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequest = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", "firstName lastName age skills about photoUrl gender"); //we wrote ref:User in connecreq schema of fromUserId..linked
    res.json({data:connectionRequest});
  } catch (err) {
    res.status(err.status || 500).send(err.message || "Something went wrong");
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", "firstName lastName age skills about photoUrl gender")
      .populate("toUserId", "firstName lastName age skills about photoUrl gender");

    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        //checking that the one seeing the connection is from or to..and return the basically receiver info
        return row.toUserId;
      }
      return row.fromUserId;
    }); //connReq is an array and fromUserId and toUserId has all relevant info(populate)
    res.json({data:data});
  } catch (err) {
    res.status(err.status || 500).send(err.message || "Something went wrong");
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page=parseInt(req.query.page) || 1;
    //const limit=parseInt(req.query.limit) || 10;
    //const skip=(page-1)*limit;//formula to calc skip
    //user should see all except
    //1. his own
    //2. his connections
    //3. ignored
    //4. interested
    //5. rejected by other

    //find all the connection requests(sent+rec)all
    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");
  

    const hideUserFromFeed = new Set(); //to get all unique people to hide
    connectionRequests.forEach((request) => {
      hideUserFromFeed.add(request.fromUserId.toString());
      hideUserFromFeed.add(request.toUserId.toString());
    });
    console.log(hideUserFromFeed);
    

    const users = await User.find({//focus->its the User model not connection model
      $and: [
        { _id: { $nin: Array.from(hideUserFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    }).select("firstName lastName gender skills about photoUrl age")//.skip(skip).limit(limit) //all users not in connections


    console.log(users);
    console.log(users.length)

    res.send(users)

  } catch (err) {
    res.status(err.status || 500).send(err.message || "Something went wrong");
  }
});
module.exports = userRouter;
