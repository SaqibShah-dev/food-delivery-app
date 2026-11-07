import { createContext } from 'react';

import type { IAuthUser, ILoginInput } from '../types';

export interface IAuthContext {
  user: IAuthUser | null;
  loading: boolean;
  login: (credentials: ILoginInput) => Promise<IAuthUser>;
  logout: () => void;
}

export const AuthContext = createContext<IAuthContext | undefined>(
  undefined
);
