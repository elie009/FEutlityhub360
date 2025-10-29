# Financial Reports & Analytics System - Frontend Guide

## 📚 Overview

The Analytics page provides a comprehensive financial reports and analytics system with interactive graphs, insights, and predictions. This guide explains how to use and customize the system.

## 🎯 Features

### 1. **Financial Summary Dashboard**
- Real-time KPI cards showing:
  - Total Income (with % change)
  - Total Expenses (with % change)
  - Disposable Income (with % change)
  - Net Worth (with % change)
- Color-coded gradient cards for visual appeal
- Trend indicators (up/down arrows)

### 2. **Financial Insights & Alerts**
Three types of insights:
- **⚠️ ALERTS**: Warnings about unusual spending, overdue bills, etc.
- **💡 TIPS**: Savings opportunities and financial advice
- **🔮 FORECASTS**: Predictions for next month's finances

### 3. **Interactive Reports (6 Tabs)**

#### Tab 1: 📈 Income & Expenses
- **Income vs Expenses Trend Chart**: Visualizes income and expense patterns over time
- **Income by Category Pie Chart**: Breakdown of income sources
- **Expense Distribution Bar Chart**: Shows spending by category
- **Income Summary Card**: Key metrics and top income source

#### Tab 2: 💰 Disposable Income
- **Disposable Income Trend**: Area chart showing available money after expenses
- **Analysis Card**: 
  - Current disposable income
  - Average over period
  - Recommended savings (30% rule)
  - Comparison with previous period

#### Tab 3: 🏦 Bills & Utilities
- **Bills Trend Chart**: Track monthly bill changes
- **Bills Summary**: Total, average, and predicted amounts
- **Bills by Type Pie Chart**: Distribution across utility types
- **Upcoming Bills List**: Next 30 days with due dates
- Alert chips for unpaid and overdue bills

#### Tab 4: 💳 Loans & Debt
- **Overview Cards**: Active loans, total principal, remaining balance, monthly payment
- **Individual Loan Cards**: Each loan with:
  - Principal and remaining balance
  - Monthly payment and interest rate
  - Visual progress bar
- **Debt-Free Projection**: Estimated date to be debt-free

#### Tab 5: 💎 Savings & Goals
- **Savings Growth Trend**: Area chart showing savings accumulation
- **Goal Progress**: 
  - Circular progress indicator
  - Current balance vs target
  - Months until goal achievement
- **Savings Analysis**: Monthly savings amount and savings rate
- Goal projection alert

#### Tab 6: 📊 Net Worth
- **Net Worth Trend**: 12-month historical view
- **Summary Card**:
  - Current net worth with % change
  - Total assets and liabilities
  - Trend description
- **Asset Breakdown Pie Chart**
- **Liability Breakdown Pie Chart**

### 4. **Financial Predictions**
- Next month predictions for:
  - Income
  - Expenses
  - Bills
  - Savings
  - Disposable income
- Confidence percentage for each prediction

### 5. **Recent Transactions**
- Last 10 transactions
- Color-coded by type (credit/debit)
- Shows date, category, amount, and resulting balance

## 🔧 API Integration

### Backend Endpoints Required

```typescript
// Full report with all data
GET /api/Reports/full?period=MONTHLY&includeInsights=true&includePredictions=true

// Individual report endpoints (optional)
GET /api/Reports/summary
GET /api/Reports/income?period=MONTHLY
GET /api/Reports/expenses?period=MONTHLY
GET /api/Reports/insights
GET /api/Reports/predictions
GET /api/Reports/transactions/recent?limit=20
```

### API Response Structure

```typescript
{
  success: true,
  message: "Financial report generated successfully",
  data: {
    reportDate: "2025-10-28T20:00:00Z",
    period: "MONTHLY",
    summary: {
      totalIncome: 50000.00,
      incomeChange: 10.5,
      totalExpenses: 35000.00,
      expenseChange: -5.2,
      disposableIncome: 15000.00,
      disposableChange: 8.3,
      totalSavings: 25000.00,
      savingsGoal: 50000.00,
      savingsProgress: 50.0,
      netWorth: 245000.00,
      netWorthChange: 5.1
    },
    incomeReport: { /* income data */ },
    expenseReport: { /* expense data */ },
    disposableIncomeReport: { /* disposable income data */ },
    billsReport: { /* bills data */ },
    loanReport: { /* loan data */ },
    savingsReport: { /* savings data */ },
    netWorthReport: { /* net worth data */ },
    insights: [ /* insights array */ ],
    predictions: [ /* predictions array */ ],
    recentTransactions: [ /* transactions array */ ]
  }
}
```

## 🎨 Customization

### Chart Colors

The system uses a predefined color palette:
```typescript
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];
```

To customize, modify the `COLORS` array in `src/pages/Analytics.tsx`.

### KPI Card Gradients

Each summary card has a unique gradient:
- **Income**: Purple gradient (`#667eea` to `#764ba2`)
- **Expenses**: Pink gradient (`#f093fb` to `#f5576c`)
- **Disposable Income**: Blue gradient (`#4facfe` to `#00f2fe`)
- **Net Worth**: Green gradient (`#43e97b` to `#38f9d7`)

Modify the `background` prop in the Card components to change.

### Period Options

