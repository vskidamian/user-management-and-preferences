export const ROUTES = {
  login: '/login',
  register: '/register',
  members: '/members',
  preferences: '/preferences',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
