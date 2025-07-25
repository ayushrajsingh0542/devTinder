const express=require('express');
const { userAuth } = require('../middlewares/auth');
const paymentRouter=express.Router();
const razorpayInstance=require("../utils/razorpay.js")
const Payment=require("../models/payment.js")
const User=require("../models/user.js")
const {membershipAmount}=require("../utils/constants.js")
const {
  validateWebhookSignature,
} =
require('dotenv').config();

paymentRouter.post("/payment/create",userAuth,async(req,res)=>{

    try{
        const {membershipType}=req.body;
        const { firstName, lastName, emailId } = req.user;
         const order = await razorpayInstance.orders.create({
      amount: membershipAmount[membershipType] * 100,
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName,
        lastName,
        emailId,
        membershipType: membershipType,
      },
    });

const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savedPayment = await payment.save();


res.json({...savedPayment.toJSON(),keyId:process.env.RAZORPAY_KEY_ID})

    }catch(err)
    {
        console.log(err);
        return res.status(err.status||500).send(err.message||"Something went wrong");
    }
    
})

paymentRouter.post("/payment/webhook", async (req, res) => {
  try {
    console.log("Webhook Called");
    const webhookSignature = req.get("X-Razorpay-Signature");
    console.log("Webhook Signature", webhookSignature);

    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isWebhookValid) {
      console.log("Invalid Webhook Signature");
      return res.status(400).json({ msg: "Webhook signature is invalid" });
    }
    console.log("Valid Webhook Signature");

    // Udpate my payment Status in DB
    const paymentDetails = req.body.payload.payment.entity;

    const payment = await Payment.findOne({ orderId: paymentDetails.order_id });
    console.log("🧾 Found Payment:", payment);
    if (!payment || !payment.userId) {
  return res.status(404).json({ msg: "Payment or userId not found" });
}
    payment.status = paymentDetails.status;
    await payment.save();
    console.log("Payment saved");

    const user = await User.findOne({ _id: payment.userId });
    console.log("👤 Found User:", user);
    if (!user) {
  return res.status(404).json({ msg: "User not found" });
}
    user.isPremium = true;
    user.membershipType = payment.notes.membershipType;
    console.log("User saved");

    await user.save();

    // Update the user as premium

    // if (req.body.event == "payment.captured") {
    // }
    // if (req.body.event == "payment.failed") {
    // }

    // return success response to razorpay

    return res.status(200).json({ msg: "Webhook received successfully" });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
});



module.exports=paymentRouter;