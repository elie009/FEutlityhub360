# Test Specification: Income Sources

## Main Item: Money Overview
## Sub Item: Income Sources Management

---

## Test Case 1: View Income Sources List

| Field | Value |
|-------|-------|
| **Test Case ID** | INC-VIS-001 |
| **Test Item** | View All Income Sources |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in with valid authentication token. 2. User has at least 3 income sources configured in the system. 3. Income sources have different frequencies (MONTHLY, WEEKLY, QUARTERLY, YEARLY). 4. System has income source data available. |
| **Test Steps** | 1. Navigate to the Income Sources page ("/income-sources"). 2. Wait for the page to load completely. 3. Verify the income sources list is displayed. 4. Verify each income source card/row displays: name, amount, frequency, category, currency, company, description. 5. Verify the total monthly income summary is displayed at the top of the page. 6. Verify the total count of income sources is displayed. 7. Verify active and inactive income sources are distinguished (if applicable). 8. Verify currency formatting is applied correctly to all amounts. 9. Verify monthly equivalent amounts are calculated and displayed for non-monthly frequencies. |
| **Expected Output** | 1. Income Sources page loads successfully without errors. 2. Income sources list displays all available income sources. 3. All income source fields are visible and properly formatted. 4. Total monthly income summary is accurate and displayed prominently. 5. Income source count is accurate. 6. Amounts are formatted with proper currency symbols and decimal places. 7. Frequency labels are displayed correctly (Monthly, Weekly, Quarterly, Yearly). 8. Monthly equivalent amounts are calculated correctly (e.g., Weekly amount × 4.33, Yearly amount ÷ 12). 9. No loading skeletons or errors are visible after data loads. |

---

## Test Case 2: Create Income Source with Valid Data

| Field | Value |
|-------|-------|
| **Test Case ID** | INC-CIS-001 |
| **Test Item** | Create Income Source with Valid Information |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. User has permission to create income sources. 3. Income source form is accessible. |
| **Test Steps** | 1. Navigate to the Income Sources page. 2. Click on the "Add Income Source" or "New Income Source" button. 3. Verify the Income Source form dialog opens. 4. Enter a valid income source name (e.g., "Software Developer Salary"). 5. Enter a valid amount (e.g., 5000.00). 6. Select frequency from dropdown (e.g., "MONTHLY", "WEEKLY", "QUARTERLY", "YEARLY"). 7. Select category from dropdown (e.g., "PRIMARY", "BUSINESS", "PASSIVE"). 8. Select currency from dropdown (e.g., "USD", "EUR", "GBP"). 9. Enter company name (optional, e.g., "Tech Corp Inc."). 10. Enter description (optional, e.g., "Full-time software development position"). 11. Verify the "Active" checkbox is checked by default. 12. Click the "Save" or "Create" button. 13. Verify the form closes after successful submission. 14. Verify the new income source appears in the income sources list. |
| **Expected Output** | 1. Income Source form dialog opens successfully. 2. All form fields are visible and editable. 3. Frequency dropdown shows all available options. 4. Category dropdown shows all available categories. 5. Currency dropdown shows all supported currencies. 6. Form validation allows submission with valid data. 7. Success message is displayed (e.g., "Income source created successfully"). 8. Form dialog closes automatically after successful creation. 9. New income source card/row appears in the list with correct information. 10. Total monthly income summary updates to include the new income source. 11. Monthly equivalent amount is calculated and displayed correctly. 12. No errors occur during the creation process. |

---

## Test Case 3: Create Income Source with Missing Required Fields

