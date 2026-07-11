import React from 'react';
import {
  Drawer as MuiDrawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { SYSTEM_HUB_PATH } from '../../config/appRoutes';
import { PMS_NAV_ITEMS } from '../../config/pmsNav';

const drawerWidth = 280;

interface PropertyDrawerProps {
  open: boolean;
  onClose: () => void;
}

const PropertyDrawer: React.FC<PropertyDrawerProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    const p = location.pathname;
    if (path === '/pms') {
      return p === '/pms' || p === '/pms/';
    }
    return p === path || p.startsWith(`${path}/`);
  };

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <MuiDrawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography
          variant="h6"
          sx={{ cursor: 'pointer', fontWeight: 700 }}
          onClick={() => {
            navigate(SYSTEM_HUB_PATH);
            onClose();
          }}
        >
          UtilityHub360
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
          Property Management
        </Typography>
      </Box>
      <Divider />
      <List sx={{ px: 1 }}>
        {PMS_NAV_ITEMS.map((item) => (
          <ListItemButton
            key={item.path}
            selected={isActive(item.path)}
            onClick={() => handleNav(item.path)}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(179, 238, 154, 0.45)',
                '&:hover': { backgroundColor: 'rgba(179, 238, 154, 0.55)' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{ variant: 'body2', fontSize: '0.875rem' }}
            />
          </ListItemButton>
        ))}
      </List>
    </MuiDrawer>
  );
};

export default PropertyDrawer;
