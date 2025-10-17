import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Chip,
} from '@mui/material';
import { apiService } from '../../services/api';
import { AddCustomScheduleRequest } from '../../types/loan';

interface ApiTestResult {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}

const AddScheduleApiTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ApiTestResult | null>(null);

  // Sample data from the user's request
  const sampleRequest: AddCustomScheduleRequest = {
    startingInstallmentNumber: 13,
    numberOfMonths: 3,
    firstDueDate: "2024-07-15T00:00:00Z",
    monthlyPayment: 1200.00,
    reason: "Adding catch-up payments"
  };

  // Sample loan ID for testing (using real loan ID from user)
  const testLoanId = "da188a68-ebe3-4288-b56d-d9e0a922dc81";

  const testAddScheduleApi = async () => {
    try {
      setIsLoading(true);
      setResult(null);
      
      console.log('🔍 Testing Add Schedule API');
      console.log('📊 Request Data:', sampleRequest);
      console.log('🎯 Loan ID:', testLoanId);
      
      const response = await apiService.addCustomPaymentSchedule(testLoanId, sampleRequest);
      
      console.log('✅ API Response:', response);
      
      setResult({
        success: true,
        data: response,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error('❌ API Error:', error);
      
      setResult({
        success: false,
        error: error.message || 'Unknown error occurred',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatJson = (obj: any) => JSON.stringify(obj, null, 2);

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Add Payment Schedule API Test
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This test component verifies the POST /api/Loans/&#123;loanId&#125;/add-schedule endpoint
        with the sample data you provided.
      </Alert>

      {/* Test Configuration */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            <strong>Endpoint:</strong> POST /api/Loans/&#123;loanId&#125;/add-schedule
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            <strong>Test Loan ID:</strong> {testLoanId}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Request Body:
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.50', overflow: 'auto' }}>
            <pre style={{ fontSize: '12px', margin: 0 }}>
              {formatJson(sampleRequest)}
            </pre>
          </Paper>
        </CardContent>
      </Card>

      {/* Test Button */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={testAddScheduleApi}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading ? 'Testing API...' : 'Test Add Schedule API'}
        </Button>
      </Box>

      {/* Test Results */}
      {result && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ mr: 2 }}>
                Test Result
              </Typography>
              <Chip 
                label={result.success ? 'SUCCESS' : 'FAILED'} 
                color={result.success ? 'success' : 'error'} 
              />
              <Typography variant="caption" sx={{ ml: 'auto', color: 'text.secondary' }}>
                {new Date(result.timestamp).toLocaleString()}
              </Typography>
            </Box>

            {result.success && result.data && (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  API Response:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'success.50', overflow: 'auto', maxHeight: 400 }}>
                  <pre style={{ fontSize: '12px', margin: 0, whiteSpace: 'pre-wrap' }}>
                    {formatJson(result.data)}
                  </pre>
                </Paper>

                {/* Validate Response Structure */}
                {result.data.success && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    ✅ Response matches expected structure with success: true
                  </Alert>
                )}

                {result.data.data?.schedule && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    📋 Generated {result.data.data.schedule.length} payment installments
                  </Alert>
                )}
              </>
            )}

            {!result.success && result.error && (
              <>
                <Typography variant="subtitle2" gutterBottom color="error">
                  Error Details:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'error.50', overflow: 'auto' }}>
                  <Typography variant="body2" color="error">
                    {result.error}
                  </Typography>
                </Paper>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Expected Response Structure */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Expected Response Structure
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Based on your sample, the API should return:
          </Typography>
          
          <Paper sx={{ p: 2, bgcolor: 'grey.50', overflow: 'auto' }}>
            <pre style={{ fontSize: '12px', margin: 0 }}>
{`{
  "success": true,
  "message": "Payment schedules added successfully",
  "data": {
    "schedule": [
      {
        "id": "schedule-456",
        "loanId": "loan-123",
        "installmentNumber": 13,
        "dueDate": "2024-07-15T00:00:00Z",
        "principalAmount": 1150.00,
        "interestAmount": 50.00,
        "totalAmount": 1200.00,
        "status": "PENDING",
        "paidAt": null
      },
      // ... more installments
    ],
    "totalInstallments": 3,
    "totalAmount": 3600.00,
    "firstDueDate": "2024-07-15T00:00:00Z",
    "lastDueDate": "2024-09-15T00:00:00Z",
    "message": "3 new payment installments added starting from installment #13"
  },
  "errors": null
}`}
            </pre>
          </Paper>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AddScheduleApiTest;
