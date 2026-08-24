"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Unit } from "@/lib/format";

interface SavedSearch {
  id: string;
  label: string;
  query: string;
  createdAt: number;
  alert: boolean;
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
}

const Ctx = createContext<AppState | null>(null);

const KEY = "triq:v1";

interface Persisted {
  unit: Unit;
  theme: "dark" | "light";
  favorites: string[];
  compare: string[];
  searches: SavedSearch[];
}

const initial: Persisted = {
  unit: "dh",
  theme: "dark",
  favorites: [],
  compare: [],
  searches: [],
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
    () => setState((s) => ({ ...s, unit: s.unit === "dh" ? "million" : "dh" })),
    [],
  );
  const toggleTheme = useCallback(
    () => setState((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" })),
    [],
  );

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
      if (s.compare.includes(id)) {
        return { ...s, compare: s.compare.filter((x) => x !== id) };
      }
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
    (id: string) =>
      setState((s) => ({ ...s, searches: s.searches.filter((x) => x.id !== id) })),
    [],
  );

  const value = useMemo<AppState>(
    () => ({
      ready,
      unit: state.unit,
      setUnit,
      toggleUnit,
      theme: state.theme,
      toggleTheme,
      favorites: state.favorites,
      toggleFavorite,
      isFavorite: (id) => state.favorites.includes(id),
      compare: state.compare,
      toggleCompare,
      clearCompare,
      inCompare: (id) => state.compare.includes(id),
      searches: state.searches,
      saveSearch,
      removeSearch,
    }),
    [ready, state, setUnit, toggleUnit, toggleTheme, toggleFavorite, toggleCompare, clearCompare, saveSearch, removeSearch],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
