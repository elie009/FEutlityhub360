import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Typography, Card, CardContent, Button, Alert } from '@mui/material';

const UserDataTest: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    if (user) {
      setTestResult(`✅ User data loaded successfully! ID: ${user.id}`);
    } else {
      setTestResult('❌ No user data available');
    }
  }, [user]);

  const testUserData = () => {
    if (user) {
      console.log('🧪 Testing user data:', user);
      console.log('🧪 User ID:', user.id);
      console.log('🧪 User Name:', user.name);
      console.log('🧪 User Email:', user.email);
      setTestResult(`✅ User data test passed! ID: ${user.id}, Name: ${user.name}`);
    } else {
      setTestResult('❌ No user data to test');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        User Data Test
      </Typography>
      
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Auth State
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
              User Data from useAuth()
            </Typography>
            <Typography>ID: {user.id}</Typography>
            <Typography>Name: {user.name}</Typography>
            <Typography>Email: {user.email}</Typography>
            <Typography>Phone: {user.phone}</Typography>
            <Typography>isActive: {user.isActive?.toString()}</Typography>
            <Typography>kycVerified: {user.kycVerified?.toString()}</Typography>
          </CardContent>
        </Card>
      )}

      <Button 
        variant="contained" 
        onClick={testUserData}
        disabled={!user}
        sx={{ mb: 2 }}
      >
        Test User Data
      </Button>

      {testResult && (
        <Alert severity={testResult.includes('✅') ? 'success' : 'error'}>
          {testResult}
        </Alert>
      )}

      {!user && !isLoading && (
        <Alert severity="warning">
          No user data available. Please log in first.
        </Alert>
      )}
    </Box>
  );
};

export default UserDataTest;
