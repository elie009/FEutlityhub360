import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Typography, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { WhiteLabelProvider, useWhiteLabel } from './contexts/WhiteLabelContext';
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
import TaxOptimization from './pages/TaxOptimization';
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
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import SubscriptionCancel from './pages/SubscriptionCancel';
import WhiteLabel from './pages/WhiteLabel';
import TeamManagement from './pages/TeamManagement';
import Investments from './pages/Investments';
import { FinanceLoader } from './components/Common';
import PremiumRoute from './components/RouteGuards/PremiumRoute';

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

// Component to normalize URLs with double slashes
const UrlNormalizer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  React.useEffect(() => {
    const pathname = window.location.pathname;
    if (pathname.includes('//')) {
      const normalizedPath = pathname.replace(/\/+/g, '/');
      const normalizedUrl = normalizedPath + window.location.search + window.location.hash;
      if (normalizedUrl !== window.location.pathname + window.location.search + window.location.hash) {
        console.log('UrlNormalizer: Normalizing URL from', window.location.pathname, 'to', normalizedPath);
        window.history.replaceState({}, '', normalizedUrl);
      }
    }
  }, []);

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <UrlNormalizer>
        <Routes>
        {/* Public routes */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/subscription/success" element={<SubscriptionSuccess />} />
        <Route path="/subscription/cancel" element={<SubscriptionCancel />} />
        
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
              <PremiumRoute feature="RECEIPT_OCR">
                <Receipts />
              </PremiumRoute>
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
              <PremiumRoute feature="BANK_FEED">
                <Reconciliation />
              </PremiumRoute>
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
          
          {/* Enterprise-only routes */}
          <Route path="investments" element={
            <ProtectedRoute>
              <PremiumRoute feature="INVESTMENT_TRACKING">
                <Investments />
              </PremiumRoute>
            </ProtectedRoute>
          } />
          <Route path="tax-optimization" element={
            <ProtectedRoute>
              <PremiumRoute feature="TAX_OPTIMIZATION">
                <TaxOptimization />
              </PremiumRoute>
            </ProtectedRoute>
          } />
          <Route path="team-management" element={
            <ProtectedRoute>
              <PremiumRoute feature="MULTI_USER">
                <TeamManagement />
              </PremiumRoute>
            </ProtectedRoute>
          } />
          <Route path="api-keys" element={
            <ProtectedRoute>
              <PremiumRoute feature="API_ACCESS">
                <Box sx={{ p: 3 }}>
                  <Typography variant="h4">API Keys</Typography>
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    This feature is coming soon. API access is available for Enterprise users.
                  </Typography>
                </Box>
              </PremiumRoute>
            </ProtectedRoute>
          } />
          <Route path="white-label" element={
            <ProtectedRoute>
              <PremiumRoute feature="WHITE_LABEL">
                <WhiteLabel />
              </PremiumRoute>
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
      </UrlNormalizer>
    </Router>
  );
};

const LoanDetailsWrapper: React.FC = () => {
  const loanId = window.location.pathname.split('/').pop() || '';
  return <LoanDetails loanId={loanId} onBack={() => window.history.back()} />;
};

const ThemedAppWrapper: React.FC = () => {
  const { theme, loading } = useWhiteLabel();
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }
  
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
};

function App() {
  return (
    <WhiteLabelProvider>
      <ThemedAppWrapper />
    </WhiteLabelProvider>
  );
}

export default App;
