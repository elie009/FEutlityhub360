import React from 'react';
import { Box, Typography, Chip, Alert } from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { BillVariance } from '../../types/bill';

interface VarianceDisplayProps {
  variance: BillVariance;
}

const VarianceDisplay: React.FC<VarianceDisplayProps> = ({ variance }) => {
  const getStatusColor = () => {
    switch (variance.status) {
      case 'over_budget':
        return 'error';
      case 'slightly_over':
        return 'warning';
      case 'on_target':
        return 'success';
      case 'under_budget':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusIcon = () => {
    switch (variance.status) {
      case 'over_budget':
      case 'slightly_over':
        return <TrendingUp sx={{ fontSize: 16 }} />;
      case 'under_budget':
        return <TrendingDown sx={{ fontSize: 16 }} />;
      case 'on_target':
        return <CheckCircle sx={{ fontSize: 16 }} />;
      default:
        return <Warning sx={{ fontSize: 16 }} />;
    }
  };

  const getStatusLabel = () => {
    switch (variance.status) {
      case 'over_budget':
        return 'Over Budget';
      case 'slightly_over':
        return 'Slightly Over';
      case 'on_target':
        return 'On Target';
      case 'under_budget':
        return 'Under Budget';
      default:
        return 'Unknown';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Variance Analysis
        </Typography>
        <Chip
          label={getStatusLabel()}
          color={getStatusColor() as any}
          size="small"
          icon={getStatusIcon()}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Actual Amount:
        </Typography>
        <Typography variant="body2" fontWeight="medium">
          {formatCurrency(variance.actualAmount)}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Estimated Amount:
        </Typography>
        <Typography variant="body2" fontWeight="medium">
          {formatCurrency(variance.estimatedAmount)}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Variance:
        </Typography>
        <Typography
          variant="body2"
          fontWeight="bold"
          color={variance.variance >= 0 ? 'error.main' : 'success.main'}
        >
          {variance.variance >= 0 ? '+' : ''}
          {formatCurrency(variance.variance)} ({variance.variancePercentage >= 0 ? '+' : ''}
          {variance.variancePercentage.toFixed(2)}%)
        </Typography>
      </Box>

      {variance.message && (
        <Alert severity={getStatusColor() as any} sx={{ mb: 1 }}>
          {variance.message}
        </Alert>
      )}

      {variance.recommendation && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          💡 {variance.recommendation}
        </Typography>
      )}
    </Box>
  );
};

export default VarianceDisplay;

