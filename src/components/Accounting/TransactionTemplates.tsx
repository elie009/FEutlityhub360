import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  HelpOutline as HelpIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';

interface TransactionTemplate {
  title: string;
  description: string;
  date: string;
  entries: Array<{
    account: string;
    type: 'Debit' | 'Credit';
    amount: number;
    explanation: string;
  }>;
  totalDebits: number;
  totalCredits: number;
  icon: React.ReactNode;
  color: string;
}

const transactionTemplates: TransactionTemplate[] = [
  {
    title: 'Opening Bank Account',
    description: 'Initial deposit when setting up your account',
    date: '2024-01-01',
    entries: [
      {
        account: 'Cash (Bank Account)',
        type: 'Debit',
        amount: 10000,
        explanation: 'Asset increases (money in account)',
      },
      {
        account: "Owner's Capital",
        type: 'Credit',
        amount: 10000,
        explanation: 'Equity increases (your initial investment)',
      },
    ],
    totalDebits: 10000,
    totalCredits: 10000,
    icon: <AccountBalanceIcon />,
    color: '#4CAF50',
  },
  {
    title: 'Receiving Salary',
    description: 'Monthly salary deposit',
    date: '2024-01-15',
    entries: [
      {
        account: 'Cash',
        type: 'Debit',
        amount: 5000,
        explanation: 'Asset increases (money received)',
      },
      {
        account: 'Salary Income',
        type: 'Credit',
        amount: 5000,
        explanation: 'Income increases (revenue earned)',
      },
    ],
    totalDebits: 5000,
    totalCredits: 5000,
    icon: <TrendingUpIcon />,
    color: '#FF9800',
  },
  {
    title: 'Paying Utility Bill',
    description: 'Monthly electricity bill payment',
    date: '2024-01-20',
    entries: [
      {
        account: 'Utility Expense',
        type: 'Debit',
        amount: 150,
        explanation: 'Expense increases (cost incurred)',
      },
      {
        account: 'Cash',
        type: 'Credit',
        amount: 150,
        explanation: 'Asset decreases (money paid out)',
      },
    ],
    totalDebits: 150,
    totalCredits: 150,
    icon: <TrendingDownIcon />,
    color: '#E91E63',
  },
  {
    title: 'Taking Loan',
    description: 'Receiving loan disbursement',
    date: '2024-01-25',
    entries: [
      {
        account: 'Cash',
        type: 'Debit',
        amount: 20000,
        explanation: 'Asset increases (money received)',
      },
      {
        account: 'Loan Payable',
        type: 'Credit',
        amount: 20000,
        explanation: 'Liability increases (debt owed)',
      },
    ],
    totalDebits: 20000,
    totalCredits: 20000,
    icon: <AccountBalanceIcon />,
    color: '#F44336',
  },
  {
    title: 'Making Loan Payment',
    description: 'Monthly loan payment (principal + interest)',
    date: '2024-02-01',
    entries: [
      {
        account: 'Loan Payable (Principal)',
        type: 'Debit',
        amount: 500,
        explanation: 'Liability decreases (debt reduced)',
      },
      {
        account: 'Interest Expense',
        type: 'Debit',
        amount: 200,
        explanation: 'Expense increases (interest cost)',
      },
      {
        account: 'Cash',
        type: 'Credit',
        amount: 700,
        explanation: 'Asset decreases (money paid out)',
      },
    ],
    totalDebits: 700,
    totalCredits: 700,
    icon: <TrendingDownIcon />,
    color: '#F44336',
  },
  {
    title: 'Transfer Between Accounts',
    description: 'Moving money from checking to savings',
    date: '2024-02-05',
    entries: [
      {
        account: 'Cash (Savings Account)',
        type: 'Debit',
        amount: 1000,
        explanation: 'Asset increases (savings account balance)',
      },
      {
        account: 'Cash (Checking Account)',
        type: 'Credit',
        amount: 1000,
        explanation: 'Asset decreases (checking account balance)',
      },
    ],
    totalDebits: 1000,
    totalCredits: 1000,
    icon: <AccountBalanceIcon />,
    color: '#2196F3',
  },
];

