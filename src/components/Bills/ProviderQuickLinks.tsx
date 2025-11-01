import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Remove,
  ChevronRight,
  Bolt,
  Water,
  Wifi,
  LocalGasStation,
  CreditCard,
  School,
  LocalHospital,
  MoreHoriz,
} from '@mui/icons-material';
import { ProviderAnalytics, BillType } from '../../types/bill';

interface ProviderQuickLinksProps {
  providers: ProviderAnalytics[];
  onProviderClick: (provider: string, billType: BillType) => void;
}

const ProviderQuickLinks: React.FC<ProviderQuickLinksProps> = ({
  providers,
  onProviderClick,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getProviderIcon = (billType: BillType) => {
    switch (billType) {
      case BillType.UTILITY:
        return <Bolt color="primary" />;
      case BillType.SUBSCRIPTION:
        return <Wifi color="action" />;
      case BillType.INSURANCE:
        return <CreditCard color="success" />;
      case BillType.SCHOOL_TUITION:
        return <School color="secondary" />;
      case BillType.MEDICAL:
        return <LocalHospital color="error" />;
      case BillType.CREDIT_CARD:
        return <CreditCard color="warning" />;
      default:
        return <MoreHoriz />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp sx={{ fontSize: 18, color: 'error.main' }} />;
      case 'decreasing':
        return <TrendingDown sx={{ fontSize: 18, color: 'success.main' }} />;
      case 'stable':
        return <Remove sx={{ fontSize: 18, color: 'text.secondary' }} />;
      default:
        return null;
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'Increasing';
      case 'decreasing':
        return 'Decreasing';
      case 'stable':
        return 'Stable';
      default:
        return trend;
    }
  };

  if (providers.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Providers
          </Typography>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Add bills to see provider analytics and history
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          📊 Providers
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
          {providers.length} provider{providers.length !== 1 ? 's' : ''}
        </Typography>

        <List disablePadding>
          {providers.map((provider, index) => (
            <React.Fragment key={`${provider.provider}-${provider.billType}`}>
              <ListItemButton
                onClick={() => onProviderClick(provider.provider, provider.billType)}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  p: 1.5,
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', mb: 1 }}>
                  {getProviderIcon(provider.billType)}
                  <Typography variant="body2" fontWeight="medium" sx={{ flex: 1 }}>
                    {provider.provider}
                  </Typography>
                  {getTrendIcon(provider.trend)}
                </Box>
                
                <Box sx={{ width: '100%', pl: 4 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {provider.billCount} bill{provider.billCount !== 1 ? 's' : ''}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" fontWeight="medium">
                    Avg: {formatCurrency(provider.averageMonthly)}
                  </Typography>
                </Box>
              </ListItemButton>
              {index < providers.length - 1 && <Divider sx={{ my: 1 }} />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default ProviderQuickLinks;

