import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createFoodItem: vi.fn(),
  getAdminFoodItems: vi.fn(),
  getFoodImageUrl: vi.fn((image: string) => image),
  hideFoodItem: vi.fn(),
  restoreFoodItem: vi.fn(),
  updateFoodItem: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock('../../api/food', () => ({
  createFoodItem: mocks.createFoodItem,
  getAdminFoodItems: mocks.getAdminFoodItems,
  getFoodImageUrl: mocks.getFoodImageUrl,
  hideFoodItem: mocks.hideFoodItem,
  restoreFoodItem: mocks.restoreFoodItem,
  updateFoodItem: mocks.updateFoodItem,
}));

vi.mock('sonner', () => ({
  toast: {
    error: mocks.toastError,
    success: mocks.toastSuccess,
  },
}));

import Food from './Food';

describe('Admin food form validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAdminFoodItems.mockResolvedValue({ data: [] });
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('associates Zod field errors with their form controls accessibly', async () => {
    const user = userEvent.setup();
    render(<Food />);

    await user.click(
      await screen.findByRole('button', { name: 'Add food item' }),
    );
    await user.click(screen.getByRole('button', { name: 'Create food' }));

    const cases = [
      ['Name', 'Name must contain at least 2 characters.'],
      ['Category', 'Category must contain at least 2 characters.'],
      ['Price (USD)', 'Price is required.'],
      ['Image', 'Choose an image for the new food item.'],
      ['Description', 'Description must contain at least 5 characters.'],
    ] as const;

    for (const [label, message] of cases) {
      const field = screen.getByLabelText(label);
      expect(field).toHaveAttribute('aria-invalid', 'true');
      expect(field).toHaveAccessibleDescription(message);
      expect(screen.getByText(message)).toHaveAttribute('role', 'alert');
    }

    expect(mocks.createFoodItem).not.toHaveBeenCalled();
  });
});
