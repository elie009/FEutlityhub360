import React, { useState } from 'react';
import { Button, Paper, Typography, Box } from '@mui/material';
import { apiService } from '../../services/api';

const ApiResponseDebug: React.FC = () => {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    try {
      console.log('=== API RESPONSE DEBUG TEST ===');
      const result = await apiService.login({
        email: 'demo@utilityhub360.com',
        password: 'Demo123!'
      });
      console.log('Raw API response:', result);
      console.log('Response type:', typeof result);
      console.log('Response keys:', Object.keys(result || {}));
      console.log('Full response JSON:', JSON.stringify(result, null, 2));
      setResponse(result);
    } catch (error) {
      console.error('API test error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setResponse({ error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>API Response Debug</Typography>
      <Button 
        variant="contained" 
        onClick={testLogin} 
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? 'Testing...' : 'Test Login API'}
      </Button>
      
      {response && (
        <Box>
          <Typography variant="h6" gutterBottom>API Response:</Typography>
          <Typography variant="body2" component="pre" sx={{ 
            backgroundColor: '#f5f5f5', 
            p: 2, 
            borderRadius: 1,
            overflow: 'auto',
            maxHeight: 400
          }}>
            {JSON.stringify(response, null, 2)}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ApiResponseDebug;
