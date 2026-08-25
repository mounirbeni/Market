"use client";

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from "react";
import type { Unit } from "@/lib/format";

export interface SavedSearch {
  id: string;
  label: string;
  query: string;
  createdAt: number;
  alert: boolean;
}

export interface SessionUser {
  name: string;
  role: "buyer" | "seller";
  phone: string;
}

interface AppState {
  ready: boolean;
  unit: Unit;
  setUnit: (u: Unit) => void;
  toggleUnit: () => void;
  theme: "dark" | "light";
  toggleTheme: () => void;

  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;

  compare: string[];
  toggleCompare: (id: string) => boolean;
  clearCompare: () => void;
  inCompare: (id: string) => boolean;

  searches: SavedSearch[];
  saveSearch: (s: Omit<SavedSearch, "id" | "createdAt">) => void;
  removeSearch: (id: string) => void;

  /** آخر المركبات اللي شافها المستخدم */
  recent: string[];
  pushRecent: (id: string) => void;

  /** جلسة تجريبية محفوظة محلياً */
  user: SessionUser | null;
  signIn: (u: SessionUser) => void;
  signOut: () => void;

  /** الإشعارات المقروءة */
  readNotifications: string[];
  markRead: (id: string) => void;
  markAllRead: (ids: string[]) => void;
}

const Ctx = createContext<AppState | null>(null);
const KEY = "triq:v2";

interface Persisted {
  unit: Unit;
  theme: "dark" | "light";
  favorites: string[];
  compare: string[];
  searches: SavedSearch[];
  recent: string[];
  user: SessionUser | null;
  readNotifications: string[];
}

const initial: Persisted = {
  unit: "dh",
  theme: "light",
  favorites: [],
  compare: [],
  searches: [],
  recent: [],
  user: null,
  readNotifications: [],
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...initial, ...JSON.parse(raw) });
    } catch {
      /* المتصفح يمنع التخزين — نكمل بالقيم الافتراضية */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* تجاهل */
    }
    document.documentElement.setAttribute("data-theme", state.theme);
  }, [state, ready]);

  const setUnit = useCallback((unit: Unit) => setState((s) => ({ ...s, unit })), []);
  const toggleUnit = useCallback(
    () => setState((s) => ({ ...s, unit: s.unit === "dh" ? "million" : "dh" })), []);
  const toggleTheme = useCallback(
    () => setState((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" })), []);

  const toggleFavorite = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      favorites: s.favorites.includes(id)
        ? s.favorites.filter((x) => x !== id)
        : [id, ...s.favorites],
    }));
  }, []);

  const toggleCompare = useCallback((id: string) => {
    let added = false;
    setState((s) => {
      if (s.compare.includes(id)) return { ...s, compare: s.compare.filter((x) => x !== id) };
      if (s.compare.length >= 3) return s;
      added = true;
      return { ...s, compare: [...s.compare, id] };
    });
    return added;
  }, []);

  const clearCompare = useCallback(() => setState((s) => ({ ...s, compare: [] })), []);

  const saveSearch = useCallback((s: Omit<SavedSearch, "id" | "createdAt">) => {
    setState((prev) => ({
      ...prev,
      searches: [
        { ...s, id: Math.random().toString(36).slice(2, 9), createdAt: Date.now() },
        ...prev.searches.filter((x) => x.query !== s.query),
      ].slice(0, 12),
    }));
  }, []);

  const removeSearch = useCallback(
    (id: string) => setState((s) => ({ ...s, searches: s.searches.filter((x) => x.id !== id) })), []);

  const pushRecent = useCallback((id: string) => {
    setState((s) =>
      s.recent[0] === id ? s : { ...s, recent: [id, ...s.recent.filter((x) => x !== id)].slice(0, 12) },
    );
  }, []);

  const signIn = useCallback((user: SessionUser) => setState((s) => ({ ...s, user })), []);
  const signOut = useCallback(() => setState((s) => ({ ...s, user: null })), []);

  const markRead = useCallback((id: string) => {
    setState((s) =>
      s.readNotifications.includes(id)
        ? s
        : { ...s, readNotifications: [...s.readNotifications, id] },
    );
  }, []);
  const markAllRead = useCallback((ids: string[]) => {
    setState((s) => ({ ...s, readNotifications: Array.from(new Set([...s.readNotifications, ...ids])) }));
  }, []);

  const value = useMemo<AppState>(
    () => ({
      ready,
      unit: state.unit, setUnit, toggleUnit,
      theme: state.theme, toggleTheme,
      favorites: state.favorites, toggleFavorite,
      isFavorite: (id) => state.favorites.includes(id),
      compare: state.compare, toggleCompare, clearCompare,
      inCompare: (id) => state.compare.includes(id),
      searches: state.searches, saveSearch, removeSearch,
      recent: state.recent, pushRecent,
      user: state.user, signIn, signOut,
      readNotifications: state.readNotifications, markRead, markAllRead,
    }),
    [ready, state, setUnit, toggleUnit, toggleTheme, toggleFavorite, toggleCompare,
      clearCompare, saveSearch, removeSearch, pushRecent, signIn, signOut, markRead, markAllRead],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
