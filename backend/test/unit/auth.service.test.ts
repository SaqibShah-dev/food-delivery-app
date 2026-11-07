import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findOne: vi.fn(),
  create: vi.fn(),
}));

vi.mock('../../src/models/User.model.js', () => ({
  default: {
    findOne: mocks.findOne,
    create: mocks.create,
  },
}));

import { authService } from '../../src/services/auth.service.js';

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('always registers a regular user even if a caller supplies admin role', async () => {
    mocks.findOne.mockResolvedValue(null);
    mocks.create.mockResolvedValue({ role: 'user' });

    const registration = {
      name: 'Alex',
      email: 'alex@example.com',
      password: 'secret',
      role: 'admin',
    };
    await authService.register(registration);

    expect(mocks.create).toHaveBeenCalledWith({
      name: 'Alex',
      email: 'alex@example.com',
      password: 'secret',
      role: 'user',
    });
  });

  it('rejects duplicate registration', async () => {
    mocks.findOne.mockResolvedValue({ email: 'alex@example.com' });

    await expect(
      authService.register({
        name: 'Alex',
        email: 'alex@example.com',
        password: 'secret',
      }),
    ).rejects.toMatchObject({ status: 400 });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('accepts matching credentials and rejects unknown users or wrong passwords', async () => {
    const user = { comparePassword: vi.fn().mockResolvedValue(true) };
    mocks.findOne.mockResolvedValue(user);
    await expect(
      authService.login('alex@example.com', 'correct'),
    ).resolves.toBe(user);

    user.comparePassword.mockResolvedValue(false);
    await expect(
      authService.login('alex@example.com', 'wrong'),
    ).rejects.toMatchObject({ status: 401 });

    mocks.findOne.mockResolvedValue(null);
    await expect(
      authService.login('missing@example.com', 'wrong'),
    ).rejects.toMatchObject({ status: 401 });
  });
});
