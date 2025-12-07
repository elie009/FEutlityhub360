export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  invitedAt?: string;
  joinedAt?: string;
}

export interface InviteTeamMemberRequest {
  email: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
  message?: string;
}

export interface TeamSettings {
  maxUsers: number;
  currentUserCount: number;
  allowInvitations: boolean;
}

export interface UpdateTeamMemberRoleRequest {
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

