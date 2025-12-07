import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Chip,
  Divider,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as AttachMoneyIcon,
  HelpOutline as HelpIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

interface AccountingConcept {
  name: string;
  definition: string;
  moduleMappings: Array<{
    module: string;
    accountType: string;
  }>;
  accountingRules: {
    increases: string;
    decreases: string;
    normalBalance: string;
  };
  examples: Array<{
    description: string;
    debit: string;
    credit: string;
    amount: string;
  }>;
  icon: React.ReactNode;
  color: string;
}

const accountingConcepts: AccountingConcept[] = [
  {
    name: 'Assets',
    definition: 'Resources owned that have economic value',
    moduleMappings: [
      { module: 'Bank Accounts', accountType: 'Asset (Cash)' },
      { module: 'Savings Accounts', accountType: 'Asset (Savings)' },
      { module: 'Investment Accounts', accountType: 'Asset (Investments)' },
      { module: 'Receivables', accountType: 'Asset (Money Owed to You)' },
    ],
    accountingRules: {
      increases: 'Debit',
      decreases: 'Credit',
      normalBalance: 'Debit',
    },
    examples: [
      {
        description: 'Opening bank account',
        debit: 'Cash (Bank Account)',
        credit: "Owner's Capital",
        amount: '$10,000',
      },
      {
        description: 'Receiving payment',
        debit: 'Cash',
        credit: 'Income',
        amount: '$5,000',
      },
      {
        description: 'Making payment',
        debit: 'Expense',
        credit: 'Cash',
        amount: '$150',
      },
    ],
    icon: <AccountBalanceIcon />,
    color: '#4CAF50',
  },
  {
    name: 'Liabilities',
    definition: 'Obligations to pay debts',
    moduleMappings: [
      { module: 'Loans', accountType: 'Liability (Loan Payable)' },
      { module: 'Credit Cards', accountType: 'Liability (Credit Card Payable)' },
      { module: 'Bills (Unpaid)', accountType: 'Liability (Bills to Pay)' },
    ],
    accountingRules: {
      increases: 'Credit',
      decreases: 'Debit',
      normalBalance: 'Credit',
    },
    examples: [
      {
        description: 'Taking loan',
        debit: 'Cash',
        credit: 'Loan Payable',
        amount: '$20,000',
      },
      {
        description: 'Paying loan',
        debit: 'Loan Payable',
        credit: 'Cash',
        amount: '$500',
      },
      {
        description: 'Receiving bill',
        debit: 'Expense',
        credit: 'Bills to Pay',
        amount: '$150',
      },
      {
        description: 'Paying bill',
        debit: 'Bills to Pay',
        credit: 'Cash',
        amount: '$150',
      },
    ],
    icon: <TrendingDownIcon />,
    color: '#F44336',
  },
  {
    name: 'Equity',
    definition: "Owner's interest in assets after liabilities",
    moduleMappings: [
      { module: 'Initial Capital', accountType: "Equity (Owner's Capital)" },
      { module: 'Net Income', accountType: 'Equity (Retained Earnings)' },
      { module: 'Withdrawals', accountType: "Equity (Owner's Draw)" },
    ],
    accountingRules: {
      increases: 'Credit',
      decreases: 'Debit',
      normalBalance: 'Credit',
    },
    examples: [
      {
        description: 'Initial setup',
        debit: 'Cash',
        credit: "Owner's Capital",
        amount: '$10,000',
      },
      {
        description: 'Net income',
        debit: 'Income Summary',
        credit: 'Retained Earnings',
        amount: '$5,000',
      },
      {
        description: 'Owner withdrawal',
        debit: "Owner's Draw",
        credit: 'Cash',
        amount: '$1,000',
      },
    ],
    icon: <AttachMoneyIcon />,
    color: '#2196F3',
  },
  {
    name: 'Income',
    definition: 'Money received from business activities or investments',
    moduleMappings: [
      { module: 'Income Sources', accountType: 'Income (Salary, Business Income, etc.)' },
      { module: 'Interest Income', accountType: 'Income (Interest Revenue)' },
      { module: 'Investment Returns', accountType: 'Income (Investment Income)' },
    ],
    accountingRules: {
      increases: 'Credit',
      decreases: 'Debit (rare)',
      normalBalance: 'Credit',
    },
    examples: [
      {
        description: 'Receiving salary',
        debit: 'Cash',
        credit: 'Salary Income',
        amount: '$5,000',
      },
      {
        description: 'Interest earned',
        debit: 'Cash',
        credit: 'Interest Income',
        amount: '$50',
      },
      {
        description: 'Business income',
        debit: 'Cash',
        credit: 'Business Income',
        amount: '$2,000',
      },
    ],
    icon: <TrendingUpIcon />,
    color: '#FF9800',
  },
  {
    name: 'Expenses',
    definition: 'Costs incurred to generate income or maintain operations',
    moduleMappings: [
      { module: 'Bills', accountType: 'Expense (Utilities, Subscriptions, etc.)' },
      { module: 'Loan Interest', accountType: 'Expense (Interest Expense)' },
      { module: 'Transactions (Expenses)', accountType: 'Expense (Various categories)' },
    ],
    accountingRules: {
      increases: 'Debit',
      decreases: 'Credit (rare)',
      normalBalance: 'Debit',
    },
    examples: [
      {
        description: 'Paying utility bill',
        debit: 'Utility Expense',
        credit: 'Cash',
        amount: '$150',
      },
      {
        description: 'Loan interest',
        debit: 'Interest Expense',
        credit: 'Cash',
        amount: '$200',
      },
      {
        description: 'Office supplies',
        debit: 'Supplies Expense',
        credit: 'Cash',
        amount: '$50',
      },
    ],
    icon: <TrendingDownIcon />,
    color: '#E91E63',
  },
];

