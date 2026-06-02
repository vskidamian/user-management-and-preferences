import { api } from "../client";

export type Column = "firstName" | "lastName" | "email" | "role";
export type SortField = "firstName" | "lastName" | "email";

export interface Preference {
  _id: string;
  theme: "light" | "dark";
  tablePreferences: {
    visibleColumns: Column[];
    defaultSort: SortField;
  };
  updatedAt: string;
}

export interface UpdatePreferencesInput {
  theme: "light" | "dark";
  tablePreferences: {
    visibleColumns: Column[];
    defaultSort: SortField;
  };
}

export const getPreferences = () => api.get<Preference>("/preferences");
export const updatePreferences = (data: UpdatePreferencesInput) => api.put<Preference>("/preferences", data);
