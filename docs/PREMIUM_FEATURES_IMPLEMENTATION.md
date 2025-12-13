# Premium Features Implementation Guide

## Overview
This document describes how premium feature restrictions have been implemented in UtilityHub360.

## Backend Implementation

### Controllers with Subscription Checks

1. **ChatController** (`/api/chat`)
   - `POST /message` - Checks `AI_ASSISTANT` feature
   - `POST /upload-receipt` - Checks `RECEIPT_OCR` feature
   - `POST /generate-report` - Checks `ADVANCED_REPORTS` feature

2. **ReceiptsController** (`/api/receipts`)
   - `POST /upload` - Checks `RECEIPT_OCR` feature
   - `POST /{receiptId}/process-ocr` - Checks `RECEIPT_OCR` feature

3. **ReconciliationController** (`/api/reconciliation`)
   - `POST /statements/extract` - Checks `BANK_FEED` feature
   - `POST /statements/analyze-pdf` - Checks `BANK_FEED` feature

4. **BillsController** (`/api/bills`)
   - `POST /` - Checks `BILLS` limit before creating

5. **BankAccountsController** (`/api/bankaccounts`)
   - `POST /` - Checks `BANK_ACCOUNTS` limit before creating

### Error Messages
All premium feature restrictions return user-friendly error messages:
- "AI Assistant is a Premium feature. Please upgrade to Premium to access this feature."
- "Receipt OCR is a Premium feature. Please upgrade to Premium to access this feature."
- "Bank Feed Integration is a Premium feature. Please upgrade to Premium to access this feature."
- "Advanced Reports is a Premium feature. Please upgrade to Premium to access this feature."
- "You have reached your monthly bill limit. Please upgrade to Premium for unlimited bills."
- "You have reached your bank account limit. Please upgrade to Premium for unlimited bank accounts."

## Frontend Implementation

### Hooks

#### `usePremiumFeature(feature: string)`
Hook to check if user has access to a premium feature.

**Usage:**
```typescript
import { usePremiumFeature } from '../hooks/usePremiumFeature';

function MyComponent() {
  const { hasAccess, loading, error } = usePremiumFeature('AI_ASSISTANT');
  
  if (loading) return <Loading />;
  if (!hasAccess) return <UpgradePrompt featureName="AI Assistant" />;
  
  return <AIAssistantComponent />;
}
```

#### `useSubscription()`
Hook to get user's subscription information.

**Usage:**
```typescript
import { useSubscription } from '../hooks/usePremiumFeature';

function MyComponent() {
  const { subscription, isPremium, loading } = useSubscription();
  
  if (loading) return <Loading />;
  if (!isPremium) return <UpgradePrompt />;
  
  return <PremiumFeature />;
}
```

### Components

#### `UpgradePrompt`
Component to display upgrade prompt when user tries to access premium features.

**Props:**
- `open: boolean` - Controls dialog visibility
- `onClose: () => void` - Callback when dialog is closed
- `featureName: string` - Name of the premium feature
- `featureDescription?: string` - Optional description
- `premiumFeatures?: string[]` - Optional list of premium features to display

**Usage:**
```typescript
import UpgradePrompt from '../components/Subscription/UpgradePrompt';

function MyComponent() {
  const [showUpgrade, setShowUpgrade] = useState(false);
  
  return (
    <>
      <Button onClick={() => setShowUpgrade(true)}>
        Use Premium Feature
      </Button>
      <UpgradePrompt
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        featureName="AI Assistant"
        featureDescription="Get instant financial advice from our AI assistant"
      />
    </>
  );
}
```

## Premium Features List

### Features Requiring Premium Subscription:

1. **AI Assistant** (`AI_ASSISTANT`)
   - Chat with AI for financial advice
   - Generate financial reports
   - Budget suggestions

2. **Bank Feed Integration** (`BANK_FEED`)
   - Extract transactions from bank statements
   - AI-powered PDF analysis
   - Automatic transaction import

3. **Receipt OCR** (`RECEIPT_OCR`)
   - Upload and process receipts
   - Extract transaction data from receipts
   - Link receipts to expenses

4. **Advanced Reports** (`ADVANCED_REPORTS`)
   - Generate detailed financial reports
   - Custom report builder
   - Export to Excel/CSV

5. **Unlimited Limits** (Premium Plans)
   - Unlimited bank accounts (Free: 3 max)
   - Unlimited transactions (Free: 1,000/month)
   - Unlimited bills (Free: 5/month)
   - Unlimited loans (Free: 5 max)
   - Unlimited savings goals (Free: 5 max)

## Testing Premium Features

### Backend Testing
1. Test with free user account - should receive error messages
2. Test with premium user account - should have full access
3. Test limit enforcement - create items up to limit, then try to exceed

### Frontend Testing
1. Test upgrade prompts appear for free users
2. Test premium features are accessible for premium users
3. Test loading states during feature checks
4. Test error handling when API calls fail

## Future Enhancements

1. Add usage tracking dashboard
2. Add feature-specific upgrade prompts
3. Add trial period support
4. Add feature usage analytics
5. Add grace period for expired subscriptions

