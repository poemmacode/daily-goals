"use client";

import type { GoalHealth } from "@/lib/analytics/goal-health";
import { useLang } from "@/lib/i18n";

interface GoalHealthBadgeProps {
  health: GoalHealth;
  showDetails?: boolean;
}

const STATUS_CONFIG = {
  healthy: {
    bg: "bg-green-100 dark:bg-green-950/50",
    text: "text-green-700 dark:text-green-300",
    border: "border-green-200 dark:border-green-800",
    icon: "✓",
  },
  at_risk: {
    bg: "bg-amber-100 dark:bg-amber-950/50",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    icon: "⚠",
  },
  struggling: {
    bg: "bg-red-100 dark:bg-red-950/50",
    text: "text-red-700 dark:text-red-300",
    border: "border-red-200 dark:border-red-800",
    icon: "✗",
  },
};

const TREND_LABELS = {
  improving: { en: "↑ Improving", es: "↑ Mejorando" },
  stable: { en: "→ Stable", es: "→ Estable" },
  declining: { en: "↓ Declining", es: "↓ Bajando" },
};

export function GoalHealthBadge({ health, showDetails = false }: GoalHealthBadgeProps) {
  const { lang } = useLang();
  const config = STATUS_CONFIG[health.status];
  const trend = TREND_LABELS[health.trend];

  return (
    <div className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-medium ${config.bg} ${config.text} ${config.border}`}>
      <span>{config.icon}</span>
      <span>{health.score}%</span>
      {showDetails && (
        <>
          <span className="opacity-50">·</span>
          <span className="text-xs">{lang === "es" ? trend.es : trend.en}</span>
        </>
      )}
    </div>
  );
}
