import React, { useState } from 'react';
import {
  Drawer as MuiDrawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Collapse,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Receipt as ReceiptIcon,
  Support as SupportIcon,
  ContactMail as ContactIcon,
  CreditCard as CreditCardIcon,
  Notifications as NotificationsIcon,
  Assessment as AssessmentIcon,
  AccountBalanceWallet as TransactionsIcon,
  ExpandLess,
  ExpandMore,
  AttachMoney as FinanceIcon,
  TrendingUp as ApportionerIcon,
  AccountBalance as BankAccountIcon,
  Savings as SavingsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;
const collapsedWidth = 64;

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  {
    text: 'Finance',
    icon: <FinanceIcon />,
    children: [
      { text: 'Transactions', icon: <TransactionsIcon />, path: '/transactions' },
      { text: 'Bills and Utility', icon: <ReceiptIcon />, path: '/bills' },
      { text: 'Bank Accounts', icon: <BankAccountIcon />, path: '/bank-accounts' },
      { text: 'Savings', icon: <SavingsIcon />, path: '/savings' },
      { text: 'Loans', icon: <CreditCardIcon />, path: '/loans' },
    ],
  },
  { text: 'Apportioner', icon: <ApportionerIcon />, path: '/apportioner' },
  { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications' },
  { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  { text: 'Support', icon: <SupportIcon />, path: '/support' },
  { text: 'Contact', icon: <ContactIcon />, path: '/contact' },
];

interface SidebarProps {
  open: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    Finance: true, // Finance section open by default
  });

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleSectionToggle = (sectionName: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const isPathActive = (path: string) => {
    return location.pathname === path;
  };

  const isChildPathActive = (children: MenuItem[]) => {
    return children.some(child => child.path && isPathActive(child.path));
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.path ? isPathActive(item.path) : false;
    const hasActiveChild = hasChildren ? isChildPathActive(item.children!) : false;
    const isExpanded = hasChildren ? openSections[item.text] : false;

    // Don't show children when collapsed
    if (!open && hasChildren && level === 0) {
      return (
        <ListItem key={item.text} disablePadding>
          <ListItemButton
            selected={false}
            onClick={() => {
              if (item.path) {
                handleNavigation(item.path);
              }
            }}
            sx={{
              pl: 2,
              justifyContent: 'center',
              backgroundColor: (isActive || hasActiveChild) ? 'rgba(177, 229, 153, 0.1)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(177, 229, 153, 0.15)',
              },
              '& .MuiListItemIcon-root': {
                color: (isActive || hasActiveChild) ? 'primary.main' : 'inherit',
              },
            }}
            title={item.text} // Tooltip for collapsed state
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                justifyContent: 'center',
              }}
            >
              {item.icon}
            </ListItemIcon>
          </ListItemButton>
        </ListItem>
      );
    }

    // Don't show children items when collapsed
    if (!open && level > 0) {
      return null;
    }

    return (
      <React.Fragment key={item.text}>
        <ListItem disablePadding>
          <ListItemButton
            selected={false}
            onClick={() => {
              if (hasChildren) {
                handleSectionToggle(item.text);
              } else if (item.path) {
                handleNavigation(item.path);
              }
            }}
            sx={{
              pl: 2 + level * 2,
              backgroundColor: (isActive || hasActiveChild) ? 'rgba(177, 229, 153, 0.1)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(177, 229, 153, 0.15)',
              },
              '& .MuiListItemIcon-root': {
                color: (isActive || hasActiveChild) ? 'primary.main' : 'inherit',
              },
              '& .MuiListItemText-primary': {
                color: (isActive || hasActiveChild) ? 'primary.main' : 'inherit',
                fontWeight: (isActive || hasActiveChild) ? 600 : 400,
              },
            }}
            title={!open ? item.text : undefined} // Tooltip for collapsed state
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
              }}
            >
              {item.icon}
            </ListItemIcon>
            {open && <ListItemText primary={item.text} />}
            {open && hasChildren && (
              isExpanded ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>
        {open && hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map((child) => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawerContent = (
    <Box>
      <Box sx={{ p: open ? 2 : 1, textAlign: open ? 'left' : 'center' }}>
        {open ? (
          <Typography variant="h6" noWrap component="div">
            Admin Panel
          </Typography>
        ) : (
          <Typography variant="h6" component="div" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
            AP
          </Typography>
        )}
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => renderMenuItem(item))}
      </List>
    </Box>
  );

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
          transition: (theme) => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
      open={true} // Always open, but with different widths
    >
      {drawerContent}
    </MuiDrawer>
  );
};

export default Sidebar;
