import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { theme } from './theme/theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
// import ProfileProtectedRoute from './components/ProfileProtectedRoute';
import AuthPage from './components/Auth/AuthPage';
import Register from './pages/Register';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Bills from './pages/Bills';
import BillDetails from './pages/BillDetails';
import Analytics from './pages/Analytics';
import Support from './pages/Support';
import Settings from './pages/Settings';
import Transactions from './pages/Transactions';
import Apportioner from './pages/Apportioner';
import BankAccounts from './pages/BankAccounts';
import Savings from './pages/Savings';
import LoanDashboard from './components/Loans/LoanDashboard';
import LoanDetails from './components/Loans/LoanDetails';
import NotificationCenter from './components/Notifications/NotificationCenter';
import ReportsPage from './components/Reports/ReportsPage';
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
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile-setup" element={
          <ProtectedRoute>
            <ProfileSetup />
          </ProtectedRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={
            <ProtectedRoute>
              <Users />
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
          <Route path="analytics" element={
            <ProtectedRoute>
              <Analytics />
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
          <Route path="reports" element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          } />
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
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
