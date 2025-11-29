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
  IconButton,
  Tooltip,
  Badge,
  Button,
  Card,
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
  Work as IncomeIcon,
  ExpandLess,
  ExpandMore,
  AttachMoney as FinanceIcon,
  TrendingUp as ApportionerIcon,
  AccountBalance as BankAccountIcon,
  Savings as SavingsIcon,
  MenuBook as DocumentationIcon,
  ChevronLeft,
  ChevronRight,
  AccountBalanceWallet as ReceivablesIcon,
  CompareArrows as ReconciliationIcon,
  Label as CategoryIcon,
  Bolt as UtilitiesIcon,
  ShoppingCart as ExpensesIcon,
  Payment as PayablesIcon,
  History as AuditLogsIcon,
  School as AccountingGuideIcon,
  AccountCircle as AccountsIcon,
  ManageAccounts as AdministrativeIcon,
  Calculate as PlanningIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../logo.png';

const drawerWidth = 240;
const collapsedWidth = 64;

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  badge?: number;
}

const menuItems: MenuItem[] = [
  // ============================================
  // CATEGORY 1: OVERVIEW & DASHBOARD
  // ============================================
  { 
    text: 'Dashboard', 
    icon: <DashboardIcon />, 
    path: '/'
  },

  // ============================================
  // CATEGORY 2: ACCOUNT MANAGEMENT
  // ============================================
  {
    text: 'Accounts',
    icon: <AccountsIcon />,
    children: [
      { 
        text: 'Bank Accounts', 
        icon: <BankAccountIcon />, 
        path: '/bank-accounts'
      },
      { 
        text: 'Transactions', 
        icon: <TransactionsIcon />, 
        path: '/transactions'
      },
      { 
        text: 'Reconciliation', 
        icon: <ReconciliationIcon />, 
        path: '/reconciliation'
      },
    ],
  },

  // ============================================
  // CATEGORY 3: INCOME MANAGEMENT
  // ============================================
  {
    text: 'Income',
    icon: <IncomeIcon />,
    children: [
      { 
        text: 'Income Sources', 
        icon: <IncomeIcon />, 
        path: '/income-sources'
      },
      { 
        text: 'Receivables', 
        icon: <ReceivablesIcon />, 
        path: '/receivables'
      },
    ],
  },

  // ============================================
  // CATEGORY 4: PAYABLE MANAGEMENT
  // ============================================
  {
    text: 'Payables',
    icon: <PayablesIcon />,
    children: [
      { 
        text: 'Expenses', 
        icon: <ExpensesIcon />, 
        path: '/expenses'
      },
      { 
        text: 'Categories', 
        icon: <CategoryIcon />, 
        path: '/categories'
      },
      { 
        text: 'Bills', 
        icon: <ReceiptIcon />, 
        path: '/bills'
      },
      { 
        text: 'Utilities', 
        icon: <UtilitiesIcon />, 
        path: '/utilities'
      },
    ],
  },

  // ============================================
  // CATEGORY 5: FINANCIAL PLANNING
  // ============================================
  {
    text: 'Planning',
    icon: <PlanningIcon />,
    children: [
      { 
        text: 'Allocation Planner', 
        icon: <ApportionerIcon />, 
        path: '/apportioner'
      },
      { 
        text: 'Savings', 
        icon: <SavingsIcon />, 
        path: '/savings'
      },
      { 
        text: 'Loans', 
        icon: <CreditCardIcon />, 
        path: '/loans'
      },
    ],
  },

  // ============================================
  // CATEGORY 6: REPORTING & ANALYTICS
  // ============================================
  { 
    text: 'Reports & Analytics', 
    icon: <AnalyticsIcon />, 
    path: '/analytics'
  },

  // ============================================
  // CATEGORY 7: OPERATIONS
  // ============================================
  { 
    text: 'Notifications', 
    icon: <NotificationsIcon />, 
    path: '/notifications',
    badge: 0, // Set to number > 0 to show badge
  },

  // ============================================
  // CATEGORY 8: ADMINISTRATIVE
  // ============================================
  {
    text: 'Administrative',
    icon: <AdministrativeIcon />,
    children: [
      { 
        text: 'Accounting Guide', 
        icon: <AccountingGuideIcon />, 
        path: '/accounting-guide'
      },
      { 
        text: 'Audit Logs', 
        icon: <AuditLogsIcon />, 
        path: '/audit-logs'
      },
      { 
        text: 'Settings', 
        icon: <SettingsIcon />, 
        path: '/settings'
      },
      { 
        text: 'Support', 
        icon: <SupportIcon />, 
        path: '/support'
      },
      { 
        text: 'Documentation', 
        icon: <DocumentationIcon />, 
        path: '/documentation'
      },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    // All sections collapsed by default for cleaner initial view
    // Users can expand sections as needed
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
    const isItemActive = isActive || hasActiveChild;

    // Don't show children when collapsed
    if (!open && hasChildren && level === 0) {
      return (
        <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            selected={false}
            onClick={() => {
              if (item.path) {
                handleNavigation(item.path);
              }
            }}
            sx={{
              minHeight: 44,
              pl: 1.5,
              pr: 1.5,
              justifyContent: 'center',
              backgroundColor: isItemActive ? '#B3EE9A' : 'transparent',
              borderRadius: '8px',
              mx: 1,
              '&:hover': {
                backgroundColor: isItemActive ? '#C8F5B4' : 'rgba(179, 238, 154, 0.1)',
              },
              '& .MuiListItemIcon-root': {
                color: isItemActive ? '#1a1a1a' : '#666666',
                minWidth: 0,
                justifyContent: 'center',
              },
            }}
            title={item.text}
          >
            <ListItemIcon>
              {item.badge !== undefined && item.badge > 0 ? (
                <Badge badgeContent={item.badge} color="error" overlap="circular">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
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
        <ListItem disablePadding sx={{ mb: 0.5 }}>
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
              minHeight: 44,
              pl: level > 0 ? 3 : 2,
              pr: 2,
              py: 0.5,
              backgroundColor: isItemActive ? '#B3EE9A' : 'transparent',
              borderRadius: '8px',
              mx: 1,
              '&:hover': {
                backgroundColor: isItemActive ? '#C8F5B4' : 'rgba(179, 238, 154, 0.1)',
              },
              '& .MuiListItemIcon-root': {
                color: isItemActive ? '#1a1a1a' : '#666666',
                minWidth: 36,
              },
              '& .MuiListItemText-primary': {
                color: isItemActive ? '#1a1a1a' : '#333333',
                fontWeight: isItemActive ? 600 : 400,
                fontSize: '0.9375rem',
              },
            }}
            title={!open ? item.text : undefined}
          >
            <ListItemIcon>
              {item.badge !== undefined && item.badge > 0 ? (
                <Badge badgeContent={item.badge} color="error" overlap="circular">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            {open && <ListItemText primary={item.text} />}
            {open && hasChildren && (
              <Box sx={{ ml: 'auto' }}>
                {isExpanded ? <ExpandLess sx={{ color: isItemActive ? '#1a1a1a' : '#666666' }} /> : <ExpandMore sx={{ color: isItemActive ? '#1a1a1a' : '#666666' }} />}
              </Box>
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
    <Box sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        p: open ? 2 : 1.5, 
        display: 'flex',
        alignItems: 'center',
        justifyContent: open ? 'space-between' : 'center',
        minHeight: 64,
      }}>
        {open ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <img 
                src={logo} 
                alt="UtilityHub360 Logo" 
                style={{ 
                  height: '32px', 
                  width: 'auto',
                  objectFit: 'contain'
                }} 
              />
              <Typography 
                variant="h6" 
                noWrap 
                component="div" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#1a1a1a',
                  fontSize: '1.125rem',
                }}
              >
                UtilityHub360
              </Typography>
            </Box>
            {onToggle && (
              <IconButton
                onClick={onToggle}
                size="small"
                sx={{
                  color: '#666666',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  },
                }}
              >
                <ChevronLeft />
              </IconButton>
            )}
          </>
        ) : (
          <>
            {onToggle && (
              <IconButton
                onClick={onToggle}
                size="small"
                sx={{
                  color: '#666666',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  },
                }}
              >
                <ChevronRight />
              </IconButton>
            )}
          </>
        )}
      </Box>
      
      {/* Menu Items */}
      <Box 
        sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          overflowX: 'hidden', 
          pt: 1,
          pb: open ? 20 : 0, // Add padding bottom to make room for promotional card when open
        }}
      >
        <List sx={{ px: 0.5 }}>
          {menuItems.map((item) => renderMenuItem(item))}
        </List>
      </Box>

      {/* Promotional Card */}
      {open && (
        <Box 
          sx={{ 
            p: 2, 
            pt: 1, 
            position: 'relative',
            flexShrink: 0, // Prevent card from shrinking
            mt: 'auto', // Push to bottom
          }}
        >
          {/* Floating Image */}
          <Box
            component="img"
            src="/sidenav_img.png"
            alt="Elevate Financing"
            sx={{
              width: open ? '70%' : '100%',
              height: 'auto',
              objectFit: 'contain',
              position: 'absolute',
              top: open ? -100 : -50,
              left: open ? 35 : 0,
              right: 0,
              zIndex: 1,
              filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2))',
              transition: 'all 0.3s ease',
            }}
          />
          
          <Card
            sx={{
              backgroundColor: '#e8f5e9', // Light green background
              borderRadius: 2,
              p: 2,
              pt: open ? 7 : 4, // Adjust padding top based on sidebar state
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              minHeight: open ? 120 : 100, // Adjust height based on sidebar state
              transition: 'all 0.3s ease',
            }}
          >
            {/* Text Content */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#1a1a1a',
                  fontSize: '0.9rem',
                  mb: 0.5,
                  lineHeight: 1.2,
                }}
              >
                Elevate Financing
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#666666',
                  fontSize: '0.7rem',
                  lineHeight: 1.4,
                  mb: 1,
                }}
              >
                Enhance Financial reports, faster insights, & integrated financial management tools
              </Typography>
            </Box>

            {/* Call to Action Button */}
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#c5e1a5', // Light yellow-green
                color: '#1a1a1a',
                fontWeight: 700,
                fontSize: '0.7rem',
                textTransform: 'none',
                borderRadius: 1.5,
                py: 0.5,
                px: 1.5,
                '&:hover': {
                  backgroundColor: '#aed581',
                },
              }}
            >
              Upgrade Now
            </Button>
          </Card>
        </Box>
      )}
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
          position: 'fixed',
          top: 0, // Align to very top edge
          height: '100vh', // Full viewport height
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e5e5e5',
          zIndex: (theme) => theme.zIndex.drawer - 1, // Below AppBar
          transition: (theme) => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#cccccc',
            borderRadius: '3px',
            '&:hover': {
              background: '#999999',
            },
          },
        },
      }}
      open={true} // Always open, but with different widths
    >
      {drawerContent}
    </MuiDrawer>
  );
};

export default Sidebar;
