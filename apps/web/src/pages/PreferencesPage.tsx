import { useEffect, type FC } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme, applyTheme } from "../contexts/ThemeContext";
import { getPreferences, updatePreferences } from "../api";
import {
  preferencesSchema,
  VALID_COLUMNS,
  VALID_SORTS,
  type PreferencesFormData,
} from "../schemas";

const COLUMN_LABELS: Record<(typeof VALID_COLUMNS)[number], string> = {
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email",
  role: "Role",
};

const SORT_LABELS: Record<(typeof VALID_SORTS)[number], string> = {
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email",
};

export const PreferencesPage: FC = () => {
  const { setTheme } = useTheme();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["preferences"],
    queryFn: getPreferences,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      theme: "light",
      tablePreferences: {
        visibleColumns: [...VALID_COLUMNS],
        defaultSort: "firstName",
      },
    },
    values: data
      ? { theme: data.theme, tablePreferences: data.tablePreferences }
      : undefined,
  });

  useEffect(() => {
    if (data) setTheme(data.theme);
  }, [data, setTheme]);

  const liveTheme = useWatch({ control, name: "theme" });

  useEffect(() => {
    applyTheme(liveTheme);
  }, [liveTheme]);

  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: updatePreferences,
    onSuccess: (updated) => {
      queryClient.setQueryData(["preferences"], updated);
    },
    onError: (err) => {
      console.error("Failed to save preferences", err);
    },
  });

  const handleReset = () => {
    reset();
  };

  const lastSavedAt = data?.updatedAt
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(data.updatedAt))
    : null;

  return (
    <div className="max-w-lg space-y-8">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
        Preferences
      </h1>

      <form onSubmit={handleSubmit((d) => save(d))} className="space-y-6">
        {/* Theme */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Theme
          </h2>
          <Controller
            control={control}
            name="theme"
            render={({ field }) => (
              <div className="flex gap-3">
                {(["light", "dark"] as const).map((t) => (
                  <label
                    key={t}
                    className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      field.value === t
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                        : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      value={t}
                      checked={field.value === t}
                      onChange={() => field.onChange(t)}
                    />
                    {t === "light" ? "☀️" : "🌙"}{" "}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </label>
                ))}
              </div>
            )}
          />
        </div>

        {/* Table Preferences */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Members table
          </h2>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Visible columns
            </p>
            <div className="flex flex-wrap gap-3">
              {VALID_COLUMNS.map((col) => (
                <label
                  key={col}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={col}
                    {...register("tablePreferences.visibleColumns")}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  {COLUMN_LABELS[col]}
                </label>
              ))}
            </div>
            {errors.tablePreferences?.visibleColumns && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.tablePreferences.visibleColumns.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Default sort
            </label>
            <select
              {...register("tablePreferences.defaultSort")}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {VALID_SORTS.map((s) => (
                <option key={s} value={s}>
                  {SORT_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!isDirty || isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
            >
              {isSaving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={!isDirty}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-40 transition-colors"
            >
              Reset
            </button>
            {isDirty && (
              <span className="text-xs text-amber-600 dark:text-amber-400">
                Unsaved changes
              </span>
            )}
          </div>
          {lastSavedAt && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Last saved {lastSavedAt}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
