import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDate, formatStatus } from './format';

describe('format utilities', () => {
  it('formats currency correctly', () => {
    expect(formatCurrency(12.5)).toBe('$12.50');
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(NaN)).toBe('$0.00');
  });

  it('formats dates safely', () => {
    const date = new Date('2026-05-15T10:30:00Z');
    expect(formatDate(date)).toContain('2026');
    expect(formatDate('invalid-date')).toBe('Invalid date');
  });

  it('formats kebab-case statuses to capitalized title', () => {
    expect(formatStatus('out-for-delivery')).toBe('Out For Delivery');
    expect(formatStatus('pending')).toBe('Pending');
    expect(formatStatus('')).toBe('');
  });
});
