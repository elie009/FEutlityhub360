import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, CircularProgress, Box } from '@mui/material';
import { theme } from './theme/theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import ProfileProtectedRoute from './components/ProfileProtectedRoute';
import AuthPage from './components/Auth/AuthPage';
import Register from './pages/Register';
import ProfileSetup from './pages/ProfileSetup';
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
          <Route index element={
            <ProfileProtectedRoute>
              <Dashboard />
            </ProfileProtectedRoute>
          } />
          <Route path="users" element={
            <ProfileProtectedRoute>
              <Users />
            </ProfileProtectedRoute>
          } />
          <Route path="bills" element={
            <ProfileProtectedRoute>
              <Bills />
            </ProfileProtectedRoute>
          } />
          <Route path="analytics" element={
            <ProfileProtectedRoute>
              <Analytics />
            </ProfileProtectedRoute>
          } />
          <Route path="support" element={
            <ProfileProtectedRoute>
              <Support />
            </ProfileProtectedRoute>
          } />
          <Route path="settings" element={<Settings />} />
          <Route path="transactions" element={
            <ProfileProtectedRoute>
              <Transactions />
            </ProfileProtectedRoute>
          } />
          <Route path="apportioner" element={
            <ProfileProtectedRoute>
              <Apportioner />
            </ProfileProtectedRoute>
          } />
          <Route path="bank-accounts" element={
            <ProfileProtectedRoute>
              <BankAccounts />
            </ProfileProtectedRoute>
          } />
          <Route path="loans" element={
            <ProfileProtectedRoute>
              <LoanDashboard />
            </ProfileProtectedRoute>
          } />
          <Route path="loans/:loanId" element={
            <ProfileProtectedRoute>
              <LoanDetailsWrapper />
            </ProfileProtectedRoute>
          } />
          <Route path="notifications" element={
            <ProfileProtectedRoute>
              <NotificationCenter />
            </ProfileProtectedRoute>
          } />
          <Route path="reports" element={
            <ProfileProtectedRoute>
              <ReportsPage />
            </ProfileProtectedRoute>
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
