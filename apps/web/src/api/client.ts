import type { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./errors";

function withBody(method: string, body?: unknown): RequestInit {
  return {
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };
}

function createApiClient() {
  let onUnauthenticated: (() => void) | undefined;

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`/api${path}`, {
      ...init,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...init?.headers },
    });

    if (!res.ok) {
      if (res.status === 401 && !path.startsWith("/auth/")) {
        onUnauthenticated?.();
      }
      const body = await res.json().catch(() => ({}));
      const message = (body as any)?.message ?? res.statusText;
      throw new ApiError(
        Array.isArray(message) ? message.join(", ") : message,
        res.status,
        body,
      );
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  }

  function configure(queryClient: QueryClient) {
    onUnauthenticated = () => {
      queryClient.clear();
      window.location.replace("/login");
    };
  }

  function get<T>(path: string) {
    return request<T>(path);
  }

  function post<T>(path: string, body?: unknown) {
    return request<T>(path, withBody("POST", body));
  }

  function put<T>(path: string, body?: unknown) {
    return request<T>(path, withBody("PUT", body));
  }

  function patch<T>(path: string, body?: unknown) {
    return request<T>(path, withBody("PATCH", body));
  }

  function del<T>(path: string) {
    return request<T>(path, { method: "DELETE" });
  }

  return { configure, get, post, put, patch, delete: del };
}

export const api = createApiClient();