| Field | Value |
|-------|-------|
| **Test Case ID** | INC-CIS-002 |
| **Test Item** | Create Income Source with Missing Required Information |
| **Test Type** | Abnormal Case |
| **Precondition** | 1. User is logged in. 2. User navigates to Income Sources page. 3. Income Source form is accessible. |
| **Test Steps** | 1. Navigate to the Income Sources page. 2. Click on the "Add Income Source" button. 3. Verify the Income Source form dialog opens. 4. Leave the name field empty. 5. Leave the amount field empty. 6. Leave the frequency field unselected. 7. Leave the category field unselected. 8. Attempt to click the "Save" or "Create" button. 9. Verify form validation behavior. 10. Enter only the name. 11. Attempt to submit again. 12. Verify validation messages for each missing required field. |
| **Expected Output** | 1. Form dialog opens successfully. 2. Form prevents submission when required fields are missing. 3. Validation error messages are displayed for each missing required field (e.g., "Name is required", "Amount is required", "Frequency is required", "Category is required"). 4. Error messages are displayed in red or with appropriate styling near the respective fields. 5. Form does not close or submit with invalid data. 6. User can correct the errors and resubmit. 7. No income source is created in the database with invalid data. |

---

## Test Case 4: Create Income Source with Invalid Amount

| Field | Value |
|-------|-------|
| **Test Case ID** | INC-CIS-003 |
| **Test Item** | Create Income Source with Invalid Amount Value |
| **Test Type** | Abnormal Case |
| **Precondition** | 1. User is logged in. 2. User navigates to Income Sources page. 3. Income Source form is accessible. |
| **Test Steps** | 1. Navigate to the Income Sources page. 2. Click on the "Add Income Source" button. 3. Enter valid name, frequency, and category. 4. Enter zero (0) as the amount. 5. Attempt to submit the form. 6. Verify validation behavior. 7. Enter a negative amount (e.g., -100.00). 8. Attempt to submit again. 9. Enter a non-numeric value (e.g., "abc") in the amount field. 10. Attempt to submit again. 11. Verify validation messages. |
| **Expected Output** | 1. Form prevents submission with invalid amount values. 2. Validation error message is displayed for zero amount (e.g., "Amount must be greater than 0"). 3. Validation error message is displayed for negative amount (e.g., "Amount cannot be negative"). 4. Validation error message is displayed for non-numeric values (e.g., "Amount must be a valid number"). 5. Error messages are displayed near the amount field. 6. Form does not close or submit with invalid data. 7. User can correct the error and resubmit. 8. No income source is created with invalid amount. |

---

## Test Case 5: Edit Existing Income Source

| Field | Value |
|-------|-------|
| **Test Case ID** | INC-EIS-001 |
| **Test Item** | Edit Income Source Information |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. User has at least one existing income source (INC-001) in the system. 3. Income source INC-001 has name "Old Income Name" and amount 3000.00. |
| **Test Steps** | 1. Navigate to the Income Sources page. 2. Locate the income source card/row for INC-001. 3. Click on the "Edit" button or icon on the income source card/row. 4. Verify the Income Source form dialog opens with pre-filled data. 5. Verify all existing income source information is displayed correctly in the form. 6. Modify the name to "Updated Income Name". 7. Modify the amount to 4000.00. 8. Change the frequency from "MONTHLY" to "WEEKLY". 9. Update the category if needed. 10. Toggle the "Active" status if needed. 11. Click the "Save" or "Update" button. 12. Verify the form closes after successful update. 13. Verify the income source card/row displays the updated information. |
| **Expected Output** | 1. Edit button/icon is visible and clickable on the income source card/row. 2. Form dialog opens with all existing income source data pre-filled. 3. User can modify any editable fields. 4. Form validation works correctly for edited data. 5. Success message is displayed (e.g., "Income source updated successfully"). 6. Form dialog closes after successful update. 7. Income source card/row reflects all updated information immediately. 8. Total monthly income summary is recalculated and updated correctly. 9. Monthly equivalent amount is recalculated if frequency changed. 10. Changes are persisted in the database. 11. No errors occur during the update process. |

---

## Test Case 6: Delete Income Source

