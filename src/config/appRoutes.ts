/** Financial Management System base path (URL shows as /fms/...) */
export const FMS_BASE = '/fms';

/** Property Management System base path */
export const PMS_BASE = '/pms';

/** Post-login system picker */
export const SYSTEM_HUB_PATH = '/systems';

/**
 * Build an absolute path under FMS, e.g. fmsPath('/dashboard') -> '/fms/dashboard'
 */
export function fmsPath(path: string): string {
  if (!path || path === '/') {
    return FMS_BASE;
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${FMS_BASE}${normalized}`;
}

/**
 * Build an absolute path under PMS
 */
export function pmsPath(path: string): string {
  if (!path || path === '/') {
    return PMS_BASE;
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${PMS_BASE}${normalized}`;
}

const LEGACY_FMS_FIRST_SEGMENTS = new Set([
  'dashboard',
  'users',
  'super-admin',
  'bills',
  'utilities',
  'analytics',
  'variance-dashboard',
  'balance-sheet',
  'support',
  'settings',
  'transactions',
  'expenses',
  'categories',
  'income-sources',
  'receivables',
  'receipts',
  'apportioner',
  'bank-accounts',
  'savings',
  'reconciliation',
  'loans',
  'notifications',
  'documentation',
  'audit-logs',
  'accounting-guide',
  'tickets',
  'investments',
  'tax-optimization',
  'team-management',
  'api-keys',
  'white-label',
]);

/** True if this pathname should redirect to the same path under /fms */
export function isLegacyFmsPath(pathname: string): boolean {
  const seg = pathname.split('/').filter(Boolean)[0];
  if (!seg) {
    return false;
  }
  if (seg === 'reports') {
    return true;
  }
  return LEGACY_FMS_FIRST_SEGMENTS.has(seg);
}
