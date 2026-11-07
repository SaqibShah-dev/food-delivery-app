import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  loginUser: vi.fn(),
  setAccessToken: vi.fn(),
  setUnauthorizedHandler: vi.fn(),
}));

vi.mock('../api/auth', () => ({
  getCurrentUser: mocks.getCurrentUser,
  loginUser: mocks.loginUser,
}));

vi.mock('../api/client', () => ({
  setAccessToken: mocks.setAccessToken,
  setUnauthorizedHandler: mocks.setUnauthorizedHandler,
}));

import { useAuth } from '../hooks/useAuth';
import { AuthProvider } from './AuthContext';

function AuthProbe() {
  const { user, loading, login, logout } = useAuth();

  return (
    <section>
      <p>{loading ? 'Loading session' : `User: ${user?.name ?? 'none'}`}</p>
      <button
        onClick={() =>
          void login({ email: 'alex@example.com', password: 'secret123' })
        }
      >
        Log in
      </button>
      <button onClick={logout}>Log out</button>
    </section>
  );
}

function renderAuth() {
  return render(
    <AuthProvider>
      <AuthProbe />
    </AuthProvider>,
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('finishes restoration without making a request when no token exists', async () => {
    renderAuth();
    expect(await screen.findByText('User: none')).toBeInTheDocument();
    expect(mocks.getCurrentUser).not.toHaveBeenCalled();
  });

  it('restores a user with the saved token', async () => {
    localStorage.setItem('foodflow-access-token', 'saved-token');
    mocks.getCurrentUser.mockResolvedValue({
      data: { _id: 'user-1', name: 'Alex', email: 'alex@example.com', role: 'user' },
    });
    renderAuth();

    expect(await screen.findByText('User: Alex')).toBeInTheDocument();
    expect(mocks.setAccessToken).toHaveBeenCalledWith('saved-token');
    expect(mocks.getCurrentUser).toHaveBeenCalledOnce();
  });

  it('clears an invalid saved session', async () => {
    localStorage.setItem('foodflow-access-token', 'expired-token');
    mocks.getCurrentUser.mockRejectedValue(new Error('Unauthorized'));
    renderAuth();

    expect(await screen.findByText('User: none')).toBeInTheDocument();
    await waitFor(() => {
      expect(localStorage.getItem('foodflow-access-token')).toBeNull();
    });
    expect(mocks.setAccessToken).toHaveBeenLastCalledWith(null);
  });

  it('persists login state and clears it on logout', async () => {
    mocks.loginUser.mockResolvedValue({
      token: 'new-token',
      user: {
        _id: 'user-1',
        name: 'Alex',
        email: 'alex@example.com',
        role: 'user',
      },
    });
    const user = userEvent.setup();
    renderAuth();

    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByText('User: Alex')).toBeInTheDocument();
    expect(localStorage.getItem('foodflow-access-token')).toBe('new-token');
    expect(mocks.setAccessToken).toHaveBeenCalledWith('new-token');

    await user.click(screen.getByRole('button', { name: 'Log out' }));
    expect(screen.getByText('User: none')).toBeInTheDocument();
    expect(localStorage.getItem('foodflow-access-token')).toBeNull();
    expect(mocks.setAccessToken).toHaveBeenLastCalledWith(null);
  });
});
