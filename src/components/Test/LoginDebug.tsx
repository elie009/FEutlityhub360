import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Typography, Card, CardContent, Button, Alert, TextField } from '@mui/material';

const LoginDebug: React.FC = () => {
  const { user, isAuthenticated, isLoading, login } = useAuth();
  const [credentials, setCredentials] = useState({
    email: 'demo@utilityhub360.com',
    password: 'Demo123!'
  });
  const [loginResult, setLoginResult] = useState<string>('');

  const handleLogin = async () => {
    try {
      setLoginResult('Logging in...');
      await login(credentials);
      setLoginResult('Login successful!');
    } catch (error) {
      setLoginResult(`Login failed: ${error}`);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Login Debug Component
      </Typography>
      
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test Login
          </Typography>
          <TextField
            label="Email"
            value={credentials.email}
            onChange={(e) => setCredentials({...credentials, email: e.target.value})}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={handleLogin} disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
          {loginResult && (
            <Alert severity={loginResult.includes('successful') ? 'success' : 'error'} sx={{ mt: 2 }}>
              {loginResult}
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Auth State
          </Typography>
          <Typography>isLoading: {isLoading.toString()}</Typography>
          <Typography>isAuthenticated: {isAuthenticated.toString()}</Typography>
          <Typography>user exists: {user ? 'true' : 'false'}</Typography>
        </CardContent>
      </Card>

      {user && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              User Data Details
            </Typography>
            <Typography>ID: {user.id || 'UNDEFINED'}</Typography>
            <Typography>Name: {user.name || 'UNDEFINED'}</Typography>
            <Typography>Email: {user.email || 'UNDEFINED'}</Typography>
            <Typography>Phone: {user.phone || 'UNDEFINED'}</Typography>
            <Typography>isActive: {user.isActive?.toString() || 'UNDEFINED'}</Typography>
            <Typography>kycVerified: {user.kycVerified?.toString() || 'UNDEFINED'}</Typography>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Raw User Object
          </Typography>
          <pre style={{ fontSize: '12px', overflow: 'auto', backgroundColor: '#f5f5f5', padding: '10px' }}>
            {JSON.stringify(user, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginDebug;
