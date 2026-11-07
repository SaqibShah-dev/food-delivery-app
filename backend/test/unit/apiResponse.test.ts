import { describe, expect, it } from 'vitest';

import { apiResponse } from '../../src/utils/apiResponse.js';

describe('apiResponse', () => {
  it('returns data with the default HTTP status', () => {
    const result = apiResponse(
      { id: 'order-123' },
      'Order retrieved'
    );

    expect(result).toEqual({
      status: 200,
      message: 'Order retrieved',
      data: {
        id: 'order-123',
      },
    });
  });

  it('supports a custom status', () => {
    const result = apiResponse(
      { id: 'order-123' },
      'Order created',
      201
    );

    expect(result.status).toBe(201);
    expect(result.message).toBe('Order created');
  });

  it('supports null data for error responses', () => {
    const result = apiResponse(null, 'Not found', 404);

    expect(result).toEqual({
      status: 404,
      message: 'Not found',
      data: null,
    });
  });

  it('preserves array data', () => {
    const orders = [{ id: 'one' }, { id: 'two' }];

    expect(apiResponse(orders).data).toEqual(orders);
  });
});