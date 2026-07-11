import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, useTheme, useMediaQuery } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import PropertyAppBar from './PropertyAppBar';
import PropertyDrawer from './PropertyDrawer';
import PropertySidebar from './PropertySidebar';
import { PMS_NAV_ITEMS } from '../../config/pmsNav';
import { PMS_BASE } from '../../config/appRoutes';

function pmsTabTitle(pathname: string): string {
  const normalized =
    pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  const ordered = [...PMS_NAV_ITEMS].sort((a, b) => b.path.length - a.path.length);
  for (const item of ordered) {
    if (normalized === item.path) {
      return item.text;
    }
    if (item.path !== PMS_BASE && normalized.startsWith(`${item.path}/`)) {
      return item.text;
    }
  }
  if (normalized === PMS_BASE) {
    return 'Dashboard';
  }
  return 'PMS';
}

const PropertyLayout: React.FC = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const drawerWidth = 240;
  const collapsedWidth = 64;

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopOpen(!desktopOpen);
    }
  };

  useEffect(() => {
    const word = pmsTabTitle(location.pathname);
    document.title = `${word} · UtilityHub360`;
    return () => {
      document.title = 'UtilityHub360';
    };
  }, [location.pathname]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <CssBaseline />
      <PropertyAppBar
        onMenuClick={isMobile ? handleDrawerToggle : undefined}
        sidebarOpen={desktopOpen}
        sidebarWidth={desktopOpen ? drawerWidth : collapsedWidth}
      />
      <PropertyDrawer open={mobileOpen} onClose={handleDrawerToggle} />
      <PropertySidebar open={desktopOpen} onToggle={isMobile ? undefined : handleDrawerToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pl: { xs: 3, md: 0 },
          pr: { xs: 3, md: 3 },
          pt: { xs: 3, md: 2 },
          pb: 3,
          ml: { xs: '20px', md: desktopOpen ? '20px' : `calc(${collapsedWidth}px + 20px)` },
          width: {
            md: desktopOpen ? '20px' : `calc(100% - ${collapsedWidth}px - 20px)`,
          },
          mt: 8,
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: '#f8f9fa',
          transition: theme.transitions.create(['width', 'margin-left'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default PropertyLayout;
