import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Upload as UploadIcon,
  CompareArrows as CompareIcon,
  Assessment as ReportIcon,
} from '@mui/icons-material';

interface ReconciliationGuideProps {
  open: boolean;
  onClose: () => void;
  onStartReconciliation: () => void;
}

const ReconciliationGuide: React.FC<ReconciliationGuideProps> = ({
  open,
  onClose,
  onStartReconciliation,
}) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      label: 'Import Bank Statement',
      description: 'Upload your bank statement (CSV format)',
      content: (
        <Box>
          <Typography variant="body2" paragraph>
            <strong>Step 1:</strong> Download your bank statement from your bank's website or mobile app.
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Supported Formats:</strong> CSV (Comma Separated Values)
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Tip:</strong> Most banks allow you to export statements in CSV format. Look for "Export" or "Download" options in your online banking portal.
            </Typography>
          </Alert>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="caption" fontWeight="medium" display="block" gutterBottom>
              What to include in your CSV:
            </Typography>
            <ul style={{ margin: '4px 0', paddingLeft: 20, fontSize: '0.875rem' }}>
              <li>Transaction date</li>
              <li>Description</li>
              <li>Amount</li>
              <li>Transaction type (Debit/Credit)</li>
            </ul>
          </Box>
        </Box>
      ),
    },
    {
      label: 'Auto-Match Transactions',
      description: 'System automatically matches transactions',
      content: (
        <Box>
          <Typography variant="body2" paragraph>
            <strong>Step 2:</strong> The system will automatically try to match imported transactions with your existing records.
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Matching Criteria:</strong>
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
            <Chip 
              icon={<CheckCircleIcon />}
              label="Amount matches exactly"
              size="small"
              color="success"
              variant="outlined"
            />
            <Chip 
              icon={<CheckCircleIcon />}
              label="Date is within 3 days"
              size="small"
              color="success"
              variant="outlined"
            />
            <Chip 
              icon={<CheckCircleIcon />}
              label="Reference number matches"
              size="small"
              color="success"
              variant="outlined"
            />
          </Box>
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Automatic Matching:</strong> Transactions that match will be automatically linked. You'll only need to review unmatched items.
            </Typography>
          </Alert>
        </Box>
      ),
    },
    {
      label: 'Review & Manual Match',
      description: 'Review unmatched transactions and match manually',
      content: (
        <Box>
          <Typography variant="body2" paragraph>
            <strong>Step 3:</strong> Review transactions that couldn't be automatically matched.
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>What to do:</strong>
          </Typography>
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>Review each unmatched transaction from your bank statement</li>
            <li>Find the corresponding transaction in your records</li>
            <li>Click "Match" to link them together</li>
            <li>If a transaction doesn't exist in your records, you can create it</li>
          </ul>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Important:</strong> All transactions should be matched. If you see unmatched items, they may be:
              <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
                <li>Transactions you haven't recorded yet</li>
                <li>Bank fees or charges</li>
                <li>Interest payments or deposits</li>
              </ul>
            </Typography>
          </Alert>
        </Box>
      ),
    },
    {
      label: 'Complete Reconciliation',
      description: 'Finalize and generate reconciliation report',
      content: (
        <Box>
          <Typography variant="body2" paragraph>
            <strong>Step 4:</strong> Once all transactions are matched, complete the reconciliation.
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>What happens:</strong>
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="body2" fontWeight="medium" gutterBottom>
                  <CheckCircleIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle', color: 'success.main' }} />
                  Verification
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  System verifies that your records match the bank statement
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="body2" fontWeight="medium" gutterBottom>
                  <ReportIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle', color: 'primary.main' }} />
                  Report Generation
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  A reconciliation report is generated showing all matched transactions
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Benefits:</strong> Reconciliation ensures your records are accurate and helps identify any discrepancies or missing transactions.
            </Typography>
          </Alert>
        </Box>
      ),
    },
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleStart = () => {
    onStartReconciliation();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Reconciliation Guide</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" paragraph>
          Follow these steps to reconcile your bank account with your bank statement. This ensures your records match your bank's records.
        </Typography>
        
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                optional={
                  index === steps.length - 1 ? (
                    <Typography variant="caption">Final step</Typography>
                  ) : null
                }
              >
                {step.label}
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {step.description}
                </Typography>
                {step.content}
                <Box sx={{ mb: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    {index === steps.length - 1 ? 'Finish' : 'Continue'}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mt: 1 }}
                  >
                    Back
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
        
        {activeStep === steps.length && (
          <Box sx={{ mt: 3, p: 3, bgcolor: 'success.light', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Ready to Start!
            </Typography>
            <Typography variant="body2" paragraph>
              You now understand the reconciliation process. Click "Start Reconciliation" to begin.
            </Typography>
            <Button
              onClick={handleReset}
              sx={{ mt: 1, mr: 1 }}
            >
              Review Again
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {activeStep === steps.length && (
          <Button
            variant="contained"
            onClick={handleStart}
            startIcon={<CompareIcon />}
          >
            Start Reconciliation
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ReconciliationGuide;

