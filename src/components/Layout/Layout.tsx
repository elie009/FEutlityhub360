import React, { useState } from 'react';
import { Box, CssBaseline, useTheme, useMediaQuery } from '@mui/material';
import { Outlet } from 'react-router-dom';
import AppBar from './AppBar';
import Drawer from './Drawer';
import Sidebar from './Sidebar';
import Chatbot from '../Chatbot/Chatbot';

const Layout: React.FC = () => {
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

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <CssBaseline />
      <AppBar 
        onMenuClick={isMobile ? handleDrawerToggle : undefined}
        sidebarOpen={desktopOpen}
        sidebarWidth={desktopOpen ? drawerWidth : collapsedWidth}
      />
      
      {/* Mobile Drawer - only shows on mobile */}
      <Drawer open={mobileOpen} onClose={handleDrawerToggle} />
      
      {/* Desktop Sidebar - only shows on desktop */}
      <Sidebar open={desktopOpen} onToggle={isMobile ? undefined : handleDrawerToggle} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pl: { xs: 3, md: 0 }, // No left padding on desktop
          pr: { xs: 3, md: 3 },
          pt: { xs: 3, md: 2 }, // Reduced top padding
          pb: 3,
          ml: { xs: '20px', md: desktopOpen ? `20px` : `calc(${collapsedWidth}px + 20px)` },
          width: { 
            md: desktopOpen ? `20px` : `calc(100% - ${collapsedWidth}px - 20px)`
          },
          mt: 8,
          minHeight: 'calc(100vh - 64px)', // Full height minus AppBar height
          backgroundColor: '#f8f9fa', // Main body background color
          transition: theme.transitions.create(['width', 'margin-left'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Outlet />
      </Box>
      
      {/* Chatbot - only show when authenticated */}
      <Chatbot />
    </Box>
  );
};

export default Layout;
