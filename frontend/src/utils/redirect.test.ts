import { describe, expect, it } from 'vitest';
import { getSafeRedirectPath } from './redirect';

describe('getSafeRedirectPath', () => {
  it.each(['/checkout', '/orders', '/checkout?payment=cod#address'])(
    'preserves the internal route %s',
    (path) => {
      expect(getSafeRedirectPath(path)).toBe(path);
    },
  );

  it.each(['https://example.com', '//example.com', 'checkout', null, 3])(
    'rejects an unsafe or invalid redirect %s',
    (path) => {
      expect(getSafeRedirectPath(path)).toBeNull();
    },
  );
});
