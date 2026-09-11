import type { Goal } from "./types";

/** Clave de fecha local YYYY-MM-DD (evita desfases UTC). */
export function toLocalDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return toLocalDateKey(dt);
}

/** Día de semana 0=domingo..6=sábado para una clave local. */
export function weekdayOf(dateKey: string): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

/** ¿El objetivo está vigente en la fecha dada? */
export function isGoalActiveOn(goal: Goal, dateKey: string): boolean {
  if (goal.archived) return false;
  if (dateKey < goal.start_date || dateKey > goal.end_date) return false;
  return goal.active_days.includes(weekdayOf(dateKey));
}

export function formatSeconds(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** "90" -> "1 h 30 min", "45" -> "45 min". */
export function formatMinutes(totalMinutes: number): string {
  const m = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(m / 60);
  const rest = m % 60;
  if (h === 0) return `${rest} min`;
  return rest === 0 ? `${h} h` : `${h} h ${rest} min`;
}

export function formatDateKey(dateKey: string, locale: "en-US" | "es-MX" = "en-US"): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
