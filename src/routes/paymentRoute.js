const express = require("express");
const crypto = require("crypto");
const { userAuth } = require("../middlewares/auth");
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../models/payment");
const User = require("../models/user");
const { membershipAmount } = require("../utils/constants");
require("dotenv").config();

const paymentRouter = express.Router(); // ✅ use this consistently

// 📌 1. Create Razorpay order
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
        membershipType,
      },
    });

    console.log("🔹 Razorpay Order Created:", order);

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

    res.json({
      ...savedPayment.toJSON(),
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
});

// 📌 2. Razorpay Webhook Route (MUST use raw body)
paymentRouter.post(
  "/payment/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];
    const rawBody = req.body;

    console.log("📩 Webhook Called");
    try {
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody.toString())
        .digest("hex");

      if (expectedSignature !== signature) {
        console.log("❌ Invalid Webhook Signature");
        return res.status(400).send("Invalid signature");
      }

      const parsed = JSON.parse(rawBody.toString());

      if (parsed.entity === "order") {
        const order = parsed;
        console.log("✅ Valid Webhook Order Data:");
        console.log("Notes:", order.notes);
        console.log("Order ID:", order.id);
        console.log("Status:", order.status);
        // You can update your DB here if needed
      }

      return res.status(200).json({ status: "ok" });
    } catch (err) {
      console.error("❌ Webhook Handler Error:", err);
      return res.sendStatus(500);
    }
  }
);

// 📌 3. Premium Verify Route
paymentRouter.get("/premium/verify", userAuth, async (req, res) => {
  const user = req.user.toJSON();
  return res.json({ ...user });
});

module.exports = paymentRouter;
