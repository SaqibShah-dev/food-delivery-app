import { render, screen } from '@testing-library/react';
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
  register: vi.fn(),
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

vi.mock('../api/auth', () => ({
  registerUser: mocks.register,
}));

import Register from './Register';

function LocationOutput() {
  const location = useLocation();
  return <p>Current route: {location.pathname}</p>;
}

function renderRegister(initialEntry: string | { pathname: string; state?: unknown } = '/register') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<LocationOutput />} />
        <Route path="/orders" element={<LocationOutput />} />
        <Route path="/access-denied" element={<LocationOutput />} />
        <Route path="/admin/dashboard" element={<LocationOutput />} />
      </Routes>
    </MemoryRouter>,
  );
}

async function fillValidRegistration(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Full name'), 'Alex Example');
  await user.type(screen.getByLabelText('Email address'), 'alex@example.com');
  await user.type(screen.getByLabelText('Password'), 'secret123');
  await user.type(screen.getByLabelText('Confirm password'), 'secret123');
}

describe('Registration page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.user = null;
    mocks.loading = false;
  });

  it('renders the form and sign-in link', () => {
    renderRegister();
    expect(screen.getByLabelText('Full name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('validates required fields and does not submit', async () => {
    const user = userEvent.setup();
    renderRegister();
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(screen.getByText('Full name is required.')).toBeInTheDocument();
    expect(screen.getByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(mocks.register).not.toHaveBeenCalled();
  });

  it('requires matching password confirmation', async () => {
    const user = userEvent.setup();
    renderRegister();
    await user.type(screen.getByLabelText('Full name'), 'Alex Example');
    await user.type(screen.getByLabelText('Email address'), 'alex@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.type(screen.getByLabelText('Confirm password'), 'different123');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    expect(mocks.register).not.toHaveBeenCalled();
  });

  it('shows API errors', async () => {
    mocks.register.mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: 'Email already exists' } },
    });
    const user = userEvent.setup();
    renderRegister();
    await fillValidRegistration(user);
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Email already exists',
    );
    expect(mocks.login).not.toHaveBeenCalled();
  });

  it('registers, establishes a session using the current login flow and preserves the return path', async () => {
    mocks.register.mockResolvedValue({
      user: { role: 'user' },
      token: 'registration-token',
    });
    mocks.login.mockResolvedValue({ role: 'user' });
    const user = userEvent.setup();
    renderRegister({ pathname: '/register', state: { from: '/checkout' } });
    await fillValidRegistration(user);
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Current route: /checkout')).toBeInTheDocument();
    expect(mocks.register).toHaveBeenCalledWith({
      name: 'Alex Example',
      email: 'alex@example.com',
      password: 'secret123',
    });
    expect(mocks.login).toHaveBeenCalledWith({
      email: 'alex@example.com',
      password: 'secret123',
    });
  });

  it('waits for session restoration', () => {
    mocks.loading = true;
    renderRegister();
    expect(screen.getByText('Checking your session…')).toBeInTheDocument();
    expect(screen.queryByLabelText('Email address')).not.toBeInTheDocument();
  });
});
