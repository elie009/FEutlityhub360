export interface Investment {
  id: string;
  userId: string;
  accountName: string;
  investmentType: string;
  accountType?: string;
  brokerName?: string;
  accountNumber?: string;
  initialInvestment: number;
  currentValue: number;
  totalCostBasis: number;
  unrealizedGainLoss?: number;
  realizedGainLoss?: number;
  totalReturnPercentage?: number;
  currency: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvestmentRequest {
  accountName: string;
  investmentType: string;
  accountType?: string;
  brokerName?: string;
  accountNumber?: string;
  initialInvestment: number;
  currentValue?: number;
  currency?: string;
  description?: string;
}

export interface UpdateInvestmentRequest {
  accountName?: string;
  investmentType?: string;
  accountType?: string;
  brokerName?: string;
  currentValue?: number;
  description?: string;
  isActive?: boolean;
}

export interface InvestmentPosition {
  id: string;
  investmentId: string;
  symbol: string;
  name: string;
  assetType: string;
  quantity: number;
  averageCostBasis: number;
  totalCostBasis: number;
  currentPrice?: number;
  currentValue?: number;
  unrealizedGainLoss?: number;
  gainLossPercentage?: number;
  dividendsReceived?: number;
  interestReceived?: number;
  lastPriceUpdate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentTransaction {
  id: string;
  investmentId: string;
  positionId?: string;
  transactionType: string;
  symbol: string;
  name?: string;
  quantity?: number;
  pricePerShare?: number;
  amount: number;
  fees?: number;
  taxes?: number;
  currency: string;
  description?: string;
  reference?: string;
  transactionDate: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