| Field | Value |
|-------|-------|
| **Test Case ID** | INC-DIS-001 |
| **Test Item** | Delete Income Source |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. User has at least one income source (INC-002) that can be deleted. 3. Income source INC-002 is not linked to critical business processes. |
| **Test Steps** | 1. Navigate to the Income Sources page. 2. Locate the income source card/row for INC-002. 3. Click on the "Delete" button or icon on the income source card/row. 4. Verify a confirmation dialog appears asking "Are you sure you want to delete this income source?". 5. Click "Confirm" or "Yes" in the confirmation dialog. 6. Verify the income source is removed from the list. 7. Verify a success message is displayed. 8. Verify the income source no longer appears in the list after page refresh. 9. Verify the total monthly income summary is updated to reflect the deletion. |
| **Expected Output** | 1. Delete button/icon is visible and clickable on the income source card/row. 2. Confirmation dialog appears before deletion to prevent accidental deletion. 3. User can cancel the deletion by clicking "Cancel" in the confirmation dialog. 4. After confirmation, income source is removed from the UI immediately. 5. Success message is displayed (e.g., "Income source deleted successfully"). 6. Income source is removed from the database. 7. Income source no longer appears in any income source lists or summaries. 8. Total monthly income summary is recalculated and updated correctly. 9. No errors occur during the deletion process. |

---

## Test Case 7: Toggle Income Source Active Status

| Field | Value |
|-------|-------|
| **Test Case ID** | INC-TOGGLE-001 |
| **Test Item** | Activate or Deactivate Income Source |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. User has at least one income source (INC-003) with active status. 3. Income source can be toggled between active and inactive states. |
| **Test Steps** | 1. Navigate to the Income Sources page. 2. Locate the income source card/row for INC-003. 3. Verify the income source is currently marked as "Active". 4. Click on the "Deactivate" button/toggle or edit the income source and uncheck "Active" checkbox. 5. Verify the income source status changes to "Inactive". 6. Verify the income source is visually distinguished as inactive (e.g., grayed out, different styling). 7. Verify the total monthly income summary excludes the inactive income source. 8. Reactivate the income source by clicking "Activate" or checking "Active" checkbox. 9. Verify the income source status changes back to "Active". 10. Verify the total monthly income summary includes the reactivated income source. |
| **Expected Output** | 1. Active/Inactive toggle or checkbox is visible and functional. 2. Income source can be deactivated successfully. 3. Income source status is visually indicated (active vs inactive). 4. Total monthly income summary excludes inactive income sources. 5. Income source can be reactivated successfully. 6. Total monthly income summary includes reactivated income sources. 7. Status changes are persisted in the database. 8. No errors occur during status toggle. |

---

## Test Case 8: Calculate Monthly Equivalent for Different Frequencies

| Field | Value |
|-------|-------|
| **Test Case ID** | INC-CALC-001 |
| **Test Item** | Verify Monthly Equivalent Calculation for Different Frequencies |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. User has income sources with different frequencies configured. 3. System calculates monthly equivalents correctly. |
| **Test Steps** | 1. Navigate to the Income Sources page. 2. Create or locate an income source with frequency "WEEKLY" and amount 1000.00. 3. Verify the monthly equivalent is calculated as approximately 4333.33 (1000 × 4.33). 4. Create or locate an income source with frequency "QUARTERLY" and amount 15000.00. 5. Verify the monthly equivalent is calculated as 5000.00 (15000 ÷ 3). 6. Create or locate an income source with frequency "YEARLY" and amount 60000.00. 7. Verify the monthly equivalent is calculated as 5000.00 (60000 ÷ 12). 8. Create or locate an income source with frequency "MONTHLY" and amount 5000.00. 9. Verify the monthly equivalent equals the amount itself (5000.00). 10. Verify the total monthly income summary includes all monthly equivalents correctly. |
| **Expected Output** | 1. Weekly frequency: Monthly equivalent = Weekly amount × 4.33 (or 52/12). 2. Quarterly frequency: Monthly equivalent = Quarterly amount ÷ 3. 3. Yearly frequency: Monthly equivalent = Yearly amount ÷ 12. 4. Monthly frequency: Monthly equivalent = Monthly amount (no conversion needed). 5. Monthly equivalents are displayed correctly for each income source. 6. Total monthly income summary is the sum of all active income source monthly equivalents. 7. Calculations are accurate and rounded appropriately (e.g., 2 decimal places). 8. No calculation errors occur. |

