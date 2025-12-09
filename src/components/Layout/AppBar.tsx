import React, { useState, useEffect } from 'react';
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Badge,
  InputBase,
  Divider,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Search as SearchIcon,
  Settings as SettingsIcon,
  CheckCircle,
  Payment,
  Warning,
  Info,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Notification, NotificationType } from '../../types/loan';

interface AppBarProps {
  onMenuClick?: () => void;
  sidebarOpen?: boolean;
  sidebarWidth?: number;
}

const AppBar: React.FC<AppBarProps> = ({ onMenuClick, sidebarOpen = false, sidebarWidth = 240 }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = React.useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Fetch recent notifications when dropdown opens
  const fetchRecentNotifications = async () => {
    if (!user?.id) return;
    
    setLoadingNotifications(true);
    try {
      const response = await apiService.getNotifications(user.id, {
        limit: 5, // Show last 5 notifications
        page: 1,
      });
      setRecentNotifications(response.notifications);
    } catch (error) {
      console.error('Failed to fetch recent notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Fetch unread notification count
  useEffect(() => {
    if (user?.id) {
      const fetchUnreadCount = async () => {
        try {
          const count = await apiService.getUnreadNotificationCount(user.id);
          setUnreadCount(count);
        } catch (error) {
          console.error('Failed to fetch unread notification count:', error);
        }
      };

      fetchUnreadCount();
      // Refresh count every 2 minutes (reduced from 30 seconds to prevent excessive polling)
      const interval = setInterval(fetchUnreadCount, 120000);
      
      // Listen for notification count changes (e.g., after deletion)
      const handleNotificationCountChange = () => {
        fetchUnreadCount();
        // Refresh recent notifications if dropdown is open
        if (notificationAnchorEl) {
          fetchRecentNotifications();
        }
      };
      window.addEventListener('notificationCountChanged', handleNotificationCountChange);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('notificationCountChanged', handleNotificationCountChange);
      };
    }
  }, [user?.id, notificationAnchorEl]);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = async (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
    await fetchRecentNotifications();
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.isRead && user?.id) {
      try {
        await apiService.markNotificationAsRead(notification.id);
        setRecentNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        window.dispatchEvent(new Event('notificationCountChanged'));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    // Extract billId or loanId from templateVariables/metadata
    const billId = notification.templateVariables?.billId || notification.metadata?.billId;
    const loanId = notification.templateVariables?.loanId || notification.metadata?.loanId;

    // Navigate based on notification type
    switch (notification.type) {
      case NotificationType.PAYMENT_OVERDUE:
      case NotificationType.PAYMENT_DUE:
      case NotificationType.UPCOMING_DUE:
        if (billId) {
          navigate('/bills', { state: { openBillId: billId } });
        } else if (loanId) {
          navigate('/loans', { state: { openLoanId: loanId } });
        } else {
          if (notification.type === NotificationType.PAYMENT_OVERDUE || notification.type === NotificationType.PAYMENT_DUE) {
            navigate('/bills');
          } else {
            navigate('/loans');
          }
        }
        break;
      
      case NotificationType.LOAN_APPROVED:
      case NotificationType.LOAN_REJECTED:
      case NotificationType.LOAN_CLOSED:
        if (loanId) {
          navigate('/loans', { state: { openLoanId: loanId } });
        } else {
          navigate('/loans');
        }
        break;
      
      case NotificationType.PAYMENT_CONFIRMED:
        if (billId) {
          navigate('/bills', { state: { openBillId: billId } });
        } else if (loanId) {
          navigate('/loans', { state: { openLoanId: loanId } });
        } else {
          navigate('/transactions');
        }
        break;
      
      default:
        navigate('/notifications');
    }
    
    handleNotificationMenuClose();
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.LOAN_APPROVED:
      case NotificationType.PAYMENT_CONFIRMED:
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case NotificationType.PAYMENT_OVERDUE:
      case NotificationType.PAYMENT_DUE:
        return <Warning sx={{ color: 'warning.main' }} />;
      case NotificationType.UPCOMING_DUE:
        return <Payment sx={{ color: 'info.main' }} />;
      default:
        return <Info sx={{ color: 'primary.main' }} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && searchQuery.trim()) {
      // Redirect to documentation page with search query
      navigate(`/documentation?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <MuiAppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 10,
        top: { xs: 0, md: '12px' }, // Align with sidebar top margin
        left: { xs: 0, md: `calc(${sidebarWidth}px + 12px)` }, // Start after sidebar width + left margin
        width: { xs: '100%', md: `calc(100% - ${sidebarWidth}px - 24px)` }, // Width minus sidebar, left margin, and right margin
        borderRadius: { xs: 0, md: '8px' }, // Match sidebar border radius
        transition: (theme) => theme.transitions.create(['width', 'left'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left side - Mobile menu only */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isMobile && onMenuClick && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={onMenuClick}
              edge="start"
              sx={{ mr: 2, color: '#1a1a1a' }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Box>

        {/* Right side - Search box, notification bell, settings, and user icon */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 'auto' }}>
          {/* Search Bar */}
          <Box
            sx={{
              position: 'relative',
              borderRadius: 1,
              width: { xs: '200px', sm: '300px' },
              maxWidth: '400px',
              display: 'flex',
              alignItems: 'center',
              padding: '4px 12px',
              border: '1px solid #e5e5e5',
              backgroundColor: '#ffffff',
              '&:hover': {
                backgroundColor: '#ffffff',
              },
            }}
          >
            <SearchIcon sx={{ color: '#666666', mr: 1, fontSize: '20px' }} />
            <InputBase
              placeholder="Search bills, loans, Expense etc"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={handleSearchKeyPress}
              sx={{
                color: '#1a1a1a',
                width: '100%',
                '& .MuiInputBase-input': {
                  padding: '4px 8px',
                  fontSize: '0.875rem',
                },
              }}
            />
          </Box>

          <IconButton 
            color="inherit" 
            onClick={handleNotificationMenuOpen}
            sx={{ color: '#1a1a1a' }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Notification Dropdown Menu */}
          <Menu
            anchorEl={notificationAnchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(notificationAnchorEl)}
            onClose={handleNotificationMenuClose}
            PaperProps={{
              sx: {
                width: { xs: '90vw', sm: 500, md: 600 },
                maxWidth: '90vw',
                maxHeight: { xs: 'calc(100vh - 100px)', sm: 'calc(100vh - 80px)' },
                mt: 1,
              },
            }}
          >
            <Box sx={{ p: 2, pb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {unreadCount} unread
                </Typography>
              )}
            </Box>
            <Divider />
            <Box sx={{ overflow: 'auto', maxHeight: { xs: 'calc(100vh - 200px)', sm: 'calc(100vh - 180px)' } }}>
              {loadingNotifications ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Loading notifications...
                  </Typography>
                </Box>
              ) : recentNotifications.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No notifications
                  </Typography>
                </Box>
              ) : (
                recentNotifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <MenuItem
                      onClick={() => handleNotificationClick(notification)}
                      sx={{
                        bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                        py: 1.5,
                        px: 2,
                        whiteSpace: 'normal',
                        width: '100%',
                        '&:hover': {
                          bgcolor: 'action.selected',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, alignSelf: 'flex-start', pt: 0.5 }}>
                        {getNotificationIcon(notification.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: notification.isRead ? 400 : 600,
                              mb: 0.5,
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word',
                            }}
                          >
                            {notification.message}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{
                                whiteSpace: 'normal',
                                wordBreak: 'break-word',
                              }}
                            >
                              {formatDate(notification.createdAt)}
                            </Typography>
                            {!notification.isRead && (
                              <Chip
                                label="New"
                                size="small"
                                color="primary"
                                sx={{ height: 18, fontSize: '0.65rem' }}
                              />
                            )}
                          </Box>
                        }
                        sx={{
                          width: '100%',
                          margin: 0,
                        }}
                      />
                    </MenuItem>
                    {index < recentNotifications.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              )}
            </Box>
            <Divider />
            <Box sx={{ p: 1 }}>
              <Button
                fullWidth
                onClick={() => {
                  navigate('/notifications');
                  handleNotificationMenuClose();
                }}
                sx={{ textTransform: 'none' }}
              >
                View All Notifications
              </Button>
            </Box>
          </Menu>
          
          <IconButton
            color="inherit"
            onClick={() => navigate('/settings')}
            sx={{ color: '#1a1a1a' }}
          >
            <SettingsIcon />
          </IconButton>
          
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 1,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
              },
            }}
            onClick={handleProfileMenuOpen}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', mr: 1 }}>
              <Typography variant="body2" sx={{ color: '#1a1a1a', fontWeight: 500, fontSize: '0.875rem' }}>
                {user?.name || 'User'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#666666', fontSize: '0.75rem' }}>
                Admin
              </Typography>
            </Box>
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#B3EE9A', color: '#1a1a1a', fontWeight: 600 }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {user?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={() => { navigate('/settings'); handleMenuClose(); }}>
            Settings
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar;
