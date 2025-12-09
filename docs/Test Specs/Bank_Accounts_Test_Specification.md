# Test Specification: Bank Accounts

## Main Item: Money Overview
## Sub Item: Bank Account Management

---

## Test Case 1: Create Bank Account with Valid Data

| Field | Value |
|-------|-------|
| **Test Case ID** | BA-CBA-001 |
| **Test Item** | Create Bank Account with Valid Information |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in with valid authentication token. 2. User has completed profile setup. 3. User has permission to create bank accounts. 4. System is accessible and API endpoints are functional. |
| **Test Steps** | 1. Navigate to the Bank Accounts page ("/bank-accounts"). 2. Click on the "Add Bank Account" button. 3. Verify the Bank Account form dialog opens. 4. Enter a valid account name (e.g., "Chase Checking Account"). 5. Select account type from dropdown (e.g., "CHECKING", "SAVINGS", "CREDIT_CARD"). 6. Enter a valid initial balance (e.g., 5000.00). 7. Select currency from dropdown (e.g., "USD"). 8. Enter account number (optional, e.g., "****1234"). 9. Enter bank name (e.g., "Chase Bank"). 10. Enter routing number if applicable. 11. Click the "Save" or "Create" button. 12. Verify the form closes after successful submission. 13. Verify the new bank account appears in the accounts list. |
| **Expected Output** | 1. Bank Account form dialog opens successfully. 2. All form fields are visible and editable. 3. Form validation allows submission with valid data. 4. Success message is displayed (e.g., "Bank account created successfully"). 5. Form dialog closes automatically after successful creation. 6. New bank account card appears in the accounts list with correct information. 7. Account balance is displayed correctly. 8. Account is immediately available for transactions and other operations. 9. No errors occur during the creation process. |

---

## Test Case 2: Create Bank Account with Missing Required Fields

| Field | Value |
|-------|-------|
| **Test Case ID** | BA-CBA-002 |
| **Test Item** | Create Bank Account with Missing Required Information |
| **Test Type** | Abnormal Case |
| **Precondition** | 1. User is logged in. 2. User navigates to Bank Accounts page. 3. Bank Account form is accessible. |
| **Test Steps** | 1. Navigate to the Bank Accounts page. 2. Click on the "Add Bank Account" button. 3. Verify the Bank Account form dialog opens. 4. Leave the account name field empty. 5. Leave the account type field unselected. 6. Leave the initial balance field empty or enter 0. 7. Attempt to click the "Save" or "Create" button. 8. Verify form validation behavior. 9. Enter only the account name. 10. Attempt to submit again. 11. Verify validation messages for missing fields. |
| **Expected Output** | 1. Form dialog opens successfully. 2. Form prevents submission when required fields are missing. 3. Validation error messages are displayed for each missing required field (e.g., "Account name is required", "Account type is required", "Initial balance must be greater than 0"). 4. Error messages are displayed in red or with appropriate styling near the respective fields. 5. Form does not close or submit with invalid data. 6. User can correct the errors and resubmit. 7. No bank account is created in the database with invalid data. |

---

## Test Case 3: Edit Existing Bank Account

| Field | Value |
|-------|-------|
| **Test Case ID** | BA-EBA-001 |
| **Test Item** | Edit Bank Account Information |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. User has at least one existing bank account in the system. 3. Bank account has ID: BA-001 with name "Old Account Name" and balance 1000.00. |
| **Test Steps** | 1. Navigate to the Bank Accounts page. 2. Locate the bank account card for the account to edit. 3. Click on the "Edit" button or icon on the account card. 4. Verify the Bank Account form dialog opens with pre-filled data. 5. Verify all existing account information is displayed correctly in the form. 6. Modify the account name to "Updated Account Name". 7. Modify the account balance to 1500.00. 8. Update other fields as needed (e.g., bank name, account number). 9. Click the "Save" or "Update" button. 10. Verify the form closes after successful update. 11. Verify the account card displays the updated information. |
| **Expected Output** | 1. Edit button/icon is visible and clickable on the account card. 2. Form dialog opens with all existing account data pre-filled. 3. User can modify any editable fields. 4. Form validation works correctly for edited data. 5. Success message is displayed (e.g., "Bank account updated successfully"). 6. Form dialog closes after successful update. 7. Account card reflects all updated information immediately. 8. Account balance is updated correctly. 9. Changes are persisted in the database. 10. No errors occur during the update process. |

