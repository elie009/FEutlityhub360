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
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Search as SearchIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

interface AppBarProps {
  onMenuClick?: () => void;
  sidebarOpen?: boolean;
  sidebarWidth?: number;
}

const AppBar: React.FC<AppBarProps> = ({ onMenuClick, sidebarOpen = false, sidebarWidth = 240 }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
      };
      window.addEventListener('notificationCountChanged', handleNotificationCountChange);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('notificationCountChanged', handleNotificationCountChange);
      };
    }
  }, [user?.id]);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const handleNotificationsClick = () => {
    navigate('/notifications');
  };

  return (
    <MuiAppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 10,
        left: { xs: 0, md: `${sidebarWidth}px` }, // Start after sidebar width
        width: { xs: '100%', md: `calc(100% - ${sidebarWidth}px - 20px)` }, // Width minus sidebar and gap
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
              placeholder="Search room, guest, book, etc"
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
            onClick={handleNotificationsClick}
            sx={{ color: '#1a1a1a' }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
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
