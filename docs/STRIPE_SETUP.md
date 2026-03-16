# Stripe Payment Integration Setup

## Frontend Setup

### 1. Install Dependencies

The Stripe packages have been added to `package.json`. Run:

```bash
npm install
```

This will install:
- `@stripe/stripe-js` - Stripe.js library
- `@stripe/react-stripe-js` - React components for Stripe

### 2. Configure Stripe Publishable Key

Add your Stripe publishable key to your environment variables:

**Create or update `.env` file in the frontend root:**

```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

**For production, use:**
```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key_here
```

### 3. Get Your Stripe Keys

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Developers** → **API keys**
3. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
4. Add it to your `.env` file

## Backend Setup

### 1. Configure Stripe Secret Key

Update `appsettings.Production.json` (or your environment-specific config):

```json
{
  "Stripe": {
    "SecretKey": "sk_live_your_secret_key_here",
    "PublishableKey": "pk_live_your_publishable_key_here",
    "WebhookSecret": "whsec_your_webhook_secret_here"
  }
}
```

### 2. Run Database Migration

Execute the migration script to add Stripe Price ID columns:

```sql
-- Run: Documentation/Database/Scripts/add_stripe_price_ids_to_subscription_plans.sql
```

### 3. Create Products and Prices in Stripe

1. Go to Stripe Dashboard → **Products**
2. Create products for each plan:
   - **Starter Plan** (Free) - No price needed
   - **Professional Plan** (Premium)
   - **Enterprise Plan** (Premium Plus)

3. For each paid product, create two prices:
   - **Monthly Price**: Recurring, monthly billing
   - **Yearly Price**: Recurring, yearly billing

4. Copy the Price IDs (they start with `price_...`)

### 4. Update Database with Price IDs

```sql
UPDATE SubscriptionPlans 
SET StripeMonthlyPriceId = 'price_xxxxx', 
    StripeYearlyPriceId = 'price_yyyyy'
WHERE Name = 'PROFESSIONAL';

UPDATE SubscriptionPlans 
SET StripeMonthlyPriceId = 'price_aaaaa', 
    StripeYearlyPriceId = 'price_bbbbb'
WHERE Name = 'ENTERPRISE';
```

### 5. Configure Webhook

1. In Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set URL: `https://your-domain.com/api/subscriptionpayment/webhook`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** and add to `appsettings.json`

## Testing

### Test Cards

Use these test card numbers in Stripe test mode:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Use any future expiry date, any 3-digit CVC, and any ZIP code.

### Test Flow

1. Click "Upgrade Now" in sidebar
2. Select Premium or Premium Plus plan
3. Enter test card: `4242 4242 4242 4242`
4. Complete payment
5. Subscription should be activated

## Security Notes

- ✅ Publishable key is safe to expose in frontend
- ❌ Never expose secret key in frontend
- ✅ Always use HTTPS in production
- ✅ Verify webhook signatures (already implemented)
- ✅ Store keys in environment variables, not in code

## Troubleshooting

### "Stripe is not defined"
- Make sure `@stripe/stripe-js` is installed
- Check that `REACT_APP_STRIPE_PUBLISHABLE_KEY` is set

### "Payment method creation failed"
- Verify Stripe publishable key is correct
- Check browser console for detailed errors
- Ensure you're using test keys in test mode

### "Subscription creation failed"
- Verify Stripe Price IDs are set in database
- Check backend logs for detailed errors
- Ensure customer was created successfully

### Webhook not working
- Verify webhook URL is accessible
- Check webhook secret matches in appsettings
- View webhook events in Stripe Dashboard