Default periods available:
- **MONTHLY**: Last 30 days
- **QUARTERLY**: Last 3 months
- **YEARLY**: Last 12 months

Add custom periods by extending the Select menu options.

## 📊 Chart Types Used

1. **Line Chart**: Income trend, Bills trend
2. **Area Chart**: Disposable income, Savings growth, Net worth trend
3. **Bar Chart**: Expense distribution
4. **Pie Chart**: Income by category, Bills by type, Asset/Liability breakdown
5. **Composed Chart**: Income vs Expenses (combines Area + Line)

## 🔐 Error Handling

The system includes:
- Loading states with spinner
- Error alerts with details
- Empty state handling
- API timeout handling (from api.ts)

## 💡 Usage Tips

### For Users:
1. **Select Period**: Use the dropdown to view Monthly, Quarterly, or Yearly data
2. **Navigate Tabs**: Click tabs to explore different financial aspects
3. **Read Insights**: Check alerts and tips for actionable advice
4. **Track Progress**: Monitor loan repayment and savings goal progress bars
5. **Review Predictions**: Plan ahead with next month forecasts

### For Developers:

#### Adding a New Chart:
```tsx
<ResponsiveContainer width="100%" height={350}>
  <LineChart data={yourData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="label" />
    <YAxis />
    <RechartsTooltip formatter={(value: any) => formatCurrency(value)} />
    <Legend />
    <Line type="monotone" dataKey="value" stroke="#8884d8" />
  </LineChart>
</ResponsiveContainer>
```

#### Adding a New Insight Type:
```typescript
const getInsightIcon = (type: string) => {
  switch (type) {
    case 'ALERT': return <Warning />;
    case 'TIP': return <Lightbulb />;
    case 'FORECAST': return <TrendingUp />;
    case 'YOUR_NEW_TYPE': return <YourIcon />;
    default: return <Info />;
  }
};
```

#### Formatting Currency:
```typescript
const formatCurrency = (value: number) => {
  return `${getCurrencySymbol()}${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
```

## 🧪 Testing

### Test with Mock Data

If the backend is not ready, you can test with mock data:

```typescript
// In src/services/api.ts
async getFullFinancialReport(params?: any): Promise<any> {
  if (isMockDataEnabled()) {
    return {
      reportDate: new Date().toISOString(),
      period: 'MONTHLY',
      summary: {
        totalIncome: 50000,
        incomeChange: 10.5,
        // ... more mock data
      },
      // ... more mock sections
    };
  }
  // Real API call
}
```

### API Testing

Use the provided HTTP test files:

```http
### Get Full Financial Report
GET http://localhost:5000/api/Reports/full?period=MONTHLY
Authorization: Bearer {{token}}

### Get Summary Only
GET http://localhost:5000/api/Reports/summary
Authorization: Bearer {{token}}
```

## 🚀 Performance Optimization

1. **Data Caching**: Reports are cached for 5 minutes on backend
2. **Lazy Loading**: Charts load only when their tab is active
3. **Responsive Charts**: All charts use ResponsiveContainer for optimal sizing
4. **Efficient Rendering**: React hooks (useState, useEffect) minimize re-renders

## 🐛 Troubleshooting

### Problem: Charts not displaying
**Solution**: 
- Ensure `recharts` is installed: `npm install recharts`
- Check console for errors
- Verify data format matches expected structure

### Problem: API 404 errors
**Solution**:
- Verify backend `/Reports` endpoints are implemented
- Check API base URL in `src/config/environment.ts`
- Ensure authentication token is valid

### Problem: "No data available"
**Solution**:
- Ensure user has financial data (income, expenses, bills, etc.)
- Check database has records for the selected period
- Verify date range in API requests

### Problem: Slow loading
**Solution**:
- Enable backend caching
- Add database indexes on date fields
- Reduce `includeTransactions` limit
- Use pagination for large datasets

## 📱 Responsive Design

The Analytics page is fully responsive:
- **Desktop (lg)**: 3-4 column layouts
- **Tablet (md)**: 2 column layouts
- **Mobile (xs/sm)**: Single column, stacked cards

Grid breakpoints:
```typescript
<Grid item xs={12} sm={6} md={4} lg={3}>
```

## 🎯 Future Enhancements

Potential additions:
1. **Export to PDF/CSV**: Download reports
2. **Custom Date Ranges**: Select specific start/end dates
3. **Comparison Mode**: Compare multiple periods side-by-side
4. **Budget vs Actual**: Visual comparison charts
5. **Financial Goals Wizard**: Set and track multiple goals
6. **Drill-down Details**: Click charts to see transaction details
7. **Scheduled Reports**: Email automated reports
8. **Multi-currency Support**: Convert and display in different currencies

## 📖 Related Files

- **Types**: `src/types/financialReport.ts`
- **API Service**: `src/services/api.ts` (lines 2615-2741)
- **Analytics Page**: `src/pages/Analytics.tsx`
- **Currency Context**: `src/contexts/CurrencyContext.tsx`

## 💬 Support

For issues or questions:
- Check the console for error messages
- Review the API response structure
- Verify authentication and permissions
- Ensure all required data exists in the database

---

**Last Updated**: October 28, 2025  
**Version**: 1.0.0  
**Framework**: React 19 + TypeScript + Material-UI + Recharts

