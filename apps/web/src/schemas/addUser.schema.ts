import { z } from 'zod';

export const addUserSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
  role: z.enum(['admin', 'member']).default('member'),
});

export type AddUserFormData = z.infer<typeof addUserSchema>;
