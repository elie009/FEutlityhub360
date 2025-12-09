# Test Specification: Transactions

## Main Item: Money Overview
## Sub Item: Transactions Management

---

## Test Case 1: View Transactions List

| Field | Value |
|-------|-------|
| **Test Case ID** | TRN-VT-001 |
| **Test Item** | View All Transactions |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in with valid authentication token. 2. User has at least 10 transactions recorded in the system. 3. Transactions span multiple months and have different types (income/expense). 4. System has transaction data available. |
| **Test Steps** | 1. Navigate to the Transactions page ("/transactions"). 2. Wait for the page to load completely. 3. Verify the transactions list/table is displayed. 4. Verify transactions are displayed in either table view or card view (based on view mode). 5. Verify each transaction displays: date, description, amount, type (income/expense), category, bank account. 6. Verify transactions are sorted by date (most recent first) by default. 7. Verify pagination controls are visible if there are more than 10 transactions. 8. Verify the total count of transactions is displayed. 9. Verify currency formatting is applied correctly to all amounts. |
| **Expected Output** | 1. Transactions page loads successfully without errors. 2. Transactions list/table displays all available transactions. 3. All transaction fields are visible and properly formatted. 4. Transactions are sorted correctly (most recent first). 5. Pagination works correctly if there are multiple pages. 6. Transaction count is accurate. 7. Amounts are formatted with proper currency symbols and decimal places. 8. Income transactions are displayed with positive amounts or green color indicator. 9. Expense transactions are displayed with negative amounts or red color indicator. 10. No loading skeletons or errors are visible after data loads. |

---

## Test Case 2: Create Transaction with Valid Data

| Field | Value |
|-------|-------|
| **Test Case ID** | TRN-CT-001 |
| **Test Item** | Create Transaction with Valid Information |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. User has at least one bank account (BA-001) in the system. 3. User has permission to create transactions. 4. Transaction form is accessible. |
| **Test Steps** | 1. Navigate to the Transactions page. 2. Click on the "Add Transaction" or "New Transaction" button. 3. Verify the Transaction form dialog opens. 4. Select a bank account from the "Bank Account" dropdown (e.g., BA-001). 5. Enter a transaction description (e.g., "Grocery Shopping"). 6. Enter transaction amount (e.g., 150.50). 7. Select transaction type (e.g., "Expense" or "Income"). 8. Select a category from the category dropdown (e.g., "Food & Dining"). 9. Select transaction date (defaults to today, can be changed). 10. Optionally add notes or tags. 11. Click the "Save" or "Create" button. 12. Verify the form closes after successful submission. 13. Verify the new transaction appears in the transactions list. |
| **Expected Output** | 1. Transaction form dialog opens successfully. 2. All form fields are visible and editable. 3. Bank account dropdown shows all available bank accounts. 4. Category dropdown shows available categories. 5. Form validation allows submission with valid data. 6. Success message is displayed (e.g., "Transaction created successfully"). 7. Form dialog closes automatically after successful creation. 8. New transaction appears in the transactions list with correct information. 9. Transaction amount is formatted correctly. 10. Bank account balance is updated to reflect the new transaction. 11. No errors occur during the creation process. |

---

## Test Case 3: Create Transaction with Missing Required Fields

| Field | Value |
|-------|-------|
| **Test Case ID** | TRN-CT-002 |
| **Test Item** | Create Transaction with Missing Required Information |
| **Test Type** | Abnormal Case |
| **Precondition** | 1. User is logged in. 2. User navigates to Transactions page. 3. Transaction form is accessible. |
| **Test Steps** | 1. Navigate to the Transactions page. 2. Click on the "Add Transaction" button. 3. Verify the Transaction form dialog opens. 4. Leave the bank account field unselected. 5. Leave the description field empty. 6. Leave the amount field empty. 7. Leave the transaction type unselected. 8. Attempt to click the "Save" or "Create" button. 9. Verify form validation behavior. 10. Enter only the description. 11. Attempt to submit again. 12. Verify validation messages for each missing required field. |
| **Expected Output** | 1. Form dialog opens successfully. 2. Form prevents submission when required fields are missing. 3. Validation error messages are displayed for each missing required field (e.g., "Bank account is required", "Description is required", "Amount is required", "Transaction type is required"). 4. Error messages are displayed in red or with appropriate styling near the respective fields. 5. Form does not close or submit with invalid data. 6. User can correct the errors and resubmit. 7. No transaction is created in the database with invalid data. |

