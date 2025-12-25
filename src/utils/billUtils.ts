import { Bill, BillStatus } from '../types/bill';

/**
 * Filters bills to show only the latest due date for each bill name.
 * Removes duplicates by keeping only the bill with the most recent due date for each billName.
 * 
 * @param bills - Array of bills to filter
 * @returns Array of bills with only the latest due date for each bill name
 */
export function getLatestBillsByName(bills: Bill[]): Bill[] {
  const pendingBills = bills.filter((bill) => bill.status === BillStatus.PENDING);
  const billMap = new Map<string, Bill>();
  
  pendingBills.forEach((bill) => {
    const existing = billMap.get(bill.billName);
    if (!existing) {
      billMap.set(bill.billName, bill);
    } else {
      // Keep the bill with the latest due date
      const existingDate = new Date(existing.dueDate);
      const currentDate = new Date(bill.dueDate);
      if (currentDate > existingDate) {
        billMap.set(bill.billName, bill);
      }
    }
  });
  
  return Array.from(billMap.values());
}

