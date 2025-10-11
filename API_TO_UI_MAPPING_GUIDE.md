# 📊 API to UI Mapping Guide - Bill History

## 🎯 How Your API Response Maps to the UI

This guide shows exactly how the data from your backend API (`GET /api/bills/analytics/history`) is displayed in the frontend.

---

## 📡 **API Response Structure**

```json
GET /api/bills/analytics/history?provider=Meralco&billType=utility&months=6

Response:
{
  "success": true,
  "data": {
    "bills": [...],           // Array of bills
    "analytics": {...},       // Summary statistics
    "forecast": {...},        // Next month prediction
    "totalCount": 6           // Total number of bills
  }
}
```

---

## 🗺️ **Complete Data Mapping**

### **1. Bills Array → Bill History Table**

```json
API Response:
{
  "bills": [
    {
      "id": "bill-123",
      "billName": "Electricity Bill - October",
      "provider": "Meralco",
      "amount": 3050.00,
      "dueDate": "2025-10-10T00:00:00Z",
      "status": "PENDING",
      "createdAt": "2025-10-01T00:00:00Z",
      "paidAt": null
    },
    {
      "id": "bill-456",
      "billName": "Electricity Bill - September",
      "provider": "Meralco",
      "amount": 2640.00,
      "dueDate": "2025-09-10T00:00:00Z",
      "status": "PAID",
      "createdAt": "2025-09-01T00:00:00Z",
      "paidAt": "2025-09-09T00:00:00Z"
    }
  ]
}
```

**UI Display (BillHistoryTable):**

```
┌────────────────────────────────────────────────────────────┐
│ 📜 Bill History                                            │
├────────────────────────────────────────────────────────────┤
│ Month    │ Amount  │ Estimated │ Variance │ Status │ Paid │
├──────────┼─────────┼───────────┼──────────┼────────┼──────┤
│ Oct 2025 │ ₱3,050 │ ₱2,989   │ +2.04%↗️ │Pending │ —    │
│ ↑        │ ↑       │           │          │ ↑      │      │
│ dueDate  │ amount  │           │          │ status │      │
│          │         │           │          │        │      │
│ Sep 2025 │ ₱2,640 │ ₱2,913   │ -9.37%↘️ │Paid ✓ │ 9/9  │
│          │         │           │          │        │ ↑    │
│          │         │           │          │        │paidAt│
└──────────┴─────────┴───────────┴──────────┴────────┴──────┘
```

**Mapping:**
- `dueDate` → **Month column** (formatted as "Oct 2025")
- `amount` → **Amount column** (formatted as ₱3,050)
- `status` → **Status column** (chip with color)
- `paidAt` → **Paid Date column** (formatted date or "—")

---

### **2. Analytics Object → Analytics Summary Cards**

```json
API Response:
{
  "analytics": {
    "averageSimple": 2903.33,
    "averageWeighted": 2989.00,
    "totalSpent": 17190.00,
    "highestBill": 3200.00,
    "lowestBill": 2450.00,
    "trend": "increasing",
    "billCount": 6,
    "firstBillDate": "2025-05-01T00:00:00Z",
    "lastBillDate": "2025-10-01T00:00:00Z"
  }
}
```

**UI Display (Analytics Summary Cards):**

```
┌──────────────┬───────────────┬──────────────┬──────────────┐
│ Total Spent  │ Avg/Month     │ Highest Bill │ Lowest Bill  │
├──────────────┼───────────────┼──────────────┼──────────────┤
│ ₱17,190     │ ₱2,989       │ ₱3,200      │ ₱2,450      │
│      ↑       │      ↑        │      ↑       │      ↑       │
│ totalSpent   │averageWeighted│ highestBill  │ lowestBill   │
│              │               │              │              │
│ Last 6 months│ Weighted avg  │ Peak amount  │ Min amount   │
│      ↑       │               │              │              │
│  billCount   │               │              │              │
└──────────────┴───────────────┴──────────────┴──────────────┘
```