---

## Test Case 4: Create Transaction with Invalid Amount

| Field | Value |
|-------|-------|
| **Test Case ID** | TRN-CT-003 |
| **Test Item** | Create Transaction with Invalid Amount Value |
| **Test Type** | Abnormal Case |
| **Precondition** | 1. User is logged in. 2. User navigates to Transactions page. 3. Transaction form is accessible. |
| **Test Steps** | 1. Navigate to the Transactions page. 2. Click on the "Add Transaction" button. 3. Enter valid bank account, description, and transaction type. 4. Enter zero (0) as the amount. 5. Attempt to submit the form. 6. Verify validation behavior. 7. Enter a negative amount for an income transaction. 8. Attempt to submit again. 9. Enter a non-numeric value (e.g., "abc") in the amount field. 10. Attempt to submit again. 11. Verify validation messages. |
| **Expected Output** | 1. Form prevents submission with invalid amount values. 2. Validation error message is displayed for zero amount (e.g., "Amount must be greater than 0"). 3. Validation error message is displayed for negative income amounts (e.g., "Income amount cannot be negative"). 4. Validation error message is displayed for non-numeric values (e.g., "Amount must be a valid number"). 5. Error messages are displayed near the amount field. 6. Form does not close or submit with invalid data. 7. User can correct the error and resubmit. 8. No transaction is created with invalid amount. |

---

## Test Case 5: Edit Existing Transaction

| Field | Value |
|-------|-------|
| **Test Case ID** | TRN-ET-001 |
| **Test Item** | Edit Transaction Information |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. User has at least one existing transaction (TRN-001) in the system. 3. Transaction TRN-001 has description "Old Description" and amount 100.00. |
| **Test Steps** | 1. Navigate to the Transactions page. 2. Locate the transaction TRN-001 in the transactions list. 3. Click on the "Edit" button or icon on the transaction row/card. 4. Verify the Transaction form dialog opens with pre-filled data. 5. Verify all existing transaction information is displayed correctly in the form. 6. Modify the description to "Updated Description". 7. Modify the amount to 150.00. 8. Change the category to a different category. 9. Update the transaction date if needed. 10. Click the "Save" or "Update" button. 11. Verify the form closes after successful update. 12. Verify the transaction row/card displays the updated information. |
| **Expected Output** | 1. Edit button/icon is visible and clickable on the transaction row/card. 2. Form dialog opens with all existing transaction data pre-filled. 3. User can modify any editable fields. 4. Form validation works correctly for edited data. 5. Success message is displayed (e.g., "Transaction updated successfully"). 6. Form dialog closes after successful update. 7. Transaction row/card reflects all updated information immediately. 8. Transaction amount is updated correctly. 9. Bank account balance is recalculated to reflect the updated transaction. 10. Changes are persisted in the database. 11. No errors occur during the update process. |

---

## Test Case 6: Delete Transaction

| Field | Value |
|-------|-------|
| **Test Case ID** | TRN-DT-001 |
| **Test Item** | Delete Transaction |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. User has at least one transaction (TRN-002) that can be deleted. 3. Transaction TRN-002 is not linked to critical business processes (e.g., closed month reconciliation). |
| **Test Steps** | 1. Navigate to the Transactions page. 2. Locate the transaction TRN-002 in the transactions list. 3. Click on the "Delete" button or icon on the transaction row/card. 4. Verify a confirmation dialog appears asking "Are you sure you want to delete this transaction?". 5. Click "Confirm" or "Yes" in the confirmation dialog. 6. Verify the transaction is removed from the list. 7. Verify a success message is displayed. 8. Verify the transaction no longer appears in the list after page refresh. 9. Verify the bank account balance is updated to reflect the deleted transaction. |
| **Expected Output** | 1. Delete button/icon is visible and clickable on the transaction row/card. 2. Confirmation dialog appears before deletion to prevent accidental deletion. 3. User can cancel the deletion by clicking "Cancel" in the confirmation dialog. 4. After confirmation, transaction is removed from the UI immediately. 5. Success message is displayed (e.g., "Transaction deleted successfully"). 6. Transaction is removed from the database. 7. Transaction no longer appears in any transaction lists or reports. 8. Bank account balance is recalculated and updated correctly. 9. No errors occur during the deletion process. |

