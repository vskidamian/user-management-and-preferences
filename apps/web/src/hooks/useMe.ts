import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export interface Organization {
  _id: string;
  name: string;
}

export interface Me {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'member';
  organizationId: Organization;
  isActive: boolean;
}

export function useMe() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get<Me>('/auth/me'),
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
