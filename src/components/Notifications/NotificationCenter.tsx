import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive,
  CheckCircle,
  Warning,
  Info,
  Error,
  MarkEmailRead,
  Delete,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Notification, NotificationType, NotificationStatus, NotificationPriority, NotificationsResponse, GetNotificationsParams, NotificationPagination, NotificationSummary } from '../../types/loan';
import { getErrorMessage } from '../../utils/validation';

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.LOAN_APPROVED:
      return <CheckCircle color="success" />;
    case NotificationType.LOAN_REJECTED:
      return <Error color="error" />;
    case NotificationType.PAYMENT_DUE:
    case NotificationType.PAYMENT_OVERDUE:
      return <Warning color="warning" />;
    case NotificationType.PAYMENT_CONFIRMED:
      return <CheckCircle color="success" />;
    case NotificationType.LOAN_CLOSED:
      return <CheckCircle color="info" />;
    case NotificationType.UPCOMING_DUE:
      return <Info color="info" />;
    default:
      return <NotificationsIcon />;
  }
};

const getNotificationColor = (type: NotificationType): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (type) {
    case NotificationType.LOAN_APPROVED:
    case NotificationType.PAYMENT_CONFIRMED:
    case NotificationType.LOAN_CLOSED:
      return 'success';
    case NotificationType.LOAN_REJECTED:
    case NotificationType.PAYMENT_OVERDUE:
      return 'error';
    case NotificationType.PAYMENT_DUE:
      return 'warning';
    case NotificationType.UPCOMING_DUE:
      return 'info';
    default:
      return 'default';
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString();
  }
};

const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<NotificationPagination | null>(null);
  const [summary, setSummary] = useState<NotificationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);


  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user, currentPage, filter]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const params: GetNotificationsParams = {
        page: currentPage,
        limit: pageSize,
        unreadOnly: filter === 'unread'
      };
      
      const response: NotificationsResponse = await apiService.getNotifications(user.id, params);
      setNotifications(response.notifications);
      setPagination(response.pagination);
      setSummary(response.summary);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load notifications'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications(prev =>
        (prev || []).map(notif =>
          notif.id === notificationId
            ? { ...notif, isRead: true, readAt: new Date().toISOString() }
            : notif
        )
      );
      // Update summary if available
      if (summary) {
        setSummary(prev => prev ? {
          ...prev,
          unreadCount: Math.max(0, prev.unreadCount - 1)
        } : null);
      }
    } catch (err: unknown) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = (notifications || []).filter(n => !n.isRead);
      await Promise.all(unreadNotifications.map(n => apiService.markNotificationAsRead(n.id)));
      setNotifications(prev =>
        (prev || []).map(notif => ({
          ...notif,
          isRead: true,
          readAt: notif.readAt || new Date().toISOString(),
        }))
      );
      // Update summary
      if (summary) {
        setSummary(prev => prev ? {
          ...prev,
          unreadCount: 0
        } : null);
      }
    } catch (err: unknown) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleFilterChange = (newFilter: 'all' | 'unread') => {
    setFilter(newFilter);
    handleMenuClose();
  };

  const filteredNotifications = (notifications || []).filter(notification => {
    if (filter === 'unread') {
      return !notification.isRead;
    }
    return true;
  });

  const unreadCount = summary?.unreadCount || (notifications || []).filter(n => !n.isRead).length;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Notifications
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<MarkEmailRead />}
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark All as Read
          </Button>
          <IconButton onClick={handleMenuOpen}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsActive />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleFilterChange('all')}>
              All Notifications
            </MenuItem>
            <MenuItem onClick={() => handleFilterChange('unread')}>
              Unread Only
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filter === 'unread' 
                ? 'You\'re all caught up!'
                : 'You haven\'t received any notifications yet.'
              }
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <List>
            {filteredNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                    '&:hover': {
                      bgcolor: 'action.selected',
                    },
                  }}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="body1">
                          {notification.message}
                        </Typography>
                        <Chip
                          label={notification.type.replace('_', ' ')}
                          color={getNotificationColor(notification.type)}
                          size="small"
                        />
                        {!notification.isRead && (
                          <Chip
                            label="New"
                            color="primary"
                            size="small"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(notification.createdAt)}
                        </Typography>
                        {!notification.isRead && (
                          <Button
                            size="small"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            Mark as Read
                          </Button>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < filteredNotifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Card>
      )}
    </Box>
  );
};

export default NotificationCenter;
