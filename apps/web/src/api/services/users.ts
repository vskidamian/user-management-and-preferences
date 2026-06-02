import { api } from "../client";

export interface Member {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "member";
}

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "admin" | "member";
}

export const getUsers = () => api.get<Member[]>("/users");
export const createUser = (data: CreateUserInput) => api.post<Member>("/users", data);
