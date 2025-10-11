import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Chip,
  Badge,
} from '@mui/material';
import {
  NotificationsActive,
  Close,
  Warning,
  Info,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import { BillAlert } from '../../types/bill';
import { apiService } from '../../services/api';

interface BillAlertsProps {
  alerts: BillAlert[];
  onAlertRead?: () => void;
}

const BillAlerts: React.FC<BillAlertsProps> = ({ alerts, onAlertRead }) => {
  const unreadAlerts = alerts.filter(alert => !alert.read);

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <Error sx={{ fontSize: 20 }} />;
      case 'warning':
        return <Warning sx={{ fontSize: 20 }} />;
      case 'success':
        return <CheckCircle sx={{ fontSize: 20 }} />;
      case 'info':
      default:
        return <Info sx={{ fontSize: 20 }} />;
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'budget_exceeded':
        return 'Budget Exceeded';
      case 'trend_increase':
        return 'Trend Alert';
      case 'unusual_spike':
        return 'Unusual Spike';
      case 'due_reminder':
        return 'Payment Due';
      case 'overdue':
        return 'Overdue';
      case 'savings':
        return 'Savings';
      default:
        return type;
    }
  };

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await apiService.markAlertAsRead(alertId);
      onAlertRead?.();
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <NotificationsActive sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No Alerts
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You're all caught up!
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">🔔 Alerts</Typography>
            {unreadAlerts.length > 0 && (
              <Badge badgeContent={unreadAlerts.length} color="error" />
            )}
          </Box>
        </Box>

        <List disablePadding>
          {alerts.map((alert, index) => (
            <ListItem
              key={alert.id}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                p: 1,
                flexDirection: 'column',
                alignItems: 'flex-start',
                bgcolor: alert.read ? 'background.paper' : 'action.hover',
                '&:last-child': { mb: 0 },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, width: '100%', mb: 0.5 }}>
                <Box sx={{ color: `${alert.severity}.main`, mt: 0.5 }}>
                  {getAlertIcon(alert.severity)}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" fontWeight="bold" display="block">
                    {alert.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    {alert.message}
                  </Typography>
                  {alert.provider && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      {alert.provider}
                    </Typography>
                  )}
                  {alert.amount && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      ${alert.amount.toLocaleString()}
                    </Typography>
                  )}
                </Box>
                <IconButton
                  size="small"
                  onClick={() => handleMarkAsRead(alert.id)}
                  disabled={alert.read}
                  sx={{ p: 0.5 }}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default BillAlerts;