---

## Test Case 4: Delete Bank Account

| Field | Value |
|-------|-------|
| **Test Case ID** | BA-DBA-001 |
| **Test Item** | Delete Bank Account |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. User has at least one bank account (BA-002) that can be deleted. 3. Bank account BA-002 has no pending transactions or critical dependencies. 4. User has permission to delete bank accounts. |
| **Test Steps** | 1. Navigate to the Bank Accounts page. 2. Locate the bank account card for account BA-002. 3. Click on the "Delete" button or icon on the account card. 4. Verify a confirmation dialog appears asking "Are you sure you want to delete this bank account?". 5. Click "Confirm" or "Yes" in the confirmation dialog. 6. Verify the account is removed from the list. 7. Verify a success message is displayed. 8. Verify the account no longer appears in the accounts list after page refresh. |
| **Expected Output** | 1. Delete button/icon is visible and clickable on the account card. 2. Confirmation dialog appears before deletion to prevent accidental deletion. 3. User can cancel the deletion by clicking "Cancel" in the confirmation dialog. 4. After confirmation, account is removed from the UI immediately. 5. Success message is displayed (e.g., "Bank account deleted successfully"). 6. Account is removed from the database. 7. Account no longer appears in any account lists or dropdowns. 8. Associated transactions (if any) are handled appropriately (archived or orphaned based on business rules). 9. No errors occur during the deletion process. |

---

## Test Case 5: Delete Bank Account with Associated Transactions

| Field | Value |
|-------|-------|
| **Test Case ID** | BA-DBA-002 |
| **Test Item** | Delete Bank Account That Has Associated Transactions |
| **Test Type** | Abnormal Case |
| **Precondition** | 1. User is logged in. 2. User has a bank account (BA-003) with at least 5 associated transactions. 3. Transactions are linked to this account in the database. |
| **Test Steps** | 1. Navigate to the Bank Accounts page. 2. Locate the bank account card for account BA-003. 3. Click on the "Delete" button or icon. 4. Verify a confirmation dialog appears. 5. Click "Confirm" in the confirmation dialog. 6. Verify system behavior when attempting to delete account with transactions. |
| **Expected Output** | 1. System either: (a) Prevents deletion and displays error message: "Cannot delete bank account with associated transactions. Please remove or reassign transactions first." OR (b) Allows deletion but handles transactions appropriately (e.g., archives them, reassigns to another account, or marks account as deleted but preserves transaction history). 2. If deletion is prevented, account remains in the list. 3. If deletion is allowed, transactions are handled according to business rules. 4. Clear error or warning message is displayed to inform the user. 5. No data integrity issues occur. 6. Transaction history is preserved if required by business rules. |

---

## Test Case 6: View Bank Account Transactions

| Field | Value |
|-------|-------|
| **Test Case ID** | BA-VT-001 |
| **Test Item** | View Transactions for a Specific Bank Account |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. User has a bank account (BA-004) with at least 3 transactions. 3. Transactions are recorded in the system for this account. |
| **Test Steps** | 1. Navigate to the Bank Accounts page. 2. Locate the bank account card for account BA-004. 3. Click on the "View Transactions" button or link on the account card. 4. Verify a transactions modal or page opens. 5. Verify the modal/page displays all transactions for account BA-004. 6. Verify transactions are displayed in a list or table format. 7. Verify each transaction shows: date, description, amount, type (income/expense), category. 8. Verify transactions are sorted by date (most recent first). 9. Close the transactions modal or navigate back. 10. Verify user returns to Bank Accounts page. |
| **Expected Output** | 1. "View Transactions" button/link is visible and clickable. 2. Transactions modal/page opens successfully. 3. All transactions for the selected account are displayed. 4. Transaction list is properly formatted and readable. 5. Transaction details are accurate and match database records. 6. Transactions are sorted correctly (most recent first). 7. Amounts are formatted with proper currency symbols. 8. Modal/page can be closed easily. 9. No errors occur during the view operation. |

