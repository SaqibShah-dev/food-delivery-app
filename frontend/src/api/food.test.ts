import { describe, expect, it } from 'vitest';

import { API_BASE } from './client';
import { getFoodImageUrl } from './food';

describe('getFoodImageUrl', () => {
  it('uses Cloudinary secure URLs directly', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/food.jpg';

    expect(getFoodImageUrl(url)).toBe(url);
  });

  it('continues resolving legacy local upload paths against the API host', () => {
    const apiOrigin = new URL(API_BASE, window.location.origin).origin;
    expect(getFoodImageUrl('/uploads/legacy.jpg')).toBe(`${apiOrigin}/uploads/legacy.jpg`);
  });
});
