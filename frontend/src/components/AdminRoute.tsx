import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

export default function AdminRoute() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname +
            location.search +
            location.hash,
        }}
      />
    );
  }

  if (user.role !== 'admin') {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
}