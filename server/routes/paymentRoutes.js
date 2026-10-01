const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const asyncHandler = require('express-async-handler');
const r = express.Router();
r.post('/stripe/intent', protect, asyncHandler(async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const { amount } = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'bdt',
    automatic_payment_methods: { enabled: true },
  });
  res.json({ clientSecret: paymentIntent.client_secret });
}));
module.exports = r;
