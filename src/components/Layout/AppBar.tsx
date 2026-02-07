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
  Search as SearchIcon,
  Settings as SettingsIcon,
  CheckCircle,
  Payment,
  Warning,
  Info,
  AccountBalance as WalletIcon,
  AttachMoney as MoneyIcon,
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
      navigate(`/documentation?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/documentation?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <MuiAppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 10,
        top: 12,
        left: { xs: 0, md: `calc(${sidebarWidth}px + 24px)` },
        width: { xs: '100%', md: `calc(100% - ${sidebarWidth}px - 48px)` },
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'grey.200',
        boxShadow: 1,
        borderRadius: { xs: 0, md: 2 },
        ml: 0,
        mr: { xs: 0, md: 3 },
        transition: (theme) => theme.transitions.create(['width', 'left'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      <Toolbar
        sx={{
          py: '5px',
          px: { xs: 2, sm: 3 },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        {/* Left: Menu (mobile) + Logo + Title + Subtitle */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
          {isMobile && onMenuClick && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={onMenuClick}
              edge="start"
              sx={{ color: 'grey.900', p: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: '#b3ee9a',
              boxShadow: '0 4px 14px rgba(179, 238, 154, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MoneyIcon sx={{ fontSize: 20, color: 'grey.900' }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1.25rem', fontWeight: 600, color: 'grey.900', lineHeight: 1.2 }}>
              Personal Finance Hub
            </Typography>
            <Typography variant="caption" sx={{ color: 'grey.500', fontSize: '0.75rem' }}>
              Financial Dashboard
            </Typography>
          </Box>
        </Box>

        {/* Center: Search bar (rounded-full, flex-1 max-w-md) */}
        <Box
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{
            flex: 1,
            maxWidth: { xs: '100%', sm: 400, md: 448 },
            mx: { xs: 1, sm: 2 },
            display: { xs: 'none', sm: 'block' },
          }}
        >
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              height: 44,
              bgcolor: 'grey.50',
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: 9999,
              '&:hover': { borderColor: 'grey.300' },
              '&:focus-within': {
                borderColor: '#b3ee9a',
                bgcolor: 'background.paper',
                boxShadow: '0 0 0 2px rgba(179, 238, 154, 0.2)',
              },
            }}
          >
            <SearchIcon
              sx={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 20,
                color: 'grey.400',
              }}
            />
            <InputBase
              placeholder="Search transactions, bills, accounts..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={handleSearchKeyPress}
              sx={{
                width: '100%',
                height: '100%',
                pl: 6,
                pr: 2,
                fontSize: '0.875rem',
                color: 'grey.900',
                '& .MuiInputBase-input::placeholder': { color: 'grey.400', opacity: 1 },
              }}
            />
          </Box>
        </Box>

        {/* Right: Pill with Notifications, Wallet, Avatar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            bgcolor: 'grey.50',
            borderRadius: 9999,
            px: 1.5,
            py: 1,
            border: '1px solid',
            borderColor: 'grey.200',
            flexShrink: 0,
          }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                minWidth: 20,
                height: 20,
                fontSize: '0.75rem',
              },
            }}
          >
            <IconButton
              onClick={handleNotificationMenuOpen}
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                color: 'grey.500',
                '&:hover': { bgcolor: 'grey.100', color: 'grey.900' },
                '& .MuiSvgIcon-root': { fontSize: 20 },
              }}
            >
              <NotificationsIcon />
            </IconButton>
          </Badge>

          <Menu
            anchorEl={notificationAnchorEl}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={Boolean(notificationAnchorEl)}
            onClose={handleNotificationMenuClose}
            PaperProps={{
              sx: {
                width: { xs: '90vw', sm: 320 },
                maxWidth: 320,
                maxHeight: 'calc(100vh - 100px)',
                mt: 1.5,
                borderRadius: 2,
                boxShadow: 4,
                border: '1px solid',
                borderColor: 'grey.200',
                overflow: 'hidden',
              },
            }}
          >
            <Box sx={{ p: 2, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'grey.900' }}>
                Notifications
              </Typography>
              <Button
                size="small"
                onClick={() => {
                  navigate('/notifications');
                  handleNotificationMenuClose();
                }}
                sx={{ textTransform: 'none', fontSize: '0.75rem', color: '#5ba842', minWidth: 'auto', p: 0 }}
              >
                Mark all read
              </Button>
            </Box>
            <Divider />
            <Box sx={{ overflow: 'auto', maxHeight: 'calc(100vh - 220px)' }}>
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
                        bgcolor: notification.isRead ? 'transparent' : 'grey.50',
                        py: 1.5,
                        px: 2,
                        whiteSpace: 'normal',
                        width: '100%',
                        '&:hover': { bgcolor: 'grey.100' },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, alignSelf: 'flex-start', pt: 0.5 }}>
                        {getNotificationIcon(notification.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: notification.isRead ? 400 : 600, mb: 0.5 }}>
                            {notification.message}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(notification.createdAt)}
                          </Typography>
                        }
                        sx={{ margin: 0 }}
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

          <Button
            variant="outlined"
            size="small"
            startIcon={<WalletIcon sx={{ fontSize: 18 }} />}
            onClick={() => navigate('/dashboard')}
            sx={{
              height: 40,
              borderRadius: 9999,
              bgcolor: 'background.paper',
              borderColor: 'grey.200',
              color: 'grey.900',
              textTransform: 'none',
              fontSize: '0.875rem',
              '&:hover': { borderColor: 'grey.300', bgcolor: 'grey.100' },
            }}
          >
            Wallet
          </Button>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              borderRadius: '50%',
              overflow: 'hidden',
              '&:hover': { opacity: 0.9 },
              transition: 'transform 0.2s',
              '&:hover .avatar-circle': { transform: 'scale(1.1)' },
            }}
            onClick={handleProfileMenuOpen}
          >
            <Avatar
              className="avatar-circle"
              sx={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #fb923c 0%, #ec4899 100%)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.875rem',
                boxShadow: 2,
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          keepMounted
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
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
            <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
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
