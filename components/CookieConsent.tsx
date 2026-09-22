"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";

const CONSENT_KEY = "dg:cookie_consent";

type ConsentState = "accepted" | "declined" | null;

function isLikelyEU(): boolean {
  if (typeof Intl === "undefined") return false;
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const euTimezones = [
      "Europe/", "Atlantic/Canary", "Atlantic/Faroe", "Atlantic/Reykjavik",
      "Atlantic/Azores", "Atlantic/Madeira",
    ];
    return euTimezones.some((prefix) => tz.startsWith(prefix));
  } catch {
    return false;
  }
}

function initGA(granted: boolean) {
  if (typeof window === "undefined" || document.getElementById("ga-script")) return;

  const script = document.createElement("script");
  script.id = "ga-script";
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=G-3SWWZ7C48H";
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) { window.dataLayer!.push(args); }
  window.gtag = gtag;

  gtag("js", new Date());
  gtag("config", "G-3SWWZ7C48H", {
    analytics_storage: granted ? "granted" : "denied",
  });
}

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
  }
}

function getInitialShow(): boolean {
  if (typeof window === "undefined") return false;
  const saved = localStorage.getItem(CONSENT_KEY) as ConsentState;
  if (saved) {
    initGA(saved === "accepted");
    return false;
  }
  if (!isLikelyEU()) {
    localStorage.setItem(CONSENT_KEY, "accepted");
    initGA(true);
    return false;
  }
  return true;
}

export function CookieConsent() {
  const { lang } = useLang();
  const [show, setShow] = useState(getInitialShow);

  function accept() {
    localStorage.setItem(CONSENT_KEY, "accepted");
    initGA(true);
    setShow(false);
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, "declined");
    initGA(false);
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {lang === "es"
            ? "Usamos cookies para analizar el tráfico y mejorar tu experiencia. Puedes aceptar o rechazar el seguimiento analítico."
            : "We use cookies to analyze traffic and improve your experience. You can accept or decline analytics tracking."}
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={decline}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            {lang === "es" ? "Rechazar" : "Decline"}
          </button>
          <button
            onClick={accept}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            {lang === "es" ? "Aceptar" : "Accept"}
          </button>
        </div>
      </div>
    </div>
  );
}
