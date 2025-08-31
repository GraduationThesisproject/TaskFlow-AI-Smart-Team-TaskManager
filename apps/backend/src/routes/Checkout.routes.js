const express = require('express');
const router = express.Router();
const config = require('../config/env');

// Lazily initialize Stripe only when needed to avoid crashing when key is missing
let stripeInstance = null;
function getStripe() {
  if (stripeInstance) return stripeInstance;
  const key = process.env.STRIPE_SECRET_KEY || config.STRIPE_SECRET_KEY;
  if (!key) {
    return null;
  }
  // eslint-disable-next-line global-require
  stripeInstance = require('stripe')(key);
  return stripeInstance;
}

router.post("/create-checkout-session", async (req, res) => {
  const { products, metadata } = req.body;
  
  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({
        error: "Stripe is not configured on the server",
        message: "Set STRIPE_SECRET_KEY in apps/backend/.env and restart the server."
      });
    }
    // Extract plan details from metadata for URL parameters
    const planName = metadata?.plan || 'premium';
    const amount = products[0]?.price_data?.unit_amount ? (products[0].price_data.unit_amount / 100).toFixed(2) : '0';
    const billingCycle = metadata?.billing_cycle || 'monthly';
    
    // Build success URL with plan details
    const successParams = new URLSearchParams({
      session_id: '{CHECKOUT_SESSION_ID}',
      plan: planName,
      amount: amount,
      billing_cycle: billingCycle
    });
    
    const cancelParams = new URLSearchParams({
      session_id: '{CHECKOUT_SESSION_ID}',
      reason: 'user_cancelled',
      plan: planName,
      amount: amount
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: products,
      mode: "payment",
      success_url: `${config.FRONTEND_URL || 'http://localhost:5173'}/success?${successParams.toString()}`,
      cancel_url: `${config.FRONTEND_URL || 'http://localhost:5173'}/cancel?${cancelParams.toString()}`,
      metadata: metadata || {},
    });
    
    // Return session ID for redirectToCheckout
    res.json({ 
      id: session.id,
      url: session.url 
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

module.exports = router;
