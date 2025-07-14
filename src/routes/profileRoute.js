const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation.js");
const User = require("../models/user.js");
const bcrypt = require("bcrypt");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = await req.user; //attached earlier in auth
    console.log(user);
    res.send("Logged in user found");
  } catch (err) {
    res.status(err.status || 500).send(err.message || "Something went wrong");
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid edit request");
    }
    const user = req.user; //attached by userAuth
    console.log(user);
    Object.keys(req.body).forEach((key) => (user[key] = req.body[key]));
    console.log(user);
    await user.save();
    const updatedUser = await User.findById(user._id);
    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    res.status(err.status || 500).send(err.message || "Soemthing went wrong");
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const { oldPassword, newPassword } = req.body;

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    user.password = newPasswordHash;
    await user.save();
    const updatedUser = await User.findById(user._id);
    res
      .status(200)
      .json({ message: "Password updated successfully", user: updatedUser });
  } catch (err) {
    res.status(err.status || 500).send(err.message || "Soemthing went wrong");
  }
});

module.exports = profileRouter;
