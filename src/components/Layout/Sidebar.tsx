import React, { useState, useEffect } from 'react';
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
import SubscriptionModal from '../Subscription/SubscriptionModal';
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
  TrendingUp,
  AccountBalance as BankAccountIcon,
  AccountBalance as LoanIcon,
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
  ManageAccounts,
  Calculate as PlanningIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { useSubscription, usePremiumFeature } from '../../hooks/usePremiumFeature';
import logo from '../../logo.png';

const drawerWidth = 240;
const collapsedWidth = 64;

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  badge?: number;
  state?: any;
}

// Menu items will be created dynamically with notification count and user
const createMenuItems = (
  notificationCount: number, 
  user: any,
  hasBankFeed: boolean,
  hasAdvancedReports: boolean,
  hasInvestmentTracking: boolean,
  hasTaxOptimization: boolean,
  hasMultiUser: boolean,
  hasApiAccess: boolean,
  hasWhiteLabel: boolean
): MenuItem[] => {
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
    // CATEGORY 3: MONEY OVERVIEW
    // ============================================
    {
      text: 'Money Overview',
      icon: <IncomeIcon />,
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
          text: 'Income Sources', 
          icon: <IncomeIcon />, 
          path: '/income-sources'
        },
        { 
          text: 'Categories', 
          icon: <CategoryIcon />, 
          path: '/categories'
        },
        { 
          text: 'Money Owed to You', 
          icon: <ReceivablesIcon />, 
          path: '/receivables'
        },
        // Reconciliation - Available to all users (Free tier has 3 uploads/month limit)
        { 
          text: 'Reconciliation', 
          icon: <ReconciliationIcon />, 
          path: '/reconciliation'
        },
      ],
    },

    // ============================================
    // CATEGORY 4: MY BILLS
    // ============================================
    {
      text: 'My Bills',
      icon: <PayablesIcon />,
      children: [
        { 
          text: 'All Bills', 
          icon: <ReceiptIcon />, 
          path: '/bills'
        },
        { 
          text: 'Expenses', 
          icon: <ExpensesIcon />, 
          path: '/expenses'
        },
        { 
          text: 'Utilities', 
          icon: <UtilitiesIcon />, 
          path: '/utilities'
        },
      ],
    },

    // ============================================
    // CATEGORY 5: MY LOANS
    // ============================================
    {
      text: 'My Loans',
      icon: <LoanIcon />,
      path: '/loans'
    },
    // ============================================
    // CATEGORY 6: MY SAVINGS
    // ============================================
    {
      text: 'My Savings',
      icon: <SavingsIcon />,
      children: [
        { 
          text: 'Savings Goals', 
          icon: <SavingsIcon />, 
          path: '/savings'
        },
        { 
          text: 'Allocation Planner', 
          icon: <ApportionerIcon />, 
          path: '/apportioner'
        },
      ],
    },

    // ============================================
    // CATEGORY 7: REPORTS
    // ============================================
    // Reports & Analytics - Available to all, but Advanced Reports features are Premium+
    { 
      text: 'Reports', 
      icon: <AnalyticsIcon />, 
      path: '/analytics'
    },

    // ============================================
    // CATEGORY 8: OPERATIONS
    // ============================================
    { 
      text: 'Notifications', 
      icon: <NotificationsIcon />, 
      path: '/notifications',
      badge: notificationCount > 0 ? notificationCount : undefined,
    },

    // ============================================
    // CATEGORY 9: SETTINGS
    // ============================================
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings#profile'
    },
    {
      text: 'Help & Support',
      icon: <SupportIcon />,
      path: '/support'
    },

    // ============================================
    // CATEGORY 10: ADVANCED (for power users)
    // ============================================
    {
      text: 'Advanced',
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
          text: 'Documentation', 
          icon: <DocumentationIcon />, 
          path: '/documentation'
        },
        ...(user && user.role === 'ADMIN' ? [{
          text: 'Super Admin', 
          icon: <AdministrativeIcon />, 
          path: '/super-admin'
        }] : []),
        // Enterprise-only features
        ...(hasInvestmentTracking ? [{
          text: 'Investment Tracking', 
          icon: <TrendingUp />, 
          path: '/investments'
        }] : []),
        ...(hasTaxOptimization ? [{
          text: 'Tax Optimization', 
          icon: <AssessmentIcon />, 
          path: '/tax-optimization'
        }] : []),
        ...(hasMultiUser ? [{
          text: 'Team Management', 
          icon: <ManageAccounts />, 
          path: '/team-management'
        }] : []),
        ...(hasApiAccess ? [{
          text: 'API Keys', 
          icon: <SettingsIcon />, 
          path: '/api-keys'
        }] : []),
        ...(hasWhiteLabel ? [{
          text: 'White-Label', 
          icon: <SettingsIcon />, 
          path: '/white-label'
        }] : []),
      ],
    },
  ];

  // Filter out empty parent menus (if all children were filtered)
  return menuItems.map(item => {
    if (item.children) {
      const filteredChildren = item.children.filter(child => child !== null);
      if (filteredChildren.length === 0) {
        return null;
      }
      return { ...item, children: filteredChildren };
    }
    return item;
  }).filter(item => item !== null) as MenuItem[];
};

