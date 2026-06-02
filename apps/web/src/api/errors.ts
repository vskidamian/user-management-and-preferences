import type { FieldValues, UseFormSetError, FieldPath } from 'react-hook-form';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type StatusMap<T extends FieldValues> = Partial<Record<number, { field: FieldPath<T> | 'root'; message: string }>>;

export function handleApiError<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
  statusMap: StatusMap<T>,
  fallback = 'Something went wrong. Please try again.',
) {
  if (err instanceof ApiError) {
    const mapped = statusMap[err.status];
    if (mapped) {
      setError(mapped.field as FieldPath<T>, { message: mapped.message });
      return;
    }
  }
  setError('root', { message: fallback });
}
