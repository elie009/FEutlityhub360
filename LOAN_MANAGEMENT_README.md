# Loan Management System

A comprehensive loan management system built with React, TypeScript, and Material-UI that provides complete loan lifecycle management for users.

## Features

### 🔐 Authentication & User Management
- User registration and login
- Secure authentication with JWT tokens
- User profile management
- Protected routes

### 💰 Loan Management
- **Loan Application**: Multi-step loan application form with validation
  - Loan amount (principal)
  - Purpose of loan
  - Loan term (6, 12, 24, 36, 48, or 60 months)
  - Monthly income
  - Employment status (employed, self-employed, unemployed, retired, student)
  - Additional information (optional)
- **Loan Dashboard**: Overview of all user loans with status indicators
- **Loan Details**: Detailed view with repayment schedule and transaction history
- **Loan Status Tracking**: Pending, Approved, Active, Closed, Rejected, Overdue

### 💳 Payment Processing
- **Payment Form**: Make payments with multiple payment methods
- **Payment History**: Track all payment transactions
- **Payment Methods**: Bank Transfer, Credit/Debit Card, Digital Wallet, Cash
- **Quick Payment Options**: Minimum payment, half balance, full balance

### 📊 Repayment Management
- **Repayment Schedule**: Detailed breakdown of principal and interest
- **Payment Tracking**: Real-time payment status updates
- **Outstanding Balance**: Current balance and remaining payments
- **Payment Due Dates**: Upcoming payment notifications

### 🔔 Notifications System
- **Real-time Alerts**: Payment due, overdue, approval notifications
- **Notification Center**: Centralized notification management
- **Multiple Types**: Loan approved/rejected, payment confirmations, overdue alerts
- **Read/Unread Status**: Track notification status

### 📈 Reports & Analytics
- **Financial Summary**: Total borrowed, paid, outstanding amounts
- **Loan Performance**: Active, closed, overdue loan statistics
- **Payment History**: Comprehensive payment tracking
- **Export Reports**: Download detailed reports

## Technical Architecture

### Frontend Stack
- **React 19** with TypeScript
- **Material-UI (MUI)** for UI components
- **React Router** for navigation
- **Context API** for state management
- **Axios** for API calls (via fetch API)

### Key Components

#### Authentication
- `AuthContext`: Global authentication state management
- `LoginForm`: User login component
- `RegisterForm`: User registration component
- `AuthPage`: Authentication page wrapper

#### Loan Management
- `LoanDashboard`: Main loans overview page
- `LoanApplicationForm`: Multi-step loan application
- `LoanCard`: Individual loan display card
- `LoanDetails`: Detailed loan view with schedule
- `PaymentForm`: Payment processing form

#### Notifications
- `NotificationCenter`: Centralized notification management
- Real-time notification updates
- Notification filtering and status management

#### Reports
- `ReportsPage`: Comprehensive reporting dashboard
- Financial summaries and analytics
- Export functionality for reports

### API Integration

The system is designed to work with a RESTful backend API with the following endpoints:

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

#### Loans
- `POST /api/loans/user/apply` - Apply for loan
- `GET /api/loans/user/{id}` - Get loan details
- `GET /api/loans/user/{id}` - Get user loans
- `PUT /api/loans/user/{id}/approve` - Approve loan (admin)
- `PUT /api/loans/user/{id}/close` - Close loan

#### Payments
- `POST /api/payments` - Make payment
- `GET /api/payments/{id}` - Get payment details
- `GET /api/loans/user/{id}/payments` - Get loan payments

#### Notifications
- `GET /api/notifications/{userId}` - Get user notifications
- `PUT /api/notifications/{id}/read` - Mark as read
- `POST /api/notifications/send` - Send notification

#### Reports
- `GET /api/reports/user/{userId}` - User reports
- `GET /api/reports/loan/{loanId}` - Loan reports

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Backend API server (optional - demo mode available)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (optional for demo mode):
   ```bash
   # Create .env file
   REACT_APP_API_URL=http://localhost:3001/api
   ```

4. Start the development server:
   ```bash
   npm start
   ```

### Demo Mode

The application includes a **demo mode** with pre-configured data for testing purposes:

**Demo Credentials:**
- **Email:** `demo@utilityhub360.com`
- **Password:** `Demo123!`

**Additional Demo Account:**
- **Email:** `admin@utilityhub360.com`
- **Password:** `Admin123!`

The demo mode includes:
- Sample loan data (active, closed, overdue loans)
- Mock repayment schedules
- Sample payment history
- Demo notifications
- Pre-configured user profiles

**Note:** The demo mode uses mock data and doesn't require a backend server. To use with a real backend, update the API service configuration.

### Configuration

The system requires a backend API server running on the configured URL. Update the `REACT_APP_API_URL` environment variable to point to your backend server.

## Usage

### For Users

1. **Register/Login**: Create an account or sign in
2. **Apply for Loan**: Use the loan application form to apply for a new loan
3. **View Loans**: Check your loan dashboard for all active loans
4. **Make Payments**: Process payments through the payment form
5. **Track Progress**: Monitor repayment schedules and outstanding balances
6. **View Reports**: Access detailed financial reports and analytics

### For Administrators

1. **Review Applications**: Approve or reject loan applications
2. **Monitor Loans**: Track all active loans and their status
3. **Process Disbursements**: Handle loan disbursements
4. **Manage Notifications**: Send notifications to users
5. **Generate Reports**: Create comprehensive system reports

## Data Models

### User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  kycVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Loan
```typescript
interface Loan {
  id: string;
  userId: string;
  principal: number;
  interestRate: number;
  term: number;
  status: LoanStatus;
  purpose: string;
  createdAt: string;
  updatedAt: string;
  outstandingBalance: number;
  totalAmount: number;
}
```

### LoanApplication
```typescript
interface LoanApplication {
  principal: number;        // Loan amount (double)
  purpose: string;          // Purpose of the loan
  term: number;            // Loan term in months (int)
  monthlyIncome: number;   // Monthly income (int)
  employmentStatus: string; // Employment status
  additionalInfo?: string;  // Optional additional information
}
```

### Payment
```typescript
interface Payment {
  id: string;
  loanId: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string;
  createdAt: string;
}
```

## Security Features

- JWT token-based authentication
- Protected routes and API endpoints
- Input validation and sanitization
- Secure password handling
- CSRF protection ready

## Future Enhancements

- Real-time notifications with WebSocket
- Mobile app integration
- Advanced analytics and charts
- Document upload for KYC
- Multi-currency support
- Automated payment processing
- Credit scoring integration
- SMS/Email notification delivery

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
