"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "es";

const en = {
  nav: { today: "Today", goals: "Goals", insights: "Insights", signOut: "Sign out", openMenu: "Open menu", closeMenu: "Close menu" },
  bottom: { today: "Today", goals: "Goals", insights: "Insights" },
  footer: { tagline: "Daily Goals — gamify your routines" },
  login: {
    subtitle: "Your daily routines, with focus timer and streaks.",
    password: "Password",
    magic: "Magic link",
    emailPh: "you@email.com",
    passwordPh: "Your password",
    sendMagic: "Send magic link",
    sending: "Sending…",
    signIn: "Sign in",
    signUp: "Create account",
    sentMagic: "Check your inbox: we sent you a sign-in link. ✉️",
    linkMissingCode: "The link had no access code. Request a new one.",
    linkExpired: "The link expired or was already used. Request a new one.",
    linkFailed: "Could not complete sign in.",
  },
  today: {
    completedOf: (done: number, total: number) => `${done} of ${total} goals completed`,
    loading: "Loading…",
    empty: "No active goals today.",
    createFirst: "Create your first goal →",
    uncheck: "Uncheck",
    check: "Complete",
    inProgressHint: "Timer running: finish the session to complete",
    inProgress: "In progress",
    viewTimer: "View running timer",
    min: "min",
    recorded: (m: number) => ` · ${m} min logged`,
    focus: "▶ Focus",
    totalTime: "Total estimated time",
    remainingTime: "Remaining time",
    saveFailed: (msg: string) => `Could not save: ${msg}`,
  },
  goals: {
    title: "Goals",
    new: "+ New",
    editTitle: "Edit goal",
    newTitle: "New goal",
    close: "Close",
    closeModal: "Close modal",
    edit: "Edit",
    archive: "Archive",
    reactivate: "Reactivate",
    delete: "Delete",
    confirmDelete: "Delete this goal and its history?",
    daysPerWeek: (n: number) => `${n} days/wk`,
    endBeforeStart: "End date cannot be before start date.",
    pickDay: "Select at least one active day.",
    invalidSession: "Invalid session. Please sign in again.",
    loading: "Loading…",
    notesToggle: "📚 View notes / resources",
  },
  form: {
    title: "Title",
    titlePh: "E.g. Read for 30 minutes",
    minutes: "Assigned minutes",
    category: "Category",
    start: "Start",
    end: "End",
    activeDays: "Active days",
    color: "Color",
    notes: "Notes / resources",
    notesPh: "E.g. Study here:\nhttps://docs.python.org/3/tutorial/",
    notesHint: "Links become clickable automatically.",
    save: "Save changes",
    create: "Create goal",
    saving: "Saving…",
    cancel: "Cancel",
  },
  focus: {
    back: "← Back to today",
    notFound: "Goal not found.",
    backToday: "Back to today",
    sessionOf: (m: number) => `A ${m}-minute session`,
    otherSession: "⏳ You already have a session running on another goal.",
    backToIt: "Back to it →",
    savedDone: "Session saved and goal completed ✅ — back to your day…",
    savedTime: (m: number) => `+${m} min logged today`,
    resources: "📚 Resources",
    loading: "Loading…",
  },
  timer: {
    start: "Start focus",
    startHint: "Press ▶ to start — time doesn't run until then",
    pausedHint: "Paused — your spot is saved even if you close the tab",
    pause: "Pause",
    resume: "Resume",
    reset: "Reset",
    done: "Session complete! 🎉",
    repeat: "Repeat",
    expired: "Time ran out while you were away ⏰",
    markDone: "✓ Mark complete",
  },
  insights: {
    title: "Insights",
    calculating: "Calculating…",
    streak: "Current streak",
    day: "day",
    days: "days",
    consecutive100: "Consecutive days at 100%",
    lastDays: (n: number) => `Last ${n} days`,
    perGoal: "Per goal",
    daysDone: (d: number, e: number) => `${d}/${e} days`,
    minVs: (a: number, p: number) => `${a} of ${p} min`,
    noGoals: "No goals yet.",
    createOne: "Create one →",
  },
};

export type Dict = typeof en;

