const express = require("express");
const { userAuth } = require("../middlewares/auth");
const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../models/payment");
const User = require("../models/user");
const { membershipAmount } = require("../utils/constants");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
require('dotenv').config();

// Create order
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

    console.log(order);

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
    return res.status(500).json({ msg: err.message });
  }
});

// ✅ Webhook route (with raw body parser scoped correctly)
paymentRouter.post(
  "/payment/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      console.log("Webhook Called");

      const webhookSignature = req.get("X-Razorpay-Signature");

      const isWebhookValid = validateWebhookSignature(
        req.body, // ✅ raw buffer
        webhookSignature,
        process.env.RAZORPAY_WEBHOOK_SECRET
      );

      if (!isWebhookValid) {
        console.log("❌ Invalid Webhook Signature");
        return res.status(400).json({ msg: "Webhook signature is invalid" });
      }

      console.log("✅ Valid Webhook Signature");

      const payload = JSON.parse(req.body.toString("utf8"));
      const paymentDetails = payload.payload.payment.entity;

      console.log("Payment Details from Webhook:", paymentDetails);

      return res.status(200).json({ msg: "Webhook received successfully" });
    } catch (err) {
      console.error("Webhook Error:", err.message);
      return res.status(500).json({ msg: err.message });
    }
  }
);

// Premium verify
paymentRouter.get("/premium/verify", userAuth, async (req, res) => {
  const user = req.user.toJSON();
  return res.json({ ...user });
});

module.exports = paymentRouter;