---

## Test Case 9: Filter Income Sources by Category

| Field | Value |
|-------|-------|
| **Test Case ID** | INC-FILTER-001 |
| **Test Item** | Filter Income Sources by Category |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. User has income sources in different categories (PRIMARY, BUSINESS, PASSIVE, INVESTMENT, etc.). |
| **Test Steps** | 1. Navigate to the Income Sources page. 2. Locate the category filter control (dropdown or checkboxes). 3. Select "PRIMARY" from the category filter. 4. Verify only income sources with PRIMARY category are displayed. 5. Clear the filter or select "All Categories". 6. Verify all income sources are displayed again. 7. Select multiple categories simultaneously (e.g., PRIMARY and BUSINESS). 8. Verify filtered results show income sources matching any of the selected categories. |
| **Expected Output** | 1. Category filter control is visible and functional. 2. Filtering by single category works correctly. 3. Filtering by multiple categories works correctly (shows union of selected categories). 4. Filtered results are accurate and match the selected criteria. 5. Clear/Reset filter functionality works to show all income sources. 6. Total monthly income summary updates to reflect only filtered active income sources. 7. No errors occur during filtering. |

---

## Test Case 10: Filter Income Sources by Active Status

| Field | Value |
|-------|-------|
| **Test Case ID** | INC-FILTER-002 |
| **Test Item** | Filter Income Sources by Active/Inactive Status |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. User has both active and inactive income sources. |
| **Test Steps** | 1. Navigate to the Income Sources page. 2. Locate the status filter control (dropdown or toggle). 3. Select "Active Only" from the status filter. 4. Verify only active income sources are displayed. 5. Select "Inactive Only" from the status filter. 6. Verify only inactive income sources are displayed. 7. Select "All" from the status filter. 8. Verify both active and inactive income sources are displayed. 9. Verify active and inactive income sources are visually distinguished. |
| **Expected Output** | 1. Status filter control is visible and functional. 2. Filtering by "Active Only" shows only active income sources. 3. Filtering by "Inactive Only" shows only inactive income sources. 4. Filtering by "All" shows both active and inactive income sources. 5. Active and inactive income sources are visually distinguished (e.g., different colors, badges, styling). 6. Total monthly income summary updates to reflect only active income sources when filtered. 7. No errors occur during filtering. |

---

## Test Case 11: View Income Source Summary Statistics

| Field | Value |
|-------|-------|
| **Test Case ID** | INC-SUMMARY-001 |
| **Test Item** | View Income Source Summary and Statistics |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. User has multiple income sources with different categories and frequencies. 3. System calculates summary statistics. |
| **Test Steps** | 1. Navigate to the Income Sources page. 2. Locate the summary section at the top of the page. 3. Verify the "Total Monthly Income" is displayed. 4. Verify the "Total Income Sources" count is displayed. 5. Verify the summary shows breakdown by category if available (e.g., PRIMARY: $5000, BUSINESS: $3000). 6. Verify the summary shows breakdown by frequency if available. 7. Verify all summary values are accurate and match the income sources list. 8. Add a new income source. 9. Verify the summary updates to reflect the new income source. |
| **Expected Output** | 1. Summary section is visible and prominently displayed. 2. Total monthly income is calculated correctly (sum of all active income source monthly equivalents). 3. Total income sources count is accurate. 4. Category breakdown is accurate if displayed. 5. Frequency breakdown is accurate if displayed. 6. Summary updates in real-time when income sources are added, edited, or deleted. 7. All summary values are formatted with proper currency symbols. 8. Summary calculations are accurate and consistent. |

