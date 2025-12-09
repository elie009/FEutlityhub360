# Test Specification: Dashboard

## Main Item: Dashboard Overview
## Sub Item: Dashboard Page

---

## Test Case 1: View Dashboard with Valid Data

| Field | Value |
|-------|-------|
| **Test Case ID** | DASH-001 |
| **Test Item** | View Dashboard with Valid Financial Data |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in with valid authentication token. 2. User has completed profile setup. 3. User has at least one bank account with balance > 0. 4. User has at least one transaction in the current month. 5. User has at least one income source configured. 6. System has financial data for the current month. |
| **Test Steps** | 1. Navigate to the Dashboard page ("/" or "/dashboard"). 2. Wait for all data to load (financial overview, cash flow, transactions, bills). 3. Verify the Financial Overview section displays: Total Balance, Monthly Income, Monthly Expenses, Disposable Amount. 4. Verify the Monthly Cash Flow chart is displayed with bar chart showing income vs expenses. 5. Verify the Account Balances section shows all bank accounts with their balances. 6. Verify the Upcoming Bills section displays bills due in the next 30 days. 7. Verify the Recent Transactions section displays the last 6 transactions. 8. Verify the Income Sources Summary section displays total monthly income and count of income sources. 9. Verify the Savings Summary section displays savings accounts if any exist. 10. Verify all currency values are formatted correctly according to user's currency preference. |
| **Expected Output** | 1. Dashboard page loads successfully without errors. 2. All financial summary cards display correct values. 3. Monthly Cash Flow chart renders with accurate data for the current year. 4. Account balances are displayed correctly for all bank accounts. 5. Upcoming bills list shows bills sorted by due date (ascending). 6. Recent transactions list shows the 6 most recent transactions. 7. All numeric values are formatted with proper currency symbols and decimal places. 8. No error messages or loading skeletons are visible after data loads. 9. All interactive elements (buttons, links) are clickable and functional. |

---

## Test Case 2: View Dashboard with Empty State

| Field | Value |
|-------|-------|
| **Test Case ID** | DASH-002 |
| **Test Item** | View Dashboard with No Financial Data |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in with valid authentication token. 2. User has completed profile setup. 3. User has no bank accounts created. 4. User has no transactions recorded. 5. User has no income sources configured. 6. User has no bills added. |
| **Test Steps** | 1. Navigate to the Dashboard page. 2. Wait for the page to load completely. 3. Verify the Financial Overview section displays zero values or placeholder text. 4. Verify the Monthly Cash Flow chart displays empty state or message indicating no data. 5. Verify the Account Balances section shows empty state message. 6. Verify the Upcoming Bills section shows "No upcoming bills" message. 7. Verify the Recent Transactions section shows "No transactions" message. 8. Verify the Income Sources Summary shows zero income. 9. Verify the Savings Summary shows empty state if no savings accounts exist. 10. Verify that "Add Bank Account" or similar call-to-action buttons are visible and functional. |
| **Expected Output** | 1. Dashboard page loads successfully without errors. 2. All sections display appropriate empty state messages. 3. No error messages are displayed. 4. Call-to-action buttons are visible to guide user to add data. 5. Charts display empty state gracefully without breaking the layout. 6. All sections maintain proper spacing and layout even with no data. |

---

## Test Case 3: Change Period Filter on Dashboard

| Field | Value |
|-------|-------|
| **Test Case ID** | DASH-003 |
| **Test Item** | Filter Dashboard Data by Year and Month |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. User has financial data for multiple months (at least current month and previous month). 3. User has transactions recorded in different months. 4. System has historical financial data available. |
| **Test Steps** | 1. Navigate to the Dashboard page. 2. Locate the Period Selector (Year and Month dropdowns). 3. Select a previous month from the Month dropdown (e.g., if current month is December, select November). 4. Verify the Financial Overview section updates to show data for the selected month. 5. Verify the Monthly Cash Flow chart updates to reflect the selected period. 6. Verify the Recent Transactions section filters to show transactions from the selected month. 7. Select a different year from the Year dropdown. 8. Verify all dashboard sections update to reflect the selected year and month combination. 9. Select the current month and year to return to current view. 10. Verify the dashboard returns to showing current month data. |
| **Expected Output** | 1. Period selector dropdowns are functional and display available years (2000-2100) and months (1-12). 2. Financial Overview cards update immediately after period selection. 3. Monthly Cash Flow chart re-renders with data for the selected period. 4. Recent Transactions list updates to show transactions from the selected month only. 5. All financial calculations are accurate for the selected period. 6. No data from other periods is displayed. 7. Loading indicators appear briefly during data refresh. 8. No errors occur during period change. |

