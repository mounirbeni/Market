"use client";

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from "react";
import type { Unit } from "@/lib/format";
import { useSession } from "./session";

export interface SavedSearch {
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

  /** آخر المركبات اللي شافها المستخدم */
  recent: string[];
  pushRecent: (id: string) => void;

  /** مركبات مفعّل عليها تنبيه انخفاض السعر */
  priceWatch: string[];
  togglePriceWatch: (id: string) => void;
  isWatched: (id: string) => boolean;

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
  priceWatch: string[];
}

const initial: Persisted = {
  unit: "dh",
  theme: "light",
  favorites: [],
  compare: [],
  searches: [],
  recent: [],
  priceWatch: [],
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

  /* ============================================================
     المزامنة مع الحساب

     ملي يكون المستخدم داخل، المفضّلة والبحوث المحفوظة كيعيشو
     فقاعدة البيانات ماشي فالمتصفح — باش يلقاهم من أي جهاز.
     اللي حفظ قبل ما يدخل كيتّرفع للحساب أول مرة.
     ============================================================ */
  const { user } = useSession();
  const userId = user?.id ?? null;

  useEffect(() => {
    if (!ready) return;
    if (!userId) return;
    let alive = true;

    (async () => {
      try {
        const [favRes, srchRes] = await Promise.all([
          fetch("/api/me/favorites").then((r) => r.json()),
          fetch("/api/me/searches").then((r) => r.json()),
        ]);
        if (!alive || !favRes?.ok) return;

        const remoteFavs: string[] = favRes.data.favorites ?? [];
        const remoteWatch: string[] = favRes.data.priceWatch ?? [];

        // اللي محفوظ محلياً وماشي فالحساب — كنرفعوه
        const toUpload = state.favorites.filter((id) => !remoteFavs.includes(id));
        await Promise.all(
          toUpload.map((ref) =>
            fetch("/api/me/favorites", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ ref, on: true }),
            }).catch(() => {}),
          ),
        );

        const remoteSearches = srchRes?.ok
          ? (srchRes.data.items as { id: string; label: string; query: string; alert: boolean; created_at: string }[])
          : [];
        const known = new Set(remoteSearches.map((x) => x.query));
        await Promise.all(
          state.searches
            .filter((x) => !known.has(x.query))
            .map((x) =>
              fetch("/api/me/searches", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ label: x.label, query: x.query }),
              }).catch(() => {}),
            ),
        );

        if (!alive) return;
        setState((prev) => ({
          ...prev,
          favorites: [...new Set([...toUpload, ...remoteFavs])],
          priceWatch: [...new Set([...prev.priceWatch, ...remoteWatch])],
          searches: [
            ...prev.searches.filter((x) => !known.has(x.query)),
            ...remoteSearches.map((x) => ({
              id: x.id,
              label: x.label,
              query: x.query,
              alert: x.alert,
              createdAt: new Date(x.created_at).getTime(),
            })),
          ].slice(0, 12),
        }));
      } catch {
        /* الشبكة قاطعة — كنكملو بالتخزين المحلي */
      }
    })();

    return () => {
      alive = false;
    };
    // كنمشيو غير ملي يتبدّل المستخدم — ماشي مع كل تغيير فالحالة
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, userId]);

  /** كتبعت التغيير للحساب ملي يكون المستخدم داخل — الفشل ماكيوقفش الواجهة */
  const push = useCallback(
    (url: string, payload: unknown, method = "POST") => {
      if (!userId) return;
      fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: method === "DELETE" ? undefined : JSON.stringify(payload),
      }).catch(() => {});
    },
    [userId],
  );

  const setUnit = useCallback((unit: Unit) => setState((s) => ({ ...s, unit })), []);
  const toggleUnit = useCallback(
    () => setState((s) => ({ ...s, unit: s.unit === "dh" ? "million" : "dh" })), []);
  const toggleTheme = useCallback(
    () => setState((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" })), []);

  const toggleFavorite = useCallback((id: string) => {
    setState((s) => {
      const on = !s.favorites.includes(id);
      push("/api/me/favorites", { ref: id, on });
      return {
        ...s,
        favorites: on ? [id, ...s.favorites] : s.favorites.filter((x) => x !== id),
      };
    });
  }, [push]);

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
    push("/api/me/searches", { label: s.label, query: s.query });
    setState((prev) => ({
      ...prev,
      searches: [
        { ...s, id: Math.random().toString(36).slice(2, 9), createdAt: Date.now() },
        ...prev.searches.filter((x) => x.query !== s.query),
      ].slice(0, 12),
    }));
  }, [push]);

  const removeSearch = useCallback(
    (id: string) => {
      if (userId) fetch(`/api/me/searches?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
      setState((s) => ({ ...s, searches: s.searches.filter((x) => x.id !== id) }));
    },
    [userId],
  );

  const pushRecent = useCallback((id: string) => {
    setState((s) =>
      s.recent[0] === id ? s : { ...s, recent: [id, ...s.recent.filter((x) => x !== id)].slice(0, 12) },
    );
  }, []);

  const togglePriceWatch = useCallback((id: string) => {
    setState((s) => {
      const watch = !s.priceWatch.includes(id);
      push("/api/me/favorites", { ref: id, watch });
      return {
        ...s,
        priceWatch: watch ? [...s.priceWatch, id] : s.priceWatch.filter((x) => x !== id),
      };
    });
  }, [push]);

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
      priceWatch: state.priceWatch, togglePriceWatch,
      isWatched: (id) => state.priceWatch.includes(id),
    }),
    [ready, state, setUnit, toggleUnit, toggleTheme, toggleFavorite, toggleCompare,
      clearCompare, saveSearch, removeSearch, pushRecent,
      togglePriceWatch],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
