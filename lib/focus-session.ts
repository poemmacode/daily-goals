/** Sesión de focus persistida en localStorage.
 *  Permite restaurar el cronómetro tras cerrar la pestaña: todo se calcula
 *  contra `targetTs`, así el restante ya descuenta el tiempo fuera.
 */

const KEY = "dg:focus-session";

export interface FocusSession {
  goalId: string;
  totalSeconds: number;
  /** Epoch ms en que termina (fase running) o terminó la base de pausa. */
  targetTs: number;
  phase: "running" | "paused";
  /** Restante en segundos al pausar (solo fase paused). */
  pausedRemaining: number;
  updatedAt: number;
}

export function readFocusSession(): FocusSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as FocusSession;
    if (!s.goalId || !s.totalSeconds) return null;
    return s;
  } catch {
    return null;
  }
}

export function writeFocusSession(s: Omit<FocusSession, "updatedAt">): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...s, updatedAt: Date.now() }));
  } catch {
    // Almacenamiento no disponible: la sesión vive solo en memoria.
  }
}

export function clearFocusSession(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Sin almacenamiento: nada que limpiar.
  }
}

/** ¿La sesión venció? Solo aplica a fase running con target en el pasado. */
export function isSessionExpired(s: FocusSession, now: number = Date.now()): boolean {
  return s.phase === "running" && s.targetTs <= now;
}

/** Restante en segundos para una sesión (0 si expiró). */
export function sessionRemaining(s: FocusSession, now: number = Date.now()): number {
  if (s.phase === "paused") return Math.max(0, Math.round(s.pausedRemaining));
  return Math.max(0, Math.round((s.targetTs - now) / 1000));
}