interface SidebarProps {
  open: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    // All sections collapsed by default for cleaner initial view
    // Users can expand sections as needed
  });
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState<boolean>(false);

  // Check subscription and feature access
  const { isPremium, isEnterprise, isFree } = useSubscription();
  const { hasAccess: hasBankFeed } = usePremiumFeature('BANK_FEED');
  const { hasAccess: hasAdvancedReports } = usePremiumFeature('ADVANCED_REPORTS');
  const { hasAccess: hasInvestmentTracking } = usePremiumFeature('INVESTMENT_TRACKING');
  const { hasAccess: hasTaxOptimization } = usePremiumFeature('TAX_OPTIMIZATION');
  const { hasAccess: hasMultiUser } = usePremiumFeature('MULTI_USER');
  const { hasAccess: hasApiAccess } = usePremiumFeature('API_ACCESS');
  const { hasAccess: hasWhiteLabel } = usePremiumFeature('WHITE_LABEL');

  // Fetch unread notification count
  useEffect(() => {
    if (user?.id) {
      const fetchUnreadCount = async () => {
        try {
          const count = await apiService.getUnreadNotificationCount(user.id);
          setUnreadNotificationCount(count);
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

  // Refresh count when navigating to/from notifications page
  useEffect(() => {
    if (location.pathname === '/notifications' || location.pathname !== '/notifications') {
      if (user?.id) {
        apiService.getUnreadNotificationCount(user.id)
          .then(setUnreadNotificationCount)
          .catch(console.error);
      }
    }
  }, [location.pathname, user?.id]);

  // Create menu items with dynamic notification count and feature access
  const menuItems = createMenuItems(
    unreadNotificationCount, 
    user,
    hasBankFeed,
    hasAdvancedReports,
    hasInvestmentTracking,
    hasTaxOptimization,
    hasMultiUser,
    hasApiAccess,
    hasWhiteLabel
  );

  // Helper function to find the parent menu that contains a given path
  const findParentMenu = (path: string): string | null => {
    for (const item of menuItems) {
      if (item.children) {
        const hasChildPath = item.children.some(child => child.path === path);
        if (hasChildPath) {
          return item.text;
        }
      }
    }
    return null;
  };

  // Auto-expand parent menu when a submenu item is active
  useEffect(() => {
    const currentPath = location.pathname;
    const parentMenu = findParentMenu(currentPath);
    
    if (parentMenu) {
      // Only expand the parent menu, close others
      setOpenSections({
        [parentMenu]: true,
      });
    }
  }, [location.pathname]);

  const handleNavigation = (path: string, state?: any) => {
    // Extract hash from path if present
    const [basePath, hash] = path.split('#');
    if (hash) {
      // Navigate to base path, then set hash
      navigate(basePath, { state });
      // Use setTimeout to ensure navigation completes before setting hash
      setTimeout(() => {
        window.location.hash = hash;
      }, 0);
    } else {
      navigate(path, { state });
    }
    // Find the parent menu for this path (use base path for matching)
    const parentMenu = findParentMenu(basePath);
    
    if (parentMenu) {
      // Keep the parent menu expanded when navigating to a child
      setOpenSections(prev => ({
        [parentMenu]: true,
      }));
    } else {
      // If it's a top-level menu item, close all expanded menus
      setOpenSections({});
    }
  };

  const handleSectionToggle = (sectionName: string) => {
    setOpenSections(prev => {
      // If the section is already open, close it
      if (prev[sectionName]) {
        return {};
      }
      // Otherwise, close all other sections and open only this one
      return {
        [sectionName]: true,
      };
    });
  };

  const isPathActive = (path: string) => {
    // Strip hash fragment from path for comparison
    const pathWithoutHash = path.split('#')[0];
    return location.pathname === pathWithoutHash;
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
        <ListItem key={item.text} disablePadding sx={{ mb: 0.25 }}>
          <ListItemButton
            selected={false}
            onClick={() => {
              if (item.path) {
                handleNavigation(item.path, item.state);
              }
            }}
            sx={{
              minHeight: 36,
              pl: 1.5,
              pr: 1.5,
              justifyContent: 'center',
              backgroundColor: isItemActive ? '#B3EE9A' : 'transparent',
              borderRadius: '6px',
              mx: 0.75,
              '&:hover': {
                backgroundColor: isItemActive ? '#C8F5B4' : 'rgba(179, 238, 154, 0.1)',
              },
              '& .MuiListItemIcon-root': {
                color: isItemActive ? '#1a1a1a' : '#666666',
                minWidth: 0,
                justifyContent: 'center',
                '& svg': {
                  fontSize: '1.1rem',
                },
              },
            }}
            title={item.text}
          >
            <ListItemIcon>
              {item.badge !== undefined && item.badge > 0 ? (
                <Badge badgeContent={item.badge > 99 ? '99+' : item.badge} color="error" overlap="circular">
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
        <ListItem disablePadding sx={{ mb: 0.25 }}>
          <ListItemButton
            selected={false}
            onClick={() => {
              if (hasChildren) {
                handleSectionToggle(item.text);
              } else if (item.path) {
                handleNavigation(item.path, item.state);
              }
            }}
            sx={{
              minHeight: 36,
              // When collapsed, center align all items
              ...(!open && level === 0 ? {
                pl: 1.5,
                pr: 1.5,
                justifyContent: 'center',
              } : {
                pl: level > 0 ? 2.5 : 1.5,
                pr: 1.5,
              }),
              py: 0.25,
              backgroundColor: isItemActive ? '#B3EE9A' : 'transparent',
              borderRadius: '6px',
              mx: 0.75,
              '&:hover': {
                backgroundColor: isItemActive ? '#C8F5B4' : 'rgba(179, 238, 154, 0.1)',
              },
              '& .MuiListItemIcon-root': {
                color: isItemActive ? '#1a1a1a' : '#666666',
                // When collapsed, center align icons
                ...(!open && level === 0 ? {
                  minWidth: 0,
                  justifyContent: 'center',
                } : {
                  minWidth: 32,
                }),
                '& svg': {
                  fontSize: '1.1rem',
                },
              },
              '& .MuiListItemText-primary': {
                color: isItemActive ? '#1a1a1a' : '#333333',
                fontWeight: isItemActive ? 600 : 400,
                fontSize: '0.8125rem',
                lineHeight: 1.4,
              },
            }}
            title={!open ? item.text : undefined}
          >
            <ListItemIcon>
              {item.badge !== undefined && item.badge > 0 ? (
                <Badge badgeContent={item.badge > 99 ? '99+' : item.badge} color="error" overlap="circular">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            {open && <ListItemText primary={item.text} />}
            {open && hasChildren && (
              <Box sx={{ ml: 'auto' }}>
                {isExpanded ? <ExpandLess sx={{ color: isItemActive ? '#1a1a1a' : '#666666', fontSize: '1.1rem' }} /> : <ExpandMore sx={{ color: isItemActive ? '#1a1a1a' : '#666666', fontSize: '1.1rem' }} />}
              </Box>
            )}
          </ListItemButton>
        </ListItem>
        {open && hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map((child) => renderMenuItem({ ...child, state: child.state || item.state }, level + 1))}
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
        p: open ? 1.5 : 1, 
        display: 'flex',
        alignItems: 'center',
        justifyContent: open ? 'space-between' : 'center',
        minHeight: 48,
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
                  fontSize: '1rem',
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
        <List sx={{ px: 0.5, py: 0.5 }}>
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
              onClick={() => setSubscriptionModalOpen(true)}
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
          top: '12px', // Small margin from top edge
          left: '12px', // Small margin from left edge
          height: 'calc(100vh - 24px)', // Full viewport height minus top and bottom margins
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e5e5e5',
          borderRadius: '8px', // Add rounded corners for better appearance with margin
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', // Light shadow for depth
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
      <SubscriptionModal
        open={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
      />
    </MuiDrawer>
  );
};

export default Sidebar;

