import React from 'react';
import { Container, Box, Tabs, Tab, Typography } from '@mui/material';
import AccountingConcepts from '../components/Accounting/AccountingConcepts';
import TransactionTemplates from '../components/Accounting/TransactionTemplates';
import AccountingEquation from '../components/Accounting/AccountingEquation';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`accounting-tabpanel-${index}`}
      aria-labelledby={`accounting-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const AccountingGuide: React.FC = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
          Accounting System Guide
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Learn how your financial transactions work behind the scenes. This guide explains accounting
          concepts in simple, non-technical terms.
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <AccountingEquation />
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={value} onChange={handleChange} aria-label="accounting guide tabs">
          <Tab label="Accounting Concepts" />
          <Tab label="Transaction Templates" />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        <AccountingConcepts />
      </TabPanel>

      <TabPanel value={value} index={1}>
        <TransactionTemplates />
      </TabPanel>
    </Container>
  );
};

export default AccountingGuide;

