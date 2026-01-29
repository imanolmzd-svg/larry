export type StoredAuthUser = {
  id: string;
  email: string | null;
};

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";

const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export function getAuthToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredAuth(): { token: string; user: StoredAuthUser } | null {
  if (!isBrowser()) return null;

  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
  const rawUser = window.localStorage.getItem(AUTH_USER_KEY);
  if (!token || !rawUser) return null;

  try {
    const user = JSON.parse(rawUser) as StoredAuthUser;
    if (!user || typeof user.id !== "string") return null;
    return { token, user };
  } catch {
    return null;
  }
}

export function setStoredAuth(token: string, user: StoredAuthUser): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
}
