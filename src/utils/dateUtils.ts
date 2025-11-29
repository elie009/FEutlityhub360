/**
 * Date utility functions for loan due date tracking
 */

/**
 * Format a due date string for display with smart formatting
 * Examples:
 * - "Overdue by 5 days"
 * - "Due TODAY"
 * - "Due tomorrow"
 * - "Due in 7 days"
 * - "No upcoming payment"
 */
export const formatDueDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return 'No upcoming payment';
  
  try {
    const dueDate = new Date(dateStr);
    const today = new Date();
    
    // Reset time to midnight for accurate day comparison
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    const daysUntil = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return `Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''}`;
    if (daysUntil === 0) return 'Due TODAY';
    if (daysUntil === 1) return 'Due tomorrow';
    if (daysUntil <= 7) return `Due in ${daysUntil} days`;
    
    // For dates further out, show the actual date
    return `Due ${formatDate(dateStr)}`;
  } catch (error) {
    console.error('Error formatting due date:', error);
    return 'Invalid date';
  }
};

/**
 * Get the number of days until a due date
 * Returns negative number if overdue
 */
export const getDaysUntilDue = (dateStr: string | null | undefined): number | null => {
  if (!dateStr) return null;
  
  try {
    const dueDate = new Date(dateStr);
    const today = new Date();
    
    // Reset time to midnight for accurate day comparison
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    return Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error('Error calculating days until due:', error);
    return null;
  }
};

/**
 * Get color for due date based on urgency
 */
export const getDueDateColor = (dateStr: string | null | undefined): 'error' | 'warning' | 'info' | 'default' => {
  const daysUntil = getDaysUntilDue(dateStr);
  
  if (daysUntil === null) return 'default';
  if (daysUntil < 0) return 'error'; // Overdue
  if (daysUntil === 0) return 'error'; // Due today
  if (daysUntil <= 3) return 'warning'; // Due within 3 days
  if (daysUntil <= 7) return 'info'; // Due within a week
  
  return 'default';
};

/**
 * Check if a date is overdue
 */
export const isOverdue = (dateStr: string | null | undefined): boolean => {
  const daysUntil = getDaysUntilDue(dateStr);
  return daysUntil !== null && daysUntil < 0;
};

/**
 * Check if a date is due today
 */
export const isDueToday = (dateStr: string | null | undefined): boolean => {
  const daysUntil = getDaysUntilDue(dateStr);
  return daysUntil === 0;
};

/**
 * Check if a date is due soon (within specified days)
 */
export const isDueSoon = (dateStr: string | null | undefined, days: number = 7): boolean => {
  const daysUntil = getDaysUntilDue(dateStr);
  return daysUntil !== null && daysUntil > 0 && daysUntil <= days;
};

/**
 * Format a date string for display
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Format a date string for display with full month
 */
export const formatDateLong = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Convert date to ISO string for API requests
 */
export const toISODateString = (date: Date): string => {
  return date.toISOString();
};

/**
 * Get a date object for today at midnight
 */
export const getToday = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

/**
 * Get a date object for a specific number of days from today
 */
export const getDaysFromToday = (days: number): Date => {
  const date = getToday();
  date.setDate(date.getDate() + days);
  return date;
};

