// Mock data service for bill management
import { 
  Bill, 
  BillType, 
  BillStatus, 
  BillFrequency, 
  CreateBillRequest, 
  UpdateBillRequest,
  BillAnalytics,
  TotalPaidAnalytics,
  PaginatedBillsResponse
} from '../types/bill';

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock bills data
export const mockBills: Bill[] = [
  {
    id: 'bill-001',
    userId: 'demo-user-123',
    billName: 'Electricity Bill',
    billType: BillType.UTILITY,
    amount: 150.00,
    dueDate: '2025-10-15T00:00:00Z',
    frequency: BillFrequency.MONTHLY,
    status: BillStatus.PENDING,
    createdAt: '2025-09-24T20:35:00Z',
    updatedAt: '2025-09-24T20:35:00Z',
    paidAt: undefined,
    notes: 'Monthly electricity bill',
    provider: 'Electric Company',
    referenceNumber: 'ELEC123456',
  },
  {
    id: 'bill-002',
    userId: 'demo-user-123',
    billName: 'Netflix Subscription',
    billType: BillType.SUBSCRIPTION,
    amount: 15.99,
    dueDate: '2025-10-01T00:00:00Z',
    frequency: BillFrequency.MONTHLY,
    status: BillStatus.PENDING,
    createdAt: '2025-09-20T10:15:00Z',
    updatedAt: '2025-09-20T10:15:00Z',
    paidAt: undefined,
    notes: 'Premium subscription',
    provider: 'Netflix Inc.',
    referenceNumber: 'NFX789012',
  },
  {
    id: 'bill-003',
    userId: 'demo-user-123',
    billName: 'Water Bill',
    billType: BillType.UTILITY,
    amount: 85.50,
    dueDate: '2025-09-20T00:00:00Z',
    frequency: BillFrequency.MONTHLY,
    status: BillStatus.OVERDUE,
    createdAt: '2025-08-20T14:30:00Z',
    updatedAt: '2025-09-20T00:00:00Z',
    paidAt: undefined,
    notes: 'Monthly water usage',
    provider: 'Water Company',
    referenceNumber: 'WTR345678',
  },
  {
    id: 'bill-004',
    userId: 'demo-user-123',
    billName: 'Gym Membership',
    billType: BillType.SUBSCRIPTION,
    amount: 49.99,
    dueDate: '2025-09-15T00:00:00Z',
    frequency: BillFrequency.MONTHLY,
    status: BillStatus.PAID,
    createdAt: '2025-08-15T09:00:00Z',
    updatedAt: '2025-09-15T10:30:00Z',
    paidAt: '2025-09-15T10:30:00Z',
    notes: 'Monthly gym membership',
    provider: 'FitLife Gym',
    referenceNumber: 'GYM901234',
  },
  {
    id: 'bill-005',
    userId: 'demo-user-123',
    billName: 'Internet Bill',
    billType: BillType.UTILITY,
    amount: 75.00,
    dueDate: '2025-10-05T00:00:00Z',
    frequency: BillFrequency.MONTHLY,
    status: BillStatus.PENDING,
    createdAt: '2025-09-05T16:45:00Z',
    updatedAt: '2025-09-05T16:45:00Z',
    paidAt: undefined,
    notes: 'High-speed internet',
    provider: 'ISP Company',
    referenceNumber: 'INT567890',
  },
  {
    id: 'bill-006',
    userId: 'demo-user-123',
    billName: 'Spotify Premium',
    billType: BillType.SUBSCRIPTION,
    amount: 9.99,
    dueDate: '2025-10-10T00:00:00Z',
    frequency: BillFrequency.MONTHLY,
    status: BillStatus.PENDING,
    createdAt: '2025-09-10T12:20:00Z',
    updatedAt: '2025-09-10T12:20:00Z',
    paidAt: undefined,
    notes: 'Music streaming service',
    provider: 'Spotify AB',
    referenceNumber: 'SPT234567',
  },
  {
    id: 'bill-007',
    userId: 'demo-user-123',
    billName: 'Property Tax',
    billType: BillType.OTHERS,
    amount: 1200.00,
    dueDate: '2025-12-31T00:00:00Z',
    frequency: BillFrequency.YEARLY,
    status: BillStatus.PENDING,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    paidAt: undefined,
    notes: 'Annual property tax',
    provider: 'City Tax Office',
    referenceNumber: 'TAX2025001',
  },
  {
    id: 'bill-008',
    userId: 'demo-user-123',
    billName: 'Car Insurance',
    billType: BillType.OTHERS,
    amount: 180.00,
    dueDate: '2025-09-25T00:00:00Z',
    frequency: BillFrequency.MONTHLY,
    status: BillStatus.PAID,
    createdAt: '2025-08-25T11:15:00Z',
    updatedAt: '2025-09-25T08:45:00Z',
    paidAt: '2025-09-25T08:45:00Z',
    notes: 'Monthly car insurance premium',
    provider: 'Auto Insurance Co.',
    referenceNumber: 'AUTO890123',
  },
];

