import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

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

/**
 * Format a join date (e.g., "Tháng 5, 2022")
 */
export function formatJoinDate(dateString: string | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const formatted = format(date, "MMMM, yyyy", { locale: vi });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
