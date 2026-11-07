import { describe, expect, it } from 'vitest';
import { getCartItemTotal, getCartTotal } from './cart';

describe('cart totals', () => {
  it('calculates line totals to cents', () => {
    expect(getCartItemTotal(12.5, 2)).toBe(25);
    expect(getCartItemTotal(0.105, 3)).toBe(0.33);
  });

  it('sums rounded line prices without floating-point drift', () => {
    expect(
      getCartTotal([
        { price: 12.5, quantity: 2 },
        { price: 0.105, quantity: 3 },
      ]),
    ).toBe(25.33);
  });
});
