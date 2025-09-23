import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';

const UserStateTest: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  useEffect(() => {
    if (user) {
      addTestResult(`User object exists: ${JSON.stringify(user)}`);
      addTestResult(`User ID: ${user.id || 'UNDEFINED'}`);
      addTestResult(`User Name: ${user.name || 'UNDEFINED'}`);
      addTestResult(`User Email: ${user.email || 'UNDEFINED'}`);
      addTestResult(`User Phone: ${user.phone || 'UNDEFINED'}`);
      addTestResult(`User isActive: ${user.isActive || 'UNDEFINED'}`);
    } else {
      addTestResult('User object is null/undefined');
    }
  }, [user]);

  const testUserFields = () => {
    if (user) {
      addTestResult('=== MANUAL TEST ===');
      addTestResult(`user.id: ${user.id}`);
      addTestResult(`user.name: ${user.name}`);
      addTestResult(`user.email: ${user.email}`);
      addTestResult(`user.phone: ${user.phone}`);
      addTestResult(`user.isActive: ${user.isActive}`);
      addTestResult(`user.kycVerified: ${user.kycVerified}`);
      addTestResult(`user.createdAt: ${user.createdAt}`);
      addTestResult(`user.updatedAt: ${user.updatedAt}`);
      addTestResult('=== END TEST ===');
    } else {
      addTestResult('Cannot test - user is null/undefined');
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        User State Test
      </Typography>
      
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current State
          </Typography>
          <Typography>isLoading: {isLoading.toString()}</Typography>
          <Typography>isAuthenticated: {isAuthenticated.toString()}</Typography>
          <Typography>user exists: {user ? 'true' : 'false'}</Typography>
        </CardContent>
      </Card>

      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={testUserFields} sx={{ mr: 2 }}>
          Test User Fields
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
            <Typography color="text.secondary">No test results yet. Try testing user fields.</Typography>
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

export default UserStateTest;
