import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { theme } from './theme/theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import Layout from './components/Layout/Layout';
// import ProfileProtectedRoute from './components/ProfileProtectedRoute';
import LandingPage from './pages/LandingPage';
import AuthPage from './components/Auth/AuthPage';
import ForgotPasswordForm from './components/Auth/ForgotPasswordForm';
import ResetPasswordForm from './components/Auth/ResetPasswordForm';
import Register from './pages/Register';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import SuperAdmin from './pages/SuperAdmin';
import Bills from './pages/Bills';
import BillDetails from './pages/BillDetails';
import Utilities from './pages/Utilities';
import Analytics from './pages/Analytics';
import BalanceSheet from './pages/BalanceSheet';
import VarianceDashboard from './pages/VarianceDashboard';
import Support from './pages/Support';
import Settings from './pages/Settings';
import Contact from './pages/Contact';
import Transactions from './pages/Transactions';
import Expenses from './pages/Expenses';
import Apportioner from './pages/Apportioner';
import BankAccounts from './pages/BankAccounts';
import Savings from './pages/Savings';
import IncomeSources from './pages/IncomeSources';
import Receivables from './pages/Receivables';
import Reconciliation from './pages/Reconciliation';
import LoanDashboard from './components/Loans/LoanDashboard';
import LoanDetails from './components/Loans/LoanDetails';
import NotificationCenter from './components/Notifications/NotificationCenter';
import Documentation from './pages/Documentation';
import CategoryManagement from './components/Categories/CategoryManagement';
import AuditLogs from './pages/AuditLogs';
import Receipts from './pages/Receipts';
import AccountingGuide from './pages/AccountingGuide';
import Tickets from './pages/Tickets';
import { FinanceLoader } from './components/Common';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('ProtectedRoute: State check:', { isAuthenticated, isLoading });

  if (isLoading) {
    console.log('ProtectedRoute: Still loading, showing spinner');
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <FinanceLoader size="large" text="Authenticating" fullScreen />
      </Box>
    );
  }

  console.log('ProtectedRoute: Loading complete, isAuthenticated:', isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Landing page for unauthenticated users, Dashboard for authenticated */}
        <Route path="/" element={
          isAuthenticated ? (
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          ) : (
            <LandingPage />
          )
        }>
          {/* Protected routes - only accessible when authenticated */}
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          } />
          <Route path="super-admin" element={
            <ProtectedRoute>
              <SuperAdmin />
            </ProtectedRoute>
          } />
          <Route path="bills" element={
            <ProtectedRoute>
              <Bills />
            </ProtectedRoute>
          } />
          <Route path="bills/:provider/:billType" element={
            <ProtectedRoute>
              <BillDetails />
            </ProtectedRoute>
          } />
          <Route path="utilities" element={
            <ProtectedRoute>
              <Utilities />
            </ProtectedRoute>
          } />
          <Route path="analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="variance-dashboard" element={
            <ProtectedRoute>
              <VarianceDashboard />
            </ProtectedRoute>
          } />
          <Route path="balance-sheet" element={
            <ProtectedRoute>
              <BalanceSheet />
            </ProtectedRoute>
          } />
          <Route path="support" element={
            <ProtectedRoute>
              <Support />
            </ProtectedRoute>
          } />
          <Route path="settings" element={<Settings />} />
          <Route path="transactions" element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          } />
          <Route path="expenses" element={
            <ProtectedRoute>
              <Expenses />
            </ProtectedRoute>
          } />
          <Route path="categories" element={
            <ProtectedRoute>
              <CategoryManagement />
            </ProtectedRoute>
          } />
          <Route path="income-sources" element={
            <ProtectedRoute>
              <IncomeSources />
            </ProtectedRoute>
          } />
          <Route path="receivables" element={
            <ProtectedRoute>
              <Receivables />
            </ProtectedRoute>
          } />
          <Route path="receipts" element={
            <ProtectedRoute>
              <Receipts />
            </ProtectedRoute>
          } />
          <Route path="apportioner" element={
            <ProtectedRoute>
              <Apportioner />
            </ProtectedRoute>
          } />
          <Route path="bank-accounts" element={
            <ProtectedRoute>
              <BankAccounts />
            </ProtectedRoute>
          } />
          <Route path="savings" element={
            <ProtectedRoute>
              <Savings />
            </ProtectedRoute>
          } />
          <Route path="reconciliation" element={
            <ProtectedRoute>
              <Reconciliation />
            </ProtectedRoute>
          } />
          <Route path="loans" element={
            <ProtectedRoute>
              <LoanDashboard />
            </ProtectedRoute>
          } />
          <Route path="loans/:loanId" element={
            <ProtectedRoute>
              <LoanDetailsWrapper />
            </ProtectedRoute>
          } />
          <Route path="notifications" element={
            <ProtectedRoute>
              <NotificationCenter />
            </ProtectedRoute>
          } />
          <Route path="documentation" element={
            <ProtectedRoute>
              <Documentation />
            </ProtectedRoute>
          } />
          <Route path="audit-logs" element={
            <ProtectedRoute>
              <AuditLogs />
            </ProtectedRoute>
          } />
          <Route path="accounting-guide" element={
            <ProtectedRoute>
              <AccountingGuide />
            </ProtectedRoute>
          } />
          <Route path="tickets" element={
            <ProtectedRoute>
              <Tickets />
            </ProtectedRoute>
          } />
          <Route path="reports" element={<Navigate to="/analytics" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

const LoanDetailsWrapper: React.FC = () => {
  const loanId = window.location.pathname.split('/').pop() || '';
  return <LoanDetails loanId={loanId} onBack={() => window.history.back()} />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CurrencyProvider>
          <AppRoutes />
        </CurrencyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
