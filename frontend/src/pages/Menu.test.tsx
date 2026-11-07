import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAvailableFoodCategories: vi.fn(),
  getAvailableFoodItems: vi.fn(),
  getFoodImageUrl: vi.fn((image: string) => image),
  addItem: vi.fn(),
  logout: vi.fn(),
  user: null as { name: string; role: 'user' | 'admin' } | null,
}));

vi.mock('../api/food', () => ({
  getAvailableFoodCategories: mocks.getAvailableFoodCategories,
  getAvailableFoodItems: mocks.getAvailableFoodItems,
  getFoodImageUrl: mocks.getFoodImageUrl,
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: mocks.user, logout: mocks.logout }),
}));

vi.mock('../hooks/useCart', () => ({
  useCart: () => ({ totalItems: 0, addItem: mocks.addItem }),
}));

vi.mock('../components/AddToCartButton', () => ({
  default: ({ food }: { food: { name: string } }) => (
    <button onClick={() => mocks.addItem(food)}>Add {food.name} to cart</button>
  ),
}));

import Menu from './Menu';

const soup = {
  _id: 'food-1',
  name: 'Soup',
  description: 'Warm soup',
  price: 4.25,
  image: '/soup.jpg',
  category: 'Lunch',
  isAvailable: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

function menuResponse(
  items = [soup],
  page = 1,
  totalItems = items.length,
  totalPages = 1,
) {
  return {
    data: {
      items,
      pagination: {
        page,
        limit: 9,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    },
  };
}

function renderMenu() {
  return render(
    <MemoryRouter>
      <Menu />
    </MemoryRouter>,
  );
}

describe('Menu page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.user = null;
    mocks.getAvailableFoodCategories.mockResolvedValue({
      data: ['Lunch', 'Dinner'],
    });
    mocks.getAvailableFoodItems.mockResolvedValue(menuResponse());
  });

  it('loads categories and food items and adds a selected food to the cart', async () => {
    renderMenu();

    expect(await screen.findByRole('heading', { name: 'Soup' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Lunch' })).toBeInTheDocument();
    expect(mocks.getAvailableFoodItems).toHaveBeenCalledWith(
      { page: 1, limit: 9 },
      expect.any(AbortSignal),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add Soup to cart' }));
    expect(mocks.addItem).toHaveBeenCalledWith(soup);
  });

  it('applies search and category filters and resets pagination', async () => {
    mocks.getAvailableFoodItems
      .mockResolvedValueOnce(menuResponse([soup], 2, 20, 3))
      .mockResolvedValue(menuResponse([soup]));
    renderMenu();
    await screen.findByRole('heading', { name: 'Soup' });
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Search food by name'), {
      target: { value: '  soup  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    await waitFor(() => {
      expect(mocks.getAvailableFoodItems).toHaveBeenLastCalledWith(
        { page: 1, limit: 9, search: 'soup' },
        expect.any(AbortSignal),
      );
    });

    fireEvent.click(screen.getByRole('button', { name: 'Lunch' }));
    await waitFor(() => {
      expect(mocks.getAvailableFoodItems).toHaveBeenLastCalledWith(
        { page: 1, limit: 9, category: 'Lunch', search: 'soup' },
        expect.any(AbortSignal),
      );
    });
  });

  it('surfaces loading errors with a retry action', async () => {
    mocks.getAvailableFoodItems
      .mockRejectedValueOnce({
        isAxiosError: true,
        response: { data: { message: 'Menu unavailable' } },
      })
      .mockResolvedValue(menuResponse());
    renderMenu();

    expect(await screen.findByRole('alert')).toHaveTextContent('Menu unavailable');
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('heading', { name: 'Soup' })).toBeInTheDocument();
  });
});