**Mapping:**
- `totalSpent` → **Total Spent card** (₱17,190)
- `averageWeighted` → **Monthly Average card** (₱2,989)
- `highestBill` → **Highest Bill card** (₱3,200)
- `lowestBill` → **Lowest Bill card** (₱2,450)
- `billCount` → **Count display** (6 months)
- `trend` → **Trend indicator** (↗️ Increasing)

---

### **3. Forecast Object → Forecast Widget**

```json
API Response:
{
  "forecast": {
    "estimatedAmount": 2989.00,
    "calculationMethod": "weighted",
    "confidence": "medium"
  }
}
```

**UI Display (ForecastWidget):**

```
┌──────────────────────────────────────┐
│ 🔮 Forecast & Analysis               │
├──────────────────────────────────────┤
│ Estimated Next Bill                  │
│                                      │
│       ₱2,989                        │
│          ↑                           │
│   estimatedAmount                    │
│                                      │
│ [Confidence: medium] [Weighted Avg]  │
│         ↑                   ↑        │
│    confidence        calculationMethod│
│                                      │
│ 💡 Tip: Based on your history,      │
│    expect around ₱2,989              │
└──────────────────────────────────────┘
```

**Mapping:**
- `estimatedAmount` → **Main forecast display** (₱2,989)
- `calculationMethod` → **Method chip** ("Weighted Average")
- `confidence` → **Confidence chip** (Medium)

---

### **4. Bills Array → Trend Chart**

```json
API Response:
{
  "bills": [
    { "dueDate": "2025-10-10", "amount": 3050 },
    { "dueDate": "2025-09-10", "amount": 2640 },
    { "dueDate": "2025-08-10", "amount": 2870 },
    // ... more bills
  ]
}
```

**UI Display (TrendChart):**

```
┌──────────────────────────────────────────────┐
│ 📈 6-Month Billing Trend                     │
├──────────────────────────────────────────────┤
│ ₱3,500 │                     ●  ← Oct (3050)│
│        │                                     │
│ ₱3,000 │         ●               ●          │
│        │             ●       ●              │
│ ₱2,500 │     ●                              │
│        │      ↑                              │
│        │  May (2450)                         │
│        └─────────────────────────────────    │
│         May  Jun  Jul  Aug  Sep  Oct        │
│              ↑    ↑    ↑    ↑    ↑    ↑     │
│          dueDate (formatted)                 │
└──────────────────────────────────────────────┘
```

**Mapping:**
- Each bill → Data point on chart
- `dueDate` → X-axis (month label)
- `amount` → Y-axis (height of point)
- `averageWeighted` → Reference line (dashed)

---

## 📊 **Complete Page Mapping**

### **Bill Details Page Structure:**

```
╔════════════════════════════════════════════════════════╗
║ /bills/Meralco/utility                                 ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║ 1️⃣ HEADER                                             ║
║    Provider: "Meralco" ← provider param               ║
║    Type: "utility Bills" ← billType param             ║
║    Count: "6 months" ← analytics.billCount            ║
║                                                        ║
║ 2️⃣ ANALYTICS SUMMARY                                  ║
║    ┌────────────────────────────────────────────┐    ║
║    │ Total: ₱17,190 ← analytics.totalSpent     │    ║
║    │ Avg: ₱2,989 ← analytics.averageWeighted   │    ║
║    │ High: ₱3,200 ← analytics.highestBill      │    ║
║    │ Low: ₱2,450 ← analytics.lowestBill        │    ║
║    └────────────────────────────────────────────┘    ║
║                                                        ║
║ 3️⃣ TREND CHART                                        ║
║    Data: bills[] array                                 ║
║    Average Line: analytics.averageWeighted             ║
║    Trend: analytics.trend ("increasing")               ║
║                                                        ║
║ 4️⃣ BILL HISTORY TABLE                                 ║
║    Rows: bills[] array                                 ║
║    Sortable: Yes                                       ║
║    Shows: All fields from bills                        ║
║                                                        ║
║ 5️⃣ FORECAST WIDGET (Sidebar)                          ║
║    Amount: forecast.estimatedAmount (₱2,989)          ║
║    Method: forecast.calculationMethod ("weighted")     ║
║    Confidence: forecast.confidence ("medium")          ║
║                                                        ║
║ 6️⃣ BUDGET TRACKER (Sidebar)                           ║
║    Separate API call: /bills/budgets/status            ║
║                                                        ║
║ 7️⃣ TREND ANALYSIS (Sidebar)                           ║
║    Trend: analytics.trend                              ║
║    Simple Avg: analytics.averageSimple                 ║
║    Seasonal Avg: analytics.averageSeasonal             ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

---

## 🔄 **Data Flow Diagram**

```
USER ACTION:
Click "Meralco" in Provider Quick Links
   ↓
