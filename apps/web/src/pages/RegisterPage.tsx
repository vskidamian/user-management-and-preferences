import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router';
import { api, ApiError } from '../api/client';

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  organizationName: z.string().min(1, 'Required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.post('/auth/register', data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      navigate('/members');
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 409) {
        setError('email', { message: 'Email already in use' });
      } else {
        setError('root', { message: 'Something went wrong. Please try again.' });
      }
    },
  });

  const fields = [
    { name: 'firstName' as const, label: 'First name', type: 'text', autoComplete: 'given-name' },
    { name: 'lastName' as const, label: 'Last name', type: 'text', autoComplete: 'family-name' },
    { name: 'email' as const, label: 'Email', type: 'email', autoComplete: 'email' },
    { name: 'organizationName' as const, label: 'Organization name', type: 'text', autoComplete: 'organization' },
    { name: 'password' as const, label: 'Password', type: 'password', autoComplete: 'new-password' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow p-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create account</h1>

        {errors.root && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-3">
            {errors.root.message}
          </p>
        )}

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          {fields.map(({ name, label, type, autoComplete }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label}
              </label>
              <input
                {...register(name)}
                type={type}
                autoComplete={autoComplete}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors[name] && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors[name]!.message}</p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
          >
            {mutation.isPending ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
