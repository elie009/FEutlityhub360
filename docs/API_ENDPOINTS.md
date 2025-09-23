# API Endpoints Documentation

## Base Configuration
- **Base URL:** https://your-api-domain.com/api
- **Authentication:** JWT Bearer tokens
- **Content-Type:** pplication/json

## 1. Authentication Endpoints

### POST /auth/register
**Description:** Register a new user
**Request Body:**
`json
{
  "name": "string (required, 2-100 chars)",
  "email": "string (required, valid email)",
  "phone": "string (required, valid phone)",
  "password": "string (required, min 6 chars)",
  "confirmPassword": "string (required, must match password)"
}
`
**Response:** User object with JWT tokens

### POST /auth/login
**Description:** Authenticate user
**Request Body:**
`json
{
  "email": "string (required)",
  "password": "string (required)"
}
`
**Response:** User object with JWT tokens

### GET /auth/me
**Description:** Get current authenticated user
**Headers:** Authorization: Bearer <token>
**Response:** User object

## 2. User Management Endpoints

### GET /users/{userId}
**Description:** Get user by ID
**Headers:** Authorization: Bearer <token>
**Response:** User object

## 3. Loan Management Endpoints

### POST /loans/apply
**Description:** Apply for a new loan
**Headers:** Authorization: Bearer <token>
**Request Body:**
`json
{
  "principal": "number (required, 1000-100000)",
  "purpose": "string (required, 10-500 chars)",
  "term": "number (required, 6|12|24|36|48|60)",
  "monthlyIncome": "number (required, min 1000)",
  "employmentStatus": "string (required, employed|self-employed|unemployed|retired|student)",
  "additionalInfo": "string (optional, max 1000 chars)"
}
`
**Response:** Loan object

### GET /loans/{loanId}
**Description:** Get loan details
**Headers:** Authorization: Bearer <token>
**Response:** Loan object

### GET /users/{userId}/loans
**Description:** Get all loans for a user
**Headers:** Authorization: Bearer <token>
**Query Parameters:** ?status=PENDING&page=1&limit=10
**Response:** Array of loan objects with pagination

### GET /loans/{loanId}/status
**Description:** Get loan status and outstanding balance
**Headers:** Authorization: Bearer <token>
**Response:**
`json
{
  "status": "string",
  "outstandingBalance": "number"
}
`

### GET /loans/{loanId}/schedule
**Description:** Get repayment schedule for a loan
**Headers:** Authorization: Bearer <token>
**Response:** Array of repayment schedule objects

### GET /loans/{loanId}/transactions
**Description:** Get transaction history for a loan
**Headers:** Authorization: Bearer <token>
**Response:** Array of transaction objects

## 4. Admin Endpoints

### PUT /loans/{loanId}/approve
**Description:** Approve a loan (Admin only)
**Headers:** Authorization: Bearer <token>
**Request Body:**
`json
{
  "approvedBy": "string (admin user ID)",
  "notes": "string (optional)"
}
`

### PUT /loans/{loanId}/reject
**Description:** Reject a loan (Admin only)
**Headers:** Authorization: Bearer <token>
**Request Body:**
`json
{
  "reason": "string (required)",
  "rejectedBy": "string (admin user ID)",
  "notes": "string (optional)"
}
`

### POST /transactions/disburse
**Description:** Disburse a loan (Admin only)
**Headers:** Authorization: Bearer <token>
**Request Body:**
`json
{
  "loanId": "string (required)",
  "disbursedBy": "string (admin user ID)",
  "disbursementMethod": "string (BANK_TRANSFER|CASH|CHECK)",
  "reference": "string (optional)"
}
`

### PUT /loans/{loanId}/close
**Description:** Close a loan (Admin only)
**Headers:** Authorization: Bearer <token>
**Request Body:**
`json
{
  "closedBy": "string (admin user ID)",
  "notes": "string (optional)"
}
`

## 5. Payment Endpoints

### POST /payments
**Description:** Make a payment
**Headers:** Authorization: Bearer <token>
**Request Body:**
`json
{
  "loanId": "string (required)",
  "amount": "number (required, min 0.01)",
  "method": "string (required, BANK_TRANSFER|CARD|WALLET|CASH)",
  "reference": "string (required, 3-50 chars)"
}
`
**Response:** Payment object

### GET /payments/{paymentId}
**Description:** Get payment details
**Headers:** Authorization: Bearer <token>
**Response:** Payment object

### GET /loans/{loanId}/payments
**Description:** Get all payments for a loan
**Headers:** Authorization: Bearer <token>
**Query Parameters:** ?page=1&limit=10
**Response:** Array of payment objects with pagination

## 6. Notification Endpoints

### GET /notifications/{userId}
**Description:** Get user notifications
**Headers:** Authorization: Bearer <token>
**Query Parameters:** ?status=unread&type=PAYMENT_DUE&page=1&limit=10
**Response:** Array of notification objects with pagination

### PUT /notifications/{notificationId}/read
**Description:** Mark notification as read
**Headers:** Authorization: Bearer <token>
**Response:** Updated notification object

### POST /notifications/send
**Description:** Send notification (Admin only)
**Headers:** Authorization: Bearer <token>
**Request Body:**
`json
{
  "userId": "string (required)",
  "type": "string (required, notification type enum)",
  "message": "string (required, max 500 chars)"
}
`

## 7. Report Endpoints

### GET /reports/user/{userId}
**Description:** Get user financial report
**Headers:** Authorization: Bearer <token>
**Query Parameters:** ?period=year&startDate=2024-01-01&endDate=2024-12-31
**Response:** User report object

### GET /reports/loan/{loanId}
**Description:** Get loan detailed report
**Headers:** Authorization: Bearer <token>
**Response:** Loan report object
