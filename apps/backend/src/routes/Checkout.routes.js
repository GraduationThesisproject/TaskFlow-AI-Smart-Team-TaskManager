const express = require('express');
const router = express.Router();
const env=require('../config/env');
const stripe = require("stripe")(env.STRIPE_SECRET_KEY);
const { sendEmail } = require('../utils/email');
const User = require('../models/User');

router.post("/create-checkout-session", async (req, res) => {
  const { products, metadata } = req.body;
  // Merge client-provided metadata with the authenticated user id so webhook can notify the right user
  const userId = String(req.user._id) 
  const mergedMetadata = { ...(metadata || {}), ...(userId ? { userId } : {}) };
  
  try {
    if (!stripe) {
      return res.status(503).json({
        error: "Stripe is not configured on the server",
        message: "Set STRIPE_SECRET_KEY in apps/backend/.env and restart the server."
      });
    }
    // Extract plan details from metadata for URL parameters
    const planName = mergedMetadata?.plan || 'premium';
    const amount = products[0]?.price_data?.unit_amount ? (products[0].price_data.unit_amount / 100).toFixed(2) : '0';
    const billingCycle = mergedMetadata?.billing_cycle || 'monthly';
    
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
      success_url: `http://localhost:5173/success?${successParams.toString()}`,
      cancel_url: `http://localhost:5173/cancel?${cancelParams.toString()}`,
      metadata: mergedMetadata,
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

// Send payment confirmation email after checkout session creation
router.post('/send-payment-notification', async (req, res) => {
  try {
    const { sessionId, planName, amount, billingCycle } = req.body;
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    console.log('📧 Sending payment notification to:', user.email);
    
    // Calculate next billing date
    const nextBillingDate = new Date();
    if (billingCycle === 'monthly') {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    } else if (billingCycle === 'yearly') {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    }

    // Prepare email data
    const emailData = {
      customerName: user.name || user.email.split('@')[0],
      planName: planName.charAt(0).toUpperCase() + planName.slice(1),
      amount: amount,
      billingCycle: billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1),
      transactionId: sessionId,
      paymentDate: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      nextBillingDate: nextBillingDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      isPremium: planName.toLowerCase() === 'premium',
      isEnterprise: planName.toLowerCase() === 'enterprise',
      dashboardUrl: `${env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`,
      billingUrl: `${env.FRONTEND_URL || 'http://localhost:5173'}/billing`,
      supportUrl: `${env.FRONTEND_URL || 'http://localhost:5173'}/support`
    };

    // Send payment confirmation email
    const emailResult = await sendEmail({
      to: user.email,
      template: 'payment-confirmation',
      data: emailData
    });

    console.log('✅ Payment notification email sent successfully');

    // Update user's plan in database
    if (user.subscription) {
      user.subscription.plan = planName.toLowerCase();
      user.subscription.status = 'active';
      user.subscription.billingCycle = billingCycle;
      user.subscription.nextBillingDate = nextBillingDate;
      user.subscription.lastPaymentDate = new Date();
      await user.save();
    }

    res.json({ 
      success: true, 
      message: 'Payment notification sent successfully'
    });
    
  } catch (error) {
    console.error('❌ Payment notification failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