---

## Test Case 12: Income Sources Page Load Failure

| Field | Value |
|-------|-------|
| **Test Case ID** | INC-LOAD-001 |
| **Test Item** | Handle Income Sources Page Load Failure |
| **Test Type** | Abnormal Case |
| **Precondition** | 1. User is logged in. 2. Network connection is available initially. 3. User has income sources in the system. |
| **Test Steps** | 1. Navigate to the Income Sources page. 2. While the page is loading, simulate network disconnection (disable network in browser DevTools). 3. Wait for API calls to fail. 4. Verify error handling behavior. 5. Verify error messages are displayed to the user. 6. Re-enable network connection. 7. Click on a "Retry" or "Refresh" button if available. 8. Verify the page attempts to reload income sources. |
| **Expected Output** | 1. Page displays appropriate error messages when API calls fail. 2. Error messages are user-friendly (e.g., "Failed to load income sources. Please check your connection and try again."). 3. Loading indicators stop displaying after error occurs. 4. User is not left with a blank screen or infinite loading state. 5. Retry/Refresh functionality is available and functional. 6. After network restoration and retry, income sources load successfully. 7. No JavaScript errors are thrown that break the page functionality. |

---

## Test Case 13: Create Income Source with Very Large Amount

| Field | Value |
|-------|-------|
| **Test Case ID** | INC-CIS-004 |
| **Test Item** | Create Income Source with Extremely Large Amount Value |
| **Test Type** | Abnormal Case |
| **Precondition** | 1. User is logged in. 2. User navigates to Income Sources page. 3. Income Source form is accessible. |
| **Test Steps** | 1. Navigate to the Income Sources page. 2. Click on the "Add Income Source" button. 3. Enter valid name, frequency, and category. 4. Enter an extremely large amount (e.g., 999999999999.99 or 1e15). 5. Attempt to submit the form. 6. Verify validation behavior and system handling. 7. Enter a reasonable large amount (e.g., 1000000.00). 8. Verify the system handles it correctly. |
| **Expected Output** | 1. System validates amount range if there are business rules (e.g., maximum amount limit). 2. Extremely large amounts are either: (a) Rejected with appropriate error message, OR (b) Accepted and stored correctly if within system limits. 3. Amount formatting handles large numbers correctly (e.g., proper comma separators, no scientific notation in display). 4. Calculations (monthly equivalents) work correctly with large amounts. 5. No system errors or crashes occur with large amounts. 6. Database can store the value without overflow errors. |

---

## Test Case 14: Edit Income Source Frequency and Verify Recalculation

| Field | Value |
|-------|-------|
| **Test Case ID** | INC-EIS-002 |
| **Test Item** | Edit Income Source Frequency and Verify Monthly Equivalent Recalculation |
| **Test Type** | Normal Case |
| **Precondition** | 1. User is logged in. 2. User has an income source (INC-004) with frequency "MONTHLY" and amount 5000.00. |
| **Test Steps** | 1. Navigate to the Income Sources page. 2. Locate the income source INC-004. 3. Note the current monthly equivalent (should be 5000.00). 4. Click on the "Edit" button for INC-004. 5. Change the frequency from "MONTHLY" to "WEEKLY". 6. Keep the amount as 5000.00. 7. Click "Save" to update. 8. Verify the monthly equivalent is recalculated to approximately 21650.00 (5000 × 4.33). 9. Verify the total monthly income summary updates to reflect the new monthly equivalent. 10. Edit again and change frequency back to "MONTHLY". 11. Verify the monthly equivalent returns to 5000.00. |
| **Expected Output** | 1. Frequency can be changed during edit. 2. Monthly equivalent is recalculated immediately when frequency changes. 3. Recalculation is accurate based on the new frequency. 4. Total monthly income summary updates correctly after frequency change. 5. Changes are persisted in the database. 6. No calculation errors occur during frequency change. 7. UI updates immediately to show new monthly equivalent. |

