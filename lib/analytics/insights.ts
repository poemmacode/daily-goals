import type { Goal, DailyLog, GoalMiss } from "../types";
import { isGoalActiveOn, addDays, weekdayOf } from "../dates";
import { calculateStreaks, calculateGoalStreak } from "./streaks";
import { calculateGoalHealth, calculateAllGoalHealth, type GoalHealth } from "./goal-health";
import { aggregateFailureStats } from "./failure-reasons";

export interface BehavioralInsights {
  completionRate: number;
  streak: number;
  longestStreak: number;
  bestDays: { day: number; rate: number }[];
  commonFailureReasons: { reason: string; count: number }[];
  recentMisses: number;
  goalHealth: Map<string, GoalHealth>;
  scheduleAdherence: number;
  trend: "improving" | "stable" | "declining";
  averageSessionMinutes: number;
  totalMinutesLogged: number;
  daysTracked: number;
}

interface InsightsInput {
  goals: Goal[];
  logs: DailyLog[];
  misses?: GoalMiss[];
  todayKey: string;
  lookbackDays?: number;
}

/**
 * Generate comprehensive behavioral insights from user data.
 * This is the main entry point for the analytics engine.
 */
export function generateInsights(input: InsightsInput): BehavioralInsights {
  const { goals, logs, misses = [], todayKey, lookbackDays = 90 } = input;
  const activeGoals = goals.filter((g) => !g.archived);

  // Streaks
  const streakResult = calculateStreaks(activeGoals, logs, todayKey, 365);

  // Goal health for each active goal
  const missCounts = new Map<string, number>();
  const recentCutoff = addDays(todayKey, -30);
  for (const m of misses) {
    if (m.miss_date >= recentCutoff) {
      missCounts.set(m.goal_id, (missCounts.get(m.goal_id) ?? 0) + 1);
    }
  }
  const goalHealth = calculateAllGoalHealth(activeGoals, logs, todayKey, missCounts);

  // Completion rate
  let totalActive = 0;
  let totalCompleted = 0;
  for (let i = lookbackDays - 1; i >= 0; i--) {
    const date = addDays(todayKey, -i);
    const activeToday = activeGoals.filter(
      (g) => isGoalActiveOn(g, date) && g.created_at.slice(0, 10) <= date,
    );
    if (activeToday.length === 0) continue;
    totalActive += activeToday.length;
    const completedToday = logs.filter(
      (l) => l.log_date === date && l.completed,
    ).length;
    totalCompleted += Math.min(completedToday, activeToday.length);
  }
  const completionRate = totalActive > 0 ? Math.round((totalCompleted / totalActive) * 100) : 0;

  // Best days of the week
  const dayStats = new Map<number, { active: number; completed: number }>();
  for (let i = lookbackDays - 1; i >= 0; i--) {
    const date = addDays(todayKey, -i);
    const weekday = weekdayOf(date);
    const activeToday = activeGoals.filter(
      (g) => isGoalActiveOn(g, date) && g.created_at.slice(0, 10) <= date,
    );
    if (activeToday.length === 0) continue;
    const stat = dayStats.get(weekday) ?? { active: 0, completed: 0 };
    stat.active += activeToday.length;
    const completedToday = logs.filter(
      (l) => l.log_date === date && l.completed,
    ).length;
    stat.completed += Math.min(completedToday, activeToday.length);
    dayStats.set(weekday, stat);
  }
  const bestDays = [...dayStats.entries()]
    .map(([day, stat]) => ({
      day,
      rate: stat.active > 0 ? Math.round((stat.completed / stat.active) * 100) : 0,
    }))
    .sort((a, b) => b.rate - a.rate);

  // Failure stats
  const failureStats = aggregateFailureStats(misses, todayKey, lookbackDays);

  // Schedule adherence
  const logDates = new Set(logs.map((l) => l.log_date));
  let daysWithGoals = 0;
  let daysWithLogs = 0;
  for (let i = lookbackDays - 1; i >= 0; i--) {
    const date = addDays(todayKey, -i);
    const activeToday = activeGoals.filter(
      (g) => isGoalActiveOn(g, date) && g.created_at.slice(0, 10) <= date,
    );
    if (activeToday.length > 0) {
      daysWithGoals++;
      if (logDates.has(date)) daysWithLogs++;
    }
  }
  const scheduleAdherence = daysWithGoals > 0 ? Math.round((daysWithLogs / daysWithGoals) * 100) : 0;

  // Trend
  const recentDays = 14;
  let recentActive = 0;
  let recentCompleted = 0;
  let olderActive = 0;
  let olderCompleted = 0;
  for (let i = 0; i < lookbackDays; i++) {
    const date = addDays(todayKey, -i);
    const activeToday = activeGoals.filter(
      (g) => isGoalActiveOn(g, date) && g.created_at.slice(0, 10) <= date,
    );
    if (activeToday.length === 0) continue;
    const completedToday = logs.filter(
      (l) => l.log_date === date && l.completed,
    ).length;
    const done = Math.min(completedToday, activeToday.length);
    if (i < recentDays) {
      recentActive += activeToday.length;
      recentCompleted += done;
    } else {
      olderActive += activeToday.length;
      olderCompleted += done;
    }
  }
  const recentRate = recentActive > 0 ? recentCompleted / recentActive : 0;
  const olderRate = olderActive > 0 ? olderCompleted / olderActive : 0;
  const trendDiff = recentRate - olderRate;
  const trend: "improving" | "stable" | "declining" =
    trendDiff > 0.1 ? "improving" : trendDiff < -0.1 ? "declining" : "stable";

  // Average session minutes
  const totalSeconds = logs.reduce((a, l) => a + l.time_spent_seconds, 0);
  const averageSessionMinutes = logs.length > 0
    ? Math.round(totalSeconds / 60 / logs.length)
    : 0;
  const totalMinutesLogged = Math.round(totalSeconds / 60);

  return {
    completionRate,
    streak: streakResult.current,
    longestStreak: streakResult.longest,
    bestDays,
    commonFailureReasons: failureStats.byReason.slice(0, 3).map((r) => ({
      reason: r.reason,
      count: r.count,
    })),
    recentMisses: failureStats.recentMisses,
    goalHealth,
    scheduleAdherence,
    trend,
    averageSessionMinutes,
    totalMinutesLogged,
    daysTracked: streakResult.totalDaysWithGoals,
  };
}

/**
 * Get per-goal insights.
 */
export function getGoalInsights(
  goal: Goal,
  logs: DailyLog[],
  todayKey: string,
): {
  health: GoalHealth;
  streak: { current: number; longest: number };
  completionRate: number;
} {
  const goalLogs = logs.filter((l) => l.goal_id === goal.id);
  const health = calculateGoalHealth({ goal, logs: goalLogs, todayKey });
  const streak = calculateGoalStreak(goal, goalLogs, todayKey);

  let active = 0;
  let completed = 0;
  for (let i = 90 - 1; i >= 0; i--) {
    const date = addDays(todayKey, -i);
    if (isGoalActiveOn(goal, date) && goal.created_at.slice(0, 10) <= date) {
      active++;
      if (goalLogs.some((l) => l.log_date === date && l.completed)) completed++;
    }
  }

  return {
    health,
    streak,
    completionRate: active > 0 ? Math.round((completed / active) * 100) : 0,
  };
}
