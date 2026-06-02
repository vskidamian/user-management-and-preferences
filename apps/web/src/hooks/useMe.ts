import { useQuery } from '@tanstack/react-query';
import { getMe, type Me } from '../api';

export type { Me };

export function useMe() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    retry: false,
    staleTime: Infinity,
  });

  return {
    user: data ?? null,
    isLoading,
    isAuthenticated: !!data && !isError,
    isAdmin: data?.role === 'admin',
  };
}
