import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Typography, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { WhiteLabelProvider, useWhiteLabel } from './contexts/WhiteLabelContext';
import Layout from './components/Layout/Layout';
import PropertyLayout from './components/Layout/PropertyLayout';
import LandingPage from './pages/LandingPage';
import AuthPage from './components/Auth/AuthPage';
import ForgotPasswordForm from './components/Auth/ForgotPasswordForm';
import ResetPasswordForm from './components/Auth/ResetPasswordForm';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
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
import SystemHubPage from './pages/SystemHubPage';
import PropertyHomePage from './pages/PropertyHomePage';
import {
  PropertyDirectoryPage,
  ReservationsCalendarPage,
  ChannelManagerPage,
  MaintenanceWorkOrdersPage,
  InstallmentSchedulesPage,
  OwnerInvestorPortalPage,
  RentRollDelinquencyPage,
  PmsUserManagementPage,
  AnalyticsReportsBuilderPage,
} from './pages/pms/pmsPages';
import { FinanceLoader } from './components/Common';
import PremiumRoute from './components/RouteGuards/PremiumRoute';
import { SYSTEM_HUB_PATH, isLegacyFmsPath } from './config/appRoutes';

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

const LandingPageWrapper: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [checkingToken, setCheckingToken] = React.useState(true);

  React.useEffect(() => {
    const checkTokenAndRedirect = async () => {
      if (isLoading) {
        return;
      }

      if (isAuthenticated) {
        navigate(SYSTEM_HUB_PATH, { replace: true });
        return;
      }

      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const { apiService } = await import('./services/api');
          await apiService.getCurrentUser();
          navigate(SYSTEM_HUB_PATH, { replace: true });
          return;
        } catch (error: any) {
          const is401Error = error?.status === 401 ||
                            error?.message?.includes('401') ||
                            error?.message?.includes('Unauthorized');
          if (is401Error) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
          }
        }
      }

      setCheckingToken(false);
    };

    checkTokenAndRedirect();
  }, [isAuthenticated, isLoading, navigate]);

  if (checkingToken || isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  return <LandingPage />;
};

/** Old bookmarks like /dashboard → /fms/dashboard */
const LegacyFmsRedirect: React.FC = () => {
  const location = useLocation();
  const { pathname, search, hash } = location;
  if (pathname === '/reports' || pathname.startsWith('/reports/')) {
    return <Navigate to={`/fms/analytics${search}${hash}`} replace />;
  }
  if (isLegacyFmsPath(pathname)) {
    return <Navigate to={`/fms${pathname}${search}${hash}`} replace />;
  }
  return <Navigate to={SYSTEM_HUB_PATH} replace />;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <UrlNormalizer>
        <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/subscription/success" element={<SubscriptionSuccess />} />
        <Route path="/subscription/cancel" element={<SubscriptionCancel />} />

        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to={SYSTEM_HUB_PATH} replace /> : <LandingPageWrapper />
          }
        />

        <Route
          path={SYSTEM_HUB_PATH}
          element={
            <ProtectedRoute>
              <SystemHubPage />
            </ProtectedRoute>
          }
        />

        <Route path="fms" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
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
          <Route path="reports" element={<Navigate to="/fms/analytics" replace />} />
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

        <Route path="pms" element={<ProtectedRoute><PropertyLayout /></ProtectedRoute>}>
          <Route index element={<PropertyHomePage />} />
          <Route path="property-directory" element={<PropertyDirectoryPage />} />
          <Route path="reservations" element={<ReservationsCalendarPage />} />
          <Route path="channel-manager" element={<ChannelManagerPage />} />
          <Route path="maintenance" element={<MaintenanceWorkOrdersPage />} />
          <Route path="installments" element={<InstallmentSchedulesPage />} />
          <Route path="owner-portal" element={<OwnerInvestorPortalPage />} />
          <Route path="rent-roll" element={<RentRollDelinquencyPage />} />
          <Route path="users" element={<PmsUserManagementPage />} />
          <Route path="analytics-reports" element={<AnalyticsReportsBuilderPage />} />
        </Route>

        <Route path="*" element={<LegacyFmsRedirect />} />
      </Routes>
      </UrlNormalizer>
    </Router>
  );
};

const LoanDetailsWrapper: React.FC = () => {
  const { loanId } = useParams<{ loanId: string }>();
  const navigate = useNavigate();
  return <LoanDetails loanId={loanId || ''} onBack={() => navigate(-1)} />;
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
