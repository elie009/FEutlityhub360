import React from 'react';
import {
  Drawer as MuiDrawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../logo.png';
import { PMS_BASE, SYSTEM_HUB_PATH } from '../../config/appRoutes';
import { PMS_NAV_ITEMS } from '../../config/pmsNav';

const drawerWidth = 240;
const collapsedWidth = 64;

interface PropertySidebarProps {
  open: boolean;
  onToggle?: () => void;
}

const PropertySidebar: React.FC<PropertySidebarProps> = ({ open, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    const p = location.pathname;
    if (path === PMS_BASE) {
      return p === PMS_BASE || p === `${PMS_BASE}/`;
    }
    return p === path || p.startsWith(`${path}/`);
  };

  return (
    <MuiDrawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        width: open ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: open ? drawerWidth : collapsedWidth,
          overflowX: 'hidden',
          position: 'fixed',
          top: '12px',
          left: '12px',
          height: 'calc(100vh - 24px)',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e5e5e5',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          zIndex: (theme) => theme.zIndex.drawer - 1,
          transition: (theme) => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
      open
    >
      <Box sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            p: open ? 1.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: open ? 'space-between' : 'center',
            minHeight: 48,
          }}
        >
          {open ? (
            <>
              <Box
                onClick={() => navigate(SYSTEM_HUB_PATH)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  cursor: 'pointer',
                  borderRadius: 1,
                  pr: 0.5,
                  '&:hover': { opacity: 0.85 },
                }}
                role="link"
                aria-label="Back to workspace selection"
              >
                <img src={logo} alt="UtilityHub360 Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
                <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '1rem' }}>
                  UtilityHub360
                </Typography>
              </Box>
              {onToggle && (
                <IconButton onClick={onToggle} size="small" sx={{ color: '#666666', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.05)' } }}>
                  <ChevronLeft />
                </IconButton>
              )}
            </>
          ) : (
            <>
              {onToggle && (
                <IconButton onClick={onToggle} size="small" sx={{ color: '#666666', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.05)' } }}>
                  <ChevronRight />
                </IconButton>
              )}
            </>
          )}
        </Box>

        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            pt: 1,
            pb: 2,
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-thumb': { background: '#B3EE9A', borderRadius: '3px' },
          }}
        >
          <List sx={{ px: 0.5, py: 0.5 }}>
            {PMS_NAV_ITEMS.map((item) => {
              const active = isActive(item.path);
              const button = (
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    minHeight: 36,
                    pl: open ? 1.5 : 1.5,
                    pr: 1.5,
                    py: 0.5,
                    justifyContent: open ? 'flex-start' : 'center',
                    backgroundColor: active ? '#B3EE9A' : 'transparent',
                    borderRadius: '6px',
                    mx: 0.75,
                    width: open ? 'auto' : '100%',
                    '&:hover': {
                      backgroundColor: active ? '#C8F5B4' : 'rgba(179, 238, 154, 0.1)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: open ? 32 : 0,
                      justifyContent: 'center',
                      color: active ? '#1a1a1a' : '#666666',
                      '& svg': { fontSize: '1.1rem' },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {open && (
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.8125rem',
                        fontWeight: active ? 600 : 400,
                        color: active ? '#1a1a1a' : '#333333',
                        lineHeight: 1.4,
                      }}
                    />
                  )}
                </ListItemButton>
              );
              return (
                <ListItem key={item.path} disablePadding sx={{ mb: 0.25, display: 'block' }}>
                  {!open ? (
                    <Tooltip title={item.text} placement="right">
                      {button}
                    </Tooltip>
                  ) : (
                    button
                  )}
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Box>
    </MuiDrawer>
  );
};

export default PropertySidebar;
