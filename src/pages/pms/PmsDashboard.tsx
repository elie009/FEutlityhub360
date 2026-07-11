import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  Apartment,
  CalendarMonth,
  Build,
  TrendingUp,
  WarningAmber,
  People,
} from '@mui/icons-material';

const StatCard: React.FC<{
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  accent?: string;
}> = ({ title, value, subtitle, icon, accent = '#b3ee9a' }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        {title}
      </Typography>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          bgcolor: `${accent}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'grey.900',
        }}
      >
        {icon}
      </Box>
    </Box>
    <Typography variant="h5" fontWeight={700} sx={{ color: '#1a1a1a' }}>
      {value}
    </Typography>
    {subtitle && (
      <Typography variant="caption" color="text.secondary">
        {subtitle}
      </Typography>
    )}
  </Paper>
);

const PmsDashboard: React.FC = () => {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: '#1a1a1a', mb: 0.5 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Portfolio snapshot, occupancy, and what needs attention today.
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Occupancy rate"
            value="94%"
            subtitle="vs last month +1.2%"
            icon={<TrendingUp sx={{ fontSize: 22 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Units / properties"
            value="128 / 12"
            subtitle="Active in portfolio"
            icon={<Apartment sx={{ fontSize: 22 }} />}
            accent="#90caf9"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Arrivals (7 days)"
            value="23"
            subtitle="Check-ins scheduled"
            icon={<CalendarMonth sx={{ fontSize: 22 }} />}
            accent="#ce93d8"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Open work orders"
            value="7"
            subtitle="2 marked urgent"
            icon={<Build sx={{ fontSize: 22 }} />}
            accent="#ffcc80"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Rent collection (this month)
            </Typography>
            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Collected
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  82%
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={82} sx={{ height: 8, borderRadius: 9999 }} />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Demo metrics — connect ledger &amp; bank feeds to populate live data.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <WarningAmber color="warning" />
              <Typography variant="subtitle1" fontWeight={600}>
                Delinquency watch
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              4 leases are past due. Review rent roll and send reminders from the delinquency report.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <People fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Owner portal invites: 3 pending
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PmsDashboard;
