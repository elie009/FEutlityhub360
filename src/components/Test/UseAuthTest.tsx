import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';

const UseAuthTest: React.FC = () => {
  const { user, isAuthenticated, isLoading, getUserData } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  useEffect(() => {
    addResult('=== useAuth() Test ===');
    addResult(`isLoading: ${isLoading}`);
    addResult(`isAuthenticated: ${isAuthenticated}`);
    addResult(`user exists: ${user ? 'true' : 'false'}`);
    
    if (user) {
      addResult(`user.id: ${user.id || 'UNDEFINED'}`);
      addResult(`user.name: ${user.name || 'UNDEFINED'}`);
      addResult(`user.email: ${user.email || 'UNDEFINED'}`);
      addResult(`user.phone: ${user.phone || 'UNDEFINED'}`);
      addResult(`user.isActive: ${user.isActive?.toString() || 'UNDEFINED'}`);
      addResult(`user.kycVerified: ${user.kycVerified?.toString() || 'UNDEFINED'}`);
      
      // Check for undefined fields
      const undefinedFields = [];
      if (user.id === undefined) undefinedFields.push('id');
      if (user.name === undefined) undefinedFields.push('name');
      if (user.email === undefined) undefinedFields.push('email');
      if (user.phone === undefined) undefinedFields.push('phone');
      if (user.isActive === undefined) undefinedFields.push('isActive');
      if (user.kycVerified === undefined) undefinedFields.push('kycVerified');
      
      if (undefinedFields.length > 0) {
        addResult(`❌ UNDEFINED FIELDS: ${undefinedFields.join(', ')}`);
      } else {
        addResult('✅ All fields are defined!');
      }
    } else {
      addResult('❌ No user data available');
    }
    addResult('=== End Test ===');
  }, [user, isAuthenticated, isLoading]);

  const testGetUserData = () => {
    addResult('=== Testing getUserData() ===');
    const userData = getUserData();
    if (userData) {
      addResult(`getUserData().id: ${userData.id || 'UNDEFINED'}`);
      addResult(`getUserData().name: ${userData.name || 'UNDEFINED'}`);
      addResult(`getUserData().email: ${userData.email || 'UNDEFINED'}`);
    } else {
      addResult('getUserData() returned null/undefined');
    }
    addResult('=== End getUserData() Test ===');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        useAuth() Test Component
      </Typography>
      
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current useAuth() Values
          </Typography>
          <Typography>isLoading: {isLoading.toString()}</Typography>
          <Typography>isAuthenticated: {isAuthenticated.toString()}</Typography>
          <Typography>user exists: {user ? 'true' : 'false'}</Typography>
          {user && (
            <Box sx={{ mt: 2 }}>
              <Typography>ID: {user.id || 'UNDEFINED'}</Typography>
              <Typography>Name: {user.name || 'UNDEFINED'}</Typography>
              <Typography>Email: {user.email || 'UNDEFINED'}</Typography>
              <Typography>Phone: {user.phone || 'UNDEFINED'}</Typography>
              <Typography>isActive: {user.isActive?.toString() || 'UNDEFINED'}</Typography>
              <Typography>kycVerified: {user.kycVerified?.toString() || 'UNDEFINED'}</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={testGetUserData} sx={{ mr: 2 }}>
          Test getUserData()
        </Button>
        <Button variant="outlined" onClick={clearResults}>
          Clear Results
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test Results
          </Typography>
          {testResults.length === 0 ? (
            <Typography color="text.secondary">No test results yet. Login to see results.</Typography>
          ) : (
            <Box>
              {testResults.map((result, index) => (
                <Typography key={index} variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5 }}>
                  {result}
                </Typography>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default UseAuthTest;