FRONTEND:
Navigate to /bills/Meralco/utility
   ↓
REACT COMPONENT:
BillDetails.tsx useEffect runs
   ↓
API CALL:
GET /api/bills/analytics/history?provider=Meralco&billType=utility&months=12
   ↓
BACKEND RESPONSE:
{
  bills: [...],
  analytics: {...},
  forecast: {...},
  totalCount: 6
}
   ↓
FRONTEND STATE:
setHistoryData(response.data)
   ↓
COMPONENTS RENDER:
├─ Analytics Summary (uses analytics.*)
├─ Trend Chart (uses bills[])
├─ Bill History Table (uses bills[])
├─ Forecast Widget (uses forecast.*)
└─ Trend Analysis (uses analytics.trend)
   ↓
USER SEES:
Complete bill history with all data! ✅
```

---

## 🎨 **Field-by-Field Mapping**

### **Bills Array Fields:**

| API Field | Type | UI Location | UI Component | Format |
|-----------|------|-------------|--------------|--------|
| `id` | string | Table row key | BillHistoryTable | Hidden |
| `billName` | string | Not displayed in table | — | — |
| `provider` | string | Page header | BillDetails | Text |
| `amount` | number | Amount column | BillHistoryTable | ₱3,050 |
| `dueDate` | string | Month column | BillHistoryTable | Oct 2025 |
| `status` | string | Status column | BillHistoryTable | Chip (colored) |
| `createdAt` | string | Metadata | — | Hidden |
| `paidAt` | string | Paid Date column | BillHistoryTable | Sep 9 or "—" |

### **Analytics Fields:**

| API Field | Type | UI Location | UI Component | Format |
|-----------|------|-------------|--------------|--------|
| `averageSimple` | number | Trend Analysis card | BillDetails | ₱2,903 |
| `averageWeighted` | number | Analytics Summary | BillDetails | ₱2,989 |
| `averageSeasonal` | number | Trend Analysis card | BillDetails | Optional |
| `totalSpent` | number | Analytics Summary | BillDetails | ₱17,190 |
| `highestBill` | number | Analytics Summary | BillDetails | ₱3,200 |
| `lowestBill` | number | Analytics Summary | BillDetails | ₱2,450 |
| `trend` | string | Multiple places | Multiple | ↗️/↘️/➡️ |
| `billCount` | number | Header, cards | BillDetails | "6 months" |
| `firstBillDate` | string | Not displayed | — | Optional |
| `lastBillDate` | string | Not displayed | — | Optional |

### **Forecast Fields:**

| API Field | Type | UI Location | UI Component | Format |
|-----------|------|-------------|--------------|--------|
| `estimatedAmount` | number | Main display | ForecastWidget | ₱2,989 |
| `calculationMethod` | string | Method chip | ForecastWidget | "Weighted Average" |
| `confidence` | string | Confidence chip | ForecastWidget | "Medium" |

---

## 🎯 **Example: Complete Data Flow**

### **Your API Returns:**

```json
{
  "success": true,
  "data": {
    "bills": [
      {
        "id": "bill-001",
        "billName": "Electricity Bill - October",
        "provider": "Meralco",
        "amount": 3050.00,
        "dueDate": "2025-10-10T00:00:00Z",
        "status": "PENDING",
        "createdAt": "2025-10-01T00:00:00Z",
        "paidAt": null
      },
      {
        "id": "bill-002",
        "billName": "Electricity Bill - September",
        "provider": "Meralco",
        "amount": 2640.00,
        "dueDate": "2025-09-10T00:00:00Z",
        "status": "PAID",
        "createdAt": "2025-09-01T00:00:00Z",
        "paidAt": "2025-09-09T00:00:00Z"
      }
    ],
    "analytics": {
      "averageSimple": 2903.33,
      "averageWeighted": 2989.00,
      "totalSpent": 17190.00,
      "highestBill": 3200.00,
      "lowestBill": 2450.00,
      "trend": "increasing",
      "billCount": 6
    },
    "forecast": {
      "estimatedAmount": 2989.00,
      "calculationMethod": "weighted",
      "confidence": "medium"
    },
    "totalCount": 6
  }
}
```

---

### **User Sees This:**

```
╔════════════════════════════════════════════════════════╗
║ ← Back          ⚡ Meralco Electricity                 ║
║                    utility Bills • 6 months             ║
║                                   ↑                     ║
║                            billCount/totalCount         ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║ 📊 ANALYTICS SUMMARY                                   ║
║ ┌──────────┬───────────┬──────────┬──────────┐        ║
║ │Total     │Average    │Highest   │Lowest    │        ║
║ │₱17,190  │₱2,989    │₱3,200   │₱2,450   │        ║
║ │    ↑     │    ↑      │    ↑     │    ↑     │        ║
║ │totalSpent│avgWeighted│highestBil│lowestBill│        ║
║ └──────────┴───────────┴──────────┴──────────┘        ║
║                                                        ║
║ 📈 TREND CHART                                         ║
║    Data Points: bills[] (Oct: 3050, Sep: 2640)        ║
║    Trend Arrow: ↗️ (from analytics.trend)             ║
║    Average Line: 2989 (from analytics.averageWeighted)║
║                                                        ║
║ 📜 BILL HISTORY TABLE                                  ║
║ ┌────────────────────────────────────────────────┐    ║
║ │ Oct 2025 │ ₱3,050│ —    │ —     │ Pending │ — │    ║
║ │    ↑     │   ↑   │      │       │    ↑    │   │    ║
║ │ dueDate  │amount │      │       │ status  │   │    ║
║ │          │       │      │       │         │   │    ║
║ │ Sep 2025 │ ₱2,640│ —    │ —     │ Paid ✓ │9/9│    ║
║ │          │       │      │       │         │ ↑ │    ║
║ │          │       │      │       │         │paidAt   ║
║ └────────────────────────────────────────────────┘    ║
║                                                        ║
║ 🔮 FORECAST (Sidebar)                                  ║
║ ┌──────────────────────────────┐                      ║
║ │ Estimated Next Bill          │                      ║
║ │                              │                      ║
║ │       ₱2,989                │                      ║
║ │          ↑                   │                      ║
║ │  estimatedAmount             │                      ║
║ │                              │                      ║
║ │ Confidence: medium           │                      ║
║ │      ↑                       │                      ║
║ │  confidence                  │                      ║
║ │                              │                      ║
║ │ Method: Weighted Average     │                      ║
║ │         ↑                    │                      ║
║ │  calculationMethod           │                      ║
║ └──────────────────────────────┘                      ║
╚════════════════════════════════════════════════════════╝
```

---

## 🔧 **How the Components Handle the Data**

### **BillDetails.tsx (Main Page):**

```typescript
// Load data from API
const loadBillDetails = async () => {
  const history = await apiService.getBillHistory({
    provider: 'Meralco',
    billType: BillType.UTILITY,
    months: 12,
  });
  
  // history.data matches your API response!
  setHistoryData(history);
};

