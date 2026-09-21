import type { Goal, DailyLog } from "../types";
import { isGoalActiveOn, addDays } from "../dates";

export interface StreakResult {
  current: number;
  longest: number;
  totalDaysWithGoals: number;
  totalDaysCompleted: number;
}

/**
 * Calculate current and longest streaks for a set of goals and logs.
 * A "streak" is consecutive days where ALL active goals were completed.
 */
export function calculateStreaks(
  goals: Goal[],
  logs: DailyLog[],
  todayKey: string,
  lookbackDays: number = 365,
): StreakResult {
  const logsByDay = new Map<string, Set<string>>();
  for (const log of logs) {
    if (!log.completed) continue;
    const set = logsByDay.get(log.log_date) ?? new Set();
    set.add(log.goal_id);
    logsByDay.set(log.log_date, set);
  }

  const days: { date: string; active: string[]; completed: string[] }[] = [];
  for (let i = lookbackDays - 1; i >= 0; i--) {
    const date = addDays(todayKey, -i);
    const activeGoals = goals.filter(
      (g) => isGoalActiveOn(g, date) && g.created_at.slice(0, 10) <= date,
    );
    const activeIds = activeGoals.map((g) => g.id);
    const completedIds = (logsByDay.get(date) ?? new Set());
    days.push({
      date,
      active: activeIds,
      completed: [...completedIds].filter((id) => activeIds.includes(id)),
    });
  }

  // Current streak: consecutive active days from today (or yesterday) where all goals were done
  // Inactive days are skipped (don't break or extend the streak)
  let current = 0;
  const ordered = [...days].reverse();
  // If today has active goals but not all completed, start from yesterday
  const today = ordered[0];
  if (today && today.active.length > 0 && today.completed.length < today.active.length) {
    ordered.shift();
  }
  for (const d of ordered) {
    if (d.active.length === 0) continue; // inactive day: skip
    if (d.completed.length >= d.active.length) {
      current++;
    } else {
      break;
    }
  }

  // Longest streak: consecutive days where all active goals were completed
  let longest = 0;
  let streak = 0;
  for (const d of days) {
    if (d.active.length === 0) {
      // No goals active: skip (don't break or extend streak)
      continue;
    }
    if (d.completed.length >= d.active.length) {
      streak++;
      longest = Math.max(longest, streak);
    } else {
      streak = 0;
    }
  }

  const totalDaysWithGoals = days.filter((d) => d.active.length > 0).length;
  const totalDaysCompleted = days.filter(
    (d) => d.active.length > 0 && d.completed.length >= d.active.length,
  ).length;

  return { current, longest, totalDaysWithGoals, totalDaysCompleted };
}

/**
 * Calculate streak for a single goal.
 */
export function calculateGoalStreak(
  goal: Goal,
  logs: DailyLog[],
  todayKey: string,
  lookbackDays: number = 365,
): { current: number; longest: number } {
  const completedDates = new Set(
    logs.filter((l) => l.completed).map((l) => l.log_date),
  );

  const days: { date: string; active: boolean; completed: boolean }[] = [];
  for (let i = lookbackDays - 1; i >= 0; i--) {
    const date = addDays(todayKey, -i);
    const active = isGoalActiveOn(goal, date) && goal.created_at.slice(0, 10) <= date;
    days.push({ date, active, completed: completedDates.has(date) });
  }

  // Current streak
  let current = 0;
  const ordered = [...days].reverse();
  const today = ordered[0];
  if (today && today.active && !today.completed) {
    ordered.shift();
  }
  for (const d of ordered) {
    if (!d.active) continue;
    if (d.completed) {
      current++;
    } else {
      break;
    }
  }

  // Longest streak
  let longest = 0;
  let streak = 0;
  for (const d of days) {
    if (!d.active) continue;
    if (d.completed) {
      streak++;
      longest = Math.max(longest, streak);
    } else {
      streak = 0;
    }
  }

  return { current, longest };
}
