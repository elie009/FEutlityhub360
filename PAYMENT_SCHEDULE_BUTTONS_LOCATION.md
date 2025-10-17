# Payment Schedule Buttons Location Guide

## 🎯 **Where to Find All Buttons**

### **Location 1: Update Loan Modal → Payment Schedule Tab**

**File**: `src/components/Loans/RepaymentScheduleManager.tsx`

#### **✅ Buttons Added:**

#### 1. **"Add Schedule" Button** (Top Right)
```
┌─────────────────────────────────────────────┐
│  Repayment Schedule          [+ Add Schedule] │
└─────────────────────────────────────────────┘
```

**Location**: Line 301-308  
**Function**: Opens `AddScheduleDialog` with 3 tabs:
- Add Custom Installments
- Extend Loan Term
- Regenerate Schedule

**Code**:
```typescript
<Button
  variant="contained"
  startIcon={<Add />}
  onClick={() => setAddDialogOpen(true)}
>
  Add Schedule
</Button>
```

---

#### 2. **Action Buttons in Table (Each Row)**

```
┌──────────────────────────────────────────────────────────────────────┐
│  #  │ Due Date │ Principal │ Interest │ Total │ Status │    Actions    │
├──────────────────────────────────────────────────────────────────────┤
│  1  │ 01/15/24 │  $650.00  │ $175.00  │ $825  │ PENDING│ [✏️] [💰] [🗑️] │
│  2  │ 02/15/24 │  $660.00  │ $165.00  │ $825  │ PAID   │       -       │
│  3  │ 03/15/24 │  $670.00  │ $155.00  │ $825  │ PENDING│ [✏️] [💰] [🗑️] │
└──────────────────────────────────────────────────────────────────────┘
```

**Buttons in Actions Column** (Lines 389-428):

##### **[✏️] Edit Due Date** (Blue/Primary)
- **Shows for**: PENDING, OVERDUE installments
- **Hidden for**: PAID installments
- **Tooltip**: "Edit due date"
- **Function**: `handleEditClick(item)` → Opens edit dialog
- **Line**: 391-401

##### **[💰] Mark as Paid** (Green/Success)
- **Shows for**: PENDING, OVERDUE installments
- **Hidden for**: PAID, PARTIAL installments
- **Tooltip**: "Mark as paid"
- **Function**: `handleMarkAsPaidClick(item)` → Opens payment dialog
- **Line**: 404-414

##### **[🗑️] Delete** (Red/Error)
- **Shows for**: PENDING, OVERDUE, PARTIAL installments
- **Hidden for**: PAID installments
- **Tooltip**: "Delete installment"
- **Function**: `handleDeleteClick(item)` → Confirms & deletes
- **Line**: 417-427

---

### **Location 2: Loan Details → Repayment Schedule Tab**

**File**: `src/components/Loans/LoanDetails.tsx`

#### **✅ Buttons Added:**

#### 1. **"Add Schedule" Button** (Top Right)
**Location**: Line 451-459  
**Same functionality** as above

#### 2. **"⋮" More Actions Menu** (Each Row)
**Location**: Lines 478-485  
**Menu Options**: Update Schedule, Mark as Paid, Update Due Date, Delete

---

## 📍 **Complete Button Matrix**

### **In Update Loan Modal → Payment Schedule Tab**

| Button | Icon | Color | When Visible | Action |
|--------|------|-------|--------------|--------|
| **Add Schedule** | + | Primary (Blue) | Always | Open add dialog |
| **Edit Due Date** | ✏️ | Primary (Blue) | Not PAID | Edit due date dialog |
| **Mark as Paid** | 💰 | Success (Green) | PENDING/OVERDUE | Payment details dialog |
| **Delete** | 🗑️ | Error (Red) | Not PAID | Confirm & delete |

### **Business Rules**

#### **Edit Due Date Button**
- ✅ Shows for: PENDING, OVERDUE
- ❌ Hidden for: PAID
- **Why**: Paid installments shouldn't have dates changed

#### **Mark as Paid Button**
- ✅ Shows for: PENDING, OVERDUE
- ❌ Hidden for: PAID, PARTIAL
- **Why**: Only unpaid installments can be marked as paid

#### **Delete Button**
- ✅ Shows for: PENDING, OVERDUE, PARTIAL
- ❌ Hidden for: PAID
- **Why**: Cannot delete paid installments (API restriction)

---

## 🎮 **How to Use**

### **In Update Loan Modal:**

1. **Open Loan Dashboard** → Click **Edit** button on any loan
2. **Click "Payment Schedule" tab** in the dialog
3. **You'll see**:
   - Payment schedule table
   - "Add Schedule" button (top right)
   - Action buttons on each row

### **Add Schedule:**
1. Click **"Add Schedule"** button
2. Select tab:
   - **Add Custom Installments**: Insert specific months
   - **Extend Term**: Add months to end
   - **Regenerate**: Replace entire schedule
3. Fill form and submit

### **Mark as Paid:**
1. Find the PENDING/OVERDUE installment
2. Click the **green 💰 icon**
3. Fill in payment details:
   - Payment amount
   - Payment method
   - Payment reference
   - Payment date
   - Notes (optional)
