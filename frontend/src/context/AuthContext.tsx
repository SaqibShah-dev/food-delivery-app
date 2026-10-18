import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { ReactNode } from 'react';
import type { IAuthUser, ILoginInput } from '../types';

import { loginUser } from '../api/auth';
import {
  setAccessToken,
  setUnauthorizedHandler,
} from '../api/client';

interface IAuthContext {
  user: IAuthUser | null;
  login: (credentials: ILoginInput) => Promise<IAuthUser>;
  logout: () => void;
}

export const AuthContext = createContext<IAuthContext | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<IAuthUser | null>(null);

  const logout = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    localStorage.removeItem('token');

    setUnauthorizedHandler(logout);

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [logout]);

  const login = useCallback(
    async (credentials: ILoginInput): Promise<IAuthUser> => {
      const result = await loginUser(credentials);

      setAccessToken(result.token);
      setUser(result.user);

      return result.user;
    },
    []
  );

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
    }),
    [user, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}