export const mockBillDataService = {
  // Get all bills for a user
  async getUserBills(userId: string, filters?: any): Promise<PaginatedBillsResponse> {
    await delay(500);
    
    let filteredBills = mockBills.filter(bill => bill.userId === userId);
    
    // Apply filters
    if (filters?.status) {
      filteredBills = filteredBills.filter(bill => bill.status === filters.status);
    }
    if (filters?.billType) {
      filteredBills = filteredBills.filter(bill => bill.billType === filters.billType);
    }
    
    // Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBills = filteredBills.slice(startIndex, endIndex);
    
    return {
      data: paginatedBills,
      page,
      limit,
      totalCount: filteredBills.length,
      totalPages: Math.ceil(filteredBills.length / limit),
      hasNextPage: endIndex < filteredBills.length,
      hasPreviousPage: page > 1,
    };
  },

  // Get a specific bill
  async getBill(billId: string): Promise<Bill> {
    await delay(300);
    const bill = mockBills.find(b => b.id === billId);
    if (!bill) {
      throw new Error('Bill not found');
    }
    return bill;
  },

  // Create a new bill
  async createBill(userId: string, billData: CreateBillRequest): Promise<Bill> {
    await delay(800);
    
    const newBill: Bill = {
      id: 'bill-' + Date.now(),
      userId,
      ...billData,
      status: BillStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paidAt: undefined,
    };
    
    mockBills.push(newBill);
    return newBill;
  },

  // Update a bill
  async updateBill(billId: string, updateData: UpdateBillRequest): Promise<Bill> {
    await delay(600);
    
    const billIndex = mockBills.findIndex(bill => bill.id === billId);
    if (billIndex === -1) {
      throw new Error('Bill not found');
    }
    
    const updatedBill: Bill = {
      ...mockBills[billIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    
    // If status is being updated to PAID, set paidAt
    if (updateData.status === BillStatus.PAID && !mockBills[billIndex].paidAt) {
      updatedBill.paidAt = new Date().toISOString();
    }
    
    mockBills[billIndex] = updatedBill;
    return updatedBill;
  },

  // Delete a bill
  async deleteBill(billId: string): Promise<boolean> {
    await delay(400);
    
    const billIndex = mockBills.findIndex(bill => bill.id === billId);
    if (billIndex === -1) {
      throw new Error('Bill not found');
    }
    
    mockBills.splice(billIndex, 1);
    return true;
  },

  // Mark bill as paid
  async markBillAsPaid(billId: string, notes?: string): Promise<Bill> {
    await delay(500);
    
    const billIndex = mockBills.findIndex(bill => bill.id === billId);
    if (billIndex === -1) {
      throw new Error('Bill not found');
    }
    
    const updatedBill: Bill = {
      ...mockBills[billIndex],
      status: BillStatus.PAID,
      paidAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: notes || mockBills[billIndex].notes,
    };
    
    mockBills[billIndex] = updatedBill;
    return updatedBill;
  },

  // Get analytics summary
  async getAnalyticsSummary(userId: string): Promise<BillAnalytics> {
    await delay(400);
    
    const userBills = mockBills.filter(bill => bill.userId === userId);
    
    const totalPendingAmount = userBills
      .filter(bill => bill.status === BillStatus.PENDING)
      .reduce((sum, bill) => sum + bill.amount, 0);
    
    const totalPaidAmount = userBills
      .filter(bill => bill.status === BillStatus.PAID)
      .reduce((sum, bill) => sum + bill.amount, 0);
    
    const totalOverdueAmount = userBills
      .filter(bill => bill.status === BillStatus.OVERDUE)
      .reduce((sum, bill) => sum + bill.amount, 0);
    
    return {
      totalPendingAmount,
      totalPaidAmount,
      totalOverdueAmount,
      totalPendingBills: userBills.filter(bill => bill.status === BillStatus.PENDING).length,
      totalPaidBills: userBills.filter(bill => bill.status === BillStatus.PAID).length,
      totalOverdueBills: userBills.filter(bill => bill.status === BillStatus.OVERDUE).length,
      generatedAt: new Date().toISOString(),
    };
  },

  // Get total pending amount
  async getTotalPendingAmount(userId: string): Promise<number> {
    await delay(300);
    const userBills = mockBills.filter(bill => bill.userId === userId);
    return userBills
      .filter(bill => bill.status === BillStatus.PENDING)
      .reduce((sum, bill) => sum + bill.amount, 0);
  },

  // Get total paid amount
  async getTotalPaidAmount(userId: string, period: string = 'month'): Promise<TotalPaidAnalytics> {
    await delay(300);
    const userBills = mockBills.filter(bill => bill.userId === userId);
    const paidBills = userBills.filter(bill => bill.status === BillStatus.PAID);
    
    const amount = paidBills.reduce((sum, bill) => sum + bill.amount, 0);
    
    return {
      amount,
      count: paidBills.length,
      period: period.toUpperCase(),
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
    };
  },

  // Get total overdue amount
  async getTotalOverdueAmount(userId: string): Promise<number> {
    await delay(300);
    const userBills = mockBills.filter(bill => bill.userId === userId);
    return userBills
      .filter(bill => bill.status === BillStatus.OVERDUE)
      .reduce((sum, bill) => sum + bill.amount, 0);
  },

  // Get overdue bills
  async getOverdueBills(userId: string): Promise<Bill[]> {
    await delay(400);
    return mockBills.filter(bill => 
      bill.userId === userId && bill.status === BillStatus.OVERDUE
    );
  },

  // Get upcoming bills
  async getUpcomingBills(userId: string, days: number = 7): Promise<Bill[]> {
    await delay(400);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return mockBills.filter(bill => 
      bill.userId === userId && 
      bill.status === BillStatus.PENDING &&
      new Date(bill.dueDate) <= futureDate
    );
  },
};
