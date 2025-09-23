import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Box, Typography, Button, Alert, Card, CardContent } from '@mui/material';

const UserDebug: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  const testGetUserLoans = async () => {
    if (!user) {
      console.log('❌ No user available for testing');
      return;
    }

    try {
      console.log('🧪 Testing getUserLoans with user:', user);
      console.log('🧪 User ID:', user.id);
      console.log('🧪 User ID type:', typeof user.id);
      const loans = await apiService.getUserLoans(user.id);
      console.log('🧪 getUserLoans result:', loans);
    } catch (error) {
      console.error('🧪 getUserLoans error:', error);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        User Debug Information
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
              User Object Details
            </Typography>
            <Typography>ID: {user.id}</Typography>
            <Typography>Name: {user.name}</Typography>
            <Typography>Email: {user.email}</Typography>
            <Typography>Phone: {user.phone}</Typography>
            <Typography>isActive: {user.isActive?.toString()}</Typography>
            <Typography>kycVerified: {user.kycVerified?.toString()}</Typography>
            <Typography>Created: {user.createdAt}</Typography>
            <Typography>Updated: {user.updatedAt}</Typography>
          </CardContent>
        </Card>
      )}

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Raw User Object
          </Typography>
          <pre style={{ fontSize: '12px', overflow: 'auto' }}>
            {JSON.stringify(user, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Button 
        variant="contained" 
        onClick={testGetUserLoans}
        disabled={!user}
        sx={{ mb: 2 }}
      >
        Test getUserLoans API Call
      </Button>

      {!user && (
        <Alert severity="warning">
          No user data available. Please log in first.
        </Alert>
      )}
    </Box>
  );
};

export default UserDebug;
