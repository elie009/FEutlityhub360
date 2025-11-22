import React from 'react';
import { Box, Typography, Alert, Paper } from '@mui/material';
import { Settings } from '@mui/icons-material';

const CustomReportTab: React.FC = () => {
  return (
    <Box>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Settings sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Custom Reports
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          This feature is coming soon. Create custom reports with your own date ranges, categories, and metrics.
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          Custom Reports will allow you to:
          <ul style={{ textAlign: 'left', marginTop: 8 }}>
            <li>Select custom date ranges</li>
            <li>Filter by categories and accounts</li>
            <li>Choose specific metrics to display</li>
            <li>Save report templates for future use</li>
            <li>Export reports in PDF, Excel, or CSV formats</li>
          </ul>
        </Alert>
      </Paper>
    </Box>
  );
};

export default CustomReportTab;

