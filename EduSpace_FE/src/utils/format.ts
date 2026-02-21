/**
 * Format a number as Vietnamese currency
 */
export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('vi-VN')}₫`;
}

/**
 * Format a price per hour
 */
export function formatPricePerHour(amount: number): string {
  return `${formatCurrency(amount)} / hr`;
}

/**
 * Format a date string
 */
export function formatDate(date: string | Date): string {
  if (typeof date === 'string') {
    return date;
  }
  return date.toLocaleDateString('vi-VN');
}
