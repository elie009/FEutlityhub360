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
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">Alerts</Typography>
            {unreadAlerts.length > 0 && (
              <Badge badgeContent={unreadAlerts.length} color="error">
                <NotificationsActive />
              </Badge>
            )}
          </Box>
          <Typography variant="caption" color="text.secondary">
            {alerts.length} total
          </Typography>
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
                bgcolor: alert.read ? 'background.paper' : 'action.hover',
                '&:last-child': { mb: 0 },
              }}
              secondaryAction={
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => handleMarkAsRead(alert.id)}
                  disabled={alert.read}
                >
                  <Close fontSize="small" />
                </IconButton>
              }
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Box sx={{ color: `${alert.severity}.main` }}>
                      {getAlertIcon(alert.severity)}
                    </Box>
                    <Typography variant="subtitle2" fontWeight="medium">
                      {alert.title}
                    </Typography>
                    <Chip
                      label={getAlertTypeLabel(alert.type)}
                      size="small"
                      variant="outlined"
                      sx={{ ml: 'auto' }}
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {alert.message}
                    </Typography>
                    {alert.provider && (
                      <Typography variant="caption" color="text.secondary">
                        Provider: {alert.provider}
                      </Typography>
                    )}
                    {alert.amount && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        Amount: ₱{alert.amount.toLocaleString()}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" display="block">
                      {formatDate(alert.createdAt)}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default BillAlerts;