4. Click **"Mark as Paid"**

### **Delete Installment:**
1. Find the PENDING/OVERDUE installment
2. Click the **red 🗑️ icon**
3. Confirm deletion
4. Installment removed and loan totals updated

### **Edit Due Date:**
1. Find the PENDING/OVERDUE installment
2. Click the **blue ✏️ icon**
3. Select new due date
4. Click **"Update"**

---

## 💻 **Function Reference**

### **In RepaymentScheduleManager.tsx**

```typescript
// ADD FUNCTIONS
setAddDialogOpen(true)           // Line 304 - Opens add dialog

// UPDATE FUNCTIONS  
handleMarkAsPaidClick(item)      // Line 169-175 - Opens mark as paid dialog
handleEditClick(item)            // Line 117-129 - Opens edit due date dialog

// DELETE FUNCTION
handleDeleteClick(item)          // Line 177-218 - Deletes with confirmation

// SUCCESS/ERROR HANDLERS
handleScheduleSuccess(message)   // Line 220-227 - Shows success message
handleScheduleError(message)     // Line 229-235 - Shows error message
handleScheduleUpdate(schedule)   // Line 237-239 - Updates schedule state
```

### **API Calls Made**

```typescript
// Called from handlers
apiService.deletePaymentInstallment(loanId, installmentNumber)  // Line 193
apiService.markInstallmentAsPaid(loanId, installmentNumber, data) // Via UpdateScheduleDialog
apiService.addCustomPaymentSchedule(loanId, data)  // Via AddScheduleDialog
apiService.updateScheduleDueDate(loanId, installmentNumber, date) // Line 141
```

---

## 🎨 **Visual Layout**

### **Update Loan Modal Structure:**

```
┌──────────────────────────────────────────────────────┐
│  Update Loan #ABCD1234                               │
│  ┌────────────────┬──────────────────────┐          │
│  │ Update Loan    │  Payment Schedule 📅 │          │
│  └────────────────┴──────────────────────┘          │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Repayment Schedule            [+ Add Schedule]      │
│  ┌──────────────────────────────────────────────┐   │
│  │  # │ Due Date │ ... │ Status │   Actions     │   │
│  ├────────────────────────────────────────────────┤   │
│  │ 1  │ 01/15/24 │ ... │ PENDING│ [✏️] [💰] [🗑️] │   │
│  │ 2  │ 02/15/24 │ ... │ PAID   │      -        │   │
│  │ 3  │ 03/15/24 │ ... │ OVERDUE│ [✏️] [💰] [🗑️] │   │
│  └──────────────────────────────────────────────┘   │
│                                                       │
├──────────────────────────────────────────────────────┤
│                               [Close]                 │
└──────────────────────────────────────────────────────┘
```

### **Button Icons:**
- **✏️** = Edit Due Date (EditIcon)
- **💰** = Mark as Paid (PaymentIcon)  
- **🗑️** = Delete (Delete icon)
- **+** = Add Schedule (Add icon)

---

## 📊 **Button Visibility Matrix**

| Installment Status | Edit ✏️ | Mark Paid 💰 | Delete 🗑️ |
|-------------------|---------|--------------|-----------|
| **PENDING** | ✅ Yes | ✅ Yes | ✅ Yes |
| **OVERDUE** | ✅ Yes | ✅ Yes | ✅ Yes |
| **PARTIAL** | ✅ Yes | ❌ No | ✅ Yes |
| **PAID** | ❌ No | ❌ No | ❌ No |

---

## 🔧 **Testing Checklist**

### **Test Add Schedule Button:**
- [ ] Button appears at top right
- [ ] Opens dialog with 3 tabs
- [ ] Can add custom installments
- [ ] Can extend loan term
- [ ] Can regenerate schedule
- [ ] Success message appears

### **Test Mark as Paid Button:**
- [ ] Green button appears for PENDING installments
- [ ] Green button appears for OVERDUE installments
- [ ] Button hidden for PAID installments
- [ ] Opens payment details dialog
- [ ] Can enter payment information
- [ ] Installment status updates to PAID
- [ ] Success message appears

### **Test Delete Button:**
- [ ] Red button appears for PENDING installments
- [ ] Red button appears for OVERDUE installments
- [ ] Button hidden for PAID installments
- [ ] Confirmation dialog appears
- [ ] Installment deleted from table
- [ ] Success message appears
- [ ] Cannot delete PAID installments

### **Test Edit Due Date Button:**
- [ ] Blue button appears for PENDING installments
- [ ] Button hidden for PAID installments
- [ ] Opens edit dialog
- [ ] Can change due date
- [ ] Due date updates in table
- [ ] Success message appears

---

## 🎉 **Summary**

✅ **Add Schedule button** - Added to top of payment schedule table  
✅ **Mark as Paid button** - Added to Actions column (green icon)  
✅ **Delete button** - Added to Actions column (red icon)  
✅ **Edit Due Date button** - Already exists (blue icon)  

**All buttons are now available in the Update Loan Modal → Payment Schedule Tab!**

---

**Last Updated**: October 12, 2025  
**Status**: ✅ Complete  
**Location**: Update Loan Modal → Payment Schedule Tab