---

## Test Case 7: Connect Bank Account via Plaid

| Field | Value |
|-------|-------|
| **Test Case ID** | BA-PLAID-001 |
| **Test Item** | Connect Bank Account Using Plaid Integration |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. Plaid integration is configured and enabled in the system. 3. User has a bank account that supports Plaid connection. 4. Plaid API credentials are valid. |
| **Test Steps** | 1. Navigate to the Bank Accounts page. 2. Locate an existing bank account or create a new one. 3. Click on the "Connect via Plaid" or "Link Account" button. 4. Verify the Plaid Link dialog opens. 5. Follow Plaid's authentication flow (select bank, enter credentials). 6. Complete Plaid's security verification if required. 7. Grant permissions for account access. 8. Verify successful connection. 9. Verify the account status changes to "Connected" or shows Plaid connection indicator. |
| **Expected Output** | 1. "Connect via Plaid" button is visible for eligible accounts. 2. Plaid Link dialog opens successfully. 3. User can complete Plaid authentication flow. 4. After successful connection, account status updates to "Connected". 5. Account balance syncs automatically from the bank. 6. Transactions can be synced from the connected bank. 7. Success message is displayed (e.g., "Bank account connected successfully"). 8. Account card shows connection indicator (e.g., "Connected" badge or icon). 9. No errors occur during the Plaid connection process. |

---

## Test Case 8: Sync Bank Account Data

| Field | Value |
|-------|-------|
| **Test Case ID** | BA-SYNC-001 |
| **Test Item** | Sync Bank Account Data from Connected Account |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. User has a bank account (BA-005) that is connected via Plaid. 3. Bank account has new transactions available at the connected bank. 4. Plaid sync functionality is enabled. |
| **Test Steps** | 1. Navigate to the Bank Accounts page. 2. Locate the bank account card for account BA-005 (connected account). 3. Click on the "Sync" or "Refresh" button on the account card. 4. Verify a loading indicator appears during sync. 5. Wait for sync to complete. 6. Verify the account balance updates if there are new transactions. 7. Verify new transactions are imported and displayed. 8. Verify a success message is displayed after sync completion. |
| **Expected Output** | 1. "Sync" button is visible and clickable for connected accounts. 2. Loading indicator appears during sync operation. 3. Sync process completes successfully. 4. Account balance updates to reflect latest balance from bank. 5. New transactions are imported and appear in the transactions list. 6. Success message is displayed (e.g., "Account synced successfully. 5 new transactions imported."). 7. No duplicate transactions are created. 8. Transaction data is accurate and matches bank records. 9. No errors occur during sync. |

---

## Test Case 9: Disconnect Plaid Connection

| Field | Value |
|-------|-------|
| **Test Case ID** | BA-DISCONNECT-001 |
| **Test Item** | Disconnect Bank Account from Plaid |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. User has a bank account (BA-006) that is currently connected via Plaid. 3. Account has synced data and transactions. |
| **Test Steps** | 1. Navigate to the Bank Accounts page. 2. Locate the bank account card for account BA-006. 3. Click on the "Disconnect" or "Unlink" button. 4. Verify a confirmation dialog appears asking to confirm disconnection. 5. Click "Confirm" in the confirmation dialog. 6. Verify the account status changes to "Not Connected" or removes connection indicator. 7. Verify the account data (balance, transactions) is preserved. 8. Verify sync functionality is no longer available for this account. |
| **Expected Output** | 1. "Disconnect" button is visible for connected accounts. 2. Confirmation dialog appears before disconnection. 3. User can cancel disconnection if needed. 4. After confirmation, Plaid connection is removed. 5. Account status updates to show it is no longer connected. 6. Existing account data (balance, transactions) is preserved. 7. Account can still be used manually (manual transaction entry). 8. Sync button is no longer available or is disabled. 9. Success message is displayed (e.g., "Bank account disconnected successfully"). 10. No errors occur during disconnection. |

