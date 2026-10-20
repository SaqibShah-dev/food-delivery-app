import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { ReactNode } from 'react';
import type { IAuthUser, ILoginInput } from '../types';

import { getCurrentUser, loginUser } from '../api/auth';
import {
  setAccessToken,
  setUnauthorizedHandler,
} from '../api/client';

interface IAuthContext {
  user: IAuthUser | null;
  loading: boolean;
  login: (credentials: ILoginInput) => Promise<IAuthUser>;
  logout: () => void;
}

export const AuthContext = createContext<IAuthContext | undefined>(
  undefined
);

const TOKEN_STORAGE_KEY = 'foodflow-access-token';

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<IAuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    setUnauthorizedHandler(logout);

    const restoreSession = async () => {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);

      if (!token) {
        setLoading(false);
        return;
      }

      setAccessToken(token);

      try {
        const response = await getCurrentUser(
          controller.signal
        );

        if (!controller.signal.aborted) {
          setUser(response.data);
        }
      } catch {
        if (!controller.signal.aborted) {
          logout();
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void restoreSession();

    return () => {
      controller.abort();
      setUnauthorizedHandler(null);
    };
  }, [logout]);

  const login = useCallback(
    async (credentials: ILoginInput): Promise<IAuthUser> => {
      const result = await loginUser(credentials);

      localStorage.setItem(TOKEN_STORAGE_KEY, result.token);
      setAccessToken(result.token);
      setUser(result.user);

      return result.user;
    },
    []
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
    }),
    [user, loading, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}