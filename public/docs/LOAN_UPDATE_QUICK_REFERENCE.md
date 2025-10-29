# 💰 Loan Principal Update - Quick Reference

## 🚀 Quick Start

### **For Users**

1. Open any loan card → Click "Update" button
2. Toggle **Auto-calculate** checkbox:
   - **ON** (default): Backend calculates monthly payment & remaining balance
   - **OFF**: You manually control all values
3. Update financial values as needed
4. Click "Update Loan"

---

## 🎯 Feature Flags

### **Auto-Calculate ON** ✅ (Recommended)

**What happens:**
- ✅ Update principal/interest rate freely
- ✅ Monthly payment & remaining balance are **disabled**
- ✅ Backend automatically calculates them
- ✅ Payment history is preserved

**Use when:**
- Adjusting loan amount
- Changing interest rate
- Want accurate calculations
- Standard workflow

---

### **Auto-Calculate OFF** ⚙️ (Advanced)

**What happens:**
- ✅ All fields are **enabled**
- ✅ You have full manual control
- ✅ Backend uses your provided values
- ✅ Total amount is still calculated

**Use when:**
- Setting custom monthly payments
- Manually adjusting balances
- Special loan arrangements
- Advanced use cases

---

## 📋 Common Scenarios

### **Scenario 1: Increase Loan Amount**

```
✓ Auto-Calculate: ON
1. Principal: 50,000 → 60,000
2. Click Update
✅ Backend calculates new monthly payment
✅ Backend recalculates remaining balance
```

---

### **Scenario 2: Change Interest Rate**

```
✓ Auto-Calculate: ON
1. Interest Rate: 5.5% → 4.5%
2. Click Update
✅ Backend recalculates monthly payment
✅ Backend recalculates total & remaining
```

---

### **Scenario 3: Both Principal & Rate**

```
✓ Auto-Calculate: ON
1. Principal: 50,000 → 60,000
2. Interest Rate: 5.5% → 4.5%
3. Click Update
✅ Backend recalculates everything
```

---

### **Scenario 4: Custom Monthly Payment**

```
✗ Auto-Calculate: OFF
1. Principal: 50,000 → 60,000
2. Monthly Payment: 1,140 → 1,200
3. Click Update
✅ Backend uses your custom payment
✅ Total = 1,200 × term
```

---

### **Scenario 5: Update Non-Financial Fields**

```
Either mode works:
1. Purpose: "Home" → "Home Renovation"
2. Status: PENDING → APPROVED
3. Click Update
✅ Financial values unchanged
```

---

## 🔍 Visual Indicators

| Indicator | Meaning |
|-----------|---------|
| 🔒 Lock icon | Field is auto-calculated (disabled) |
| 💡 Light bulb | Field is manual (editable) |
| ⭐ Star icon | Key field that triggers calculations |
| ℹ️ Info icon | Important information |
| ✓ Checkmark | Auto-calculate is enabled |

---

## 🎨 UI States

### **State 1: Auto-Calculate Enabled**
```
[✓] Auto-calculate

ℹ️ Auto-Calculate Mode: Monthly payment and 
   remaining balance will be automatically 
   calculated

Principal: [60,000] ⭐
Interest Rate: [5.5] %
Monthly Payment: [1,140.60] 🔒 (disabled)
Remaining Balance: [58,436.00] 🔒 (disabled)
```

### **State 2: Auto-Calculate Disabled**
```
[ ] Auto-calculate

Principal: [60,000] ⭐
Interest Rate: [5.5] %
Monthly Payment: [1,200] 💡 (editable)
Remaining Balance: [66,000] 💡 (editable)
```

---

## 🧮 Calculation Rules

### **When Auto-Calculate is ON:**

```javascript
// Frontend sends:
{
  principal: 60000,
  interestRate: 4.5
}

// Backend calculates:
monthlyPayment = calculatePayment(principal, interestRate, term)
totalAmount = monthlyPayment × term
remainingBalance = totalAmount - paidAmount  // Preserves history!
```

### **When Auto-Calculate is OFF:**

```javascript
// Frontend sends:
{
  principal: 60000,
  monthlyPayment: 1200
}

// Backend calculates:
totalAmount = monthlyPayment × term  // Only this is calculated
remainingBalance = (if provided, use it; else calculate)
```

---

## 🐛 Console Logs

### **What to look for:**

```javascript
📤 Submitting loan update:
🔹 Auto-Calculate Mode: ✅ ENABLED
🔹 Original Loan: { principal: 50000, ... }
🔹 Fields Changed: { principal: 60000 }
🔹 Backend Will Auto-Calculate: {
  monthlyPayment: '✅ YES',
  remainingBalance: '✅ YES'
}

✅ Loan updated successfully!
📊 Backend Response: { principal: 60000, monthlyPayment: 1140.60, ... }
🔄 Changes Applied: {
  principal: '50000 → 60000',
  monthlyPayment: '950.50 → 1140.60 (auto-calculated)',
  ...
}
```