---

## Test Case 10: Filter Bank Accounts

| Field | Value |
|-------|-------|
| **Test Case ID** | BA-FILTER-001 |
| **Test Item** | Filter Bank Accounts by Type and Status |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. User has multiple bank accounts of different types (CHECKING, SAVINGS, CREDIT_CARD). 3. User has both connected and non-connected accounts. |
| **Test Steps** | 1. Navigate to the Bank Accounts page. 2. Locate the filter controls (dropdowns or checkboxes). 3. Select "CHECKING" from the Account Type filter. 4. Verify only checking accounts are displayed. 5. Clear the filter or select "All Types". 6. Verify all accounts are displayed again. 7. Select "Connected" from the Connection Status filter. 8. Verify only Plaid-connected accounts are displayed. 9. Apply multiple filters simultaneously (e.g., Type: SAVINGS, Status: Connected). 10. Verify filtered results match all applied criteria. |
| **Expected Output** | 1. Filter controls are visible and functional. 2. Filtering by account type works correctly. 3. Filtering by connection status works correctly. 4. Multiple filters can be applied simultaneously. 5. Filtered results are accurate and match the criteria. 6. Clear/Reset filter functionality works to show all accounts. 7. Account count or summary updates to reflect filtered results. 8. No errors occur during filtering. |

---

## Test Case 11: Create Bank Account with Invalid Balance

| Field | Value |
|-------|-------|
| **Test Case ID** | BA-CBA-003 |
| **Test Item** | Create Bank Account with Invalid Initial Balance |
| **Test Type** | Abnormal Case |
| **Precondition** | 1. User is logged in. 2. User navigates to Bank Accounts page. 3. Bank Account form is accessible. |
| **Test Steps** | 1. Navigate to the Bank Accounts page. 2. Click on the "Add Bank Account" button. 3. Enter a valid account name. 4. Select a valid account type. 5. Enter a negative balance (e.g., -100.00) in the initial balance field. 6. Attempt to submit the form. 7. Verify validation behavior. 8. Enter a non-numeric value (e.g., "abc") in the balance field. 9. Attempt to submit again. 10. Verify validation messages. |
| **Expected Output** | 1. Form prevents submission with invalid balance values. 2. Validation error message is displayed for negative balance (e.g., "Initial balance cannot be negative"). 3. Validation error message is displayed for non-numeric values (e.g., "Initial balance must be a valid number"). 4. Error messages are displayed near the balance field. 5. Form does not close or submit with invalid data. 6. User can correct the error and resubmit. 7. No bank account is created with invalid balance. |

---

## Test Case 12: Bank Account Load Failure

| Field | Value |
|-------|-------|
| **Test Case ID** | BA-LOAD-001 |
| **Test Item** | Handle Bank Accounts Page Load Failure |
| **Test Type** | Abnormal Case |
| **Precondition** | 1. User is logged in. 2. Network connection is available initially. 3. User has bank accounts in the system. |
| **Test Steps** | 1. Navigate to the Bank Accounts page. 2. While the page is loading, simulate network disconnection (disable network in browser DevTools). 3. Wait for API calls to fail. 4. Verify error handling behavior. 5. Verify error messages are displayed to the user. 6. Re-enable network connection. 7. Click on a "Retry" or "Refresh" button if available. 8. Verify the page attempts to reload bank accounts. |
| **Expected Output** | 1. Page displays appropriate error messages when API calls fail. 2. Error messages are user-friendly (e.g., "Failed to load bank accounts. Please check your connection and try again."). 3. Loading indicators stop displaying after error occurs. 4. User is not left with a blank screen or infinite loading state. 5. Retry/Refresh functionality is available and functional. 6. After network restoration and retry, bank accounts load successfully. 7. No JavaScript errors are thrown that break the page functionality. |