const AccountingConcepts: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Accounting Concepts Guide
        </Typography>
        <Tooltip title="This guide explains how your financial activities map to accounting concepts. No accounting knowledge required!">
          <IconButton size="small">
            <HelpIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Understanding how your transactions work behind the scenes. Every transaction follows
        double-entry accounting principles, ensuring accuracy and completeness.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Fundamental Accounting Equation
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
              Assets = Liabilities + Equity
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
              This equation must always balance. Your system automatically maintains this balance
              through double-entry bookkeeping.
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {accountingConcepts.map((concept, index) => (
        <Accordion
          key={concept.name}
          expanded={expanded === `panel${index}`}
          onChange={handleChange(`panel${index}`)}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Box
                sx={{
                  color: concept.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: `${concept.color}20`,
                }}
              >
                {concept.icon}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  {concept.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {concept.definition}
                </Typography>
              </Box>
              <Chip
                label={concept.accountingRules.normalBalance}
                size="small"
                sx={{
                  bgcolor: `${concept.color}20`,
                  color: concept.color,
                  fontWeight: 'bold',
                }}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Module Mapping
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  How your app modules map to accounting accounts:
                </Typography>
                {concept.moduleMappings.map((mapping, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      borderRadius: 1,
                      bgcolor: 'background.default',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body2" fontWeight="medium">
                      {mapping.module}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      → {mapping.accountType}
                    </Typography>
                  </Box>
                ))}
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Accounting Rules
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Increases:</Typography>
                    <Chip
                      label={concept.accountingRules.increases}
                      size="small"
                      sx={{
                        bgcolor: concept.accountingRules.increases === 'Debit' ? '#4CAF5020' : '#2196F320',
                        color: concept.accountingRules.increases === 'Debit' ? '#4CAF50' : '#2196F3',
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Decreases:</Typography>
                    <Chip
                      label={concept.accountingRules.decreases}
                      size="small"
                      sx={{
                        bgcolor: concept.accountingRules.decreases === 'Credit' ? '#4CAF5020' : '#2196F320',
                        color: concept.accountingRules.decreases === 'Credit' ? '#4CAF50' : '#2196F3',
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Normal Balance:</Typography>
                    <Chip
                      label={concept.accountingRules.normalBalance}
                      size="small"
                      sx={{
                        bgcolor: `${concept.color}20`,
                        color: concept.color,
                        fontWeight: 'bold',
                      }}
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Examples
                </Typography>
                {concept.examples.map((example, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 1.5,
                      mb: 1.5,
                      borderRadius: 1,
                      bgcolor: 'background.default',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body2" fontWeight="medium" gutterBottom>
                      {example.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Debit:
                      </Typography>
                      <Typography variant="caption" fontWeight="medium">
                        {example.debit}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Credit:
                      </Typography>
                      <Typography variant="caption" fontWeight="medium">
                        {example.credit}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">
                        Amount:
                      </Typography>
                      <Typography variant="caption" fontWeight="bold" color={concept.color}>
                        {example.amount}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      <Card sx={{ mt: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CheckCircleIcon />
            <Typography variant="h6">Double-Entry Principle</Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Every transaction in your system automatically creates balanced entries:
          </Typography>
          <Box sx={{ fontFamily: 'monospace', bgcolor: 'rgba(0,0,0,0.1)', p: 2, borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>Total Debits = Total Credits</strong>
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.9 }}>
              This ensures mathematical accuracy and prevents errors. Your system validates this
              automatically for every transaction.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AccountingConcepts;

