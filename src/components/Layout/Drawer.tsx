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
  Work as IncomeIcon,
  ExpandLess,
  ExpandMore,
  AttachMoney as FinanceIcon,
  TrendingUp as ApportionerIcon,
  AccountBalance as BankAccountIcon,
  Savings as SavingsIcon,
  MenuBook as DocumentationIcon,
  AccountBalanceWallet as ReceivablesIcon,
  CompareArrows as ReconciliationIcon,
  History as AuditLogsIcon,
  School as AccountingGuideIcon,
  AccountCircle as AccountsIcon,
  ManageAccounts as AdministrativeIcon,
  Calculate as PlanningIcon,
  Label as CategoryIcon,
  Bolt as UtilitiesIcon,
  ShoppingCart as ExpensesIcon,
  Payment as PayablesIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

interface DrawerProps {
  open: boolean;
  onClose: () => void;
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
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
        text: 'Transactions', 
        icon: <TransactionsIcon />, 
        path: '/transactions'
      },
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
    path: '/notifications'
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

const Drawer: React.FC<DrawerProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    // All sections collapsed by default for cleaner initial view
    // Users can expand sections as needed
  });

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
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

    return (
      <React.Fragment key={item.text}>
        <ListItem disablePadding>
          <ListItemButton
            selected={isActive}
            onClick={() => {
              if (hasChildren) {
                handleSectionToggle(item.text);
              } else if (item.path) {
                handleNavigation(item.path);
              }
            }}
            sx={{
              pl: 2 + level * 2,
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
              },
              ...(hasActiveChild && !isActive && {
                backgroundColor: 'rgba(177, 229, 153, 0.1)',
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
              }),
            }}
          >
            <ListItemIcon
              sx={{
                color: (isActive || hasActiveChild) ? (isActive ? 'white' : 'primary.main') : 'inherit',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
            {hasChildren && (
              isExpanded ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>
        {hasChildren && (
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
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" noWrap component="div">
          UtilityHub360
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => renderMenuItem(item))}
      </List>
    </Box>
  );

  return (
    <MuiDrawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
      }}
    >
      {drawerContent}
    </MuiDrawer>
  );
};

export default Drawer;
