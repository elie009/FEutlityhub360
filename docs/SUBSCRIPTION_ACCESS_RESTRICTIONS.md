# Frontend Subscription Access Restrictions Guide

> **📚 Complete Documentation**: See the backend documentation at `utlityhub360-backend/UtilityHub360/Documentation/SUBSCRIPTION_ACCESS_RESTRICTIONS.md` for full implementation details, API reference, and backend examples.

## Overview

This guide explains how to implement subscription-based access restrictions in the frontend React application.

## Quick Start

### 1. Check Feature Access

```typescript
import { usePremiumFeature } from '../hooks/usePremiumFeature';

const MyComponent: React.FC = () => {
  const { hasAccess, loading } = usePremiumFeature('BILL_FORECASTING');
  
  if (loading) return <Loading />;
  if (!hasAccess) return <UpgradePrompt />;
  
  return <FeatureComponent />;
};
```

### 2. Check Subscription Tier

```typescript
import { useSubscription } from '../hooks/usePremiumFeature';

const MyComponent: React.FC = () => {
  const { isPremium, isEnterprise, isFree } = useSubscription();
  
  if (isFree) return <FreeTierView />;
  if (isPremium && !isEnterprise) return <PremiumTierView />;
  if (isEnterprise) return <EnterpriseTierView />;
};
```

## Feature Matrix

| Feature | Free | Premium | Premium Plus |
|---------|------|---------|--------------|
| Dashboard | ✅ | ✅ | ✅ |
| Bank Accounts | 3 max | Unlimited | Unlimited |
| Transactions | Unlimited | Unlimited | Unlimited |
| Bills | 5 max | Unlimited | Unlimited |
| Loans | 5 max | Unlimited | Unlimited |
| Savings Goals | 5 max | Unlimited | Unlimited |
| Basic Reports | ✅ | ✅ | ✅ |
| Advanced Reports | ❌ | ✅ | ✅ |
| AI Assistant | 10 queries/mo | Unlimited | Unlimited |
| Bank Feeds | ❌ | ✅ | ✅ |
| Receipt OCR | ❌ | ✅ | ✅ |
| Financial Health Score | ❌ | ✅ | ✅ |
| Bill Forecasting | ❌ | ✅ | ✅ |
| Debt Optimizer | ❌ | ✅ | ✅ |
| Investment Tracking | ❌ | ❌ | ✅ |
| Tax Optimization | ❌ | ❌ | ✅ |
| Multi-User Support | ❌ | ❌ | ✅ |
| API Access | ❌ | ❌ | ✅ |
| White-Label | ❌ | ❌ | ✅ |
| Support | Email (48h) | Priority (24h) | Dedicated (4h) |

## Available Features

### Premium Features (PROFESSIONAL tier)
- `ADVANCED_REPORTS`
- `AI_ASSISTANT` (10 queries/month for Free, unlimited for Premium)
- `BANK_FEED`
- `RECEIPT_OCR`
- `FINANCIAL_HEALTH_SCORE`
- `BILL_FORECASTING`
- `DEBT_OPTIMIZER`

### Enterprise Features (ENTERPRISE tier only)
- `INVESTMENT_TRACKING`
- `TAX_OPTIMIZATION`
- `MULTI_USER`
- `API_ACCESS`
- `WHITE_LABEL`

## Component Patterns

### Pattern 1: Conditional Rendering

```typescript
const BillForecastPage: React.FC = () => {
  const { hasAccess, loading } = usePremiumFeature('BILL_FORECASTING');
  const [showUpgrade, setShowUpgrade] = useState(false);
  
  if (loading) return <Loading />;
  
  if (!hasAccess) {
    return (
      <>
        <UpgradePrompt
          open={showUpgrade}
          onClose={() => setShowUpgrade(false)}
          featureName="Bill Forecasting"
        />
        <Alert severity="info">
          This feature requires Premium subscription.
          <Button onClick={() => setShowUpgrade(true)}>Upgrade Now</Button>
        </Alert>
      </>
    );
  }
  
  return <BillForecastComponent />;
};
```

### Pattern 2: Hide Feature

```typescript
const Sidebar: React.FC = () => {
  const { hasAccess: hasForecast } = usePremiumFeature('BILL_FORECASTING');
  const { hasAccess: hasInvestment } = usePremiumFeature('INVESTMENT_TRACKING');
  
  return (
    <List>
      <MenuItem>Dashboard</MenuItem>
      {hasForecast && <MenuItem>Bill Forecasting</MenuItem>}
      {hasInvestment && <MenuItem>Investment Tracking</MenuItem>}
    </List>
  );
};
```

### Pattern 3: Disable Feature

```typescript
const MyComponent: React.FC = () => {
  const { hasAccess } = usePremiumFeature('ADVANCED_REPORTS');
  const [showUpgrade, setShowUpgrade] = useState(false);
  
  return (
    <>
      <Button
        disabled={!hasAccess}
        onClick={() => {
          if (!hasAccess) {
            setShowUpgrade(true);
          } else {
            handleAdvancedReport();
          }
        }}
      >
        Generate Advanced Report
      </Button>
      <UpgradePrompt
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        featureName="Advanced Reports"
      />
    </>
  );
};
```

## Upgrade Prompt Component

```typescript
import UpgradePrompt from '../components/Subscription/UpgradePrompt';

<UpgradePrompt
  open={showUpgrade}
  onClose={() => setShowUpgrade(false)}
  featureName="Feature Name"
  featureDescription="Description of what the feature does"
  premiumFeatures={[
    'Feature Name',
    'Other Premium Feature',
    'Another Feature'
  ]}
/>
```

## Menu Item Filtering

```typescript
const menuItems = [
  { text: 'Dashboard', path: '/', tier: 'all' },
  { text: 'Bill Forecasting', path: '/forecast', tier: 'premium' },
  { text: 'Investment Tracking', path: '/investments', tier: 'enterprise' },
];

const Sidebar: React.FC = () => {
  const { isPremium, isEnterprise } = useSubscription();
  
  const visibleItems = menuItems.filter(item => {
    if (item.tier === 'enterprise' && !isEnterprise) return false;
    if (item.tier === 'premium' && !isPremium) return false;
    return true;
  });
  
  return (
    <List>
      {visibleItems.map(item => (
        <MenuItem key={item.path}>{item.text}</MenuItem>
      ))}
    </List>
  );
};
```

## Error Handling

```typescript
const MyComponent: React.FC = () => {
  const { hasAccess, error } = usePremiumFeature('FEATURE_NAME');
  
  if (error) {
    return (
      <Alert severity="error">
        Failed to check feature access: {error}
      </Alert>
    );
  }
  
  // ... rest of component
};
```

## Best Practices

1. **Always Check Before Rendering**: Don't assume users have access
2. **Show Loading States**: Use loading indicators while checking access
3. **User-Friendly Messages**: Provide clear upgrade prompts
4. **Hide vs Disable**: Hide features when possible, disable when needed
5. **Consistent Patterns**: Use the same patterns across components

## Examples

See the following components for reference:
- `src/components/Subscription/UpgradePrompt.tsx`
- `src/pages/Analytics.tsx` (Advanced Reports)
- `src/pages/Bills.tsx` (Bill Forecasting)

