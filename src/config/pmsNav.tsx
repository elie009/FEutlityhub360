import React from 'react';
import {
  Dashboard as DashboardIcon,
  Apartment as ApartmentIcon,
  CalendarMonth as CalendarIcon,
  Hub as HubIcon,
  Build as BuildIcon,
  Payment as PaymentIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  ManageAccounts as ManageAccountsIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { PMS_BASE } from './appRoutes';

export interface PmsNavItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

export const PMS_NAV_ITEMS: PmsNavItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: PMS_BASE },
  { text: 'Directory', icon: <ApartmentIcon />, path: `${PMS_BASE}/property-directory` },
  { text: 'Bookings', icon: <CalendarIcon />, path: `${PMS_BASE}/reservations` },
  { text: 'Channels', icon: <HubIcon />, path: `${PMS_BASE}/channel-manager` },
  { text: 'Maintenance', icon: <BuildIcon />, path: `${PMS_BASE}/maintenance` },
  { text: 'Installments', icon: <PaymentIcon />, path: `${PMS_BASE}/installments` },
  { text: 'Owners', icon: <BusinessIcon />, path: `${PMS_BASE}/owner-portal` },
  { text: 'Rentroll', icon: <AssessmentIcon />, path: `${PMS_BASE}/rent-roll` },
  { text: 'Users', icon: <ManageAccountsIcon />, path: `${PMS_BASE}/users` },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: `${PMS_BASE}/analytics-reports` },
];