---

## Test Case 7: Filter Transactions by Date Range

| Field | Value |
|-------|-------|
| **Test Case ID** | TRN-FILTER-001 |
| **Test Item** | Filter Transactions by Date Range |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. User has transactions recorded across multiple months. 3. Transactions exist for current month, previous month, and older months. |
| **Test Steps** | 1. Navigate to the Transactions page. 2. Locate the date filter controls (Date From and Date To fields). 3. Set "Date From" to the first day of the previous month (e.g., 2024-11-01). 4. Set "Date To" to the last day of the previous month (e.g., 2024-11-30). 5. Click "Apply Filter" or wait for automatic filter application. 6. Verify only transactions within the selected date range are displayed. 7. Verify transactions outside the date range are not shown. 8. Clear the date filters or set to current month. 9. Verify all transactions are displayed again. |
| **Expected Output** | 1. Date filter controls are visible and functional. 2. Date picker allows selection of valid dates. 3. Filtering by date range works correctly. 4. Only transactions within the selected date range are displayed. 5. Transaction count updates to reflect filtered results. 6. Date filters can be cleared to show all transactions. 7. Filter state persists during page navigation if implemented. 8. No errors occur during filtering. |

---

## Test Case 8: Filter Transactions by Type and Category

| Field | Value |
|-------|-------|
| **Test Case ID** | TRN-FILTER-002 |
| **Test Item** | Filter Transactions by Transaction Type and Category |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. User has transactions of different types (Income and Expense). 3. User has transactions in different categories (e.g., Food, Transportation, Salary). |
| **Test Steps** | 1. Navigate to the Transactions page. 2. Locate the transaction type filter (dropdown or toggle). 3. Select "Expense" from the transaction type filter. 4. Verify only expense transactions are displayed. 5. Clear the type filter or select "All Types". 6. Verify all transactions are displayed again. 7. Locate the category filter dropdown. 8. Select a specific category (e.g., "Food & Dining"). 9. Verify only transactions in that category are displayed. 10. Apply both type filter (Expense) and category filter (Food & Dining) simultaneously. 11. Verify filtered results match both criteria. |
| **Expected Output** | 1. Transaction type filter is visible and functional. 2. Category filter is visible and functional. 3. Filtering by transaction type works correctly. 4. Filtering by category works correctly. 5. Multiple filters can be applied simultaneously. 6. Filtered results are accurate and match all applied criteria. 7. Clear/Reset filter functionality works to show all transactions. 8. Transaction count updates to reflect filtered results. 9. No errors occur during filtering. |

---

## Test Case 9: Search Transactions by Description

| Field | Value |
|-------|-------|
| **Test Case ID** | TRN-SEARCH-001 |
| **Test Item** | Search Transactions by Description Keywords |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. User has multiple transactions with different descriptions (e.g., "Grocery Store", "Gas Station", "Salary Payment"). |
| **Test Steps** | 1. Navigate to the Transactions page. 2. Locate the search input field. 3. Enter a search keyword (e.g., "Grocery") in the search field. 4. Verify the search is executed (automatically or after clicking search button). 5. Verify only transactions containing the keyword in their description are displayed. 6. Verify the search is case-insensitive (test with "grocery" and "GROCERY"). 7. Clear the search field. 8. Verify all transactions are displayed again. 9. Enter a keyword that matches no transactions. 10. Verify "No transactions found" message is displayed. |
| **Expected Output** | 1. Search input field is visible and functional. 2. Search executes correctly and filters transactions by description. 3. Search is case-insensitive. 4. Search results are accurate and match the keyword. 5. Search can be cleared to show all transactions. 6. Empty state message is displayed when no results are found. 7. Search works in combination with other filters. 8. No errors occur during search. |

---

## Test Case 10: Sort Transactions