// Use the data
<Typography>{historyData.analytics.billCount} months</Typography>
<Typography>{formatCurrency(historyData.analytics.totalSpent)}</Typography>
<Typography>{formatCurrency(historyData.analytics.averageWeighted)}</Typography>

// Pass to child components
<TrendChart 
  data={historyData.bills}
  averageAmount={historyData.analytics.averageWeighted}
/>

<ForecastWidget forecast={historyData.forecast} />

<BillHistoryTable bills={historyData.bills} />
```

---

### **BillHistoryTable.tsx:**

```typescript
// Receives bills array
const BillHistoryTable = ({ bills }) => {
  return (
    <Table>
      {bills.map(bill => (
        <TableRow>
          <TableCell>{formatDate(bill.dueDate)}</TableCell>
          <TableCell>{formatCurrency(bill.amount)}</TableCell>
          <TableCell>{bill.status}</TableCell>
          <TableCell>{bill.paidAt ? formatDate(bill.paidAt) : '—'}</TableCell>
        </TableRow>
      ))}
    </Table>
  );
};
```

---

### **ForecastWidget.tsx:**

```typescript
// Receives forecast object
const ForecastWidget = ({ forecast }) => {
  return (
    <Card>
      <Typography variant="h3">
        {formatCurrency(forecast.estimatedAmount)}
      </Typography>
      <Chip label={`Confidence: ${forecast.confidence}`} />
      <Chip label={getMethodLabel(forecast.calculationMethod)} />
    </Card>
  );
};
```

---

### **TrendChart.tsx:**

```typescript
// Receives bills array
const TrendChart = ({ data, averageAmount }) => {
  const chartData = data.map(bill => ({
    month: formatMonth(bill.dueDate),
    amount: bill.amount,
  }));
  
  return (
    <LineChart data={chartData}>
      <Line dataKey="amount" />
      <ReferenceLine y={averageAmount} />
    </LineChart>
  );
};
```

---

## ✅ **What's Already Implemented**

All the mapping is **already done** and working! ✅

### **Components That Handle Your API Response:**

1. ✅ **BillDetails.tsx** - Main page, loads data
2. ✅ **BillHistoryTable.tsx** - Displays bills array
3. ✅ **ForecastWidget.tsx** - Displays forecast
4. ✅ **TrendChart.tsx** - Visualizes bills data
5. ✅ **ProviderQuickLinks.tsx** - Shows provider list

### **Types That Match Your API:**

1. ✅ **BillHistoryAnalytics** - Updated to match your response
2. ✅ **Bill** - Matches your bill objects
3. ✅ **BillForecast** - Matches your forecast object

---

## 🎯 **How to Test**

### **Using Your Backend:**

```typescript
// The frontend is already calling:
const history = await apiService.getBillHistory({
  provider: 'Meralco',
  billType: BillType.UTILITY,
  months: 6
});

