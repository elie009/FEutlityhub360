# Custom Finance Loaders

Professional, finance-themed loading components for UtilityHub360.

## Components

### 1. FinanceLoader
An animated, feature-rich loader with rotating gradient rings, pulsing center, and floating icons.

**Features:**
- 3 rotating rings with gradient colors (emerald to blue)
- Pulsing dollar sign center with shimmer effect
- Floating finance icons (TrendingUp, AccountBalance)
- Multiple size options
- Full-screen mode
- Customizable loading text

**Usage:**
```tsx
import { FinanceLoader } from '../components/Common';

// Basic usage
<FinanceLoader />

// With options
<FinanceLoader 
  size="large" 
  text="Loading your data..." 
  fullScreen 
/>
```

**Props:**
- `size?: 'small' | 'medium' | 'large'` - Default: 'medium'
- `text?: string` - Loading text - Default: 'Loading...'
- `fullScreen?: boolean` - Full screen mode - Default: false

---

### 2. SimpleFinanceLoader
A minimalist, lightweight loader with circular progress and dollar sign.

**Features:**
- Circular progress with gradient stroke
- Dollar sign center icon
- Smooth animations
- Minimal footprint
- Optional loading text

**Usage:**
```tsx
import { SimpleFinanceLoader } from '../components/Common';

// Basic usage
<SimpleFinanceLoader />

// With options
<SimpleFinanceLoader 
  size="medium" 
  text="Processing..." 
/>
```

**Props:**
- `size?: 'small' | 'medium' | 'large'` - Default: 'medium'
- `text?: string` - Loading text (optional)

---

## When to Use Each

### FinanceLoader
Use for:
- Full-screen loading states
- Initial app/page load
- Authentication flows
- Major data operations
- When you want a more prominent, eye-catching loader

### SimpleFinanceLoader
Use for:
- Inline loading states
- Card/section loading
- Button loading states
- Quick data fetches
- When you need a subtle, unobtrusive loader

---

## Examples

### Full Screen Authentication
```tsx
if (isLoading) {
  return <FinanceLoader size="large" text="Authenticating..." fullScreen />;
}
```

### Page Loading
```tsx
if (loading && !data) {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
      <SimpleFinanceLoader size="large" text="Loading bills..." />
    </Box>
  );
}
```

### Inline Loading
```tsx
<Box sx={{ textAlign: 'center', py: 4 }}>
  <SimpleFinanceLoader size="small" text="Updating..." />
</Box>
```

### Card Loading State
```tsx
<Card>
  <CardContent>
    {loading ? (
      <SimpleFinanceLoader size="medium" text="Loading data..." />
    ) : (
      // Your content here
    )}
  </CardContent>
</Card>
```

---

## Theme Integration

Both loaders use colors from the application theme:
- Primary: `#10b981` (Emerald Green)
- Secondary: `#3b82f6` (Blue)
- Gradients between primary and secondary colors
- Professional, modern animations

---

## Animations

### FinanceLoader Animations:
- **Rotate**: Outer and inner rings rotate continuously
- **Pulse**: Center icon scales and fades
- **Shimmer**: Light reflection effect across center
- **Coin Flip**: Dollar sign rotates on Y-axis
- **Float**: Accent icons float up and down

### SimpleFinanceLoader Animations:
- **Spin**: Container rotates continuously
- **Dash**: Circular progress animates around the circle

All animations are smooth, GPU-accelerated, and optimized for performance.

---

## Accessibility

- Both loaders use semantic markup
- Clear visual indicators
- Optional descriptive text
- Appropriate ARIA labels can be added

---

## Performance

- Lightweight components
- CSS animations (GPU-accelerated)
- No heavy dependencies
- Optimized re-render performance

---

## Browser Support

Works in all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Demo

View the demo page at `/loader-demo` to see all loader variations and use cases.

