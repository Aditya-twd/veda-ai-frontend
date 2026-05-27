/** Client-side auth storage. Token + user live in localStorage under one key. */

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "teacher" | "admin";
  avatarUrl: string;
  school?: { name: string; location: string; sector: string };
  onboarded: boolean;
  provider: string;
}

const STORAGE_KEY = "veda_auth";

interface StoredAuth {
  token: string;
  user: AuthUser;
}

function read(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return read()?.token ?? null;
}

export function getStoredUser(): AuthUser | null {
  return read()?.user ?? null;
}

export function saveAuth(token: string, user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
}

/** Update just the user (e.g. after onboarding) while keeping the existing token. */
export function saveUser(user: AuthUser): void {
  const current = read();
  if (!current) return;
  saveAuth(current.token, user);
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
