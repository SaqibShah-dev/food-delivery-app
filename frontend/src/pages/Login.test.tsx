import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  user: null as { role: 'user' | 'admin' } | null,
  loading: false,
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: mocks.user,
    loading: mocks.loading,
    login: mocks.login,
  }),
}));

import Login from './Login';

function LocationOutput() {
  const location = useLocation();
  return <p>Current route: {location.pathname}</p>;
}

function renderLogin(initialEntry: string | { pathname: string; state?: unknown } = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/checkout" element={<LocationOutput />} />
        <Route path="/orders" element={<LocationOutput />} />
        <Route path="/admin/dashboard" element={<LocationOutput />} />
        <Route path="/access-denied" element={<LocationOutput />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Login page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.user = null;
    mocks.loading = false;
  });

  it('renders labeled fields and the registration link', () => {
    renderLogin();

    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Create an account' }),
    ).toBeInTheDocument();
  });

  it('shows required-field errors and does not attempt login', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(screen.getByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(mocks.login).not.toHaveBeenCalled();
  });

  it('shows malformed email and too-short password errors', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText('Email address'), 'invalid');
    await user.type(screen.getByLabelText('Password'), '123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
    expect(
      screen.getByText('Password must be at least 6 characters.'),
    ).toBeInTheDocument();
    expect(mocks.login).not.toHaveBeenCalled();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    renderLogin();
    const password = screen.getByLabelText('Password');

    await user.click(screen.getByRole('button', { name: 'Show' }));
    expect(password).toHaveAttribute('type', 'text');
    await user.click(screen.getByRole('button', { name: 'Hide' }));
    expect(password).toHaveAttribute('type', 'password');
  });

  it('waits for session restoration before rendering the form', () => {
    mocks.loading = true;
    renderLogin();
    expect(screen.getByText('Checking your session…')).toBeInTheDocument();
    expect(screen.queryByLabelText('Email address')).not.toBeInTheDocument();
  });

  it('shows the pending state while submitting valid credentials', async () => {
    let resolveLogin!: (value: { role: 'user' }) => void;
    mocks.login.mockReturnValue(
      new Promise((resolve) => {
        resolveLogin = resolve;
      }),
    );
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText('Email address'), 'alex@example.com');
    await user.type(screen.getByLabelText('Password'), '123456');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByRole('button', { name: 'Signing in…' }),
    ).toBeDisabled();
    resolveLogin({ role: 'user' });
  });

  it('displays API errors', async () => {
    mocks.login.mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: 'Invalid credentials' } },
    });
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText('Email address'), 'alex@example.com');
    await user.type(screen.getByLabelText('Password'), '123456');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid credentials',
    );
  });

  it('preserves the safe customer destination after login', async () => {
    mocks.login.mockResolvedValue({ role: 'user' });
    const user = userEvent.setup();
    renderLogin({ pathname: '/login', state: { from: '/checkout' } });
    await user.type(screen.getByLabelText('Email address'), 'alex@example.com');
    await user.type(screen.getByLabelText('Password'), '123456');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Current route: /checkout')).toBeInTheDocument();
  });

  it('redirects authenticated admins to their requested admin route', async () => {
    mocks.login.mockResolvedValue({ role: 'admin' });
    const user = userEvent.setup();
    renderLogin({
      pathname: '/login',
      state: { from: '/admin/dashboard' },
    });
    await user.type(screen.getByLabelText('Email address'), 'admin@example.com');
    await user.type(screen.getByLabelText('Password'), '123456');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByText('Current route: /admin/dashboard')).toBeInTheDocument();
    });
  });

  it('does not redirect a regular user to an admin destination', async () => {
    mocks.login.mockResolvedValue({ role: 'user' });
    const user = userEvent.setup();
    renderLogin({ pathname: '/login', state: { from: '/admin/orders' } });
    await user.type(screen.getByLabelText('Email address'), 'alex@example.com');
    await user.type(screen.getByLabelText('Password'), '123456');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Current route: /access-denied')).toBeInTheDocument();
  });
});
