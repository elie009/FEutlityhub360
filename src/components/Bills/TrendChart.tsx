import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { MonthlyBillData } from '../../types/bill';

interface TrendChartProps {
  data: MonthlyBillData[];
  provider?: string;
  averageAmount?: number;
}

const TrendChart: React.FC<TrendChartProps> = ({ data, provider, averageAmount }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Monthly Trend
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No data available for trend chart
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = data.map((item) => ({
    month: new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    amount: item.amount,
    status: item.status,
  }));

  // Calculate trend
  const firstAmount = data[0]?.amount || 0;
  const lastAmount = data[data.length - 1]?.amount || 0;
  const trendPercentage = firstAmount !== 0 ? ((lastAmount - firstAmount) / firstAmount) * 100 : 0;
  const isIncreasing = trendPercentage > 0;

  // Find highest and lowest
  const amounts = data.map(d => d.amount);
  const highestAmount = Math.max(...amounts);
  const lowestAmount = Math.min(...amounts);

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            {provider ? `${provider} - Monthly Trend` : 'Monthly Trend'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {isIncreasing ? (
              <TrendingUp color="error" />
            ) : (
              <TrendingDown color="success" />
            )}
            <Typography
              variant="body2"
              color={isIncreasing ? 'error.main' : 'success.main'}
              fontWeight="bold"
            >
              {isIncreasing ? '+' : ''}
              {trendPercentage.toFixed(1)}%
            </Typography>
          </Box>
        </Box>

        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelStyle={{ color: '#000' }}
              />
              <Legend />
              {averageAmount && (
                <ReferenceLine
                  y={averageAmount}
                  stroke="#666"
                  strokeDasharray="5 5"
                  label={{ value: 'Average', position: 'right' }}
                />
              )}
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Bill Amount"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Highest
            </Typography>
            <Typography variant="body2" fontWeight="bold" color="error.main">
              {formatCurrency(highestAmount)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Lowest
            </Typography>
            <Typography variant="body2" fontWeight="bold" color="success.main">
              {formatCurrency(lowestAmount)}
            </Typography>
          </Box>
          {averageAmount && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Average
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {formatCurrency(averageAmount)}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TrendChart;

