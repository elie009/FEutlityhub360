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

/**
 * From the API bills list: keep all bills without parentBillId.
 * For bills with parentBillId, keep only the one with the earliest dueDate per parentBillId (first when ordered by dueDate asc).
 */
export function getBillsWithEarliestPerParent(bills: Bill[]): Bill[] {
  const standalone: Bill[] = [];
  const byParent = new Map<string, Bill[]>();

  for (const bill of bills) {
    const parentId = bill.parentBillId ?? null;
    if (parentId === null || parentId === undefined || parentId === '') {
      standalone.push(bill);
    } else {
      const list = byParent.get(parentId) ?? [];
      list.push(bill);
      byParent.set(parentId, list);
    }
  }

  const parse = (d: string | undefined): number => {
    if (!d || typeof d !== 'string') return Number.MAX_SAFE_INTEGER;
    const t = new Date(d.trim()).getTime();
    return Number.isNaN(t) ? Number.MAX_SAFE_INTEGER : t;
  };

  const firstPerParent: Bill[] = [];
  byParent.forEach((list) => {
    const sorted = [...list].sort((a, b) => parse(a.dueDate) - parse(b.dueDate));
    if (sorted.length > 0) firstPerParent.push(sorted[0]);
  });

  return [...standalone, ...firstPerParent];
}