---

## Test Case 4: View Disposable Amount Details

| Field | Value |
|-------|-------|
| **Test Case ID** | DASH-004 |
| **Test Item** | View Detailed Disposable Amount Breakdown |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. User has configured income sources. 3. User has bills and expenses recorded. 4. System has calculated disposable amount data available. |
| **Test Steps** | 1. Navigate to the Dashboard page. 2. Locate the Disposable Amount card in the Financial Overview section. 3. Click on the Disposable Amount card or the "View Details" button/link. 4. Verify a modal dialog opens displaying detailed disposable amount breakdown. 5. Verify the modal shows: Total Monthly Income, Total Monthly Expenses, Disposable Amount calculation. 6. Verify the breakdown includes itemized income sources. 7. Verify the breakdown includes itemized expenses/bills. 8. Verify all amounts are formatted correctly with currency symbols. 9. Close the modal dialog. 10. Verify the modal closes and user returns to dashboard view. |
| **Expected Output** | 1. Disposable Amount card is clickable and triggers modal opening. 2. Modal dialog opens smoothly without page refresh. 3. Modal displays accurate breakdown of income and expenses. 4. All calculations are correct (Income - Expenses = Disposable Amount). 5. Itemized lists show all relevant income sources and expenses. 6. Currency formatting is consistent throughout the modal. 7. Modal can be closed by clicking close button or outside the modal. 8. No errors occur during modal open/close operations. |

---

## Test Case 5: Navigate to Related Pages from Dashboard

| Field | Value |
|-------|-------|
| **Test Case ID** | DASH-005 |
| **Test Item** | Navigate to Detailed Views from Dashboard Links |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. Dashboard displays data (transactions, bills, accounts). 3. User has appropriate permissions to access related pages. |
| **Test Steps** | 1. Navigate to the Dashboard page. 2. Locate the "View All Transactions" link/button in the Recent Transactions section. 3. Click on "View All Transactions". 4. Verify navigation to the Transactions page occurs. 5. Navigate back to Dashboard. 6. Locate the "View All Bills" link/button in the Upcoming Bills section. 7. Click on "View All Bills". 8. Verify navigation to the Bills page occurs. 9. Navigate back to Dashboard. 10. Click on a bank account card in the Account Balances section. 11. Verify navigation to Bank Accounts page or account details occurs. |
| **Expected Output** | 1. All navigation links/buttons are visible and clickable. 2. Clicking "View All Transactions" navigates to "/transactions" page. 3. Clicking "View All Bills" navigates to "/bills" page. 4. Clicking on account cards navigates to appropriate account details page. 5. Navigation occurs without page errors. 6. Browser back button works correctly to return to dashboard. 7. All navigation maintains user's authentication state. |

---

## Test Case 6: Dashboard Load with Network Error

| Field | Value |
|-------|-------|
| **Test Case ID** | DASH-006 |
| **Test Item** | Handle Dashboard Load Failure Due to Network Error |
| **Test Type** | Abnormal Case |
| **Precondition** | 1. User is logged in. 2. Network connection is available initially. 3. User has financial data in the system. |
| **Test Steps** | 1. Navigate to the Dashboard page. 2. While the page is loading, simulate network disconnection (disable network in browser DevTools). 3. Wait for API calls to fail. 4. Verify error handling behavior. 5. Verify error messages are displayed to the user. 6. Re-enable network connection. 7. Click on a "Retry" or "Refresh" button if available. 8. Verify the dashboard attempts to reload data. |
| **Expected Output** | 1. Dashboard displays appropriate error messages when API calls fail. 2. Error messages are user-friendly and actionable (e.g., "Failed to load financial data. Please check your connection and try again."). 3. Loading indicators stop displaying after error occurs. 4. User is not left with a blank screen or infinite loading state. 5. Retry/Refresh functionality is available and functional. 6. After network restoration and retry, dashboard loads successfully. 7. No JavaScript errors are thrown that break the page functionality. |

---

## Test Case 7: Dashboard with Invalid Period Selection

