import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import ReceiptUpload from '../components/Receipts/ReceiptUpload';
import ReceiptList from '../components/Receipts/ReceiptList';
import { Receipt } from '../types/receipt';

const ReceiptsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = (receipt: Receipt) => {
    // Refresh the list when a new receipt is uploaded
    setRefreshKey((prev) => prev + 1);
    // Optionally switch to the list tab
    setActiveTab(1);
  };

  const handleDelete = (receiptId: string) => {
    // List will refresh automatically
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Receipt Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Upload and manage your receipts. Our OCR system will automatically extract key information like amount, date, and merchant.
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Upload Receipt" />
          <Tab label="My Receipts" />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {activeTab === 0 && (
          <Paper sx={{ p: 3 }}>
            <ReceiptUpload
              onUploadSuccess={handleUploadSuccess}
              maxFiles={10}
            />
          </Paper>
        )}

        {activeTab === 1 && (
          <ReceiptList
            key={refreshKey}
            onDelete={handleDelete}
          />
        )}
      </Box>
    </Container>
  );
};

export default ReceiptsPage;

