import React from 'react';
import { Box, Typography, Alert, Paper } from '@mui/material';
import { Assessment } from '@mui/icons-material';

const IncomeStatementTab: React.FC = () => {
  return (
    <Box>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Assessment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Income Statement
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          This feature is coming soon. The Income Statement will show your revenue, expenses, and net income over a selected period.
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          Income Statement report will include:
          <ul style={{ textAlign: 'left', marginTop: 8 }}>
            <li>Total Revenue (Income Sources)</li>
            <li>Total Expenses (Bills, Loans, Transactions)</li>
            <li>Net Income (Revenue - Expenses)</li>
            <li>Period-over-period comparisons</li>
          </ul>
        </Alert>
      </Paper>
    </Box>
  );
};

export default IncomeStatementTab;

