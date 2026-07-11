import React from 'react';
import PmsPageScaffold from './PmsPageScaffold';

export const PropertyDirectoryPage: React.FC = () => (
  <PmsPageScaffold
    title="Directory"
    description="Central catalog of buildings, units, amenities, and status. Connect CRM or import spreadsheets to sync inventory."
  />
);

export const ReservationsCalendarPage: React.FC = () => (
  <PmsPageScaffold
    title="Bookings"
    description="Unified calendar for short-term stays, corporate blocks, and owner holds. Drag-and-drop and channel sync will land here."
  />
);

export const ChannelManagerPage: React.FC = () => (
  <PmsPageScaffold
    title="Channels"
    description="Rate parity, availability pushes, and OTA mapping across booking sites — placeholder until channel APIs are connected."
  />
);

export const MaintenanceWorkOrdersPage: React.FC = () => (
  <PmsPageScaffold
    title="Maintenance"
    description="Create, assign, and track work orders with vendor SLAs, photos, and resident notifications."
  />
);

export const InstallmentSchedulesPage: React.FC = () => (
  <PmsPageScaffold
    title="Installments"
    description="Payment plans for owners and tenants: milestones, auto-reminders, and reconciliation with accounting."
  />
);

export const OwnerInvestorPortalPage: React.FC = () => (
  <PmsPageScaffold
    title="Owners"
    description="Secure portal for statements, distributions, and document vault access."
  />
);

export const RentRollDelinquencyPage: React.FC = () => (
  <PmsPageScaffold
    title="Rentroll"
    description="Aging buckets, promises to pay, and export to finance for collections workflows."
  />
);

export const PmsUserManagementPage: React.FC = () => (
  <PmsPageScaffold
    title="Users"
    description="Roles for property managers, leasing agents, maintenance, and read-only investors."
  />
);

export const AnalyticsReportsBuilderPage: React.FC = () => (
  <PmsPageScaffold
    title="Analytics"
    description="Custom dashboards and scheduled PDF/email reports — search from the header lands here with your query string."
  />
);
