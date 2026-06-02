import { api } from "../client";

export interface Organization {
  _id: string;
  name: string;
}

export interface Me {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "member";
  organizationId: Organization;
  isActive: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  organizationName: string;
  password: string;
}

export const getMe = () => api.get<Me>("/auth/me");
export const login = (data: LoginInput) => api.post<void>("/auth/login", data);
export const logout = () => api.post<void>("/auth/logout");
export const register = (data: RegisterInput) => api.post<void>("/auth/register", data);
