// UserProfile API Types

export interface IncomeSource {
  name: string;
  amount: number;
  currency: string;
  frequency: string;
  category: string;
  company: string;
  description: string;
}

export interface CreateUserProfileRequest {
  jobTitle: string;
  company: string;
  employmentType: string;
  monthlySavingsGoal: number;
  monthlyInvestmentGoal: number;
  monthlyEmergencyFundGoal: number;
  taxRate: number;
  monthlyTaxDeductions: number;
  industry: string;
  location: string;
  notes: string;
  preferredCurrency: string;
  incomeSources: IncomeSource[];
}

export interface UpdateUserProfileRequest {
  jobTitle: string;
  company: string;
  employmentType: string;
  monthlySavingsGoal: number;
  monthlyInvestmentGoal: number;
  monthlyEmergencyFundGoal: number;
  taxRate: number;
  monthlyTaxDeductions: number;
  industry: string;
  location: string;
  notes: string;
  preferredCurrency: string;
}

export interface UserProfileResponse {
  id: string;
  userId: string;
  jobTitle: string;
  company: string;
  employmentType: string;
  monthlySavingsGoal: number;
  monthlyInvestmentGoal: number;
  monthlyEmergencyFundGoal: number;
  taxRate: number;
  monthlyTaxDeductions: number;
  industry: string;
  location: string;
  notes: string;
  preferredCurrency: string;
  incomeSources: IncomeSource[];
  createdAt: string;
  updatedAt: string;
}
