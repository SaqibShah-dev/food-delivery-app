import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  find: vi.fn(),
  countDocuments: vi.fn(),
  sort: vi.fn(),
  skip: vi.fn(),
  limit: vi.fn(),
}));

vi.mock('../../src/models/FoodItem.model.js', () => ({
  default: {
    find: mocks.find,
    countDocuments: mocks.countDocuments,
  },
}));

import { foodService } from '../../src/services/food.service.js';

describe('foodService.getAllAvailable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.find.mockReturnValue({ sort: mocks.sort });
    mocks.sort.mockReturnValue({ skip: mocks.skip });
    mocks.skip.mockReturnValue({ limit: mocks.limit });
    mocks.limit.mockResolvedValue([{ name: 'Soup' }]);
    mocks.countDocuments.mockResolvedValue(21);
  });

  it('filters for available items, applies search/category and paginates results', async () => {
    const result = await foodService.getAllAvailable({
      page: 2,
      limit: 10,
      category: 'Lunch',
      search: 'soup',
    });

    expect(mocks.find).toHaveBeenCalledWith({
      isAvailable: true,
      category: { $regex: '^Lunch$', $options: 'i' },
      name: { $regex: 'soup', $options: 'i' },
    });
    expect(mocks.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(mocks.skip).toHaveBeenCalledWith(10);
    expect(mocks.limit).toHaveBeenCalledWith(10);
    expect(result.pagination).toMatchObject({
      page: 2,
      limit: 10,
      totalItems: 21,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });
});
