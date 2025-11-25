export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type TicketCategory = 'BUG' | 'FEATURE_REQUEST' | 'SUPPORT' | 'TECHNICAL' | 'BILLING' | 'GENERAL';

export interface Ticket {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  assignedTo?: string;
  assignedToName?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolvedByName?: string;
  createdAt: string;
  updatedAt: string;
  commentCount?: number;
  attachmentCount?: number;
  comments?: TicketComment[];
  attachments?: TicketAttachment[];
  statusHistory?: TicketStatusHistory[];
}

export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  userName?: string;
  comment: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface TicketAttachment {
  id: string;
  ticketId: string;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  uploadedBy?: string;
  uploadedByName?: string;
  createdAt: string;
}

export interface TicketStatusHistory {
  id: string;
  ticketId: string;
  oldStatus: string;
  newStatus: string;
  changedBy?: string;
  changedByName?: string;
  notes?: string;
  changedAt: string;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  priority?: TicketPriority;
  category?: TicketCategory;
}

export interface UpdateTicketRequest {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assignedTo?: string;
  resolutionNotes?: string;
}

export interface CreateTicketCommentRequest {
  comment: string;
  isInternal?: boolean;
}

export interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assignedTo?: string;
  search?: string;
  createdFrom?: string;
  createdTo?: string;
}

export interface PaginatedTicketsResponse {
  items: Ticket[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const TICKET_STATUS_OPTIONS: { value: TicketStatus; label: string; color: string }[] = [
  { value: 'OPEN', label: 'Open', color: '#1976d2' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: '#ed6c02' },
  { value: 'RESOLVED', label: 'Resolved', color: '#2e7d32' },
  { value: 'CLOSED', label: 'Closed', color: '#666' },
];

export const TICKET_PRIORITY_OPTIONS: { value: TicketPriority; label: string; color: string }[] = [
  { value: 'LOW', label: 'Low', color: '#757575' },
  { value: 'NORMAL', label: 'Normal', color: '#1976d2' },
  { value: 'HIGH', label: 'High', color: '#ed6c02' },
  { value: 'URGENT', label: 'Urgent', color: '#d32f2f' },
];

export const TICKET_CATEGORY_OPTIONS: { value: TicketCategory; label: string }[] = [
  { value: 'BUG', label: 'Bug Report' },
  { value: 'FEATURE_REQUEST', label: 'Feature Request' },
  { value: 'SUPPORT', label: 'Support' },
  { value: 'TECHNICAL', label: 'Technical Issue' },
  { value: 'BILLING', label: 'Billing' },
  { value: 'GENERAL', label: 'General' },
];

