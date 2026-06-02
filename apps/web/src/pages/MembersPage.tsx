import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMe } from '../hooks/useMe';
import { getUsers, createUser, getPreferences, ApiError, type Member } from '../api';
import { addUserSchema, type AddUserFormData } from '../schemas';

const ALL_COLUMNS = ['firstName', 'lastName', 'email', 'role'] as const;

const COLUMN_LABELS: Record<string, string> = {
  firstName: 'First Name',
  lastName: 'Last Name',
  email: 'Email',
  role: 'Role',
};

export function MembersPage() {
  const { isAdmin } = useMe();
  const queryClient = useQueryClient();

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const { data: preferences } = useQuery({
    queryKey: ['preferences'],
    queryFn: getPreferences,
  });

  const visibleColumns: string[] =
    preferences?.tablePreferences?.visibleColumns ?? [...ALL_COLUMNS];
  const defaultSort: string =
    preferences?.tablePreferences?.defaultSort ?? 'firstName';

  const sorted = [...members].sort((a, b) =>
    (a[defaultSort as keyof Member] as string).localeCompare(
      b[defaultSort as keyof Member] as string,
    ),
  );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<AddUserFormData>({ resolver: zodResolver(addUserSchema) });

  const { mutate: addUser, isPending: isAddingUser } = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      reset();
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 409) {
        setError('email', { message: 'Email already in use' });
      } else {
        setError('root', { message: 'Failed to create user. Please try again.' });
      }
    },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Members</h1>

      {membersLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {ALL_COLUMNS.filter((col) => visibleColumns.includes(col)).map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400"
                  >
                    {COLUMN_LABELS[col]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleColumns.length}
                    className="px-4 py-8 text-center text-gray-400 dark:text-gray-500"
                  >
                    No members yet.
                  </td>
                </tr>
              ) : (
                sorted.map((member) => (
                  <tr
                    key={member._id}
                    className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    {ALL_COLUMNS.filter((col) => visibleColumns.includes(col)).map((col) => (
                      <td key={col} className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {col === 'role' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                            {member[col]}
                          </span>
                        ) : (
                          member[col as keyof Member]
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {isAdmin && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Add member</h2>

          {errors.root && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-3">
              {errors.root.message}
            </p>
          )}

          <form
            onSubmit={handleSubmit((d) => addUser(d))}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {(
              [
                { name: 'firstName', label: 'First name', type: 'text' },
                { name: 'lastName', label: 'Last name', type: 'text' },
                { name: 'email', label: 'Email', type: 'email' },
                { name: 'password', label: 'Password', type: 'password' },
              ] as const
            ).map(({ name, label, type }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {label}
                </label>
                <input
                  {...register(name)}
                  type={type}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors[name] && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors[name]!.message}
                  </p>
                )}
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <select
                {...register('role')}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isAddingUser}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
              >
                {isAddingUser ? 'Adding…' : 'Add member'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
