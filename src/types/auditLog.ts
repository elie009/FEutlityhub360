export interface AuditLog {
  id: string;
  userId: string;
  userEmail?: string;
  action: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  logType: string; // USER_ACTIVITY, SYSTEM_EVENT, SECURITY_EVENT, COMPLIANCE_EVENT
  severity?: string; // INFO, WARNING, ERROR, CRITICAL
  description: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  requestMethod?: string;
  requestPath?: string;
  requestId?: string;
  complianceType?: string; // SOX, GDPR, HIPAA, etc.
  category?: string;
  subCategory?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AuditLogQuery {
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  logType?: string;
  severity?: string;
  complianceType?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedAuditLogs {
  logs: AuditLog[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuditLogSummary {
  totalLogs: number;
  userActivityLogs: number;
  systemEventLogs: number;
  securityEventLogs: number;
  complianceEventLogs: number;
  logsByAction: Record<string, number>;
  logsByEntityType: Record<string, number>;
  logsBySeverity: Record<string, number>;
  logsByComplianceType: Record<string, number>;
}

export interface CreateAuditLogRequest {
  action: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  logType?: string;
  severity?: string;
  description: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  requestMethod?: string;
  requestPath?: string;
  requestId?: string;
  complianceType?: string;
  category?: string;
  subCategory?: string;
  metadata?: Record<string, any>;
}

