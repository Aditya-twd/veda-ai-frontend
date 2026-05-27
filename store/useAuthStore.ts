"use client";
import { create } from "zustand";
import { getToken, getStoredUser, saveAuth, saveUser, clearAuth, type AuthUser } from "@/lib/auth";

type AuthStatus = "loading" | "authed" | "anon";

interface AuthStore {
  user: AuthUser | null;
  status: AuthStatus;
  /** Read token+user from localStorage. Call once on mount (client-only). */
  hydrate: () => void;
  /** Persist a fresh login and flip to authed. */
  login: (token: string, user: AuthUser) => void;
  /** Update just the user (e.g. after onboarding). */
  setUser: (user: AuthUser) => void;
  /** Clear everything and bounce to /login. */
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  status: "loading",

  hydrate: () => {
    const token = getToken();
    const user = getStoredUser();
    if (token && user) set({ user, status: "authed" });
    else set({ user: null, status: "anon" });
  },

  login: (token, user) => {
    saveAuth(token, user);
    set({ user, status: "authed" });
  },

  setUser: (user) => {
    saveUser(user);
    set({ user });
  },

  logout: () => {
    clearAuth();
    set({ user: null, status: "anon" });
    if (typeof window !== "undefined") window.location.href = "/login";
  },
}));