| Field | Value |
|-------|-------|
| **Test Case ID** | TRN-SORT-001 |
| **Test Item** | Sort Transactions by Different Criteria |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. User has at least 10 transactions with varying dates, amounts, and descriptions. |
| **Test Steps** | 1. Navigate to the Transactions page. 2. Locate the sort controls (column headers in table view or sort dropdown). 3. Click on the "Date" column header to sort by date. 4. Verify transactions are sorted by date (ascending). 5. Click again to reverse sort order (descending). 6. Verify transactions are sorted by date (descending, most recent first). 7. Click on the "Amount" column header to sort by amount. 8. Verify transactions are sorted by amount (ascending). 9. Click again to reverse sort order (descending). 10. Verify transactions are sorted by amount (descending, highest first). 11. Test sorting by description alphabetically. |
| **Expected Output** | 1. Sort controls are visible and functional. 2. Sorting by date works correctly in both ascending and descending order. 3. Sorting by amount works correctly in both ascending and descending order. 4. Sorting by description works correctly alphabetically. 5. Sort indicators (arrows) show current sort direction. 6. Transactions are reordered correctly based on selected sort criteria. 7. Sort state persists during filtering and searching. 8. No errors occur during sorting. |

---

## Test Case 11: View Transaction Details

| Field | Value |
|-------|-------|
| **Test Case ID** | TRN-VD-001 |
| **Test Item** | View Detailed Information for a Transaction |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. User has at least one transaction (TRN-003) with complete information. 3. Transaction has description, amount, category, date, bank account, and optional notes. |
| **Test Steps** | 1. Navigate to the Transactions page. 2. Locate the transaction TRN-003 in the transactions list. 3. Click on the transaction row/card to view details. 4. Verify a details modal or page opens. 5. Verify the modal/page displays all transaction information: description, amount, type, category, date, bank account, notes. 6. Verify all information is accurate and matches the transaction data. 7. Verify currency formatting is applied correctly. 8. Close the details modal or navigate back. 9. Verify user returns to transactions list. |
| **Expected Output** | 1. Transaction row/card is clickable to view details. 2. Details modal/page opens successfully. 3. All transaction information is displayed accurately. 4. Information is properly formatted (dates, currency, etc.). 5. Modal/page can be closed easily. 6. No errors occur during the view operation. |

---

## Test Case 12: Switch Between Table and Card View

| Field | Value |
|-------|-------|
| **Test Case ID** | TRN-VIEW-001 |
| **Test Item** | Toggle Between Table View and Card View |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. User has at least 5 transactions in the system. 3. Transactions page supports both table and card view modes. |
| **Test Steps** | 1. Navigate to the Transactions page. 2. Verify the default view mode (table or cards) is displayed. 3. Locate the view toggle buttons (Table view and Card view icons). 4. Click on the "Card View" button if currently in table view. 5. Verify transactions are displayed in card format. 6. Verify all transaction information is visible in card format. 7. Click on the "Table View" button. 8. Verify transactions are displayed in table format. 9. Verify all transaction information is visible in table format. 10. Verify view preference is saved (if implemented) and persists on page reload. |
| **Expected Output** | 1. View toggle buttons are visible and functional. 2. Switching to card view displays transactions as cards. 3. Switching to table view displays transactions as table rows. 4. All transaction information is visible in both view modes. 5. View mode change is immediate and smooth. 6. Filters, sorting, and search work in both view modes. 7. View preference persists if implemented. 8. No errors occur during view switching. |

---

## Test Case 13: Upload Transactions via CSV/File

| Field | Value |
|-------|-------|
| **Test Case ID** | TRN-UPLOAD-001 |
| **Test Item** | Upload and Import Transactions from CSV File |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. User has a valid CSV file with transaction data. 3. CSV file contains columns: date, description, amount, type, category. 4. File upload functionality is enabled. |
| **Test Steps** | 1. Navigate to the Transactions page. 2. Locate the "Upload Transactions" or "Import CSV" button. 3. Click on the upload button. 4. Verify file upload dialog or file picker opens. 5. Select a valid CSV file from the file system. 6. Verify file is uploaded and processing begins. 7. Verify a progress indicator is displayed during upload. 8. Wait for upload and processing to complete. 9. Verify success message is displayed (e.g., "10 transactions imported successfully"). 10. Verify imported transactions appear in the transactions list. |
| **Expected Output** | 1. Upload button is visible and functional. 2. File picker opens successfully. 3. Valid CSV file is accepted. 4. File upload progress is indicated to the user. 5. CSV file is parsed correctly. 6. Transactions are imported and created in the system. 7. Success message shows the number of transactions imported. 8. Imported transactions appear in the transactions list with correct data. 9. Duplicate detection works if implemented (prevents duplicate imports). 10. No errors occur during upload and import process. |

