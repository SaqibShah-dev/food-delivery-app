const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatCurrency(amount: number): string {
  if (typeof amount !== 'number' || Number.isNaN(amount)) {
    return '$0.00';
  }
  return currencyFormatter.format(amount);
}

export function formatDate(date: string | number | Date): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return 'Invalid date';
  }
  return dateFormatter.format(parsed);
}

export function formatStatus(status: string): string {
  if (!status) return '';
  return status
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
