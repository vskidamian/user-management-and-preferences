import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  organizationName: z.string().min(1, 'Required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