---

## ⚠️ Important Notes

1. **Payment History**: Always preserved, even when principal changes
2. **Total Amount**: Always recalculated by backend
3. **Validation**: Principal must be > 0
4. **Status**: Can update loans in any status (PENDING, ACTIVE, etc.)
5. **Partial Updates**: Only send fields that changed
6. **Refresh**: Loan list auto-refreshes after update

---

## 🎯 Decision Tree

```
Do you need to update the loan?
│
├─ Yes → Is it only Purpose/Status/Info?
│        │
│        ├─ Yes → Either mode works, update normally
│        │
│        └─ No → Are you changing Principal/Interest?
│               │
│               ├─ Yes → Do you want backend to calculate payment?
│               │        │
│               │        ├─ Yes → Keep Auto-Calculate ON ✅
│               │        │
│               │        └─ No → Turn Auto-Calculate OFF,
│               │               set custom values ⚙️
│               │
│               └─ No → Update Monthly Payment/Balance only?
│                      │
│                      └─ Yes → Turn Auto-Calculate OFF ⚙️
│
└─ No → Close the form
```

---

## 🧪 Testing Checklist

### **Basic Tests**
- [ ] Toggle auto-calculate ON/OFF
- [ ] Update principal only
- [ ] Update interest rate only
- [ ] Update both principal and rate
- [ ] Set custom monthly payment (auto-calc OFF)
- [ ] Update non-financial fields only

### **Edge Cases**
- [ ] Loan with existing payments (history preserved)
- [ ] Zero interest rate
- [ ] Very large principal
- [ ] Cancel form (state resets)
- [ ] Multiple rapid updates

### **Visual Tests**
- [ ] Fields disable when auto-calc ON
- [ ] Fields enable when auto-calc OFF
- [ ] Helper text changes
- [ ] Info alert appears/disappears
- [ ] Icons display correctly

---

## 📞 Troubleshooting

### **Problem: Fields are disabled and I can't edit them**

**Solution:** Uncheck the "Auto-calculate" checkbox

---

### **Problem: Backend is calculating when I don't want it to**

**Solution:** Turn Auto-Calculate OFF before making changes

---

### **Problem: My custom monthly payment was overridden**

**Solution:** Make sure Auto-Calculate is OFF when setting custom values

---

### **Problem: Remaining balance doesn't match what I expect**

**Reason:** Backend preserves payment history
**Check:** Compare totalAmount - paidAmount = remainingBalance

---

### **Problem: Console shows errors**

**Common causes:**
- Principal <= 0
- Invalid number format
- Network error
- Validation failure

**Solution:** Check console logs for specific error message

---

## 💡 Pro Tips

1. **Default Mode**: Form always opens with Auto-Calculate ON
2. **Quick Updates**: Keep auto-calc ON for standard updates
3. **Complex Scenarios**: Turn auto-calc OFF for full control
4. **Verify Changes**: Check console logs to confirm calculations
5. **Payment History**: Always preserved automatically
6. **Refresh**: List auto-refreshes, no need to reload page

---

## 📚 Related Documentation

- **Backend Guide**: See main documentation for backend calculation formulas
- **API Reference**: `PUT /api/Loans/{loanId}`
- **Component**: `src/components/Loans/LoanUpdateForm.tsx`
- **Full Documentation**: `LOAN_PRINCIPAL_UPDATE_FEATURE.md`
- **Comparison**: `docs/LOAN_UPDATE_FEATURE_COMPARISON.md`

---

## 🎓 Examples

### **Example 1: Simple Principal Update**

```typescript
// User Action:
1. Open loan update form
2. Auto-calculate: ✓ ON (default)
3. Change Principal: 50000 → 60000
4. Click Update

// Result:
✅ Principal updated to 60,000
✅ Monthly payment recalculated
✅ Total amount recalculated
✅ Remaining balance adjusted (history preserved)
```

### **Example 2: Custom Payment Setup**

```typescript
// User Action:
1. Open loan update form
2. Auto-calculate: ✗ Turn OFF
3. Change Principal: 50000 → 60000
4. Change Monthly Payment: 950 → 1200
5. Click Update

// Result:
✅ Principal updated to 60,000
✅ Monthly payment set to 1,200 (your custom value)
✅ Total amount = 1,200 × term
✅ Remaining balance adjusted
```

---

## 🔗 Quick Links

| Link | Description |
|------|-------------|
| [API Endpoints](../docs/API_ENDPOINTS.md) | Backend API reference |
| [Loan Types](../src/types/loan.ts) | TypeScript type definitions |
| [API Service](../src/services/api.ts) | Frontend API client |
| [Loan Dashboard](../src/components/Loans/LoanDashboard.tsx) | Main loan dashboard |

---

**Last Updated:** 2025-10-09  
**Version:** 2.0  
**Status:** ✅ Production Ready

