# Chatbot Interactive Forms Guide

## Overview
The UtilityHub360 Chatbot now supports interactive forms in **Basic Mode** (when AI is turned off), allowing users to manage their finances directly within the chat interface.

## Features

### 1. **Manage Bills**
Users can:
- **View All Bills**: Display a list of all bills with status indicators (PAID, PENDING, OVERDUE)
- **Add New Bill**: Fill out an interactive form to create a new bill with:
  - Bill Name
  - Bill Type (Utility, Insurance, Subscription, etc.)
  - Amount
  - Due Date
  - Frequency (Monthly, Quarterly, Yearly)
  - Provider (Optional)
  - Notes (Optional)

### 2. **Manage Loans**
Users can:
- **View All Loans**: Display a list of all loans with principal, monthly payment, and status
- **Apply for Loan**: Submit a loan application with:
  - Loan Purpose
  - Principal Amount
  - Interest Rate
  - Term (in months)
  - Monthly Income
  - Employment Status
  - Additional Info (Optional)

### 3. **Manage Bank Accounts**
Users can:
- **View All Accounts**: Display a list of all bank accounts with balances
- **Add Bank Account**: Create a new bank account with:
  - Account Name
  - Account Type (Checking, Savings, Credit Card, Investment)
  - Initial Balance
  - Currency
  - Financial Institution (Optional)
  - Account Number (Optional)
  - Description (Optional)

### 4. **Manage Savings Goals**
Users can:
- **View All Savings**: Display a list of all savings goals with progress percentages
- **Create Savings Goal**: Set up a new savings goal with:
  - Goal Name
  - Savings Type (Emergency, Vacation, Retirement, Education, etc.)
  - Target Amount
  - Target Date
  - Goal Description (Optional)
  - Additional Notes (Optional)

## How to Use

### Accessing the Chatbot
1. Click the floating chat icon in the bottom-right corner of the screen
2. Toggle the AI switch to OFF for Basic Mode (interactive forms are optimized for Basic Mode)

### Using Interactive Forms

#### Starting a Conversation:
The chatbot will greet you with quick action buttons:
- **Manage Bills**
- **Manage Loans**
- **Bank Accounts**
- **Savings Goals**
- **View Reports**

#### Example Flow - Adding a Bill:
1. Click "Manage Bills"
2. Click "Add New Bill"
3. Fill out the form that appears in the chat
4. Click "Add Bill" to submit
5. Receive confirmation message with options to:
   - View All Bills
   - Add Another Bill

#### Example Flow - Viewing Bills:
1. Click "Manage Bills"
2. Click "View My Bills"
3. See a list of up to 5 bills with details
4. Each bill shows:
   - Bill name
   - Type and amount
   - Due date
   - Status badge (color-coded)

### Natural Language Support
You can also type messages in Basic Mode:
- "I need help managing my bills"
- "I need help managing my loans"
- "I need help managing my bank accounts"
- "I need help managing my savings"

The chatbot will respond with appropriate options and forms.

## Form Validation
All forms include:
- Required field validation
- Numeric input validation for amounts
- Date picker for due dates and target dates
- Dropdown menus for predefined options

## Success & Error Handling
- **Success**: Green checkmark (✅) with success message and follow-up actions
- **Error**: Red X (❌) with error message explaining what went wrong

## Benefits
- **Convenience**: Manage finances without leaving the chat interface
- **Guided Experience**: Step-by-step forms with clear labels
- **Quick Actions**: One-click access to common tasks
- **Comprehensive Lists**: View all items with key details at a glance
- **Real-time Feedback**: Immediate confirmation of actions

## Technical Details
- Forms are rendered inline within chat messages
- Data is submitted to the backend API via the `apiService`
- Lists are paginated (showing up to 5 items with a count of remaining items)
- Forms use Material-UI components for consistent styling
- All forms support both keyboard (Enter key) and mouse interactions

## Future Enhancements
Potential future improvements:
- Edit existing items directly in the chat
- Delete items with confirmation
- Advanced filtering and search
- Bulk operations
- Export functionality
- More detailed analytics and charts

