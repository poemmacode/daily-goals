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

export const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