---

## Test Case 14: Upload Transactions with Invalid File Format

| Field | Value |
|-------|-------|
| **Test Case ID** | TRN-UPLOAD-002 |
| **Test Item** | Handle Invalid File Format During Upload |
| **Test Type** | Abnormal Case |
| **Precondition** | 1. User is logged in. 2. User has an invalid file (e.g., .txt file, corrupted CSV, wrong format). 3. File upload functionality is accessible. |
| **Test Steps** | 1. Navigate to the Transactions page. 2. Click on the "Upload Transactions" button. 3. Select an invalid file (e.g., .txt file instead of .csv). 4. Attempt to upload the file. 5. Verify error handling behavior. 6. Select a CSV file with incorrect column headers. 7. Attempt to upload again. 8. Verify validation and error messages. |
| **Expected Output** | 1. System validates file format before processing. 2. Error message is displayed for invalid file format (e.g., "Invalid file format. Please upload a CSV file."). 3. Error message is displayed for CSV with incorrect columns (e.g., "CSV file must contain columns: date, description, amount, type, category."). 4. File is not processed or imported. 5. User can select a different file and retry. 6. No partial or corrupted data is imported. 7. Error messages are clear and actionable. |

---

## Test Case 15: Link Transaction to Bill

| Field | Value |
|-------|-------|
| **Test Case ID** | TRN-LINK-001 |
| **Test Item** | Link Transaction to an Existing Bill |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. User has at least one transaction (TRN-004) that can be linked. 3. User has at least one unpaid bill (BILL-001) in the system. 4. Transaction amount matches or is related to the bill amount. |
| **Test Steps** | 1. Navigate to the Transactions page. 2. Locate the transaction TRN-004. 3. Click on the "Link" or "Connect" button/icon on the transaction. 4. Verify a link dialog or dropdown appears. 5. Select "Link to Bill" option. 6. Select bill BILL-001 from the bill dropdown. 7. Click "Save" or "Link" button. 8. Verify the transaction is linked to the bill. 9. Verify the transaction shows a link indicator or badge. 10. Verify the bill status updates if the linked transaction pays the bill. |
| **Expected Output** | 1. Link button/icon is visible and functional on transactions. 2. Link dialog/dropdown opens successfully. 3. User can select a bill to link. 4. Link is created successfully. 5. Success message is displayed (e.g., "Transaction linked to bill successfully"). 6. Transaction displays link indicator (e.g., badge or icon showing it's linked). 7. Bill status updates appropriately if transaction amount covers the bill. 8. Linked relationship is visible in both transaction and bill views. 9. No errors occur during linking process. |

---

## Test Case 16: Transactions Page Load Failure

| Field | Value |
|-------|-------|
| **Test Case ID** | TRN-LOAD-001 |
| **Test Item** | Handle Transactions Page Load Failure |
| **Test Type** | Abnormal Case |
| **Precondition** | 1. User is logged in. 2. Network connection is available initially. 3. User has transactions in the system. |
| **Test Steps** | 1. Navigate to the Transactions page. 2. While the page is loading, simulate network disconnection (disable network in browser DevTools). 3. Wait for API calls to fail. 4. Verify error handling behavior. 5. Verify error messages are displayed to the user. 6. Re-enable network connection. 7. Click on a "Retry" or "Refresh" button if available. 8. Verify the page attempts to reload transactions. |
| **Expected Output** | 1. Page displays appropriate error messages when API calls fail. 2. Error messages are user-friendly (e.g., "Failed to load transactions. Please check your connection and try again."). 3. Loading indicators stop displaying after error occurs. 4. User is not left with a blank screen or infinite loading state. 5. Retry/Refresh functionality is available and functional. 6. After network restoration and retry, transactions load successfully. 7. No JavaScript errors are thrown that break the page functionality. |

