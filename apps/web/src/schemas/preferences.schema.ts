import { z } from 'zod';

export const VALID_COLUMNS = ['firstName', 'lastName', 'email', 'role'] as const;
export const VALID_SORTS = ['firstName', 'lastName', 'email'] as const;

export const preferencesSchema = z.object({
  theme: z.enum(['light', 'dark']),
  tablePreferences: z.object({
    visibleColumns: z.array(z.enum(VALID_COLUMNS)).min(1, 'Select at least one column'),
    defaultSort: z.enum(VALID_SORTS),
  }),
});

export type PreferencesFormData = z.infer<typeof preferencesSchema>;
