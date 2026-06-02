type FormRootErrorProps = { error?: { message?: string } };

export function FormRootError({ error }: FormRootErrorProps) {
  if (!error) return null;

  return (
    <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-3">
      {error.message}
    </p>
  );
}
