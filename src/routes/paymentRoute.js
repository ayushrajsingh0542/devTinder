const express = require('express');
const paymentRouter = express.Router();
require('dotenv').config();
const { userAuth } = require('../middlewares/auth');
const razorpayInstance = require("../utils/razorpay.js");
const Payment = require("../models/payment.js");
const User = require("../models/user.js");
const { membershipAmount } = require("../utils/constants.js");
const bodyParser = require('body-parser');
const crypto = require("crypto");

// Use raw bodyParser ONLY for webhook route
paymentRouter.use('/payment/webhook', bodyParser.raw({ type: 'application/json' }));

// Create Payment Order
paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
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

    res.json({ ...savedPayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.log(err);
    return res.status(err.status || 500).send(err.message || "Something went wrong");
  }
});

// Handle Webhook
paymentRouter.post("/payment/webhook", async (req, res) => {
  try {
    console.log("✅ Webhook Called");

    const webhookSignature = req.get("X-Razorpay-Signature");
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body.toString("utf8"))
      .digest("hex");

    if (generatedSignature !== webhookSignature) {
      console.log("❌ Invalid Webhook Signature");
      return res.status(400).json({ msg: "Invalid signature" });
    }

    console.log("✅ Valid Webhook Signature");

    const parsedBody = JSON.parse(req.body.toString("utf8"));
    const paymentDetails = parsedBody.payload.payment.entity;

    const payment = await Payment.findOne({ orderId: paymentDetails.order_id });
    if (!payment || !payment.userId) {
      return res.status(404).json({ msg: "Payment or userId not found" });
    }

    payment.status = paymentDetails.status;
    await payment.save();
    console.log("✅ Payment updated");

    const user = await User.findById(payment.userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.isPremium = true;
    user.membershipType = payment.notes.membershipType;
    await user.save();

    console.log("🎉 User updated to premium");
    return res.status(200).json({ msg: "Webhook processed successfully" });
  } catch (err) {
    console.error("💥 Webhook Error:", err.message);
    return res.status(500).json({ msg: err.message });
  }
});

module.exports = paymentRouter;