const TransactionTemplates: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Transaction Templates
        </Typography>
        <Tooltip title="See how common transactions are recorded using double-entry accounting">
          <IconButton size="small">
            <HelpIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Every transaction in your system follows the same double-entry structure. Here are
        examples of how common transactions are recorded:
      </Typography>

      <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CheckCircleIcon />
            <Typography variant="h6">Double-Entry Structure</Typography>
          </Box>
          <Box sx={{ fontFamily: 'monospace', bgcolor: 'rgba(0,0,0,0.1)', p: 2, borderRadius: 1 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Transaction Date:</strong> [Date]
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Description:</strong> [Description]
            </Typography>
            <Divider sx={{ my: 1, bgcolor: 'rgba(255,255,255,0.3)' }} />
            <Typography variant="body2" gutterBottom>
              <strong>Debit Account:</strong> [Account Name] Amount: [Amount]
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Credit Account:</strong> [Account Name] Amount: [Amount]
            </Typography>
            <Divider sx={{ my: 1, bgcolor: 'rgba(255,255,255,0.3)' }} />
            <Typography variant="body2" fontWeight="bold">
              Total Debits = Total Credits
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Validation Rules
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Chip
              icon={<CheckCircleIcon />}
              label="At least one debit and one credit"
              color="success"
              variant="outlined"
              sx={{ width: '100%', mb: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Chip
              icon={<CheckCircleIcon />}
              label="Total debits equal total credits"
              color="success"
              variant="outlined"
              sx={{ width: '100%', mb: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Chip
              icon={<CheckCircleIcon />}
              label="Account balances consistent"
              color="success"
              variant="outlined"
              sx={{ width: '100%', mb: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Chip
              icon={<CheckCircleIcon />}
              label="Transactions cannot be deleted"
              color="info"
              variant="outlined"
              sx={{ width: '100%', mb: 1 }}
            />
          </Grid>
        </Grid>
      </Box>

      {transactionTemplates.map((template, index) => (
        <Accordion
          key={template.title}
          expanded={expanded === `panel${index}`}
          onChange={handleChange(`panel${index}`)}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Box
                sx={{
                  color: template.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: `${template.color}20`,
                }}
              >
                {template.icon}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  {template.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {template.description}
                </Typography>
              </Box>
              <Chip
                label={`${template.entries.length} entries`}
                size="small"
                sx={{
                  bgcolor: `${template.color}20`,
                  color: template.color,
                }}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Transaction Details
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Date:</strong> {template.date}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Description:</strong> {template.description}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Journal Entries
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <strong>Account</strong>
                        </TableCell>
                        <TableCell align="center">
                          <strong>Type</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>Amount</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Explanation</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {template.entries.map((entry, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {entry.account}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={entry.type}
                              size="small"
                              sx={{
                                bgcolor:
                                  entry.type === 'Debit'
                                    ? '#4CAF5020'
                                    : '#2196F320',
                                color:
                                  entry.type === 'Debit' ? '#4CAF50' : '#2196F3',
                                fontWeight: 'bold',
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              color={
                                entry.type === 'Debit' ? '#4CAF50' : '#2196F3'
                              }
                            >
                              {formatCurrency(entry.amount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {entry.explanation}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell colSpan={2}>
                          <Typography variant="body2" fontWeight="bold">
                            Total
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(template.totalDebits)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Balanced"
                            size="small"
                            color="success"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'success.light',
                    color: 'success.contrastText',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CheckCircleIcon />
                    <Typography variant="body2" fontWeight="bold">
                      Validation Passed
                    </Typography>
                  </Box>
                  <Typography variant="caption">
                    Total Debits ({formatCurrency(template.totalDebits)}) = Total Credits (
                    {formatCurrency(template.totalCredits)})
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default TransactionTemplates;