const es: Dict = {
  nav: { today: "Hoy", goals: "Objetivos", insights: "Insights", signOut: "Salir", openMenu: "Abrir menú", closeMenu: "Cerrar menú" },
  bottom: { today: "Hoy", goals: "Objetivos", insights: "Insights" },
  footer: { tagline: "Daily Goals — gamifica tus rutinas" },
  login: {
    subtitle: "Tus rutinas diarias, con timer de enfoque y rachas.",
    password: "Contraseña",
    magic: "Enlace mágico",
    emailPh: "tu@correo.com",
    passwordPh: "Tu contraseña",
    sendMagic: "Enviar enlace mágico",
    sending: "Enviando…",
    signIn: "Entrar",
    signUp: "Crear cuenta",
    sentMagic: "Revisa tu correo: te enviamos un enlace para entrar. ✉️",
    linkMissingCode: "El enlace no traía código de acceso. Pide uno nuevo.",
    linkExpired: "El enlace expiró o ya fue usado. Pide uno nuevo.",
    linkFailed: "No se pudo completar el inicio de sesión.",
  },
  today: {
    completedOf: (done, total) => `${done} de ${total} objetivos completados`,
    loading: "Cargando…",
    empty: "No hay objetivos vigentes hoy.",
    createFirst: "Crear tu primer objetivo →",
    uncheck: "Desmarcar",
    check: "Completar",
    inProgressHint: "Cronómetro en curso: termina la sesión para completar",
    inProgress: "In progress",
    viewTimer: "Ver cronómetro en curso",
    min: "min",
    recorded: (m) => ` · ${m} min registrados`,
    focus: "▶ Focus",
    totalTime: "Tiempo total estimado",
    remainingTime: "Tiempo restante",
    saveFailed: (msg) => `No se pudo guardar: ${msg}`,
  },
  goals: {
    title: "Objetivos",
    new: "+ Nuevo",
    editTitle: "Editar objetivo",
    newTitle: "Nuevo objetivo",
    close: "Cerrar",
    closeModal: "Cerrar modal",
    edit: "Editar",
    archive: "Archivar",
    reactivate: "Reactivar",
    delete: "Eliminar",
    confirmDelete: "¿Eliminar este objetivo y su historial?",
    daysPerWeek: (n) => `${n} días/sem`,
    endBeforeStart: "La fecha de fin no puede ser anterior al inicio.",
    pickDay: "Selecciona al menos un día activo.",
    invalidSession: "Sesión no válida. Vuelve a entrar.",
    loading: "Cargando…",
    notesToggle: "📚 Ver notas / recursos",
  },
  form: {
    title: "Título",
    titlePh: "Ej. Leer 30 minutos",
    minutes: "Minutos asignados",
    category: "Categoría",
    start: "Inicio",
    end: "Fin",
    activeDays: "Días activos",
    color: "Color",
    notes: "Notas / recursos",
    notesPh: "Ej. Estudiar aquí:\nhttps://docs.python.org/3/tutorial/",
    notesHint: "Los enlaces se vuelven clicables solos.",
    save: "Guardar cambios",
    create: "Crear objetivo",
    saving: "Guardando…",
    cancel: "Cancelar",
  },
  focus: {
    back: "← Volver a hoy",
    notFound: "Objetivo no encontrado.",
    backToday: "Volver a hoy",
    sessionOf: (m) => `Sesión de ${m} minutos`,
    otherSession: "⏳ Ya tienes una sesión en curso en otro objetivo.",
    backToIt: "Volver a ella →",
    savedDone: "Sesión guardada y objetivo completado ✅ — volviendo a tu día…",
    savedTime: (m) => `+${m} min registrados en hoy`,
    resources: "📚 Recursos",
    loading: "Cargando…",
  },
  timer: {
    start: "Iniciar focus",
    startHint: "Pulsa ▶ para iniciar — el tiempo no corre hasta entonces",
    pausedHint: "En pausa — tu lugar está guardado aunque cierres la pestaña",
    pause: "Pausar",
    resume: "Continuar",
    reset: "Reiniciar",
    done: "¡Sesión completada! 🎉",
    repeat: "Repetir",
    expired: "El tiempo terminó mientras estabas fuera ⏰",
    markDone: "✓ Marcar completada",
  },
  insights: {
    title: "Insights",
    calculating: "Calculando…",
    streak: "Racha actual",
    day: "día",
    days: "días",
    consecutive100: "Días consecutivos al 100%",
    lastDays: (n) => `Últimos ${n} días`,
    perGoal: "Por objetivo",
    daysDone: (d, e) => `${d}/${e} días`,
    minVs: (a, p) => `${a} de ${p} min`,
    noGoals: "Aún no hay objetivos.",
    createOne: "Crea uno →",
  },
};

const DICTS: Record<Lang, Dict> = { en, es };
const KEY = "dg:lang";

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Dict }>({
  lang: "en",
  setLang: () => {},
  t: en,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "en" || saved === "es") return saved;
    } catch {
      // Sin almacenamiento o SSR: inglés por defecto.
    }
    return "en";
  });

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function setLang(l: Lang) {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      // Sin almacenamiento: solo memoria.
    }
  }

  return <LangContext.Provider value={{ lang, setLang, t: DICTS[lang] }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-0.5 text-xs font-semibold dark:bg-zinc-900">
      {(["en", "es"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-md px-2 py-1 uppercase ${
            lang === l ? "bg-white shadow dark:bg-zinc-700" : "text-zinc-500"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
