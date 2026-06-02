import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMe } from '../hooks/useMe';
import { api } from '../api';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, isAdmin } = useMe();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logout = useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSuccess: () => {
      queryClient.clear();
      navigate('/login');
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-gray-900 dark:text-white text-sm">
              {user?.organizationId?.name ?? '…'}
            </span>
            <NavLink
              to="/members"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white [&.active]:text-indigo-600 dark:[&.active]:text-indigo-400 [&.active]:font-medium"
            >
              Members
            </NavLink>
            <NavLink
              to="/preferences"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white [&.active]:text-indigo-600 dark:[&.active]:text-indigo-400 [&.active]:font-medium"
            >
              Preferences
            </NavLink>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {user.firstName} {user.lastName}
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                  {isAdmin ? 'admin' : 'member'}
                </span>
              </span>
            )}

            <button
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
