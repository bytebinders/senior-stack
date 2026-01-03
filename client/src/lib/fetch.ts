export const API_BASE = (import.meta.env.VITE_API_BASE as string) || "";

export async function apiFetch(input: string, init?: RequestInit) {
  const url = `${API_BASE}${input}`;
  return fetch(url, { ...(init || {}), credentials: "include" });
}

export async function apiRequest(method: string, input: string, data?: unknown) {
  const url = `${API_BASE}${input}`;
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  return res;
}
