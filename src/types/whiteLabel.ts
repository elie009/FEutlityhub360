export interface WhiteLabelSettings {
  companyName: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  customDomain: string | null;
  isActive: boolean;
}

export interface UpdateWhiteLabelSettingsRequest {
  companyName?: string;
  logoUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  customDomain?: string | null;
  isActive?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

