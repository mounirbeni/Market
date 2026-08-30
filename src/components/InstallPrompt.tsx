"use client";

import { useEffect, useState } from "react";
import { useDict } from "@/lib/i18n/client";
import { Close, Download, Share, SquarePlus } from "./icons";

/* ============================================================
   شريط «زيد طريق للشاشة الرئيسية»

   بلا هادشي حتى واحد ماكيعرف بلي الموقع قابل للتنصيب — Chrome
   وEdge كيقدرو يوريو اقتراح تنصيب ديالهم، ولكن ماكيبانش تلقائياً
   وأغلب الناس عمرها ما كتشوفو. آيفون (سفاري) ماعندوش حتى اقتراح
   أصلاً — لازم توري ليه بيديك.

   كنستنّاو beforeinstallprompt (أندرويد/Chrome) ونخبّيوه، ومن بعد
   كنوريو الشريط ديالنا بالتصميم ديال الموقع بدل التلقائي.
   ============================================================ */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "triq:install-dismissed";
const COOLDOWN_DAYS = 14;

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // @ts-expect-error — خاصية قديمة ديال سفاري، ماكاينة فالأنواع الرسمية
    Boolean(window.navigator.standalone)
  );
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function recentlyDismissed(): boolean {
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const days = (Date.now() - Number(raw)) / 86_400_000;
  return days < COOLDOWN_DAYS;
}

export function InstallPrompt() {
  const t = useDict();
  const ip = t.installPrompt;
  const [mode, setMode] = useState<"none" | "android" | "ios">("none");
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setMode("android");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // آيفون ماعندوش beforeinstallprompt — كنوريو الشرح بعد شوية،
    // بلا ما نقفزو عليه فوق أول ثانية دخل فيها للموقع
    let iosTimer: ReturnType<typeof setTimeout> | undefined;
    if (isIos()) {
      iosTimer = setTimeout(() => setMode((m) => (m === "none" ? "ios" : m)), 2500);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setMode("none");
  }

  async function install() {
    if (!deferred) return;
    setBusy(true);
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } finally {
      // نوريوه فقط مرة وحدة كل نافذة — قبل ولا رفض، خلاص طلبنا
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
      setBusy(false);
      setMode("none");
      setDeferred(null);
    }
  }

  if (mode === "none") return null;

  return (
    <div className="animate-rise border-b" style={{ background: "var(--brand-soft)", borderColor: "var(--line)" }}>
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-2.5">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
          style={{ background: "var(--brand)", color: "#fff" }}
        >
          {mode === "ios" ? <SquarePlus size={17} /> : <Download size={17} />}
        </span>

        <div className="min-w-0 flex-1 text-[12.5px] leading-snug">
          {mode === "android" ? (
            <>
              <span className="font-bold" style={{ color: "var(--text)" }}>{ip.androidTitle}</span>{" "}
              <span style={{ color: "var(--text-muted)" }}>— {ip.androidText}</span>
            </>
          ) : (
            <>
              <span className="font-bold" style={{ color: "var(--text)" }}>{ip.iosTitle}</span>{" "}
              <span style={{ color: "var(--text-muted)" }}>
                {ip.iosTextA} <Share size={11} style={{ display: "inline", verticalAlign: "-1.5px" }} /> {ip.iosTextB}
              </span>
            </>
          )}
        </div>

        {mode === "android" && (
          <button
            onClick={install}
            disabled={busy}
            className="btn btn-primary btn-sm shrink-0"
          >
            {busy ? "…" : ip.install}
          </button>
        )}

        <button
          onClick={dismiss}
          aria-label={ip.dismiss}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg transition hover:bg-black/5"
          style={{ color: "var(--text-dim)" }}
        >
          <Close size={15} />
        </button>
      </div>
    </div>
  );
}
