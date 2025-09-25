# 📋 Billing System - Quick Reference Guide

## 🚀 Getting Started

### Navigation
- **URL**: `/bills`
- **Component**: `src/pages/Bills.tsx`
- **Menu**: Sidebar → Bills

### Key Files
```
src/
├── pages/Bills.tsx              # Main dashboard
├── components/Bills/
│   ├── BillCard.tsx            # Individual bill display
│   └── BillForm.tsx            # Create/Edit form
├── types/bill.ts               # TypeScript interfaces
└── services/
    ├── api.ts                  # API methods
    └── mockBillData.ts         # Mock data
```

## 🎯 Quick Actions

### Create Bill
```typescript
// 1. Click "Add Bill" button
// 2. Fill required fields: name, type, amount, due date, frequency
// 3. Submit form
```

### Update Bill
```typescript
// 1. Click "Update" button on bill card
// 2. Modify fields in form
// 3. Submit changes
```

### Mark as Paid
```typescript
// 1. Click "Mark Paid" button (only for PENDING bills)
// 2. Bill status automatically updates to PAID
```

### Filter Bills
```typescript
// 1. Click "Filters" button
// 2. Select status: PENDING, PAID, OVERDUE
// 3. Select type: utility, subscription, loan, others
```

## 📊 Data Types

### Bill Status
- `PENDING` - Not yet paid
- `PAID` - Payment completed
- `OVERDUE` - Past due date

### Bill Types
- `utility` - Electricity, Water, Gas, Internet
- `subscription` - Netflix, Spotify, Gym
- `loan` - Loan repayments
- `others` - Miscellaneous bills

### Frequencies
- `monthly` - Every month
- `quarterly` - Every 3 months
- `yearly` - Once per year

## 🔧 API Methods

### Core Operations
```typescript
// Get all bills
await apiService.getUserBills(filters?)

// Create bill
await apiService.createBill(billData)

// Update bill
await apiService.updateBill(billId, updateData)

// Delete bill
await apiService.deleteBill(billId)

// Mark as paid
await apiService.markBillAsPaid(billId, notes?)
```

### Analytics
```typescript
// Get summary
await apiService.getBillAnalyticsSummary()

// Get totals
await apiService.getTotalPendingAmount()
await apiService.getTotalPaidAmount(period)
await apiService.getTotalOverdueAmount()
```

## 🎨 UI Components

### BillCard Props
```typescript
interface BillCardProps {
  bill: Bill;
  onEdit: (bill: Bill) => void;
  onDelete: (billId: string) => void;
  onMarkAsPaid: (billId: string) => void;
}
```

### BillForm Props
```typescript
interface BillFormProps {
  open: boolean;
  onClose: () => void;
  bill?: Bill | null;
  onSuccess: (bill: Bill) => void;
}
```

## 🧮 Overdue Detection

### Formula
```typescript
const isOverdue = (dueDate: string): boolean => {
  return new Date(dueDate) < new Date();
};

const isBillOverdue = isOverdue(bill.dueDate) && bill.status === BillStatus.PENDING;
```

### Logic
1. Compare due date with current date
2. Check if bill status is PENDING
3. Show warning if both conditions are true

## 🎨 Styling

### Status Colors
```typescript
PENDING: 'warning' (orange)
PAID: 'success' (green)
OVERDUE: 'error' (red)
```

### Type Colors
```typescript
utility: '#1976d2' (blue)
subscription: '#388e3c' (green)
loan: '#f57c00' (orange)
others: '#7b1fa2' (purple)
```

## 🔍 Common Patterns

### Form Validation
```typescript
const validateForm = (): boolean => {
  if (!formData.billName.trim()) {
    setError('Bill name is required');
    return false;
  }
  if (formData.amount <= 0) {
    setError('Amount must be greater than 0');
    return false;
  }
  return true;
};
```

### Error Handling
```typescript
try {
  const result = await apiService.createBill(data);
  onSuccess(result);
} catch (err: unknown) {
  setError(getErrorMessage(err, 'Failed to create bill'));
}
```

### Loading States
```typescript
const [isLoading, setIsLoading] = useState(false);

// In async function
setIsLoading(true);
try {
  // API call
} finally {
  setIsLoading(false);
}
```

## 🐛 Debugging

### Console Logs
```typescript
console.log('Bill data:', bill);
console.log('Overdue check:', isOverdue(bill.dueDate));
console.log('API response:', response);
```

### Common Issues
1. **Date picker errors** → Use native HTML5 date input
2. **API failures** → Check network and authentication
3. **Form validation** → Verify required fields and formats
4. **Overdue detection** → Check date format and timezone

## 📱 Mobile Considerations

### Responsive Design
- Cards stack vertically on mobile
- Full-width buttons for touch
- Floating action button for quick access
- Optimized form layouts

### Touch Targets
- Minimum 44px button size
- Adequate spacing between elements
- Swipe-friendly card interactions

## 🔄 State Management

### Local State
```typescript
const [bills, setBills] = useState<Bill[]>([]);
const [analytics, setAnalytics] = useState<BillAnalytics | null>(null);
const [filters, setFilters] = useState<BillFilters>({});
```

### State Updates
```typescript
// After successful operations
const refreshData = () => {
  loadBills();
  loadAnalytics();
};
```

## 🎯 Best Practices

### Performance
- Use React.memo for expensive components
- Implement proper dependency arrays
- Optimize re-renders

### UX
- Show loading states
- Provide clear error messages
- Use optimistic updates
- Implement proper validation

### Code Quality
- TypeScript for type safety
- Consistent error handling
- Proper component separation
- Clean, readable code

---

**Quick Access**: Bookmark this guide for fast reference during development!