// This makes the exact API call you showed:
// GET /api/bills/analytics/history?provider=Meralco&billType=utility&months=6

// Your backend returns the JSON you showed
// Frontend automatically displays it! ✅
```

---

### **Quick Test Steps:**

1. **Make sure backend is running** at `http://localhost:5000`

2. **Open frontend** at `http://localhost:3000`

3. **Create 2-3 Meralco bills** (if you haven't)

4. **Navigate to** `/bills/Meralco/utility`

5. **Backend returns your JSON response**

6. **Frontend displays:**
   - ✅ Bills in table
   - ✅ Analytics cards
   - ✅ Trend chart
   - ✅ Forecast widget

**It's all connected and working!** 🎉

---

## 📝 **Summary**

### **Your API Response:**
```json
{
  "bills": [...],
  "analytics": {...},
  "forecast": {...},
  "totalCount": 6
}
```

### **Maps To:**
- `bills[]` → **Bill History Table** + **Trend Chart**
- `analytics.*` → **Analytics Summary Cards** + **Trend Analysis**
- `forecast.*` → **Forecast Widget**
- `totalCount` → **Header count display**

### **Status:**
✅ **Already implemented and working!**  
✅ **Types match your API**  
✅ **Components handle all fields**  
✅ **No errors**  
✅ **Ready to use with your backend!**

---

**Just start using it! The frontend is ready for your backend API!** 🚀
