# Payment Confirmation Email Setup

## Overview
This guide explains how to set up email confirmations for successful Stripe payments in TaskFlow.

## Features Implemented
✅ **Payment Confirmation Email Template** - Professional email template with payment details  
✅ **Stripe Webhook Handler** - Processes successful payment events  
✅ **Automatic Email Sending** - Sends confirmation emails after successful payments  
✅ **Plan Feature Display** - Shows unlocked features based on purchased plan  

## Setup Instructions

### 1. Configure Stripe Webhook Secret
Add the following to your `.env` file:
```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 2. Set Up Stripe Webhook Endpoint
1. Go to your Stripe Dashboard → Webhooks
2. Add endpoint: `http://localhost:3001/api/checkout/webhook`
3. Select events: `checkout.session.completed`
4. Copy the webhook signing secret to your `.env` file

### 3. Configure Email Settings
Ensure your `.env` file has email configuration:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## How It Works

### Payment Flow
1. User completes Stripe checkout
2. Stripe sends `checkout.session.completed` webhook to `/api/checkout/webhook`
3. Webhook handler extracts payment details and user information
4. System sends payment confirmation email using the `payment-confirmation` template
5. User subscription is updated in database (if subscription model exists)

### Email Template Features
- **Payment Summary**: Plan name, amount, billing cycle, transaction ID
- **Feature List**: Dynamic feature list based on purchased plan
- **Action Buttons**: Links to dashboard and billing page
- **Professional Design**: Consistent with TaskFlow branding

### Webhook Security
- Verifies Stripe webhook signature for security
- Handles webhook events safely with proper error logging
- Raw body parsing for webhook signature verification

## Testing

### Development Mode
In development, emails are logged to console instead of being sent:
```
📧 DEVELOPMENT MODE - Email would be sent:
{
  to: 'user@example.com',
  subject: '💳 Payment Confirmed - Welcome to Premium!',
  template: 'payment-confirmation',
  data: { ... }
}
```

### Production Testing
1. Use Stripe CLI to forward webhooks: `stripe listen --forward-to localhost:3001/api/checkout/webhook`
2. Complete a test payment
3. Check console logs for webhook processing
4. Verify email is sent to customer

## Troubleshooting

### Common Issues
- **Webhook not triggered**: Check Stripe webhook endpoint URL and events
- **Email not sent**: Verify SMTP configuration and email service setup
- **User not found**: Ensure userId is properly stored in checkout session metadata
- **Template errors**: Check email template syntax and data variables

### Debug Logs
The system logs detailed information for debugging:
- Webhook event processing
- User lookup and validation
- Email sending status
- Subscription updates

## Email Template Variables
The payment confirmation email supports these variables:
- `{{customerName}}` - Customer's name or email prefix
- `{{planName}}` - Purchased plan name (Premium, Enterprise)
- `{{amount}}` - Payment amount in dollars
- `{{billingCycle}}` - Monthly or Yearly
- `{{transactionId}}` - Stripe transaction/session ID
- `{{paymentDate}}` - Date of payment
- `{{nextBillingDate}}` - Next billing date
- `{{isPremium}}` - Boolean for Premium plan features
- `{{isEnterprise}}` - Boolean for Enterprise plan features
- `{{dashboardUrl}}` - Link to dashboard
- `{{billingUrl}}` - Link to billing page
- `{{supportUrl}}` - Link to support page
