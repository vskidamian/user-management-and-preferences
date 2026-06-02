import { Navigate, Outlet } from 'react-router';
import { useMe } from '../hooks/useMe';
import { ROUTES } from '../lib/routes';

export function ProtectedRoute() {
  const { isLoading, isAuthenticated } = useMe();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} />;
  }

  return <Outlet />;
}
