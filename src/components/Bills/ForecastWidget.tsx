import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Divider } from '@mui/material';
import {
  TrendingUp,
  Timeline,
  InfoOutlined,
} from '@mui/icons-material';
import { BillForecast } from '../../types/bill';

interface ForecastWidgetProps {
  forecast: BillForecast;
  provider?: string;
}

const ForecastWidget: React.FC<ForecastWidgetProps> = ({ forecast, provider }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getConfidenceColor = () => {
    switch (forecast.confidence) {
      case 'high':
        return 'success';
      case 'medium':
        return 'warning';
      case 'low':
        return 'error';
      default:
        return 'default';
    }
  };

  const getMethodLabel = () => {
    switch (forecast.calculationMethod) {
      case 'simple':
        return 'Simple Average';
      case 'weighted':
        return 'Weighted Average';
      case 'seasonal':
        return 'Seasonal Average';
      default:
        return forecast.calculationMethod;
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Timeline sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Forecast & Analysis</Typography>
        </Box>

        {provider && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {provider}
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Estimated Next Bill
          </Typography>
          <Typography variant="h3" color="primary.main" fontWeight="bold">
            {formatCurrency(forecast.estimatedAmount)}
          </Typography>
          {forecast.estimatedForMonth && (
            <Typography variant="caption" color="text.secondary">
              For {new Date(forecast.estimatedForMonth).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              })}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Chip
            label={`Confidence: ${forecast.confidence}`}
            color={getConfidenceColor() as any}
            size="small"
          />
          <Chip
            label={getMethodLabel()}
            variant="outlined"
            size="small"
          />
        </Box>

        {forecast.recommendation && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
              p: 2,
              bgcolor: 'action.hover',
              borderRadius: 1,
            }}
          >
            <InfoOutlined sx={{ fontSize: 20, color: 'info.main', mt: 0.5 }} />
            <Box>
              <Typography variant="body2" fontWeight="medium" gutterBottom>
                Tip
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {forecast.recommendation}
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ForecastWidget;

