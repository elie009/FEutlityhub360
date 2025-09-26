import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, CircularProgress, Box } from '@mui/material';
import { theme } from './theme/theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import AuthPage from './components/Auth/AuthPage';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Bills from './pages/Bills';
import Analytics from './pages/Analytics';
import Support from './pages/Support';
import Settings from './pages/Settings';
import Transactions from './pages/Transactions';
import Apportioner from './pages/Apportioner';
import BankAccounts from './pages/BankAccounts';
import LoanDashboard from './components/Loans/LoanDashboard';
import LoanDetails from './components/Loans/LoanDetails';
import NotificationCenter from './components/Notifications/NotificationCenter';
import ReportsPage from './components/Reports/ReportsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('ProtectedRoute: State check:', { isAuthenticated, isLoading });

  if (isLoading) {
    console.log('ProtectedRoute: Still loading, showing spinner');
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
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
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="bills" element={<Bills />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="support" element={<Support />} />
          <Route path="settings" element={<Settings />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="apportioner" element={<Apportioner />} />
          <Route path="bank-accounts" element={<BankAccounts />} />
          <Route path="loans" element={<LoanDashboard />} />
          <Route path="loans/:loanId" element={<LoanDetailsWrapper />} />
          <Route path="notifications" element={<NotificationCenter />} />
          <Route path="reports" element={<ReportsPage />} />
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
