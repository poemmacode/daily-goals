export interface Goal {
  id: string;
  user_id: string;
  title: string;
  category: string;
  color: string;
  icon: string;
  allocated_minutes: number;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  active_days: number[]; // 0=domingo ... 6=sábado
  archived: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface GoalMilestone {
  id: string;
  goal_id: string;
  user_id: string;
  title: string;
  sort_order: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface GoalTask {
  id: string;
  milestone_id: string;
  goal_id: string;
  user_id: string;
  title: string;
  sort_order: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface GoalMiss {
  id: string;
  goal_id: string;
  user_id: string;
  miss_date: string; // YYYY-MM-DD
  reason: MissReason | null;
  note: string | null;
  created_at: string;
}

export type MissReason =
  | "no_time"
  | "too_tired"
  | "forgot"
  | "too_difficult"
  | "not_motivated"
  | "unexpected"
  | "schedule_conflict"
  | "other";

export const MISS_REASON_LABELS: Record<MissReason, { en: string; es: string }> = {
  no_time: { en: "No time", es: "Sin tiempo" },
  too_tired: { en: "Too tired", es: "Muy cansado/a" },
  forgot: { en: "Forgot", es: "Se me olvidó" },
  too_difficult: { en: "Too difficult", es: "Muy difícil" },
  not_motivated: { en: "Not motivated", es: "Sin motivación" },
  unexpected: { en: "Unexpected event", es: "Evento inesperado" },
  schedule_conflict: { en: "Schedule conflict", es: "Conflicto de horario" },
  other: { en: "Other", es: "Otro" },
};

export interface GoalExperiment {
  id: string;
  goal_id: string;
  user_id: string;
  title: string;
  description: string | null;
  original_schedule: Record<string, unknown>;
  experiment_schedule: Record<string, unknown>;
  start_date: string;
  end_date: string;
  status: "active" | "completed" | "cancelled";
  result: Record<string, unknown> | null;
  created_at: string;
}

export interface Profile {
  id: string;
  subscription_tier: "free" | "pro";
  is_admin: boolean;
  ai_api_key_encrypted: string | null;
  ai_provider: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyLog {
  id: string;
  goal_id: string;
  user_id: string;
  log_date: string; // YYYY-MM-DD (hora local del cliente)
  completed: boolean;
  time_spent_seconds: number;
  completed_at: string | null;
  created_at: string;
}

export interface GoalWithLog extends Goal {
  log: DailyLog | null;
}

export const GOAL_COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#a855f7",
  "#ec4899",
];

export const WEEKDAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
export const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
/** @deprecated usa WEEKDAYS_ES/WEEKDAYS_EN según idioma */
export const WEEKDAYS = WEEKDAYS_ES;