| Field | Value |
|-------|-------|
| **Test Case ID** | DASH-007 |
| **Test Item** | Handle Invalid Year/Month Selection in Period Filter |
| **Test Type** | Abnormal Case |
| **Precondition** | 1. User is logged in. 2. Dashboard page is loaded. 3. Period selector is visible and functional. |
| **Test Steps** | 1. Navigate to the Dashboard page. 2. Open browser Developer Tools and access the console. 3. Manually manipulate the period selector to select an invalid year (e.g., year 1999 or year 2101) using browser DevTools. 4. Verify system behavior when invalid year is selected. 5. Attempt to select an invalid month (e.g., month 0 or month 13) if possible. 6. Verify validation and error handling. 7. Select a valid period (current month and year). 8. Verify dashboard returns to normal state. |
| **Expected Output** | 1. System validates year input and restricts to valid range (2000-2100). 2. System validates month input and restricts to valid range (1-12). 3. Invalid selections are rejected or automatically corrected to nearest valid value. 4. Error messages are displayed if invalid data is submitted. 5. Dashboard does not break or display incorrect data due to invalid period. 6. After correction, dashboard displays data correctly. 7. No JavaScript errors occur in the console. |

---

## Test Case 8: Dashboard Refresh Data

| Field | Value |
|-------|-------|
| **Test Case ID** | DASH-008 |
| **Test Item** | Refresh Dashboard Data Manually |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. Dashboard is displaying current data. 3. User has made changes to financial data in another tab or recently (e.g., added a transaction). |
| **Test Steps** | 1. Navigate to the Dashboard page. 2. Note the current values displayed (e.g., total balance, recent transaction count). 3. Add a new transaction or modify financial data from another page/tab (or use API directly). 4. Return to the Dashboard page. 5. Locate the "Refresh" button or icon (if available). 6. Click on the Refresh button. 7. Wait for data to reload. 8. Verify the dashboard displays updated values reflecting the new changes. |
| **Expected Output** | 1. Refresh button/icon is visible and clickable. 2. Clicking refresh triggers data reload from the server. 3. Loading indicators appear during refresh. 4. Dashboard updates to show latest data after refresh completes. 5. New transactions appear in Recent Transactions section. 6. Financial summary cards update with new values. 7. No duplicate data or stale data is displayed. 8. Refresh completes without errors. |

---

## Test Case 9: Dashboard Onboarding Wizard Display

| Field | Value |
|-------|-------|
| **Test Case ID** | DASH-009 |
| **Test Item** | Display Onboarding Wizard for New Users |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. User has not completed profile setup (hasProfile = false). 3. Onboarding wizard component is available. |
| **Test Steps** | 1. Navigate to the Dashboard page as a new user without a completed profile. 2. Verify the Onboarding Wizard modal/dialog appears automatically. 3. Verify the wizard displays step-by-step instructions. 4. Complete the first step of the onboarding wizard. 5. Verify progression to the next step. 6. Complete all steps of the onboarding wizard. 7. Verify the wizard closes after completion. 8. Verify the dashboard is now fully accessible. |
| **Expected Output** | 1. Onboarding wizard appears automatically when user has incomplete profile. 2. Wizard displays clear instructions and guidance. 3. User can progress through wizard steps. 4. Wizard cannot be bypassed without completing required steps. 5. After completion, wizard closes and does not reappear. 6. Dashboard becomes fully functional after onboarding completion. 7. User profile is marked as complete in the system. |

---

## Test Case 10: Dashboard with Expired Authentication

| Field | Value |
|-------|-------|
| **Test Case ID** | DASH-010 |
| **Test Item** | Handle Expired Authentication Token on Dashboard |
| **Test Type** | Abnormal Case |
| **Precondition** | 1. User was previously logged in. 2. User's authentication token has expired. 3. Dashboard page is open in browser. |
| **Test Steps** | 1. Navigate to the Dashboard page with an expired authentication token. 2. Wait for API calls to execute with expired token. 3. Verify system response to 401 Unauthorized errors. 4. Verify user is redirected to login page. 5. Verify appropriate error message is displayed. 6. Log in again with valid credentials. 7. Verify user is redirected back to Dashboard after successful login. |
| **Expected Output** | 1. System detects expired authentication token. 2. User is automatically redirected to "/auth" or login page. 3. Clear error message is displayed (e.g., "Your session has expired. Please log in again."). 4. User's current page state is preserved if possible (for redirect after login). 5. After re-authentication, user is redirected to Dashboard. 6. Dashboard loads successfully with new authentication token. 7. No sensitive data is exposed during the authentication failure. |

