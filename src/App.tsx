import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { theme } from './theme/theme';
import Layout from './components/Layout/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Utilities from './pages/Utilities';
import Bills from './pages/Bills';
import Analytics from './pages/Analytics';
import Support from './pages/Support';
import Settings from './pages/Settings';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Landing Page - Public Route */}
          <Route path="/" element={<Landing />} />
          
          {/* App Routes - With Layout */}
          <Route path="/app" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="utilities" element={<Utilities />} />
            <Route path="bills" element={<Bills />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="support" element={<Support />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
